"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { siteConfig, type SupportedLocale } from "@/config/site";
import { buildWhatsAppBookingUrl } from "@/lib/booking-links";

export interface FloatingWhatsAppProps {
  whatsappUrl?: string | null;
  whatsappDisplay?: string | null;
}

export function FloatingWhatsApp({
  whatsappUrl = siteConfig.whatsappUrl,
  whatsappDisplay = siteConfig.whatsappDisplay,
}: FloatingWhatsAppProps = {}) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const locale: SupportedLocale =
    pathname === "/en" || pathname?.startsWith("/en/") ? "en" : "ar";
  const isEn = locale === "en";

  const href =
    (whatsappUrl && whatsappUrl.startsWith("https://wa.me/")
      ? whatsappUrl
      : buildWhatsAppBookingUrl(siteConfig.whatsappE164)) ??
    siteConfig.whatsappUrl;

  const displayPhone = whatsappDisplay || siteConfig.whatsappDisplay;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="floating-whatsapp-cta"
      data-testid="floating-whatsapp-cta"
      aria-label={
        isEn
          ? `Contact via WhatsApp ${displayPhone}`
          : `تواصل عبر واتساب ${displayPhone}`
      }
    >
      <span className="floating-whatsapp-cta__icon" aria-hidden="true">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2.25C6.62 2.25 2.25 6.62 2.25 12C2.25 13.73 2.71 15.39 3.57 16.86L2.25 21.75L7.28 20.43C8.71 21.23 10.33 21.66 12 21.66C17.38 21.66 21.75 17.38 21.75 12C21.75 6.62 17.38 2.25 12 2.25Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9.35 8.65C9.15 8.2 8.95 8.18 8.76 8.17C8.61 8.16 8.44 8.16 8.27 8.16C8.1 8.16 7.82 8.23 7.59 8.48C7.35 8.73 6.7 9.35 6.7 10.6C6.7 11.85 7.61 13.06 7.74 13.23C7.87 13.4 9.5 16.03 12.08 17.04C14.23 17.88 14.66 17.71 15.13 17.67C15.6 17.63 16.64 17.05 16.85 16.45C17.06 15.85 17.06 15.34 17 15.23C16.94 15.12 16.77 15.06 16.51 14.93C16.25 14.8 15 14.18 14.77 14.1C14.54 14.01 14.37 13.97 14.2 14.23C14.03 14.48 13.54 15.06 13.39 15.23C13.24 15.4 13.09 15.42 12.83 15.29C12.57 15.16 11.75 14.89 10.77 14.01C10.01 13.33 9.5 12.49 9.35 12.23C9.2 11.98 9.33 11.84 9.46 11.71C9.58 11.59 9.72 11.41 9.85 11.26C9.98 11.11 10.02 11 10.1 10.83C10.19 10.66 10.15 10.51 10.08 10.38C10.02 10.25 9.54 9.04 9.35 8.65Z"
            fill="currentColor"
          />
        </svg>
      </span>
      <span className="floating-whatsapp-cta__label">
        {isEn ? "WhatsApp" : "واتساب"}
      </span>
      <span className="floating-whatsapp-cta__phone ltr-inline" dir="ltr">
        {displayPhone}
      </span>
    </a>
  );
}
