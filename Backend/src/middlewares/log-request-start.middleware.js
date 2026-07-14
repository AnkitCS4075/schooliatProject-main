import logger from "../config/logger.js";

const logRequestStart = (req, res, next) => {
  logger.info(`Request Start ${req.method}: ${req.url}`);
  if (
    req.headers["content-type"] == "application/json" &&
    req.method.toLowerCase() != "get"
  ) {
    logger.info(`Request Body: ${JSON.stringify(req.body)}`);
  }
  next();
};

export default logRequestStart;
