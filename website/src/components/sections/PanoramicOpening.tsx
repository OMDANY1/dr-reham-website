import React from "react";
import { siteConfig } from "@/config/site";
import { homeContent } from "@/content/ar/home";
import { getBookingCtaLabel, isLiveBookingReady } from "@/lib/content-gates";
import { validateExternalHttpsUrl } from "@/lib/booking-links";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export function PanoramicOpening() {
  const { opening } = homeContent;
  const liveReady = isLiveBookingReady(siteConfig);
  const ctaLabel = getBookingCtaLabel(siteConfig);
  const instagramHref = validateExternalHttpsUrl(siteConfig.instagramUrl);
  const primaryHref =
    !liveReady && instagramHref ? instagramHref : "/ar/book";
  const isExternal = Boolean(!liveReady && instagramHref);

  return (
    <section
      className="panoramic-opening"
      aria-labelledby="panoramic-opening-headline"
    >
      <Container>
        {/* الطبقة (ب): العنوان التحريري الكبير + التعريف المستقل */}
        <div className="panoramic-opening__top">
          <h1
            id="panoramic-opening-headline"
            className="panoramic-opening__headline"
          >
            <span className="panoramic-opening__line-1 gaze-unit-1">
              {opening.headlineLine1}
            </span>
            <span className="panoramic-opening__line-2 gaze-unit-2">
              {opening.headlineLine2}
            </span>
          </h1>

          <div className="panoramic-opening__identity gaze-unit-3">
            <strong className="panoramic-opening__doctor-name">
              {opening.doctorName}
            </strong>
            <p className="panoramic-opening__doctor-descriptor">
              {opening.doctorDescriptor}
            </p>
          </div>
        </div>

        {/* الطبقة (ج): الصورة البانورامية العريضة بقصّة مستقلة للموبايل */}
        <div className="panoramic-opening__frame gaze-panorama-enter">
          <picture className="panoramic-opening__picture">
            <source
              media="(max-width: 767px)"
              srcSet={opening.panoramicImage.mobileSrc}
            />
            <img
              src={opening.panoramicImage.desktopSrc}
              alt={opening.panoramicImage.alt}
              width={1344}
              height={768}
              className="panoramic-opening__image"
              fetchPriority="high"
            />
          </picture>
        </div>

        {/* الطبقة (د): شريط المعلومات الرفيع أسفل الصورة مباشرة */}
        <div className="panoramic-opening__infobar">
          <div className="panoramic-opening__infocell">
            <span className="panoramic-opening__infolabel">
              {opening.infoBar.specialtyLabel}
            </span>
            <strong className="panoramic-opening__infovalue">
              {opening.infoBar.specialtyValue}
            </strong>
          </div>

          <div className="panoramic-opening__infocell">
            <span className="panoramic-opening__infolabel">
              {opening.infoBar.cityLabel}
            </span>
            <strong className="panoramic-opening__infovalue">
              {opening.infoBar.cityValue}
            </strong>
          </div>

          <div className="panoramic-opening__infoaction">
            <Button
              href={primaryHref}
              variant="primary"
              external={isExternal}
            >
              {ctaLabel} {isExternal ? "↗" : ""}
            </Button>
            <span className="panoramic-opening__hint">
              {opening.infoBar.channelHint}
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
