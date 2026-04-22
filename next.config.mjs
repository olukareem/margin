/** @type {import('next').NextConfig} */

// Third-party origins Margin legitimately talks to from the browser.
// Kept in one place so the CSP below stays readable and reviewable.
const CONVEX_ORIGIN = "https://*.convex.cloud wss://*.convex.cloud";
const CLERK_ORIGINS = [
  "https://*.clerk.accounts.dev",
  "https://clerk.accounts.dev",
  "https://*.clerk.com",
  "https://clerk-telemetry.com",
  "https://*.clerk-telemetry.com",
].join(" ");
const EDGESTORE_ORIGIN = "https://files.edgestore.dev https://*.edgestore.dev";

// Next's built-in dev server needs 'unsafe-eval' for React refresh and
// HMR. We relax the CSP in dev only. In production we keep 'unsafe-eval'
// off and allow 'unsafe-inline' for scripts because Next still emits a
// handful of inline bootstrap scripts (nonces would require rewriting
// every _document / layout — out of scope for this pass).
const isDev = process.env.NODE_ENV !== "production";

const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ""} ${CLERK_ORIGINS}`,
  `worker-src 'self' blob:`,
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  `img-src 'self' data: blob: https://files.edgestore.dev https://*.edgestore.dev https://img.clerk.com https://images.clerk.dev`,
  `font-src 'self' data: https://fonts.gstatic.com`,
  `connect-src 'self' ${CONVEX_ORIGIN} ${CLERK_ORIGINS} ${EDGESTORE_ORIGIN}`,
  `frame-src 'self' ${CLERK_ORIGINS}`,
  `frame-ancestors 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `object-src 'none'`,
  `upgrade-insecure-requests`,
]
  .filter(Boolean)
  .join("; ");

const securityHeaders = [
  // Legacy but cheap defense-in-depth against clickjacking. frame-ancestors
  // in the CSP does the real work on modern browsers.
  { key: "X-Frame-Options", value: "DENY" },
  // Prevents MIME-sniffing attacks on user-uploaded cover images.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Don't leak full URLs (which may include note ids) to third parties.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Lock down powerful browser APIs we never use.
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()",
  },
  // Force HTTPS for 2 years including subdomains. Only takes effect on
  // https origins; Vercel terminates TLS so this is safe.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Content-Security-Policy", value: csp },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    domains: ["files.edgestore.dev"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
