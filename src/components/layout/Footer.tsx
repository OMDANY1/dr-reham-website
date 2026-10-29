import React from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { homeContent } from "@/content/ar/home";
import { servicesRecords } from "@/content/ar/services";
import { faqRecords } from "@/content/ar/faq";
import {
  getBookingCtaLabel,
  getPublicFaqs,
  getPublicServices,
} from "@/lib/content-gates";
import { validateExternalHttpsUrl } from "@/lib/booking-links";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";

export function Footer() {
  const bookingLabel = getBookingCtaLabel(siteConfig);
  const instagramHref = validateExternalHttpsUrl(siteConfig.instagramUrl);
  const hasServices = getPublicServices(servicesRecords).length > 0;
  const hasFaqs = getPublicFaqs(faqRecords).length > 0;

  return (
    <footer className="site-footer">
      <Container>
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <Link
              href="/ar"
              aria-label={`${siteConfig.profile.nameAr} — الرئيسية`}
            >
              <Logo tone="ink" size="compact" decorative />
            </Link>
            <div>
              <p className="site-footer__name">{siteConfig.profile.nameAr}</p>
              <p className="site-footer__meta">
                {siteConfig.profile.specialtyAr} — {siteConfig.profile.city}
              </p>
            </div>
          </div>

          <nav className="site-footer__nav" aria-label="روابط التذييل">
            <Link href="/ar" className="site-footer__link">
              {homeContent.navigation.home}
            </Link>
            <Link href="/ar/journal" className="site-footer__link">
              {homeContent.navigation.journal}
            </Link>
            <Link href="/ar/about" className="site-footer__link">
              {homeContent.navigation.about}
            </Link>
            {hasServices ? (
              <Link href="/ar/services" className="site-footer__link">
                {homeContent.navigation.services}
              </Link>
            ) : null}
            {hasFaqs ? (
              <Link href="/ar/faq" className="site-footer__link">
                {homeContent.navigation.faq}
              </Link>
            ) : null}
            <Link href="/ar/book" className="site-footer__link">
              {bookingLabel}
            </Link>
            <Link href="/ar/privacy" className="site-footer__link">
              {homeContent.navigation.privacy}
            </Link>
            {instagramHref ? (
              <a
                href={instagramHref}
                target="_blank"
                rel="noopener noreferrer"
                className="site-footer__link"
              >
                {siteConfig.instagramLabel} ({siteConfig.instagramHandle}) ↗
              </a>
            ) : null}
          </nav>
        </div>

        <div className="site-footer__bottom">
          <p>
            © {new Date().getFullYear()} {siteConfig.profile.nameAr} —{" "}
            {siteConfig.profile.city}.
          </p>
          <p>
            الصور المنشورة في الموقع تعبيرية وتحريرية ولا تمثل الدكتورة أو مرضى حقيقيين أو نتائج علاجية.
          </p>
        </div>
      </Container>
    </footer>
  );
}
