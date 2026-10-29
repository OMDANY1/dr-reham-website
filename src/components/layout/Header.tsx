"use client";

import React, { useEffect, useState } from "react";
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

export function getActiveNavItems(
  nav: typeof homeContent.navigation = homeContent.navigation
): NavItem[] {
  const items: NavItem[] = [
    { label: nav.about, href: "/ar/about" },
    { label: nav.specialty, href: "/ar#specialty" },
  ];

  if (getPublicServices(servicesRecords).length > 0) {
    items.push({ label: nav.services, href: "/ar/services" });
  }

  items.push({ label: nav.journal, href: "/ar/journal" });
  items.push({ label: nav.contact, href: "/ar/book" });
  return items;
}

export interface HeaderProps {
  navigation?: typeof homeContent.navigation;
  brandName?: string;
  specialtyAr?: string;
  bookingLabel?: string;
}

export function Header({
  navigation = homeContent.navigation,
  brandName = siteConfig.profile.nameAr,
  specialtyAr = siteConfig.profile.specialtyAr,
  bookingLabel: bookingLabelProp,
}: HeaderProps = {}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const bookingLabel = bookingLabelProp ?? getBookingCtaLabel(siteConfig);
  const navItems = getActiveNavItems(navigation);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 16);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <header
      className={`site-header ${scrolled ? "site-header--scrolled" : ""}`.trim()}
    >
      <Container className="site-header__inner">
        <Link href="/ar" className="site-header__brand">
          <Logo tone="ink" size="compact" decorative />
          <div className="site-header__brand-text">
            <span className="site-header__brand-name">{brandName}</span>
            <span className="site-header__brand-sub">{specialtyAr}</span>
          </div>
        </Link>

        <nav className="site-header__nav" aria-label="التنقل الرئيسي">
          {navItems.map((item) => {
            const isHashLink = item.href.includes("#");
            const isActive =
              !isHashLink &&
              Boolean(
                pathname === item.href || pathname?.startsWith(`${item.href}/`)
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
          <Button href="/ar/book" variant="primary">
            {bookingLabel}
          </Button>
        </div>

        <MobileMenu
          navItems={navItems}
          bookingLabel={bookingLabel}
          bookingHref="/ar/book"
          brandName={brandName}
        />
      </Container>
    </header>
  );
}
