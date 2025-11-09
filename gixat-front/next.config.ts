import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  rewrites: async () => {
    return {
      beforeFiles: [
        {
          source: "/api/:path*",
          destination: "https://www.gixat.com/api/:path*",
        },
      ],
    };
  },
};

export default nextConfig;
