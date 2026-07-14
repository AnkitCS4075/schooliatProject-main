import config from "../config.js";
import logger from "../config/logger.js";

const addReponseStatusToBody = (req, res, next) => {
  const originalSend = res.json.bind(res);

  res.json = (body) => {
    const modifiedBody = {
      status: res.statusCode,
      ...body,
    };

    if (config.ENVIRONMENT != "production") {
      logger.info(`Request End ${req.method}: ${req.url}`);
      logger.info(`Response Body: ${JSON.stringify(modifiedBody)}`);
    }

    return originalSend(modifiedBody);
  };

  next();
};

export default addReponseStatusToBody;
