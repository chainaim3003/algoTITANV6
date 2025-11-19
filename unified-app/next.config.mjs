/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Empty turbopack config to acknowledge Turbopack usage
  turbopack: {},
  
  env: {
    NEXT_PUBLIC_ALGORAND_NETWORK: process.env.ALGORAND_NETWORK || 'testnet',
    NEXT_PUBLIC_VLEI_API_URL: process.env.VLEI_API_URL || 'http://localhost:4000',
    NEXT_PUBLIC_BUYER_AGENT_URL: process.env.BUYER_AGENT_URL || 'http://localhost:8080',
    NEXT_PUBLIC_SELLER_AGENT_URL: process.env.SELLER_AGENT_URL || 'http://localhost:8081',
  },
};

export default nextConfig;
