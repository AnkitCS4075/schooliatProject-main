import helmet from "helmet";
import config from "../config.js";

/**
 * Security headers middleware using Helmet
 * Protects against XSS, clickjacking, and other common attacks
 */
const securityMiddleware = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for templates
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"], // Allow data URIs and HTTPS images
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  // Cross-Origin Embedder Policy
  crossOriginEmbedderPolicy: false, // Disable for API compatibility
  // Cross-Origin Opener Policy
  crossOriginOpenerPolicy: { policy: "same-origin" },
  // Cross-Origin Resource Policy
  crossOriginResourcePolicy: { policy: "cross-origin" },
  // DNS Prefetch Control
  dnsPrefetchControl: true,
  // Expect-CT
  expectCt: {
    maxAge: 86400, // 24 hours
  },
  // Frameguard (X-Frame-Options)
  frameguard: { action: "deny" },
  // Hide Powered-By header
  hidePoweredBy: true,
  // HSTS
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  // IE No Open
  ieNoOpen: true,
  // No Sniff
  noSniff: true,
  // Origin Agent Cluster
  originAgentCluster: true,
  // Permissions Policy
  permissionsPolicy: {
    features: {
      accelerometer: ["'none'"],
      ambientLightSensor: ["'none'"],
      autoplay: ["'none'"],
      battery: ["'none'"],
      camera: ["'none'"],
      crossOriginIsolated: ["'none'"],
      displayCapture: ["'none'"],
      documentDomain: ["'none'"],
      encryptedMedia: ["'none'"],
      executionWhileNotRendered: ["'none'"],
      executionWhileOutOfViewport: ["'none'"],
      fullscreen: ["'self'"],
      geolocation: ["'none'"],
      gyroscope: ["'none'"],
      magnetometer: ["'none'"],
      microphone: ["'none'"],
      midi: ["'none'"],
      navigationOverride: ["'none'"],
      payment: ["'none'"],
      pictureInPicture: ["'none'"],
      publickeyCredentials: ["'none'"],
      screenWakeLock: ["'none'"],
      syncXhr: ["'none'"],
      usb: ["'none'"],
      webShare: ["'none'"],
      xrSpatialTracking: ["'none'"],
    },
  },
  // Referrer Policy
  referrerPolicy: { policy: "no-referrer" },
  // XSS Protection (legacy, but still useful)
  xssFilter: true,
});

export default securityMiddleware;

