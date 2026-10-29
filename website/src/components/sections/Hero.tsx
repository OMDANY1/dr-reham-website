import React from "react";
import { siteConfig } from "@/config/site";
import { homeContent } from "@/content/ar/home";
import { isLiveBookingReady } from "@/lib/content-gates";
import { validateExternalHttpsUrl } from "@/lib/booking-links";
import { Button } from "@/components/ui/Button";
import type { HomePageCmsData } from "@/lib/cms/types";

export interface HeroProps {
  data?: HomePageCmsData["hero"];
}

export function Hero({ data }: HeroProps = {}) {
  const hero = data ?? {
    ...homeContent.hero,
    primaryHref: siteConfig.instagramUrl,
    image: {
      ...homeContent.hero.image,
      focalX: 36,
      focalY: 35,
    },
  };
  const liveReady = isLiveBookingReady(siteConfig);
  const instagramHref = validateExternalHttpsUrl(
    hero.primaryHref || siteConfig.instagramUrl
  );
  const primaryHref =
    hero.primaryHref && hero.primaryHref.startsWith("/")
      ? hero.primaryHref
      : liveReady
      ? "/ar/book"
      : instagramHref ?? "/ar/book";
  const isExternalPrimary = primaryHref.startsWith("https://");

  return (
    <section className="hero-editorial" aria-labelledby="hero-headline">
      <div className="hero-editorial__layout">
        <div className="hero-editorial__copy">
          <div className="hero-editorial__identity-bar reveal-hero-1">
            <span className="hero-editorial__doctor-name">
              {hero.doctorTag}
            </span>
            <span className="hero-editorial__divider-dot" aria-hidden="true">
              •
            </span>
            <span className="hero-editorial__specialty-tag">
              {hero.specialtyTag}
            </span>
          </div>

          <h1 id="hero-headline" className="hero-editorial__headline reveal-hero-2">
            <span className="hero-editorial__headline-line">
              {hero.headlineLine1}
            </span>
            <span className="hero-editorial__headline-line hero-editorial__headline-accent">
              {hero.headlineLine2}
            </span>
          </h1>

          <span
            className="hero-editorial__sand-line reveal-hero-2"
            data-testid="hero-sand-line"
            aria-hidden="true"
          />

          <p className="hero-editorial__support reveal-hero-3">
            {hero.support}
          </p>
        </div>

        <div className="hero-editorial__photo-stage editorial-photo-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={hero.image.src}
            alt={hero.image.alt}
            width={1600}
            height={1100}
            fetchPriority="high"
            style={
              hero.image.focalX !== undefined && hero.image.focalY !== undefined
                ? {
                    objectPosition: `${hero.image.focalX}% ${hero.image.focalY}%`,
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
              {hero.primaryCta}
            </Button>
            <Button href={hero.secondaryHref} variant="secondary">
              {hero.secondaryCta}
            </Button>
          </div>
          {!liveReady && instagramHref ? (
            <p className="hero-editorial__destination-note">
              {hero.destinationHint}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
