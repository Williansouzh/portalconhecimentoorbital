import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emite .next/standalone: um server.js com só as dependências usadas,
  // que é o que a imagem Docker roda.
  output: "standalone",
};

export default nextConfig;
