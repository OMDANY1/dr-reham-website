"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  brandName: string;
}

export function MobileMenu({
  navItems,
  bookingLabel,
  bookingHref,
  brandName,
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

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
        aria-label={isOpen ? "إغلاق القائمة" : "فتح القائمة الرئيسية"}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>القائمة</span>
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
            strokeLinecap="square"
          />
        </svg>
      </button>

      {isOpen ? (
        <div
          className="mobile-drawer-backdrop"
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
            aria-label="القائمة الرئيسية"
            className="mobile-drawer"
          >
            <div>
              <div className="mobile-drawer__top">
                <Link
                  href="/ar"
                  className="site-header__logo-link"
                  aria-label={`${brandName} — الرئيسية`}
                  onClick={() => setIsOpen(false)}
                >
                  <Logo tone="ink" size="compact" decorative />
                </Link>

                <button
                  ref={closeButtonRef}
                  type="button"
                  className="mobile-drawer__close"
                  aria-label="إغلاق القائمة"
                  onClick={() => setIsOpen(false)}
                >
                  إغلاق ×
                </button>
              </div>

              <nav className="mobile-drawer__nav" aria-label="روابط الجوال">
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
                      className={`mobile-drawer__link ${
                        isActive ? "mobile-drawer__link--active" : ""
                      }`.trim()}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setIsOpen(false)}
                    >
                      <span>{item.label}</span>
                      <span aria-hidden="true">←</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="mobile-drawer__footer">
              <Button
                href={bookingHref}
                variant="primary"
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
