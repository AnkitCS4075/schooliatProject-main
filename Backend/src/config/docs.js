import config from "../config.js";
import logger from "./logger.js";

export const addApiDocs = async (app) => {
  if (config.ENVIRONMENT != "production") {
    const swaggerUi = await import("swagger-ui-express");
    const openapi = await import("../static/openapi.json", {
      with: { type: "json" },
    });

    logger.info(`Serving docs for the API at: ${config.API_URL}/docs`);

    app.use(
      "/docs",
      swaggerUi.default.serve,
      swaggerUi.default.setup(openapi.default),
    );
  }
};
