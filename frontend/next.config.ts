import type { NextConfig } from "next";
import path from "path";

const backendHostname = process.env.BACKEND_IMAGE_HOSTNAME;

/**
 * Content-Security-Policy (OWASP ZAP P1 fix).
 *
 * Inventory of what the app really loads (verified from src/):
 * - Scripts: first-party only — Next.js App Router inline bootstrap chunks
 *   + one first-party inline <script> (ThemeScript, theme-script.tsx).
 *   No third-party scripts, no eval. `unsafe-inline` for script-src is
 *   REQUIRED by Next.js App Router (it emits inline bootstrapping code and
 *   offers no supported nonce/hash wiring without middleware changes), so it
 *   is kept and documented here; `unsafe-eval` is NOT allowed and no `*`.
 * - Styles: Tailwind runtime + next/font self-hosted CSS (Cairo/Inter via
 *   next/font/google are downloaded at build time — no runtime Google Fonts
 *   requests). `unsafe-inline` for style-src is required by Next.js style
 *   injection; documented.
 * - Images: same-origin + data:/blob: + backend /uploads over HTTP loopback
 *   in dev (remotePatterns in `images`) + optional production backend host.
 * - API/fetch: same-origin + backend API origin (connect-src).
 * - Fonts: self-hosted (next/font) + data:.
 * - Frames/objects: none (frame-src 'none', object-src 'none').
 * - Form posts: same-origin only.
 *
 * Environment behavior:
 * - Loopback backend origins are always listed: the production build is also
 *   verified locally via `next start`, and listing loopback only *allows*
 *   (never forces) those origins.
 * - `upgrade-insecure-requests` is opt-in via CSP_UPGRADE_INSECURE=true
 *   (production HTTPS only) — enabling it on plain-HTTP localhost would
 *   upgrade API/image fetches to https:// and break local dev/tests.
 */
function apiOrigin(): string | null {
  const raw =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

function backendOrigins(): string[] {
  const origins = new Set<string>([
    "http://localhost:3001",
    "http://127.0.0.1:3001",
  ]);
  const api = apiOrigin();
  if (api && (api.startsWith("http://") || api.startsWith("https://"))) {
    origins.add(api);
  }
  if (backendHostname) {
    origins.add(`https://${backendHostname}`);
  }
  return [...origins];
}

function contentSecurityPolicy(): string {
  const backends = backendOrigins().join(" ");
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-src 'none'",
    "frame-ancestors 'self'",
    "form-action 'self'",
    // See docblock above: 'unsafe-inline' required by Next.js App Router.
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: ${backends}`,
    "font-src 'self' data:",
    `connect-src 'self' ${backends}`,
    "media-src 'self' data: blob:",
    ...(process.env.CSP_UPGRADE_INSECURE === "true"
      ? ["upgrade-insecure-requests"]
      : []),
  ];
  return directives.join("; ");
}

const nextConfig: NextConfig = {
  // Monorepo-safe root (silences the multi-lockfile workspace warning).
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "3001", pathname: "/uploads/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "3001", pathname: "/uploads/**" },
      ...(backendHostname
        ? [{ protocol: "https" as const, hostname: backendHostname, pathname: "/uploads/**" }]
        : []),
    ],
  },
  async headers() {
    return [
      // Authenticated/stealth areas must never be stored by shared caches.
      // (Public pages keep the generic rule below.)
      {
        source: "/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, must-revalidate" },
        ],
      },
      {
        source: "/mjm",
        headers: [
          { key: "Cache-Control", value: "no-store, must-revalidate" },
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy() },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
