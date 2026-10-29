"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

export interface FooterProps {
  navigation?: typeof homeContent.navigation;
  brandName?: string;
  specialtyAr?: string;
  city?: string;
  instagramUrl?: string;
  footerDisclaimer?: string;
  bookingLabel?: string;
}

export function Footer({
  navigation = homeContent.navigation,
  brandName = siteConfig.profile.nameAr,
  specialtyAr = siteConfig.profile.specialtyAr,
  city = siteConfig.profile.city,
  instagramUrl = siteConfig.instagramUrl,
  footerDisclaimer = "الصور المنشورة في الموقع تعبيرية وتحريرية ولا تمثل حالات مرضى أو نتائج علاجية.",
  bookingLabel: bookingLabelProp,
}: FooterProps = {}) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const bookingLabel = bookingLabelProp ?? getBookingCtaLabel(siteConfig);
  const instagramHref = validateExternalHttpsUrl(instagramUrl);
  const hasServices = getPublicServices(servicesRecords).length > 0;
  const hasFaqs = getPublicFaqs(faqRecords).length > 0;

  return (
    <footer className="site-footer">
      <Container>
        <div className="site-footer__grid">
          <div>
            <Link href="/ar" className="site-header__brand">
              <Logo tone="ink" size="compact" decorative />
              <div className="site-header__brand-text">
                <span className="site-header__brand-name">{brandName}</span>
                <span className="site-header__brand-sub">{specialtyAr}</span>
              </div>
            </Link>
            <p
              style={{
                marginBlockStart: "var(--space-3)",
                color: "var(--color-paragraph)",
                maxInlineSize: "36ch",
              }}
            >
              عناية دقيقة بتفاصيل نظرتك — {specialtyAr} في {city}.
            </p>
          </div>

          <nav aria-label="روابط التذييل">
            <h2
              style={{
                fontSize: "var(--text-small)",
                fontWeight: 700,
                color: "var(--color-navy)",
                marginBlockEnd: "var(--space-3)",
              }}
            >
              التنقل
            </h2>
            <ul className="site-footer__list">
              <li>
                <Link href="/ar/about" className="site-footer__link">
                  {navigation.about}
                </Link>
              </li>
              <li>
                <Link href="/ar#specialty" className="site-footer__link">
                  {navigation.specialty}
                </Link>
              </li>
              {hasServices ? (
                <li>
                  <Link href="/ar/services" className="site-footer__link">
                    {navigation.services}
                  </Link>
                </li>
              ) : null}
              <li>
                <Link href="/ar/journal" className="site-footer__link">
                  {navigation.journal}
                </Link>
              </li>
              {hasFaqs ? (
                <li>
                  <Link href="/ar/faq" className="site-footer__link">
                    {navigation.faq}
                  </Link>
                </li>
              ) : null}
              <li>
                <Link href="/ar/book" className="site-footer__link">
                  {bookingLabel}
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h2
              style={{
                fontSize: "var(--text-small)",
                fontWeight: 700,
                color: "var(--color-navy)",
                marginBlockEnd: "var(--space-3)",
              }}
            >
              التواصل والخصوصية
            </h2>
            <ul className="site-footer__list">
              {instagramHref ? (
                <li>
                  <a
                    href={instagramHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="site-footer__link"
                  >
                    <span>إنستجرام</span>
                    <span
                      className="ltr-inline"
                      style={{ marginInlineStart: "0.4rem" }}
                    >
                      @dr.rehamdq
                    </span>
                  </a>
                </li>
              ) : null}
              <li>
                <Link href="/ar/privacy" className="site-footer__link">
                  {navigation.privacy}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p
            style={{
              color: "var(--color-paragraph)",
              fontSize: "var(--text-small)",
            }}
          >
            © {new Date().getFullYear()} {brandName} — {city}.
          </p>
          <p
            style={{
              color: "var(--color-paragraph)",
              fontSize: "var(--text-caption)",
            }}
          >
            {footerDisclaimer}
          </p>
        </div>
      </Container>
    </footer>
  );
}
