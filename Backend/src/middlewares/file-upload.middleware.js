import multer from "multer";
import config from "../config.js";

const fileUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.FILE_SIZE_LIMIT * 1024 * 1024,
  },
});

export default fileUpload;
