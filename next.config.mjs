import { fileURLToPath } from "node:url"
import { dirname } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the workspace root to THIS project. Without this, Next.js detected a
  // stray lockfile in the home directory and inferred C:\Users\User as the
  // root, causing Turbopack's file watcher to scan the entire home folder
  // (huge RAM/CPU + Windows error 1450 "Insufficient system resources").
  turbopack: {
    root: __dirname,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
