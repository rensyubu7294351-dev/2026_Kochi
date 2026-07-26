/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // 会場・観光画像はローカル(public/images)に置く前提。
    // 外部CDNを使う場合はここに remotePatterns を追加する。
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
