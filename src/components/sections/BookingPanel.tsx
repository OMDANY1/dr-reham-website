"use client";

import React, { useEffect, useState } from "react";
import { siteConfig, type Clinic, type SupportedLocale } from "@/config/site";
import { homeContent } from "@/content/ar/home";
import { bookPageCopy } from "@/content/ar/book";
import { homeContentEn, bookPageCopyEn } from "@/content/en";
import { isLiveBookingReady } from "@/lib/content-gates";
import {
  buildWhatsAppBookingUrl,
  resolveClinicAction,
  resolveSelectedClinic,
  validateExternalHttpsUrl,
} from "@/lib/booking-links";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { renderBidiSafeText } from "@/lib/bidi";
import type { HomePageCmsData } from "@/lib/cms/types";

export interface BookingPanelProps {
  mode?: "cta-banner" | "full-selector";
  clinics?: Clinic[];
  initialClinicParam?: string | null;
  finalInquiryData?: HomePageCmsData["finalInquiry"];
  enOverride?: NonNullable<HomePageCmsData["en"]>["finalInquiry"];
  locale?: SupportedLocale;
}

export function BookingPanel({
  mode = "cta-banner",
  clinics = siteConfig.clinics,
  initialClinicParam = null,
  finalInquiryData,
  enOverride,
  locale = "ar",
}: BookingPanelProps) {
  const isEn = locale === "en";
  const resolution = resolveSelectedClinic(clinics, initialClinicParam);
  const [selectedId, setSelectedId] = useState<string | null>(
    resolution.selectedClinic?.id ?? null
  );

  useEffect(() => {
    setSelectedId(resolution.selectedClinic?.id ?? null);
  }, [resolution.selectedClinic?.id]);

  const liveReady = isLiveBookingReady(siteConfig, clinics);
  const whatsappHref =
    buildWhatsAppBookingUrl(siteConfig.whatsappE164) ?? siteConfig.whatsappUrl;
  const instagramHref = validateExternalHttpsUrl(siteConfig.instagramUrl);

  const baseInquiry = isEn
    ? homeContentEn.finalInquiry
    : homeContent.finalInquiry;

  const eyebrow = isEn
    ? enOverride?.eyebrow || baseInquiry.eyebrow
    : finalInquiryData?.eyebrow || baseInquiry.eyebrow;
  const heading = isEn
    ? enOverride?.heading || baseInquiry.heading
    : finalInquiryData?.heading || baseInquiry.heading;
  const support = isEn
    ? enOverride?.support || baseInquiry.support
    : finalInquiryData?.support || baseInquiry.support;
  const primaryCta = isEn
    ? enOverride?.primaryCta || baseInquiry.primaryCta
    : finalInquiryData?.primaryCta === "تواصل للاستفسار"
    ? homeContent.finalInquiry.primaryCta
    : finalInquiryData?.primaryCta || baseInquiry.primaryCta;
  const destinationCaption = isEn
    ? enOverride?.destinationCaption || baseInquiry.destinationCaption
    : finalInquiryData?.destinationCaption?.includes("إنستجرام")
    ? homeContent.finalInquiry.destinationCaption
    : finalInquiryData?.destinationCaption || baseInquiry.destinationCaption;

  const rawPrimaryHref =
    !finalInquiryData?.primaryHref ||
    finalInquiryData.primaryHref === siteConfig.instagramUrl
      ? whatsappHref
      : finalInquiryData.primaryHref;

  const externalBannerHref = validateExternalHttpsUrl(
    rawPrimaryHref || whatsappHref
  );

  if (mode === "cta-banner") {
    const primaryHref =
      rawPrimaryHref && rawPrimaryHref.startsWith("/")
        ? rawPrimaryHref.replace(/^\/(ar|en)(?=\/|$)/, `/${locale}`)
        : liveReady
        ? `/${locale}/book`
        : externalBannerHref ?? whatsappHref;
    const isExternal = primaryHref.startsWith("https://");

    return (
      <section
        className="final-inquiry-section"
        aria-labelledby="final-inquiry-heading"
      >
        <Container>
          <ScrollReveal>
            <div className="final-inquiry-grid">
              <div>
                <span className="eyebrow eyebrow--on-sky">{eyebrow}</span>
                <h2 id="final-inquiry-heading" className="final-inquiry__title">
                  {heading}
                </h2>
                <p className="final-inquiry__support">{support}</p>
              </div>

              <div className="final-inquiry__actions">
                <Button
                  href={primaryHref}
                  variant="white"
                  external={isExternal}
                >
                  <span>{primaryCta}</span>
                  <span aria-hidden="true">{isEn ? "→" : "↗"}</span>
                </Button>
                {!liveReady && externalBannerHref ? (
                  <p className="final-inquiry__caption">
                    <span>{destinationCaption} </span>
                    <span className="ltr-inline" dir="ltr">
                      {siteConfig.whatsappDisplay}
                    </span>
                  </p>
                ) : null}
              </div>
            </div>
          </ScrollReveal>
        </Container>
      </section>
    );
  }

  /* mode === "full-selector" (لصفحة /ar/book و /en/book) */
  const copy = isEn ? bookPageCopyEn : bookPageCopy;
  const { bookableClinics, wasInvalidQueryReset } = resolution;
  const activeClinic =
    bookableClinics.find((c) => c.id === selectedId) ??
    bookableClinics[0] ??
    null;
  const activeAction = activeClinic ? resolveClinicAction(activeClinic) : null;

  if (bookableClinics.length === 0 || !activeClinic || !activeAction) {
    return (
      <section className="section" aria-labelledby="direct-inquiry-heading">
        <Container>
          <div className="editorial-split">
            <div className="editorial-split__lead">
              <span className="eyebrow">{copy.eyebrow}</span>
              <h2 id="direct-inquiry-heading" className="section-title">
                {copy.previewHeading}
              </h2>
              <p className="section-lead">{copy.introPreview}</p>
            </div>

            <div className="editorial-split__content">
              <div
                className="inquiry-channel-card"
                role="region"
                aria-label={
                  isEn ? "Verified Contact Channel" : "وسيلة التواصل المؤكدة"
                }
              >
                <span className="inquiry-channel-card__badge">
                  {copy.directInquiryCard.badge}
                </span>
                <h3
                  style={{
                    fontSize: "var(--text-h2)",
                    color: "var(--color-plum-dark)",
                  }}
                >
                  {copy.directInquiryCard.title}
                </h3>
                <p
                  className="ltr-inline"
                  dir="ltr"
                  style={{
                    color: "var(--color-plum)",
                    fontSize: "var(--text-h3)",
                    fontWeight: 700,
                  }}
                >
                  {siteConfig.whatsappDisplay}
                </p>
                <p
                  style={{
                    color: "var(--color-paragraph)",
                    fontSize: "var(--text-body-lg)",
                    maxInlineSize: "48ch",
                  }}
                >
                  {copy.directInquiryCard.description}
                </p>

                <div
                  style={{
                    marginBlockStart: "var(--space-2)",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "var(--space-3)",
                  }}
                >
                  {whatsappHref ? (
                    <Button href={whatsappHref} variant="primary" external>
                      <span>{copy.directInquiryCard.whatsappLabel}</span>
                      <span aria-hidden="true">{isEn ? "→" : "↗"}</span>
                    </Button>
                  ) : null}
                  {instagramHref ? (
                    <Button href={instagramHref} variant="secondary" external>
                      <span>{renderBidiSafeText(copy.directInquiryCard.actionLabel)}</span>
                      <span aria-hidden="true">{isEn ? "→" : "↗"}</span>
                    </Button>
                  ) : null}
                </div>

                <p
                  style={{
                    fontSize: "var(--text-small)",
                    color: "var(--color-secondary)",
                  }}
                >
                  {copy.directInquiryCard.externalHint}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  const isSingleClinic = bookableClinics.length === 1;

  return (
    <section className="section" aria-labelledby="clinic-selection-heading">
      <Container>
        <div className="editorial-split">
          <div className="editorial-split__lead">
            <h2 id="clinic-selection-heading" className="section-title">
              {isSingleClinic
                ? isEn
                  ? "Verified Clinic"
                  : "العيادة المعتمدة"
                : copy.selectorLabels.groupLegend}
            </h2>
            <p className="section-lead">{copy.introLive}</p>

            {wasInvalidQueryReset ? (
              <p
                role="status"
                style={{
                  marginBlockStart: "var(--space-4)",
                  padding: "var(--space-3)",
                  backgroundColor: "var(--color-card-bg)",
                  border: "1.5px solid var(--color-border)",
                  borderRadius: "var(--control-radius)",
                  fontSize: "var(--text-small)",
                  color: "var(--color-plum-dark)",
                }}
              >
                {copy.selectorLabels.invalidParamResetNote}
              </p>
            ) : null}
          </div>

          <div className="editorial-split__content">
            {!isSingleClinic ? (
              <fieldset className="clinic-radio-group">
                <legend className="sr-only">
                  {copy.selectorLabels.groupLegend}
                </legend>
                {bookableClinics.map((clinic) => {
                  const isSelected = clinic.id === activeClinic.id;
                  const clinicName =
                    isEn && clinic.nameEn ? clinic.nameEn : clinic.name;
                  return (
                    <label
                      key={clinic.id}
                      className={`clinic-radio-option ${
                        isSelected ? "clinic-radio-option--selected" : ""
                      }`.trim()}
                    >
                      <input
                        type="radio"
                        name="selected-clinic"
                        value={clinic.id}
                        checked={isSelected}
                        onChange={() => setSelectedId(clinic.id)}
                        className="clinic-radio-input"
                      />
                      <div>
                        <span
                          style={{
                            display: "block",
                            fontWeight: 700,
                            fontSize: "var(--text-h3)",
                            color: "var(--color-plum-dark)",
                          }}
                        >
                          {clinicName}
                        </span>
                        {clinic.address ? (
                          <span
                            style={{
                              display: "block",
                              fontSize: "var(--text-small)",
                              color: "var(--color-secondary)",
                              marginBlockStart: "var(--space-1)",
                            }}
                          >
                            {clinic.address}
                          </span>
                        ) : null}
                      </div>
                    </label>
                  );
                })}
              </fieldset>
            ) : null}

            <div className="clinic-details-box" aria-live="polite">
              <div>
                <span
                  style={{
                    fontSize: "var(--text-caption)",
                    color: "var(--color-secondary)",
                    display: "block",
                  }}
                >
                  {copy.selectorLabels.selectedClinicPrefix}
                </span>
                <h3
                  style={{
                    fontSize: "var(--text-h2)",
                    color: "var(--color-plum-dark)",
                    marginBlockStart: "var(--space-1)",
                  }}
                >
                  {isEn && activeClinic.nameEn
                    ? activeClinic.nameEn
                    : activeClinic.name}
                </h3>
              </div>

              {activeClinic.address ? (
                <div>
                  <strong
                    style={{
                      display: "block",
                      fontSize: "var(--text-caption)",
                      color: "var(--color-secondary)",
                    }}
                  >
                    {copy.selectorLabels.addressLabel}
                  </strong>
                  <p>{activeClinic.address}</p>
                </div>
              ) : null}

              {activeClinic.hours ? (
                <div>
                  <strong
                    style={{
                      display: "block",
                      fontSize: "var(--text-caption)",
                      color: "var(--color-secondary)",
                    }}
                  >
                    {copy.selectorLabels.hoursLabel}
                  </strong>
                  <p>{activeClinic.hours}</p>
                </div>
              ) : null}

              {activeAction.mapsHref ? (
                <div>
                  <a
                    href={activeAction.mapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-link"
                  >
                    {copy.selectorLabels.mapsLinkLabel} ↗
                  </a>
                </div>
              ) : null}

              <div className="external-destination-notice">
                <strong
                  style={{
                    display: "block",
                    color: "var(--color-plum-dark)",
                    marginBlockEnd: "var(--space-1)",
                  }}
                >
                  {copy.selectorLabels.externalNoticeTitle}
                </strong>
                <p
                  style={{
                    color: "var(--color-paragraph)",
                    fontSize: "var(--text-small)",
                  }}
                >
                  {activeAction.destinationNote}
                </p>
              </div>

              <div>
                <Button href={activeAction.href} variant="primary" external>
                  <span>{activeAction.label}</span>
                  <span aria-hidden="true">{isEn ? "→" : "↗"}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
