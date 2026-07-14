import config from "../../config.js";
import { uploadToLocal, getStreamFromLocal } from "./local.js";
import { uploadToS3, getStreamFromS3 } from "./s3.js";

/** Use S3/MinIO for upload when aws-s3 or minio (MinIO = local S3-compatible storage) */
function useS3Storage() {
  return config.FILE_STORAGE === "aws-s3" || config.FILE_STORAGE === "minio";
}

export async function uploadFile({ buffer, key, contentType }) {
  if (useS3Storage()) {
    return uploadToS3({ buffer, key, contentType });
  }
  return uploadToLocal({ buffer, key });
}

/**
 * Get a read stream for a file. Used by GET /files/:id to serve file content.
 * @param {string} key - File key (e.g. fileId.extension)
 * @returns {Promise<{ stream: import("stream").Readable; contentType?: string } | null>}
 */
export async function getFileStream(key) {
  if (useS3Storage()) {
    return getStreamFromS3(key);
  }
  return Promise.resolve(getStreamFromLocal(key));
}
