/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.mjs");
console.log("Environment Variables:");
console.log("DATABASE_URL:", process.env.DATABASE_URL);
console.log("BACKEND_URL:", process.env.BACKEND_URL);
console.log("CLERK_SECRET_KEY:", process.env.CLERK_SECRET_KEY);
console.log(
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:",
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
);

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: false,
  images: {
    domains: ["i.ytimg.com"],
  },
  output: "standalone",
  /**
   * If you have `experimental: { appDir: true }` set, then you must comment the below `i18n` config
   * out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
};

export default config;
