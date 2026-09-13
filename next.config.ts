import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["firebase-admin", "razorpay", "resend"],
  allowedDevOrigins: ["192.168.56.1"],
};

export default nextConfig;
