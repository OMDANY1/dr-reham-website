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

export function getActiveNavItems(): NavItem[] {
  const items: NavItem[] = [
    { label: homeContent.navigation.about, href: "/ar/about" },
    { label: homeContent.navigation.specialty, href: "/ar#specialty" },
  ];

  if (getPublicServices(servicesRecords).length > 0) {
    items.push({ label: homeContent.navigation.services, href: "/ar/services" });
  }

  items.push({ label: homeContent.navigation.journal, href: "/ar/journal" });
  items.push({ label: homeContent.navigation.contact, href: "/ar/book" });
  return items;
}

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const bookingLabel = getBookingCtaLabel(siteConfig);
  const navItems = getActiveNavItems();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 16);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`site-header ${scrolled ? "site-header--scrolled" : ""}`.trim()}
    >
      <Container className="site-header__inner">
        <Link href="/ar" className="site-header__brand">
          <Logo tone="ink" size="compact" decorative />
          <div className="site-header__brand-text">
            <span className="site-header__brand-name">
              {siteConfig.profile.nameAr}
            </span>
            <span className="site-header__brand-sub">
              {siteConfig.profile.specialtyAr}
            </span>
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
          brandName={siteConfig.profile.nameAr}
        />
      </Container>
    </header>
  );
}
