import config from "../config.js";
import prisma from "../prisma/client.js";

const getFileById = async (fileId) => {
  return await prisma.file.findUnique({
    where: { id: fileId },
  });
};

const attachFileURL = (file) => {
  // MinIO (local S3) and local filesystem: serve via API, never use cloud URLs.
  // Only use AWS cloud URL when FILE_STORAGE=aws-s3 and no MinIO endpoint (real AWS).
  const useLocalOrMinIOUrl =
    config.FILE_STORAGE === "local" ||
    config.FILE_STORAGE === "minio" ||
    (config.FILE_STORAGE === "aws-s3" && config.MINIO_ENDPOINT);

  if (useLocalOrMinIOUrl) {
    const base =
      config.PUBLIC_API_URL && config.PUBLIC_API_URL !== "undefined"
        ? config.PUBLIC_API_URL.replace(/\/$/, "")
        : "";
    file["url"] = base ? `${base}/files/${file.id}` : `/files/${file.id}`;
  } else if (config.FILE_STORAGE === "aws-s3") {
    file["url"] =
      `https://${config.AWS_S3_BUCKET}.s3.${config.AWS_REGION}.amazonaws.com/${config.FILE_PATH}/${file.id}.${file.extension}`;
  } else {
    const base =
      config.PUBLIC_API_URL && config.PUBLIC_API_URL !== "undefined"
        ? config.PUBLIC_API_URL.replace(/\/$/, "")
        : "";
    file["url"] = base ? `${base}/files/${file.id}` : `/files/${file.id}`;
  }

  return file;
};

const getFilesByIds = async (fileIds) => {
  if (!fileIds || fileIds.length === 0) return [];
  const files = await prisma.file.findMany({
    where: { id: { in: fileIds } },
  });
  return files.map((file) => attachFileURL(file));
};

const fileService = {
  getFileById,
  attachFileURL,
  getFilesByIds,
};

export default fileService;
