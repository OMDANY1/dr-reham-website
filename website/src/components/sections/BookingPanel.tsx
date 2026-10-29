"use client";

import React, { useEffect, useState } from "react";
import { siteConfig, type Clinic } from "@/config/site";
import { homeContent } from "@/content/ar/home";
import { bookPageCopy } from "@/content/ar/book";
import { isLiveBookingReady } from "@/lib/content-gates";
import {
  resolveClinicAction,
  resolveSelectedClinic,
  validateExternalHttpsUrl,
} from "@/lib/booking-links";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export interface BookingPanelProps {
  mode?: "cta-banner" | "full-selector";
  clinics?: Clinic[];
  initialClinicParam?: string | null;
}

/**
 * مكوّن التواصل والاستفسار:
 * - في وضع cta-banner: يعرض قسم الدعوة النهائية للتواصل «لنبدأ باستفسارك» على مساحة سماوية واضحة وقوية.
 * - في وضع full-selector: يعرض محدد العيادات عند تفعيلها أو بطاقة التواصل الرسمي المؤكدة عبر إنستجرام.
 */
export function BookingPanel({
  mode = "cta-banner",
  clinics = siteConfig.clinics,
  initialClinicParam = null,
}: BookingPanelProps) {
  const resolution = resolveSelectedClinic(clinics, initialClinicParam);
  const [selectedId, setSelectedId] = useState<string | null>(
    resolution.selectedClinic?.id ?? null
  );

  useEffect(() => {
    setSelectedId(resolution.selectedClinic?.id ?? null);
  }, [resolution.selectedClinic?.id]);

  const liveReady = isLiveBookingReady(siteConfig, clinics);
  const instagramHref = validateExternalHttpsUrl(siteConfig.instagramUrl);

  if (mode === "cta-banner") {
    const primaryHref = liveReady
      ? "/ar/book"
      : instagramHref ?? "/ar/book";

    return (
      <section
        className="final-inquiry-section"
        aria-labelledby="final-inquiry-heading"
      >
        <Container>
          <ScrollReveal>
            <div className="final-inquiry-grid">
              <div>
                <span className="eyebrow eyebrow--on-sky">
                  {homeContent.finalInquiry.eyebrow}
                </span>
                <h2 id="final-inquiry-heading" className="final-inquiry__title">
                  {homeContent.finalInquiry.heading}
                </h2>
                <p className="final-inquiry__support">
                  {homeContent.finalInquiry.support}
                </p>
              </div>

              <div className="final-inquiry__actions">
                <Button
                  href={primaryHref}
                  variant="white"
                  external={!liveReady && Boolean(instagramHref)}
                >
                  {homeContent.finalInquiry.primaryCta} ↗
                </Button>
                {!liveReady && instagramHref ? (
                  <p className="final-inquiry__caption">
                    {homeContent.finalInquiry.destinationCaption}
                  </p>
                ) : null}
              </div>
            </div>
          </ScrollReveal>
        </Container>
      </section>
    );
  }

  /* mode === "full-selector" (لصفحة /ar/book) */
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
              <span className="eyebrow">القناة المعتمدة</span>
              <h2 id="direct-inquiry-heading" className="section-title">
                التواصل المباشر
              </h2>
              <p className="section-lead">
                نسعد باستقبال استفساراتكم حول المواعيد والعيادات في الرياض عبر
                الحساب الرسمي الموثق للدكتورة ريهام القحطاني.
              </p>
            </div>

            <div className="editorial-split__content">
              <div className="inquiry-channel-card" role="region" aria-label="وسيلة التواصل المؤكدة">
                <span className="inquiry-channel-card__badge">
                  {bookPageCopy.directInquiryCard.badge}
                </span>
                <h3
                  style={{
                    fontSize: "var(--text-h2)",
                    color: "var(--ink)",
                  }}
                >
                  {bookPageCopy.directInquiryCard.title}{" "}
                  <span
                    className="ltr-inline"
                    style={{
                      color: "var(--sky-700)",
                      fontSize: "var(--text-h3)",
                    }}
                  >
                    ({bookPageCopy.directInquiryCard.handle})
                  </span>
                </h3>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: "var(--text-body-lg)",
                    maxInlineSize: "48ch",
                  }}
                >
                  {bookPageCopy.directInquiryCard.description}
                </p>

                {instagramHref ? (
                  <div style={{ marginBlockStart: "var(--space-2)" }}>
                    <Button href={instagramHref} variant="primary" external>
                      {bookPageCopy.directInquiryCard.actionLabel} ↗
                    </Button>
                  </div>
                ) : null}

                <p
                  style={{
                    fontSize: "var(--text-small)",
                    color: "var(--muted)",
                  }}
                >
                  {bookPageCopy.directInquiryCard.externalHint}
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
                ? "العيادة المعتمدة"
                : bookPageCopy.selectorLabels.groupLegend}
            </h2>
            <p className="section-lead">{bookPageCopy.introLive}</p>

            {wasInvalidQueryReset ? (
              <p
                role="status"
                style={{
                  marginBlockStart: "var(--space-4)",
                  padding: "var(--space-3)",
                  backgroundColor: "var(--sky-50)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--control-radius)",
                  fontSize: "var(--text-small)",
                  color: "var(--ink)",
                }}
              >
                {bookPageCopy.selectorLabels.invalidParamResetNote}
              </p>
            ) : null}
          </div>

          <div className="editorial-split__content">
            {!isSingleClinic ? (
              <fieldset className="clinic-radio-group">
                <legend className="sr-only">
                  {bookPageCopy.selectorLabels.groupLegend}
                </legend>
                {bookableClinics.map((clinic) => {
                  const isSelected = clinic.id === activeClinic.id;
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
                            color: "var(--ink)",
                          }}
                        >
                          {clinic.name}
                        </span>
                        {clinic.address ? (
                          <span
                            style={{
                              display: "block",
                              fontSize: "var(--text-small)",
                              color: "var(--muted)",
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
                    color: "var(--muted)",
                    display: "block",
                  }}
                >
                  {bookPageCopy.selectorLabels.selectedClinicPrefix}
                </span>
                <h3
                  style={{
                    fontSize: "var(--text-h2)",
                    color: "var(--ink)",
                    marginBlockStart: "var(--space-1)",
                  }}
                >
                  {activeClinic.name}
                </h3>
              </div>

              {activeClinic.address ? (
                <div>
                  <strong
                    style={{
                      display: "block",
                      fontSize: "var(--text-caption)",
                      color: "var(--muted)",
                    }}
                  >
                    {bookPageCopy.selectorLabels.addressLabel}
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
                      color: "var(--muted)",
                    }}
                  >
                    {bookPageCopy.selectorLabels.hoursLabel}
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
                    {bookPageCopy.selectorLabels.mapsLinkLabel} ↗
                  </a>
                </div>
              ) : null}

              <div className="external-destination-notice">
                <strong
                  style={{
                    display: "block",
                    color: "var(--ink)",
                    marginBlockEnd: "var(--space-1)",
                  }}
                >
                  {bookPageCopy.selectorLabels.externalNoticeTitle}
                </strong>
                <p style={{ color: "var(--muted)", fontSize: "var(--text-small)" }}>
                  {activeAction.destinationNote}
                </p>
              </div>

              <div>
                <Button href={activeAction.href} variant="primary" external>
                  {activeAction.label} ↗
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
