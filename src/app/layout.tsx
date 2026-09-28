import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppDrawer } from "@/components/AppDrawer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "一人暮らし新生活 総合最適化ナビ",
  description: "複数バイト×扶養の壁を横断して最適化する、一人称の意思決定シミュレーター",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <AppDrawer />
        {children}
      </body>
    </html>
  );
}
