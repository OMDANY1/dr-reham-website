"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig, type SupportedLocale } from "@/config/site";
import { homeContent } from "@/content/ar/home";
import { homeContentEn } from "@/content/en";
import { servicesRecords } from "@/content/ar/services";
import {
  getBookingCtaLabel,
  getPublicServices,
  isLiveBookingReady,
} from "@/lib/content-gates";
import { buildWhatsAppBookingUrl } from "@/lib/booking-links";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";
import { MobileMenu, type NavItem } from "@/components/layout/MobileMenu";

export function getActiveNavItems(
  nav: typeof homeContent.navigation = homeContent.navigation,
  locale: SupportedLocale = "ar"
): NavItem[] {
  const prefix = `/${locale}`;
  const isEn = locale === "en";
  const items: NavItem[] = [
    { label: nav.home, href: prefix },
    { label: nav.about, href: `${prefix}/about` },
    { label: nav.specialty, href: `${prefix}#specialty` },
  ];

  if (getPublicServices(servicesRecords).length > 0) {
    items.push({ label: nav.services, href: `${prefix}/services` });
  }

  items.push({
    label: isEn ? "Education" : "التوعية",
    href: `${prefix}#education`,
  });
  items.push({ label: nav.journal, href: `${prefix}/journal` });
  items.push({ label: nav.contact, href: `${prefix}/book` });
  return items;
}

export interface HeaderProps {
  navigation?: typeof homeContent.navigation;
  navigationEn?: typeof homeContent.navigation;
  brandName?: string;
  brandNameEn?: string;
  specialtyAr?: string;
  specialtyEn?: string;
  bookingLabel?: string;
  bookingLabelEn?: string;
}

export function Header({
  navigation = homeContent.navigation,
  navigationEn = homeContentEn.navigation,
  brandName = siteConfig.profile.nameAr,
  brandNameEn = siteConfig.profile.nameEn,
  specialtyAr = siteConfig.profile.specialtyAr,
  specialtyEn = siteConfig.profile.specialtyEn,
  bookingLabel: bookingLabelProp,
  bookingLabelEn: bookingLabelEnProp,
}: HeaderProps = {}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  const locale: SupportedLocale =
    pathname === "/en" || pathname?.startsWith("/en/") ? "en" : "ar";
  const isEn = locale === "en";

  const activeNav = isEn ? navigationEn : navigation;
  const activeBrand = isEn ? brandNameEn : brandName;
  const activeSpecialty = isEn ? specialtyEn : specialtyAr;

  const liveReady = isLiveBookingReady(siteConfig);
  const whatsappHref =
    buildWhatsAppBookingUrl(siteConfig.whatsappE164) ?? siteConfig.whatsappUrl;

  const bookingLabel = isEn
    ? bookingLabelEnProp ??
      (liveReady
        ? getBookingCtaLabel(siteConfig, siteConfig.clinics, "en")
        : activeNav.primaryInquiryCta)
    : bookingLabelProp ??
      (liveReady
        ? getBookingCtaLabel(siteConfig, siteConfig.clinics, "ar")
        : activeNav.primaryInquiryCta);

  const bookingHref = liveReady ? `/${locale}/book` : whatsappHref;
  const bookingExternal = !liveReady && bookingHref.startsWith("https://");
  const navItems = getActiveNavItems(activeNav, locale);

  const suffix = pathname ? pathname.replace(/^\/(ar|en)(?=\/|$)/, "") : "";
  const arHref = `/ar${suffix}`;
  const enHref = `/en${suffix}`;

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 16);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    document.documentElement.lang = locale;
    document.documentElement.dir = isEn ? "ltr" : "rtl";
  }, [locale, isEn, pathname]);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <header
      className={`site-header ${scrolled ? "site-header--scrolled" : ""}`.trim()}
    >
      <Container className="site-header__inner">
        <Link href={`/${locale}`} className="site-header__brand">
          <Logo tone="ink" size="compact" decorative />
          <div className="site-header__brand-text">
            <span className="site-header__brand-name">{activeBrand}</span>
            <span className="site-header__brand-sub">{activeSpecialty}</span>
          </div>
        </Link>

        <nav
          className="site-header__nav"
          aria-label={isEn ? "Main navigation" : "التنقل الرئيسي"}
        >
          {navItems.map((item) => {
            const isHashLink = item.href.includes("#");
            const isHome = item.href === `/${locale}`;
            const isActive =
              !isHashLink &&
              Boolean(
                isHome
                  ? pathname === item.href
                  : pathname === item.href ||
                      pathname?.startsWith(`${item.href}/`)
              );
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`site-header__link ${
                  isActive ? "site-header__link--active" : ""
                }`.trim()}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="site-header__actions">
          <div
            className="lang-switcher"
            data-testid="header-lang-switcher"
            role="group"
            aria-label={isEn ? "Language switcher" : "تبديل اللغة"}
          >
            <Link
              href={arHref}
              lang="ar"
              hrefLang="ar"
              className={`lang-switcher__link ${
                !isEn ? "lang-switcher__link--active" : ""
              }`.trim()}
              aria-current={!isEn ? "true" : undefined}
            >
              عربي
            </Link>
            <span className="lang-switcher__divider" aria-hidden="true">
              |
            </span>
            <Link
              href={enHref}
              lang="en"
              hrefLang="en"
              className={`lang-switcher__link ${
                isEn ? "lang-switcher__link--active" : ""
              }`.trim()}
              aria-current={isEn ? "true" : undefined}
            >
              EN
            </Link>
          </div>

          {bookingExternal ? (
            <a
              href={bookingHref}
              target="_blank"
              rel="noopener noreferrer"
              className="header-cta-pill"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <rect
                  x="2"
                  y="3"
                  width="12"
                  height="11"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.35"
                />
                <path
                  d="M2 6.5H14M5.2 1.8V4.2M10.8 1.8V4.2"
                  stroke="currentColor"
                  strokeWidth="1.35"
                  strokeLinecap="round"
                />
              </svg>
              <span>{bookingLabel}</span>
            </a>
          ) : (
            <Link href={bookingHref} className="header-cta-pill">
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <rect
                  x="2"
                  y="3"
                  width="12"
                  height="11"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.35"
                />
                <path
                  d="M2 6.5H14M5.2 1.8V4.2M10.8 1.8V4.2"
                  stroke="currentColor"
                  strokeWidth="1.35"
                  strokeLinecap="round"
                />
              </svg>
              <span>{bookingLabel}</span>
            </Link>
          )}
        </div>

        <MobileMenu
          navItems={navItems}
          bookingLabel={bookingLabel}
          bookingHref={bookingHref}
          bookingExternal={bookingExternal}
          brandName={activeBrand}
          locale={locale}
          arHref={arHref}
          enHref={enHref}
        />
      </Container>
    </header>
  );
}
