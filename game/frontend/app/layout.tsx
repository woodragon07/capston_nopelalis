// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import localFont from 'next/font/local';
import ZoomPrevent from "./components/ZoomPrevent";

const bmFont = localFont({
  src: '../public/fonts/BMKkubulimTTF.ttf',
  variable: '--font-bm',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "PLEASE",
  description: 'Truth has no witness, only survivors',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={bmFont.variable}>
      <body className="overflow-hidden bg-black">
        <ZoomPrevent />
        {children}
      </body>
    </html>
  );
}
