import type { Metadata } from "next";
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
  // viewport 제거 (아래로 분리)
};

// viewport를 별도로 export
export const viewport = {
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
      <body className="overflow-hidden">
        <ZoomPrevent />
        {children}
      </body>
    </html>
  );
}
