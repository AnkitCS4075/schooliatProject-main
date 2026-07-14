import fs from "fs";
import path from "path";
import config from "../../config.js";
import { Readable } from "stream";

export function uploadToLocal({ buffer, key }) {
  const fullPath = path.join(
    process.cwd(),
    ...config.FILE_PATH.split("/"),
    key,
  );

  fs.mkdirSync(path.dirname(fullPath), { recursive: true });

  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(fullPath);
    Readable.from(buffer).pipe(writeStream);
    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
  });
}

/**
 * Get a read stream for a file from local filesystem.
 * @param {string} key - File key (e.g. fileId.extension)
 * @returns {Promise<{ stream: import("stream").Readable; contentType?: string }>}
 */
export function getStreamFromLocal(key) {
  const fullPath = path.join(
    process.cwd(),
    ...config.FILE_PATH.split("/"),
    key,
  );
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  return {
    stream: fs.createReadStream(fullPath),
    contentType: undefined,
  };
}
