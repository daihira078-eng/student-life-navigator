import type { Metadata, Viewport } from "next";
import { M_PLUS_1, M_PLUS_1_Code } from "next/font/google";
import { AppDrawer } from "@/components/AppDrawer";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import "./globals.css";

const mplus1 = M_PLUS_1({
  variable: "--font-mplus1",
  subsets: ["latin"],
  preload: false,
});

const mplus1Code = M_PLUS_1_Code({
  variable: "--font-mplus1-code",
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  title: "一人暮らし新生活 総合最適化ナビ",
  description: "複数バイト×扶養の壁を横断して最適化する、一人称の意思決定シミュレーター",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "扶養の壁ナビ",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0e16",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${mplus1.variable} ${mplus1Code.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <ServiceWorkerRegister />
        <AppDrawer />
        {children}
      </body>
    </html>
  );
}
