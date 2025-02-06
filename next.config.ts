import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  async generateStaticParams() {
    return [{ slug: "login" }]; // ✅ Forces Next.js to generate the login page
  },
  
};

export default nextConfig;
