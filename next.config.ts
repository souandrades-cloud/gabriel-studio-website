import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Allows previewing the dev server from other devices on the same
  // network (e.g. testing on a phone via http://<lan-ip>:3000).
  allowedDevOrigins: ["192.168.1.2"],
};

export default nextConfig;
