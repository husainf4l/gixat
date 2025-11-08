import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  rewrites: async () => {
    return {
      beforeFiles: [
        {
          source: "/api/graphql",
          destination: "http://192.168.1.214:4006/api/graphql",
        },
      ],
    };
  },
};

export default nextConfig;
