import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "ddlda2rzhrys8.cloudfront.net",
      },
      // MinIO — local development
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
      },
      {
        protocol: "http",
        hostname: "moriicoffee.minio",
        port: "9000",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
