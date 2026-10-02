import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "一人暮らし新生活 総合最適化ナビ",
    short_name: "扶養の壁ナビ",
    description: "複数バイト×扶養の壁を横断して最適化する、一人称の意思決定シミュレーター",
    start_url: "/simulator",
    display: "standalone",
    background_color: "#0b0e16",
    theme_color: "#0b0e16",
    icons: [
      { src: "/pwa-icon/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/pwa-icon/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/pwa-icon/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
