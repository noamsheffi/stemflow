import type { Metadata } from "next";
import Script from "next/script";
import AnalyticsPageView from "../components/analytics-page-view";
import "./globals.css";

export const metadata: Metadata = {
  title: "Syllo | סביבת למידה",
  description: "סביבת הלמידה של Syllo",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  return (
    <html lang="he" dir="rtl">
      <body>{children}<AnalyticsPageView /></body>
      {gaId && <><Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" /><Script id="google-analytics" strategy="afterInteractive">{`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} window.gtag = gtag; gtag('js', new Date()); gtag('config', '${gaId}', { send_page_view: false });`}</Script></>}
    </html>
  );
}
