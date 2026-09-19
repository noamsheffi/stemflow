import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Syllo | סביבת למידה",
  description: "סביבת הלמידה של Syllo",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
