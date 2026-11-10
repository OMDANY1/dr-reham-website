"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig, type SupportedLocale } from "@/config/site";
import { homeContent } from "@/content/ar/home";
import { homeContentEn } from "@/content/en";
import { servicesRecords } from "@/content/ar/services";
import { faqRecords } from "@/content/ar/faq";
import {
  getBookingCtaLabel,
  getPublicFaqs,
  getPublicServices,
} from "@/lib/content-gates";
import {
  buildWhatsAppBookingUrl,
  validateExternalHttpsUrl,
} from "@/lib/booking-links";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";

export interface FooterProps {
  navigation?: typeof homeContent.navigation;
  navigationEn?: typeof homeContent.navigation;
  brandName?: string;
  brandNameEn?: string;
  specialtyAr?: string;
  specialtyEn?: string;
  city?: string;
  cityEn?: string;
  instagramUrl?: string;
  footerDisclaimer?: string;
  footerDisclaimerEn?: string;
  bookingLabel?: string;
  bookingLabelEn?: string;
  whatsappUrl?: string | null;
  whatsappDisplay?: string | null;
}

export function Footer({
  navigation = homeContent.navigation,
  navigationEn = homeContentEn.navigation,
  brandName = siteConfig.profile.nameAr,
  brandNameEn = siteConfig.profile.nameEn,
  specialtyAr = siteConfig.profile.specialtyAr,
  specialtyEn = siteConfig.profile.specialtyEn,
  city = siteConfig.profile.city,
  cityEn = siteConfig.profile.cityEn,
  instagramUrl = siteConfig.instagramUrl,
  footerDisclaimer = "الصور المنشورة في الموقع تعبيرية وتحريرية ولا تمثل حالات مرضى أو نتائج علاجية.",
  footerDisclaimerEn = "Images published on this website are editorial and illustrative and do not represent individual patient cases or clinical outcomes.",
  bookingLabel: bookingLabelProp,
  bookingLabelEn: bookingLabelEnProp,
  whatsappUrl,
  whatsappDisplay,
}: FooterProps = {}) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const locale: SupportedLocale =
    pathname === "/en" || pathname?.startsWith("/en/") ? "en" : "ar";
  const isEn = locale === "en";

  const activeNav = isEn ? navigationEn : navigation;
  const activeBrand = isEn ? brandNameEn : brandName;
  const activeSpecialty = isEn ? specialtyEn : specialtyAr;
  const activeCity = isEn ? cityEn : city;
  const activeDisclaimer = isEn ? footerDisclaimerEn : footerDisclaimer;

  const bookingLabel = isEn
    ? bookingLabelEnProp ??
      getBookingCtaLabel(siteConfig, siteConfig.clinics, "en")
    : bookingLabelProp ??
      getBookingCtaLabel(siteConfig, siteConfig.clinics, "ar");

  const whatsappHref =
    (whatsappUrl && whatsappUrl.startsWith("https://wa.me/")
      ? whatsappUrl
      : buildWhatsAppBookingUrl(siteConfig.whatsappE164)) ??
    siteConfig.whatsappUrl;
  const activeWhatsappDisplay = whatsappDisplay || siteConfig.whatsappDisplay;
  const instagramHref = validateExternalHttpsUrl(instagramUrl);
  const hasServices = getPublicServices(servicesRecords).length > 0;
  const hasFaqs = getPublicFaqs(faqRecords).length > 0;

  return (
    <footer className="site-footer">
      <Container>
        <div className="site-footer__grid">
          <div>
            <Link href={`/${locale}`} className="site-header__brand">
              <Logo tone="ink" size="compact" decorative />
              <div className="site-header__brand-text">
                <span className="site-header__brand-name">{activeBrand}</span>
                <span className="site-header__brand-sub">{activeSpecialty}</span>
              </div>
            </Link>
            <p
              style={{
                marginBlockStart: "var(--space-3)",
                color: "var(--color-paragraph)",
                maxInlineSize: "38ch",
              }}
            >
              {isEn
                ? `Precision in Care. Harmony in Aesthetics — ${activeSpecialty} in ${activeCity}.`
                : `عناية دقيقة بتفاصيل نظرتك — ${activeSpecialty} في ${activeCity}.`}
            </p>
          </div>

          <nav aria-label={isEn ? "Footer links" : "روابط التذييل"}>
            <h2
              style={{
                fontSize: "var(--text-small)",
                fontWeight: 700,
                color: "var(--color-plum-dark)",
                marginBlockEnd: "var(--space-3)",
              }}
            >
              {isEn ? "Navigation" : "التنقل"}
            </h2>
            <ul className="site-footer__list">
              <li>
                <Link href={`/${locale}/about`} className="site-footer__link">
                  {activeNav.about}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}#specialty`}
                  className="site-footer__link"
                >
                  {activeNav.specialty}
                </Link>
              </li>
              {hasServices ? (
                <li>
                  <Link
                    href={`/${locale}/services`}
                    className="site-footer__link"
                  >
                    {activeNav.services}
                  </Link>
                </li>
              ) : null}
              <li>
                <Link href={`/${locale}/journal`} className="site-footer__link">
                  {activeNav.journal}
                </Link>
              </li>
              {hasFaqs ? (
                <li>
                  <Link href={`/${locale}/faq`} className="site-footer__link">
                    {activeNav.faq}
                  </Link>
                </li>
              ) : null}
              <li>
                <Link href={`/${locale}/book`} className="site-footer__link">
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
                color: "var(--color-plum-dark)",
                marginBlockEnd: "var(--space-3)",
              }}
            >
              {isEn ? "Contact & Privacy" : "التواصل والخصوصية"}
            </h2>
            <ul className="site-footer__list">
              {whatsappHref ? (
                <li>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="site-footer__link"
                  >
                    <span>{isEn ? "WhatsApp" : "واتساب"}</span>
                    <span
                      className="ltr-inline"
                      dir="ltr"
                      style={{ marginInlineStart: "0.4rem" }}
                    >
                      {activeWhatsappDisplay}
                    </span>
                  </a>
                </li>
              ) : null}
              {instagramHref ? (
                <li>
                  <a
                    href={instagramHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="site-footer__link"
                  >
                    <span>{isEn ? "Instagram" : "إنستجرام"}</span>
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
                <Link href={`/${locale}/privacy`} className="site-footer__link">
                  {activeNav.privacy}
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
            © {new Date().getFullYear()} {activeBrand} — {activeCity}.
          </p>
          <p
            style={{
              color: "var(--color-paragraph)",
              fontSize: "var(--text-caption)",
            }}
          >
            {activeDisclaimer}
          </p>
        </div>
      </Container>
    </footer>
  );
}
