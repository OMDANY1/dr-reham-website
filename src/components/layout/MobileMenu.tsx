"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SupportedLocale } from "@/config/site";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";

export interface NavItem {
  label: string;
  href: string;
}

export interface MobileMenuProps {
  navItems: NavItem[];
  bookingLabel: string;
  bookingHref: string;
  bookingExternal?: boolean;
  brandName: string;
  locale?: SupportedLocale;
  arHref?: string;
  enHref?: string;
}

export function MobileMenu({
  navItems,
  bookingLabel,
  bookingHref,
  bookingExternal = false,
  brandName,
  locale = "ar",
  arHref = "/ar",
  enHref = "/en",
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

  const isEn = locale === "en";

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) {
      if (wasOpenRef.current) {
        triggerRef.current?.focus();
        wasOpenRef.current = false;
      }
      return;
    }

    wasOpenRef.current = true;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timer = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 10);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        return;
      }

      if (event.key === "Tab" && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="mobile-menu-trigger"
        aria-expanded={isOpen}
        aria-controls="mobile-navigation-dialog"
        aria-label={
          isOpen
            ? isEn
              ? "Close menu"
              : "إغلاق القائمة"
            : isEn
            ? "Open main menu"
            : "فتح القائمة الرئيسية"
        }
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>{isEn ? "Menu" : "القائمة"}</span>
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M2.5 5H15.5M2.5 9H15.5M2.5 13H10.5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {isOpen ? (
        <div
          className="mobile-menu-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <div
            ref={dialogRef}
            id="mobile-navigation-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={isEn ? "Main menu" : "القائمة الرئيسية"}
            className="mobile-menu-dialog"
          >
            <div>
              <div className="mobile-menu-dialog__top">
                <Link
                  href={`/${locale}`}
                  className="site-header__brand"
                  onClick={() => setIsOpen(false)}
                >
                  <Logo tone="ink" size="compact" decorative />
                  <span className="site-header__brand-name">{brandName}</span>
                </Link>

                <button
                  ref={closeButtonRef}
                  type="button"
                  className="mobile-menu-trigger"
                  aria-label={isEn ? "Close menu" : "إغلاق القائمة"}
                  onClick={() => setIsOpen(false)}
                >
                  <span>{isEn ? "Close" : "إغلاق"}</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M3.5 3.5L12.5 12.5M12.5 3.5L3.5 12.5"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              <div
                style={{
                  marginBlockStart: "var(--space-4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingBlock: "0.5rem",
                  paddingInline: "0.75rem",
                  backgroundColor: "var(--color-card-bg)",
                  borderRadius: "var(--control-radius)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <span
                  style={{
                    fontSize: "var(--text-caption)",
                    color: "var(--color-secondary)",
                    fontWeight: 600,
                  }}
                >
                  {isEn ? "Language" : "اللغة"}
                </span>
                <div className="lang-switcher">
                  <Link
                    href={arHref}
                    lang="ar"
                    className={`lang-switcher__link ${
                      !isEn ? "lang-switcher__link--active" : ""
                    }`.trim()}
                    onClick={() => setIsOpen(false)}
                  >
                    عربي
                  </Link>
                  <span className="lang-switcher__divider" aria-hidden="true">
                    |
                  </span>
                  <Link
                    href={enHref}
                    lang="en"
                    className={`lang-switcher__link ${
                      isEn ? "lang-switcher__link--active" : ""
                    }`.trim()}
                    onClick={() => setIsOpen(false)}
                  >
                    EN
                  </Link>
                </div>
              </div>

              <nav aria-label={isEn ? "Mobile navigation" : "روابط الجوال"}>
                <ul className="mobile-menu-dialog__list">
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
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="mobile-menu-dialog__link"
                          aria-current={isActive ? "page" : undefined}
                          onClick={() => setIsOpen(false)}
                        >
                          <span>{item.label}</span>
                          <span aria-hidden="true">{isEn ? "→" : "←"}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>

            <div className="mobile-menu-dialog__footer">
              <Button
                href={bookingHref}
                variant="primary"
                external={bookingExternal}
                onClick={() => setIsOpen(false)}
              >
                {bookingLabel}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
