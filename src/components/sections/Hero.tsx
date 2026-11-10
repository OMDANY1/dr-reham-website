import React from "react";
import { siteConfig, type SupportedLocale } from "@/config/site";
import { homeContent } from "@/content/ar/home";
import { homeContentEn } from "@/content/en";
import { isLiveBookingReady } from "@/lib/content-gates";
import {
  buildWhatsAppBookingUrl,
  validateExternalHttpsUrl,
} from "@/lib/booking-links";
import { Button } from "@/components/ui/Button";
import type { HomePageCmsData } from "@/lib/cms/types";

export interface HeroProps {
  data?: HomePageCmsData["hero"];
  enOverride?: NonNullable<HomePageCmsData["en"]>["hero"];
  locale?: SupportedLocale;
}

export function Hero({ data, enOverride, locale = "ar" }: HeroProps = {}) {
  const isEn = locale === "en";
  const whatsappHref =
    buildWhatsAppBookingUrl(siteConfig.whatsappE164) ?? siteConfig.whatsappUrl;

  const baseHero = isEn ? homeContentEn.hero : homeContent.hero;

  const rawImageSrc = data?.image?.src || baseHero.image.src;
  const effectiveImageSrc =
    rawImageSrc === "/media/hero-eye-editorial.jpg"
      ? "/media/hero-eye-plum-ivory.jpg"
      : rawImageSrc;

  const specialtyEyebrow = isEn
    ? enOverride?.specialtyTag || baseHero.specialtyTag
    : data?.specialtyTag || baseHero.specialtyTag;

  const nameLine1 = isEn
    ? enOverride?.headlineLine1 || baseHero.headlineLine1
    : data?.headlineLine1 === "عناية دقيقة"
    ? homeContent.hero.headlineLine1
    : data?.headlineLine1 || baseHero.headlineLine1;

  const nameLine2 = isEn
    ? enOverride?.headlineLine2 || baseHero.headlineLine2
    : data?.headlineLine2 === "بتفاصيل نظرتك"
    ? homeContent.hero.headlineLine2
    : data?.headlineLine2 || baseHero.headlineLine2;

  const rawTagline = isEn
    ? enOverride?.tagline || baseHero.tagline
    : data?.tagline || baseHero.tagline;
  const taglineLines = rawTagline
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const supportText = isEn
    ? enOverride?.support || baseHero.support
    : data?.support || baseHero.support;

  const primaryCtaLabel = isEn
    ? enOverride?.primaryCta || baseHero.primaryCta
    : data?.primaryCta === "تواصل للاستفسار"
    ? homeContent.hero.primaryCta
    : data?.primaryCta || baseHero.primaryCta;

  const secondaryCtaLabel = isEn
    ? enOverride?.secondaryCta || baseHero.secondaryCta
    : data?.secondaryCta || baseHero.secondaryCta;

  const destinationHint = isEn
    ? enOverride?.destinationHint || baseHero.destinationHint
    : data?.destinationHint?.includes("إنستجرام")
    ? homeContent.hero.destinationHint
    : data?.destinationHint || baseHero.destinationHint;

  const liveReady = isLiveBookingReady(siteConfig);
  const rawPrimaryHref =
    !data?.primaryHref || data.primaryHref === siteConfig.instagramUrl
      ? whatsappHref
      : data.primaryHref;

  const externalHref = validateExternalHttpsUrl(rawPrimaryHref || whatsappHref);
  const primaryHref =
    rawPrimaryHref && rawPrimaryHref.startsWith("/")
      ? rawPrimaryHref.replace(/^\/(ar|en)(?=\/|$)/, `/${locale}`)
      : liveReady
      ? `/${locale}/book`
      : externalHref ?? whatsappHref;
  const isExternalPrimary = primaryHref.startsWith("https://");

  const secondaryHref = `/${locale}/about`;
  const imageAlt = isEn
    ? data?.image?.altEn || baseHero.image.alt
    : data?.image?.alt || baseHero.image.alt;

  return (
    <section className="hero-editorial" aria-labelledby="hero-headline">
      {/* Subtle palm-frond shadow in the top-start corner matching the reference composition */}
      <svg
        className="hero-editorial__palm-shadow"
        viewBox="0 0 360 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M-20 -10C60 40 160 120 250 260"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M20 20C95 18 190 30 280 55C195 48 110 45 20 20Z"
          fill="currentColor"
        />
        <path
          d="M45 50C130 52 225 74 315 110C220 96 130 82 45 50Z"
          fill="currentColor"
        />
        <path
          d="M75 88C160 96 245 125 330 168C235 148 150 124 75 88Z"
          fill="currentColor"
        />
        <path
          d="M110 132C185 145 260 178 335 225C250 200 175 172 110 132Z"
          fill="currentColor"
        />
        <path
          d="M12 35C8 110 16 195 42 280C32 195 28 115 12 35Z"
          fill="currentColor"
        />
        <path
          d="M48 68C52 145 68 225 98 305C82 222 70 145 48 68Z"
          fill="currentColor"
        />
        <path
          d="M88 108C100 180 122 250 156 318C136 245 116 175 88 108Z"
          fill="currentColor"
        />
      </svg>

      <div className="hero-editorial__layout">
        <div className="hero-editorial__copy">
          <span className="hero-editorial__eyebrow reveal-hero-1">
            {specialtyEyebrow}
          </span>

          <h1
            id="hero-headline"
            className="hero-editorial__headline reveal-hero-2"
          >
            <span className="hero-editorial__headline-line">{nameLine1}</span>{" "}
            <span className="hero-editorial__headline-line">{nameLine2}</span>
          </h1>

          <p className="hero-editorial__tagline reveal-hero-2">
            {taglineLines.map((line, i) => (
              <span key={i} className="hero-editorial__tagline-line">
                {line}
              </span>
            ))}
          </p>

          <span
            className="hero-editorial__sand-line reveal-hero-2"
            data-testid="hero-sand-line"
            aria-hidden="true"
          />

          <p className="hero-editorial__support reveal-hero-3">{supportText}</p>
        </div>

        <div className="hero-editorial__photo-stage editorial-photo-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={effectiveImageSrc}
            alt={imageAlt}
            width={1600}
            height={1100}
            fetchPriority="high"
            style={
              data?.image?.focalX !== undefined &&
              data?.image?.focalY !== undefined &&
              data.image.src === "/media/hero-eye-plum-ivory.jpg"
                ? {
                    objectPosition: `${data.image.focalX}% ${data.image.focalY}%`,
                  }
                : undefined
            }
            className="hero-editorial__img reveal-hero-photo editorial-photo-zoom"
          />
        </div>

        <div className="hero-editorial__actions-wrap reveal-hero-4">
          <div className="hero-editorial__cta-row">
            <Button
              href={primaryHref}
              variant="primary"
              external={isExternalPrimary}
            >
              <span>{primaryCtaLabel}</span>
              <span aria-hidden="true">{isEn ? "→" : "←"}</span>
            </Button>
            <Button href={secondaryHref} variant="secondary">
              <svg
                width="16"
                height="16"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <circle
                  cx="9"
                  cy="9"
                  r="7.25"
                  stroke="currentColor"
                  strokeWidth="1.35"
                />
                <path
                  d="M7.5 6.2L11.5 9L7.5 11.8V6.2Z"
                  fill="currentColor"
                />
              </svg>
              <span>{secondaryCtaLabel}</span>
            </Button>
          </div>
          <p className="hero-editorial__destination-note">
            <span>{destinationHint} </span>
            <span className="ltr-inline" dir="ltr">
              {siteConfig.whatsappDisplay}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
