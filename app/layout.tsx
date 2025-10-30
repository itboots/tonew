import type { Metadata } from "next";
import { Orbitron } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "YuCoder 赛博浏览器",
  description: "赛博朋克风格的内容聚合器",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={orbitron.variable}>
      <head />
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
