import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KinderCare - Phần mềm quản lý mầm non",
  description: "Ứng dụng quản lý trường mầm non toàn diện",
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
        {children}
      </body>
    </html>
  );
}
