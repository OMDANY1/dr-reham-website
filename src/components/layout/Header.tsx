"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { homeContent } from "@/content/ar/home";
import { servicesRecords } from "@/content/ar/services";
import { getBookingCtaLabel, getPublicServices } from "@/lib/content-gates";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { MobileMenu, type NavItem } from "@/components/layout/MobileMenu";

export function getActiveNavItems(): NavItem[] {
  const items: NavItem[] = [
    { label: homeContent.navigation.home, href: "/ar" },
    { label: homeContent.navigation.journal, href: "/ar/journal" },
    { label: homeContent.navigation.about, href: "/ar/about" },
    { label: homeContent.navigation.faq, href: "/ar/faq" },
  ];

  if (getPublicServices(servicesRecords).length > 0) {
    items.push({ label: homeContent.navigation.services, href: "/ar/services" });
  }

  return items;
}

export function Header() {
  const pathname = usePathname();
  const bookingLabel = getBookingCtaLabel(siteConfig);
  const navItems = getActiveNavItems();

  return (
    <header className="site-header">
      <Container className="site-header__inner">
        <Link
          href="/ar"
          className="site-header__logo-link"
          aria-label={`${siteConfig.profile.nameAr} — الصفحة الرئيسية`}
        >
          <Logo tone="ink" size="compact" decorative />
        </Link>

        <nav className="site-header__nav" aria-label="التنقل الرئيسي">
          {navItems.map((item) => {
            const isHome = item.href === "/ar";
            const isActive = isHome
              ? pathname === "/ar"
              : Boolean(
                  pathname === item.href ||
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
          <div className="site-header__cta-desktop">
            <Button href="/ar/book" variant="primary">
              {bookingLabel}
            </Button>
          </div>

          <MobileMenu
            navItems={navItems}
            bookingLabel={bookingLabel}
            bookingHref="/ar/book"
            brandName={siteConfig.profile.nameAr}
          />
        </div>
      </Container>
    </header>
  );
}
