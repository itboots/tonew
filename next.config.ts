import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 修复 Next.js 工作区根目录警告
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
