/** @type {import('next').NextConfig} */

const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development" ? true : false,
});

module.exports = withPWA({
  // this is for fetching the cookies
  experimental: {
    serverActions: true,
  },
});
