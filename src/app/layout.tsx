import type { Metadata } from "next";
import "@/styles/globals.css";
import { homeContent } from "@/content/ar/home";
import { buildRouteMetadata } from "@/lib/metadata";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = buildRouteMetadata({
  title: homeContent.meta.title,
  description: homeContent.meta.description,
  pathname: "/ar",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <a href="#main-content" className="skip-link">
          تخطي إلى المحتوى الرئيسي
        </a>
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
