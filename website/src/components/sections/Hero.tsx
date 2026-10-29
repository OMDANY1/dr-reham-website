import React from "react";
import { siteConfig } from "@/config/site";
import { homeContent } from "@/content/ar/home";
import { isLiveBookingReady } from "@/lib/content-gates";
import { validateExternalHttpsUrl } from "@/lib/booking-links";
import { Button } from "@/components/ui/Button";

export function Hero() {
  const liveReady = isLiveBookingReady(siteConfig);
  const instagramHref = validateExternalHttpsUrl(siteConfig.instagramUrl);
  const primaryHref = liveReady
    ? "/ar/book"
    : instagramHref ?? "/ar/book";

  return (
    <section className="hero-editorial" aria-labelledby="hero-headline">
      <div className="hero-editorial__layout">
        {/* 1. النص والعنوان الرئيسي الكبير — يظهر أولًا على الجوال، وعلى اليمين في الديسكتوب */}
        <div className="hero-editorial__copy">
          <div className="hero-editorial__identity-bar reveal-hero-1">
            <span className="hero-editorial__doctor-name">
              {homeContent.hero.doctorTag}
            </span>
            <span className="hero-editorial__divider-dot" aria-hidden="true">
              •
            </span>
            <span className="hero-editorial__specialty-tag">
              {homeContent.hero.specialtyTag}
            </span>
          </div>

          <h1 id="hero-headline" className="hero-editorial__headline reveal-hero-2">
            <span className="hero-editorial__headline-line">
              {homeContent.hero.headlineLine1}
            </span>
            <span className="hero-editorial__headline-line hero-editorial__headline-accent">
              {homeContent.hero.headlineLine2}
            </span>
          </h1>

          <p className="hero-editorial__support reveal-hero-3">
            {homeContent.hero.support}
          </p>
        </div>

        {/* 2. الصورة التحريرية المقرّبة للعين والحاجب — 58% ممتدة لحافة التكوين في الديسكتوب، وثاني عنصر في الجوال */}
        <div className="hero-editorial__photo-stage editorial-photo-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={homeContent.hero.image.src}
            alt={homeContent.hero.image.alt}
            width={1600}
            height={1100}
            fetchPriority="high"
            className="hero-editorial__img reveal-hero-photo editorial-photo-zoom"
          />
        </div>

        {/* 3. أزرار الإجراءات — تظهر بعد الصورة على الجوال، وتحت النص مباشرة على الديسكتوب */}
        <div className="hero-editorial__actions-wrap reveal-hero-4">
          <div className="hero-editorial__cta-row">
            <Button
              href={primaryHref}
              variant="primary"
              external={!liveReady && Boolean(instagramHref)}
            >
              {homeContent.hero.primaryCta}
            </Button>
            <Button href={homeContent.hero.secondaryHref} variant="secondary">
              {homeContent.hero.secondaryCta}
            </Button>
          </div>
          {!liveReady && instagramHref ? (
            <p className="hero-editorial__destination-note">
              {homeContent.hero.destinationHint}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
