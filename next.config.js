/** @type {import('next').NextConfig} */

const withPWA = require("next-pwa")({
  dest: "public",
  disable: false,
});

// const nextConfig = {
//   // this is for fetching the cookies
//   experimental: {
//     serverActions: true,
//   },
// };

module.exports = withPWA({
  // this is for fetching the cookies
  experimental: {
    serverActions: true,
  },
});
