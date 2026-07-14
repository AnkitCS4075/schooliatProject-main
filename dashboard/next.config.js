const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  /** Avoid serving a stale document shell after auth state changes. */
  cacheStartUrl: false,
  extendDefaultRuntimeCaching: true,
  workboxOptions: {
    skipWaiting: true,
    runtimeCaching: [
      {
        /**
         * Never cache proxied backend traffic: JWT APIs, auth, and private files.
         * Matched first (see extendDefaultRuntimeCaching) so defaults like
         * NetworkFirst "pages" / "apis" do not apply to these paths.
         */
        urlPattern: ({ url }) => {
          const p = url.pathname;
          return (
            p.startsWith("/api/") ||
            p.startsWith("/auth/") ||
            p.startsWith("/files/")
          );
        },
        handler: "NetworkOnly",
        options: {
          cacheName: "schooliat-network-only",
        },
      },
    ],
  },
});

/**
 * Allow next/image to fetch file URLs returned by the API (cross-origin in production).
 * Without this, /_next/image?url=https://api…/files/… returns 400.
 */
function buildImageRemotePatterns() {
  const patterns = [];

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    try {
      const u = new URL(apiUrl);
      const protocol = u.protocol.replace(":", "");
      const common = {
        protocol,
        hostname: u.hostname,
        ...(u.port ? { port: u.port } : {}),
      };
      patterns.push({ ...common, pathname: "/files/**" });
      patterns.push({ ...common, pathname: "/api/v1/files/**" });
    } catch {
      // invalid NEXT_PUBLIC_API_URL — skip derived patterns
    }
  }

  // Local backend (direct)
  for (const host of ["localhost", "127.0.0.1"]) {
    patterns.push({
      protocol: "http",
      hostname: host,
      port: "4000",
      pathname: "/files/**",
    });
    patterns.push({
      protocol: "http",
      hostname: host,
      port: "4000",
      pathname: "/api/v1/files/**",
    });
  }

  // Production API host fallback (when NEXT_PUBLIC_API_URL is missing at build time)
  for (const host of ["api.schooliat.com"]) {
    patterns.push({
      protocol: "https",
      hostname: host,
      pathname: "/files/**",
    });
    patterns.push({
      protocol: "https",
      hostname: host,
      pathname: "/api/v1/files/**",
    });
  }

  // Dev: dashboard rewrites /files to backend (same tab origin is localhost:3000)
  for (const host of ["localhost", "127.0.0.1"]) {
    patterns.push({
      protocol: "http",
      hostname: host,
      port: "3000",
      pathname: "/files/**",
    });
  }

  return patterns;
}

/** Backend origin for rewrites (server-side proxy). Prefer BACKEND_URL; else same as NEXT_PUBLIC_API_URL so production works without a separate secret. */
const backendOrigin = (
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000"
).replace(/\/$/, "");

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  images: {
    remotePatterns: buildImageRemotePatterns(),
  },
  async redirects() {
    return [
      {
        source: "/super-admin/templates",
        destination: "/admin/settings?tab=templates",
        permanent: true,
      },
      {
        source: "/admin/templates",
        destination: "/admin/settings?tab=templates",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/api/:path*`,
      },
      {
        source: "/auth/:path*",
        destination: `${backendOrigin}/auth/:path*`,
      },
      {
        source: "/files/:path*",
        destination: `${backendOrigin}/files/:path*`,
      },
    ];
  },
};

module.exports = withPWA(nextConfig);

