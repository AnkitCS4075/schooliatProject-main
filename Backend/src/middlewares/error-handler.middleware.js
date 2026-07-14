import logger from "../config/logger.js";

function getMessageAndStatus(err) {
  const statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Helpful message when DB/Prisma fails (common cause of "500 on every page" in local)
  if (statusCode === 500) {
    const errStr = String(err.message || "");
    if (
      errStr.includes("Can't reach database") ||
      errStr.includes("Connection refused") ||
      errStr.includes("ECONNREFUSED") ||
      err.name === "PrismaClientInitializationError"
    ) {
      return {
        statusCode: 503,
        message:
          "Database unavailable. In Backend/.env set DATABASE_URL and ensure PostgreSQL is running.",
      };
    }
  }

  return { statusCode, message };
}

const errorHandler = (err, req, res, next) => {
  logger.error({ error: err }, err.stack, err.stack);
  const { statusCode, message } = getMessageAndStatus(err);
  res.status(statusCode).json({
    status: statusCode,
    errorCode: err.errorCode || "SERVER_ERROR",
    message,
  });
};

export default errorHandler;
