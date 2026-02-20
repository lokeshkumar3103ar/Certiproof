import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent clickjacking
          { key: "X-Frame-Options", value: "DENY" },
          // Prevent MIME-type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Enforce HTTPS for 1 year (enable only after confirming full HTTPS)
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          // Control cross-origin referrer info
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Disable browser features not needed
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Cross-origin policies
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          // Content Security Policy
          // Note: 'unsafe-inline' for styles is required by Tailwind/Next.js inline styles
          // Tighten nonce-based CSP once you have a stable deployment
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Next.js needs 'unsafe-eval' in dev; remove in production if possible
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              // Allow Supabase, fonts, and your own domain for images/data
              `img-src 'self' data: blob: https://*.supabase.co`,
              `media-src 'self'`,
              `font-src 'self' data:`,
              `connect-src 'self' https://*.supabase.co https://polygon-amoy.g.alchemy.com wss://*.supabase.co`,
              `frame-src 'none'`,
              `object-src 'none'`,
              `base-uri 'self'`,
              `form-action 'self'`,
              `upgrade-insecure-requests`,
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
