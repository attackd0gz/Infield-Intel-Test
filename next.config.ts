import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  async headers() {
    // Resolve the Supabase hostname lazily (inside the function) so a missing
    // or malformed NEXT_PUBLIC_SUPABASE_URL env var never crashes the build.
    let supabaseHost = "*.supabase.co";
    try {
      const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (raw) supabaseHost = new URL(raw).hostname;
    } catch {
      // env var missing or not a valid URL — fall back to wildcard
    }

    const securityHeaders = [
      // Prevent clickjacking
      { key: "X-Frame-Options", value: "DENY" },
      // Prevent MIME-type sniffing
      { key: "X-Content-Type-Options", value: "nosniff" },
      // Control referrer info sent to third parties
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      // Disable browser features not in use
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      // XSS auditor for older browsers
      { key: "X-XSS-Protection", value: "1; mode=block" },
      // Content Security Policy
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          // Next.js requires unsafe-inline for its runtime scripts;
          // Google Maps JS API is loaded from maps.googleapis.com
          "script-src 'self' 'unsafe-inline' https://maps.googleapis.com",
          // Tailwind and component inline styles
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          // Images: Unsplash, Supabase, Google Maps tiles, Google user avatars
          `img-src 'self' data: blob: https://images.unsplash.com https://${supabaseHost} https://*.googleapis.com https://*.gstatic.com https://lh3.googleusercontent.com`,
          // API calls: Supabase + Google Maps API
          `connect-src 'self' https://${supabaseHost} wss://${supabaseHost} https://*.googleapis.com https://*.gstatic.com`,
          // Fonts: self-hosted (next/font) + Google Fonts (used by Maps UI)
          "font-src 'self' data: https://fonts.gstatic.com",
          // Disallow all framing
          "frame-ancestors 'none'",
          // Prevent base-tag hijacking
          "base-uri 'self'",
          // Only allow forms to submit to own origin
          "form-action 'self'",
        ].join("; "),
      },
    ];

    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
