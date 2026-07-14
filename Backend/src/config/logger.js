import pino from "pino";
import config from "../config.js";

const isProduction = config.ENVIRONMENT === "production";

let logger = pino({
  level: config.LOG_LEVEL,
  transport: isProduction
    ? undefined // Use default JSON output in production
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss.l",
          ignore: "pid,hostname",
        },
      },
});

export default logger;
