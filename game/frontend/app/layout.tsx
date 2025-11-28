import type { Metadata } from "next";
import "./globals.css";
import localFont from 'next/font/local';
import ZoomPrevent from "./components/ZoomPrevent";

const bmFont = localFont({
  src: '../public/fonts/BMKkubulimTTF.ttf', // 또는 .woff, .woff2
  variable: '--font-bm',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "PLEASE",
  description: 'Truth has no witness, only survivors',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={bmFont.variable}>
      <body className="overflow-hidden">
        <ZoomPrevent />
        {children}
      </body>
    </html>
  );
}
