import type { Metadata } from "next";
import Script from "next/script";
import AnalyticsPageView from "../components/analytics-page-view";
import "@xyflow/react/dist/style.css";
import "katex/dist/katex.min.css";
import "./design-tokens.css";
import "./globals.css";
import "./lesson-04-deck.css";

export const metadata: Metadata = {
  title: "Syllo | סביבת למידה",
  description: "סביבת הלמידה של Syllo",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  return (
    <html lang="he" dir="rtl">
      <body>{children}<AnalyticsPageView /></body>
      {/* GA4 page views are dispatched by AnalyticsPageView on hydration and route changes.
          Keep Enhanced Measurement's Page views disabled in the GA4 property to avoid duplicates. */}
      {gaId && <><Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" /><Script id="google-analytics" strategy="afterInteractive">{`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} window.gtag = gtag; gtag('js', new Date()); gtag('config', '${gaId}', { send_page_view: false });`}</Script></>}
    </html>
  );
}
