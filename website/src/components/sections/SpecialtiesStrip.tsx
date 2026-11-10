import React from "react";
import type { SupportedLocale } from "@/config/site";
import { homeContent } from "@/content/ar/home";
import { homeContentEn } from "@/content/en";
import type { HomePageCmsData } from "@/lib/cms/types";
import { Container } from "@/components/ui/Container";

export interface SpecialtiesStripProps {
  data?: HomePageCmsData["specialtiesStrip"];
  locale?: SupportedLocale;
}

function SpecialtyIcon({ icon }: { icon: string }) {
  switch (icon) {
    case "eye":
    case "eyelid":
      return (
        <svg
          width="34"
          height="34"
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M3.5 18C7.2 11.4 12.2 8.2 18 8.2C23.8 8.2 28.8 11.4 32.5 18C28.8 24.6 23.8 27.8 18 27.8C12.2 27.8 7.2 24.6 3.5 18Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="18"
            cy="18"
            r="4.5"
            stroke="currentColor"
            strokeWidth="1.4"
          />
        </svg>
      );
    case "droplet":
    case "lacrimal":
      return (
        <svg
          width="34"
          height="34"
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M18 5.5C18 5.5 9.5 15.8 9.5 22C9.5 26.7 13.3 30.5 18 30.5C22.7 30.5 26.5 26.7 26.5 22C26.5 15.8 18 5.5 18 5.5Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 23C14.5 25.2 16.2 26.6 18.5 26.8"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
      );
    case "spark":
    case "orbital":
      return (
        <svg
          width="34"
          height="34"
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle
            cx="18"
            cy="18"
            r="5.5"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <ellipse
            cx="18"
            cy="18"
            rx="13.5"
            ry="6.5"
            transform="rotate(-28 18 18)"
            stroke="currentColor"
            strokeWidth="1.35"
          />
          <circle cx="28" cy="11.5" r="1.6" fill="currentColor" />
          <circle cx="8" cy="24.5" r="1.6" fill="currentColor" />
        </svg>
      );
    case "layers":
    case "reconstructive":
    default:
      return (
        <svg
          width="34"
          height="34"
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M18 7L30 13.5L18 20L6 13.5L18 7Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path
            d="M6 18.5L18 25L30 18.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6 23.5L18 30L30 23.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

export function SpecialtiesStrip({
  data,
  locale = "ar",
}: SpecialtiesStripProps = {}) {
  const isEn = locale === "en";
  const cmsItems = data?.length ? data : null;
  const fallbackAr = homeContent.specialtiesStrip;
  const fallbackEn = homeContentEn.specialtiesStrip;

  const activeItems = cmsItems
    ? cmsItems
        .filter((item) => item.enabled !== false)
        .map((item, idx) => ({
          id: item.id,
          icon: item.icon,
          title: isEn
            ? item.titleEn || fallbackEn[idx]?.title || item.title
            : item.title,
          subtitle: isEn
            ? item.subtitleEn || fallbackEn[idx]?.subtitle || item.subtitle
            : item.subtitle,
        }))
    : (isEn ? fallbackEn : fallbackAr).map((item) => ({
        id: item.id,
        icon: item.icon,
        title: item.title,
        subtitle: item.subtitle,
      }));

  if (activeItems.length === 0) {
    return null;
  }

  return (
    <section
      id="specialty"
      className="specialties-strip"
      data-testid="specialties-strip"
      aria-label={
        isEn ? "Core Subspecialty Focus Areas" : "محاور التخصص الدقيق"
      }
    >
      <Container>
        <ul className="specialties-strip__grid">
          {activeItems.map((item) => (
            <li key={item.id} className="specialties-strip__item">
              <span className="specialties-strip__icon">
                <SpecialtyIcon icon={item.icon} />
              </span>
              <div>
                <h2 className="specialties-strip__title">{item.title}</h2>
                <p className="specialties-strip__subtitle">{item.subtitle}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
