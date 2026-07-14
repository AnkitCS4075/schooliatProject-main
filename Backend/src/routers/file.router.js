import { Router } from "express";
import prisma from "../prisma/client.js";
import crypto from "crypto";
import { uploadFile, getFileStream } from "../config/storage/index.js";
import fileService from "../services/file.service.js";
import config from "../config.js";
import fileUpload from "../middlewares/file-upload.middleware.js";
import path from "path";
import fs from "fs";
import validateRequest from "../middlewares/validate-request.middleware.js";
import getFileSchema from "../schemas/file/get-file.schema.js";
import logger from "../config/logger.js";

const router = Router();

router.post("/", fileUpload.single("file"), async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: "File is required" });
  }

  const currentUser = req.context.user;
  const fileId = crypto.randomUUID();
  const originalFileNameSections = req.file.originalname.split("/");
  const originalFileName =
    originalFileNameSections[originalFileNameSections.length - 1];
  const extension = originalFileName.split(".").pop();
  const fileName = originalFileName.replace(`.${extension}`, "");

  try {
    // Upload to configured storage (local filesystem or MinIO/S3)
    await uploadFile({
      buffer: req.file.buffer,
      key: `${fileId}.${extension}`,
      contentType: req.file.mimetype,
    });
  } catch (uploadErr) {
    return res.status(500).json({ error: "File upload failed", message: uploadErr?.message });
  }

  // Store metadata in DB
  let file = await prisma.file.create({
    data: {
      id: fileId,
      extension: extension,
      name: fileName,
      contentType: req.file.mimetype,
      size: req.file.size,
      createdBy: currentUser.id,
    },
  });

  file = fileService.attachFileURL(file);
  return res.status(201).json({
    data: file,
  });
});

// Stream file bytes whenever storage supports it (local, MinIO, or AWS S3).
// Previously production+local returned JSON here, which broke browser open/download for /files/:id links.
const canStream =
  config.FILE_STORAGE === "local" ||
  config.FILE_STORAGE === "minio" ||
  config.FILE_STORAGE === "aws-s3";

router.get("/:id", validateRequest(getFileSchema), async (req, res) => {
  try {
    const file = await fileService.getFileById(req.params.id);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    if (canStream) {
      const key = `${file.id}.${file.extension}`;
      let result;
      try {
        result = await getFileStream(key);
      } catch (err) {
        logger.warn({ err, key }, "GET /files/:id storage read failed");
        return res.status(404).json({ error: "File not found" });
      }
      if (!result?.stream) {
        return res.status(404).json({ error: "File not found" });
      }
      res.setHeader(
        "Content-Type",
        result.contentType || file.contentType || "application/octet-stream",
      );
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${file.name}.${file.extension}"`,
      );

      result.stream.on("error", (err) => {
        logger.error({ err, key }, "GET /files/:id stream error");
        if (!res.headersSent) {
          res.status(500).json({ error: "Failed to read file" });
        } else {
          res.destroy(err);
        }
      });
      res.on("close", () => {
        if (typeof result.stream.destroy === "function") {
          result.stream.destroy();
        }
      });

      result.stream.pipe(res);
      return;
    }

    // Non-streaming storage: return metadata and URL (client uses URL to fetch)
    const fileWithUrl = fileService.attachFileURL({ ...file });
    return res.json({
      message: "File metadata",
      data: {
        id: fileWithUrl.id,
        filename: `${file.name}.${file.extension}`,
        size: file.size,
        mimeType: file.contentType,
        url: fileWithUrl.url,
      },
    });
  } catch (err) {
    logger.error({ err, id: req.params?.id }, "GET /files/:id failed");
    if (!res.headersSent) {
      return res.status(500).json({ error: "Failed to load file" });
    }
    return undefined;
  }
});

export default router;
