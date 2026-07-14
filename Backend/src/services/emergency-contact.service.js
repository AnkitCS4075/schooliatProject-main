import prisma from "../prisma/client.js";
import logger from "../config/logger.js";

/**
 * Emergency Contact Service
 * Handles emergency contact management for students
 */

/**
 * Create emergency contact
 * @param {Object} data - Contact data
 * @param {string} data.studentId - Student user ID
 * @param {string} data.schoolId - School ID
 * @param {string} data.name - Contact name
 * @param {string} data.relationship - Relationship (FATHER, MOTHER, GUARDIAN, RELATIVE, OTHER)
 * @param {string} data.contact - Contact number
 * @param {string} data.alternateContact - Alternate contact (optional)
 * @param {string} data.address - Address (optional)
 * @param {boolean} data.isPrimary - Is primary contact (optional)
 * @param {string} data.createdBy - User ID creating the contact
 * @returns {Promise<Object>} - Created contact
 */
const createEmergencyContact = async (data) => {
  const {
    studentId,
    schoolId,
    name,
    relationship,
    contact,
    alternateContact = null,
    address = null,
    isPrimary = false,
    createdBy,
  } = data;

  // Verify student exists and belongs to school
  const student = await prisma.user.findUnique({
    where: {
      id: studentId,
      schoolId,
      deletedAt: null,
    },
  });

  if (!student) {
    throw new Error("Student not found or does not belong to this school");
  }

  const existingCount = await prisma.emergencyContact.count({
    where: { studentId, deletedAt: null },
  });
  if (existingCount >= 6) {
    throw new Error("Maximum 6 emergency contacts allowed per student.");
  }

  // If this is primary, unset other primary contacts
  if (isPrimary) {
    await prisma.emergencyContact.updateMany({
      where: {
        studentId,
        isPrimary: true,
        deletedAt: null,
      },
      data: {
        isPrimary: false,
      },
    });
  }

  // Create contact
  const emergencyContact = await prisma.emergencyContact.create({
    data: {
      studentId,
      schoolId,
      name,
      relationship,
      contact,
      alternateContact,
      address,
      isPrimary,
      createdBy,
    },
  });

  logger.info({ contactId: emergencyContact.id, studentId }, "Emergency contact created");

  return emergencyContact;
};

/**
 * Get emergency contacts for a student
 * @param {string} studentId - Student user ID
 * @param {string} schoolId - School ID (for authorization)
 * @returns {Promise<Array>} - List of emergency contacts
 */
const getEmergencyContacts = async (studentId, schoolId = null) => {
  const where = {
    studentId,
    deletedAt: null,
  };

  if (schoolId) {
    where.schoolId = schoolId;
  }

  const contacts = await prisma.emergencyContact.findMany({
    where,
    orderBy: [
      { isPrimary: "desc" },
      { createdAt: "asc" },
    ],
  });

  return contacts;
};

/**
 * Get emergency contact by ID
 * @param {string} contactId - Contact ID
 * @param {string} schoolId - School ID (for authorization)
 * @returns {Promise<Object>} - Contact record
 */
const getEmergencyContactById = async (contactId, schoolId = null) => {
  const where = {
    id: contactId,
    deletedAt: null,
  };

  if (schoolId) {
    where.schoolId = schoolId;
  }

  const contact = await prisma.emergencyContact.findUnique({
    where,
  });

  return contact;
};

/**
 * Update emergency contact
 * @param {string} contactId - Contact ID
 * @param {Object} data - Update data
 * @param {string} data.name - Contact name (optional)
 * @param {string} data.relationship - Relationship (optional)
 * @param {string} data.contact - Contact number (optional)
 * @param {string} data.alternateContact - Alternate contact (optional)
 * @param {string} data.address - Address (optional)
 * @param {boolean} data.isPrimary - Is primary contact (optional)
 * @param {string} data.updatedBy - User ID updating the contact
 * @returns {Promise<Object>} - Updated contact
 */
const updateEmergencyContact = async (contactId, data, updatedBy) => {
  const { name, relationship, contact, alternateContact, address, isPrimary } = data;

  // If setting as primary, unset other primary contacts
  if (isPrimary !== undefined) {
    const existingContact = await prisma.emergencyContact.findUnique({
      where: { id: contactId },
    });

    if (isPrimary && existingContact) {
      await prisma.emergencyContact.updateMany({
        where: {
          studentId: existingContact.studentId,
          id: { not: contactId },
          isPrimary: true,
          deletedAt: null,
        },
        data: {
          isPrimary: false,
        },
      });
    }
  }

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (relationship !== undefined) updateData.relationship = relationship;
  if (contact !== undefined) updateData.contact = contact;
  if (alternateContact !== undefined) updateData.alternateContact = alternateContact;
  if (address !== undefined) updateData.address = address;
  if (isPrimary !== undefined) updateData.isPrimary = isPrimary;
  updateData.updatedBy = updatedBy;

  const emergencyContact = await prisma.emergencyContact.update({
    where: { id: contactId },
    data: updateData,
  });

  logger.info({ contactId }, "Emergency contact updated");

  return emergencyContact;
};

/**
 * Delete emergency contact (soft delete)
 * @param {string} contactId - Contact ID
 * @param {string} deletedBy - User ID deleting the contact
 * @returns {Promise<Object>} - Deleted contact
 */
const deleteEmergencyContact = async (contactId, deletedBy) => {
  const contact = await prisma.emergencyContact.update({
    where: { id: contactId },
    data: {
      deletedAt: new Date(),
      deletedBy,
    },
  });

  logger.info({ contactId }, "Emergency contact deleted");

  return contact;
};

const emergencyContactService = {
  createEmergencyContact,
  getEmergencyContacts,
  getEmergencyContactById,
  updateEmergencyContact,
  deleteEmergencyContact,
};

export default emergencyContactService;

