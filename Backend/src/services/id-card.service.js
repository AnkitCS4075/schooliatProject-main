import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import prisma from "../prisma/client.js";
import fileService from "./file.service.js";
import templateService from "./template.service.js";
import templateLoaderService from "./template-loader.service.js";
import { uploadFile } from "../config/storage/index.js";
import { IdCardCollectionStatus } from "../prisma/generated/index.js";
import logger from "../config/logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Extract default values from JSON schema recursively
const extractDefaultsFromSchema = (schema) => {
  if (schema.type === "object" && schema.properties) {
    const result = {};
    for (const [key, prop] of Object.entries(schema.properties)) {
      if (prop.type === "object") {
        result[key] = extractDefaultsFromSchema(prop);
      } else if (prop.default !== undefined) {
        result[key] = prop.default;
      }
    }
    return result;
  }
  return schema.default;
};

// Load schema defaults for a template path
const loadSchemaDefaults = async (templatePath) => {
  const schemaPath = path.join(
    __dirname,
    "../templates",
    templatePath,
    "schema.json",
  );
  const schemaContent = await fs.readFile(schemaPath, "utf-8");
  const schema = JSON.parse(schemaContent);
  return extractDefaultsFromSchema(schema);
};

// Check if config object is empty
const isEmptyConfig = (configObj) => {
  return !configObj || Object.keys(configObj).length === 0;
};

// Generate ID cards for a class
const generateIdCardsForClass = async (classId, schoolId, createdBy) => {
  try {
    const config = await fetchIdCardConfig(schoolId);
    if (!config)
      throw new Error("ID card config not found for this school and year");

    // Fetch template to get its path
    const template = await templateService.getTemplateById(config.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    // If config.config is empty, load defaults from schema
    if (isEmptyConfig(config.config)) {
      config.config = await loadSchemaDefaults(template.path);
    }

    // Mark collection as IN_PROGRESS
    const collection = await markCollectionInProgress(
      classId,
      schoolId,
      createdBy,
    );

    const data = await prepareIdCardData(classId, schoolId, config.config);
    if (data.length === 0) throw new Error("No students found in this class");

    const { studentFileMap, zipFileId } = await templateService.generateFiles(
      data,
      config,
      template,
      createdBy,
    );

    await Promise.all([
      createIdCardEntries(
        studentFileMap,
        classId,
        schoolId,
        config.id,
        createdBy,
      ),
      markCollectionGenerated(collection.id, config.id, zipFileId, createdBy),
    ]);

    return { studentFileMap, zipFileId, totalGenerated: data.length };
  } catch (error) {
    logger.error(error);
    throw new Error("Failed to generate ID cards for class");
  }
};

// Upload file and create DB entry
const uploadAndCreateFileEntry = async (
  buffer,
  name,
  extension,
  contentType,
  createdBy,
) => {
  const fileId = crypto.randomUUID();
  const key = `${fileId}.${extension}`;

  await uploadFile({ buffer, key, contentType });

  const file = await prisma.file.create({
    data: {
      id: fileId,
      name,
      extension,
      contentType,
      size: buffer.length,
      createdBy,
    },
  });

  return file.id;
};

// Generate sample PDF for ID card config
const generateConfigSample = async (templateId, config, userId) => {
  try {
    // Fetch template to get its path
    const template = await templateService.getTemplateById(templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    // Merge config with schema defaults if config is empty
    let finalConfig = config || {};
    if (isEmptyConfig(finalConfig)) {
      finalConfig = await loadSchemaDefaults(template.path);
    }

    // Generate sample PDF using template loader service
    const pdfBuffer = await templateLoaderService.generateSamplePdf(
      template.path,
      finalConfig,
      templateLoaderService.ID_CARD_SAMPLE_DATA,
    );

    // Upload and create file entry
    const fileId = await uploadAndCreateFileEntry(
      pdfBuffer,
      `id-card-config-sample-${templateId}`,
      "pdf",
      "application/pdf",
      userId,
    );

    return fileId;
  } catch (error) {
    logger.error(`Failed to generate config sample: ${error.message}`, error);
    throw error;
  }
};

// Fetch ID card config for school and current year
const fetchIdCardConfig = async (schoolId) => {
  const currentYear = new Date().getFullYear();
  logger.info(
    `Fetching ID card config for school ${schoolId} and year ${currentYear}`,
  );

  const config = await prisma.idCardConfig.findFirst({
    where: { schoolId, year: currentYear, deletedAt: null },
  });

  if (config && config.sampleId) {
    // Attach sampleUrl to the config object
    config.sampleUrl = fileService.attachFileURL({
      id: config.sampleId,
      extension: "pdf",
    }).url;
  } else if (config) {
    config.sampleUrl = null;
  }

  return config;
};

// Fetch students with profiles for a class
const fetchStudentsWithProfiles = async (classId, schoolId) => {
  return prisma.user.findMany({
    where: {
      schoolId,
      deletedAt: null,
      studentProfile: { classId, deletedAt: null },
    },
    include: {
      studentProfile: { include: { class: true } },
    },
  });
};

// Format student data for template rendering
const formatStudentData = (student, school, config) => {
  const idPhotoId = student.idPhotoId || student.registrationPhotoId || null;
  const idPhotoSrc = idPhotoId
    ? fileService.attachFileURL({ id: idPhotoId, extension: "jpg" }).url
    : null;

  const logoId = config.schoolLogoFileId || school.logoId || null;
  const logoSrc = logoId
    ? fileService.attachFileURL({ id: logoId, extension: "jpg" }).url
    : null;

  return {
    student: {
      ...student,
      idPhotoId,
      idPhotoSrc,
      studentProfile: {
        ...student.studentProfile,
        bloodGroup: formatBloodGroup(student.studentProfile.bloodGroup),
      },
      name: `${student.firstName} ${student.lastName || ""}`.trim(),
    },
    school: {
      ...school,
      logoId,
      logoSrc,
    },
    config,
    class: student.studentProfile.class,
  };
};

const formatBloodGroup = (bloodGroup) => {
  const mapping = {
    A_POSITIVE: "A+",
    A_NEGATIVE: "A-",
    B_POSITIVE: "B+",
    B_NEGATIVE: "B-",
    AB_POSITIVE: "AB+",
    AB_NEGATIVE: "AB-",
    O_POSITIVE: "O+",
    O_NEGATIVE: "O-",
  };
  return mapping[bloodGroup] || bloodGroup;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Prepare student data for ID card generation
const prepareIdCardData = async (classId, schoolId, config) => {
  const [students, school] = await Promise.all([
    fetchStudentsWithProfiles(classId, schoolId),
    prisma.school.findUnique({ where: { id: schoolId } }),
  ]);

  if (!school) throw new Error("School not found");
  return students.map((student) => formatStudentData(student, school, config));
};

// Create ID card entries in database
const createIdCardEntries = async (
  studentFileMap,
  classId,
  schoolId,
  configId,
  createdBy,
) => {
  const entries = Object.entries(studentFileMap).map(([studentId, fileId]) => ({
    schoolId,
    classId,
    studentId,
    idCardConfigId: configId,
    fileId,
    createdBy,
  }));

  await prisma.idCard.createMany({ data: entries });
};

// Mark collection as IN_PROGRESS when generation starts
const markCollectionInProgress = async (classId, schoolId, userId) => {
  const currentYear = new Date().getFullYear();

  return prisma.idCardCollection.upsert({
    where: { schoolId_classId_year: { schoolId, classId, year: currentYear } },
    update: { status: IdCardCollectionStatus.IN_PROGRESS, updatedBy: userId },
    create: {
      schoolId,
      classId,
      year: currentYear,
      status: IdCardCollectionStatus.IN_PROGRESS,
      createdBy: userId,
    },
  });
};

// Mark collection as GENERATED when generation completes
const markCollectionGenerated = async (
  collectionId,
  configId,
  fileId,
  userId,
) => {
  return prisma.idCardCollection.update({
    where: { id: collectionId },
    data: {
      status: IdCardCollectionStatus.GENERATED,
      idCardConfigId: configId,
      fileId,
      generatedAt: new Date(),
      generatedBy: userId,
      updatedBy: userId,
    },
  });
};

// Upsert ID card config (create or update)
const upsertIdCardConfig = async (schoolId, templateId, configData, userId) => {
  const currentYear = new Date().getFullYear();

  const existing = await prisma.idCardConfig.findFirst({
    where: { schoolId, year: currentYear, deletedAt: null },
  });

  // Generate sample with the custom config
  let sampleId = null;
  try {
    sampleId = await generateConfigSample(templateId, configData, userId);
  } catch (error) {
    // Log error but don't fail the config save
    logger.error(
      `Failed to generate sample for ID card config: ${error.message}`,
      error,
    );
  }

  if (existing) {
    const updateData = {
      templateId,
      config: configData || {},
      updatedBy: userId,
    };

    // Only update sampleId if generation was successful
    if (sampleId) {
      updateData.sampleId = sampleId;
    }

    return prisma.idCardConfig.update({
      where: { id: existing.id },
      data: updateData,
    });
  }

  return prisma.idCardConfig.create({
    data: {
      schoolId,
      year: currentYear,
      templateId,
      config: configData || {},
      sampleId,
      createdBy: userId,
    },
  });
};

// Get all classes with their ID card collection status for current year
const getClassesWithCollectionStatus = async (schoolId) => {
  const currentYear = new Date().getFullYear();

  const classes = await prisma.class.findMany({
    where: { schoolId, deletedAt: null },
    orderBy: [{ grade: "asc" }, { division: "asc" }],
  });

  const classIds = classes.map((c) => c.id);

  const collections = await prisma.idCardCollection.findMany({
    where: {
      schoolId,
      year: currentYear,
      classId: { in: classIds },
      deletedAt: null,
    },
  });

  const collectionFileIds = [
    ...new Set(collections.map((c) => c.fileId).filter(Boolean)),
  ];
  const fileRecords =
    collectionFileIds.length > 0
      ? await prisma.file.findMany({
          where: { id: { in: collectionFileIds } },
        })
      : [];
  const fileById = new Map(fileRecords.map((f) => [f.id, f]));

  collections.forEach((col) => {
    const fileRow = col.fileId ? fileById.get(col.fileId) : null;
    col.fileUrl = fileRow ? fileService.attachFileURL(fileRow).url : null;
  });

  const collectionMap = new Map(collections.map((c) => [c.classId, c]));

  return classes.map((cls) => ({
    ...cls,
    idCardCollection: collectionMap.get(cls.id) || null,
  }));
};

// Initialize ID card collections for newly added classes (with transaction support)
const initializeIdCardCollectionsForNewClasses = async (
  tx,
  classIds,
  schoolId,
  userId,
) => {
  const currentYear = new Date().getFullYear();

  const existingCollections = await tx.idCardCollection.findMany({
    where: {
      schoolId,
      year: currentYear,
      classId: { in: classIds },
      deletedAt: null,
    },
    select: { classId: true },
  });

  const existingClassIds = new Set(existingCollections.map((c) => c.classId));
  const newClassIds = classIds.filter((id) => !existingClassIds.has(id));

  if (newClassIds.length === 0) return;

  const collectionsToCreate = newClassIds.map((classId) => ({
    schoolId,
    classId,
    year: currentYear,
    status: IdCardCollectionStatus.NOT_GENERATED,
    createdBy: userId,
  }));

  await tx.idCardCollection.createMany({ data: collectionsToCreate });
};

const idCardService = {
  fetchIdCardConfig,
  prepareIdCardData,
  generateIdCardsForClass,
  upsertIdCardConfig,
  getClassesWithCollectionStatus,
  initializeIdCardCollectionsForNewClasses,
};

export default idCardService;
