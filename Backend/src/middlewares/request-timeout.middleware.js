import timeout from "connect-timeout";
import config from "../config.js";

/**
 * Request timeout middleware
 * Prevents long-running requests from hanging indefinitely
 */
const REQUEST_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT) || 30000; // 30 seconds default

const requestTimeoutMiddleware = timeout(`${REQUEST_TIMEOUT}ms`);

/**
 * Handler for timeout errors
 * Should be used after routes to catch timeout errors
 */
export const timeoutHandler = (req, res, next) => {
  if (!req.timedout) {
    next();
  } else {
    res.status(408).json({
      errorCode: "REQUEST_TIMEOUT",
      message: "Request timeout. Please try again with a simpler query.",
    });
  }
};

export default requestTimeoutMiddleware;

