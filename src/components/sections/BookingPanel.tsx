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
    const { contactChapter } = homeContent;

    return (
      <section
        className="contact-chapter"
        aria-labelledby="final-inquiry-heading"
      >
        <Container>
          <ScrollReveal>
            <div className="contact-chapter__box">
              <div>
                <span className="contact-chapter__eyebrow">
                  {contactChapter.eyebrow}
                </span>
                <h2
                  id="final-inquiry-heading"
                  className="contact-chapter__title"
                >
                  {contactChapter.title}
                </h2>
                <p className="contact-chapter__lead">{contactChapter.lead}</p>
              </div>

              <div className="contact-chapter__actions">
                <Button
                  href={primaryHref}
                  variant="primary"
                  external={!liveReady && Boolean(instagramHref)}
                >
                  {contactChapter.primaryCta}{" "}
                  {!liveReady && instagramHref ? "↗" : ""}
                </Button>
              </div>
            </div>
            <p className="contact-chapter__note">
              {contactChapter.channelNote}
            </p>
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
            <div>
              <span className="eyebrow">قناة التواصل</span>
              <h2 id="direct-inquiry-heading" className="section-title">
                التواصل للاستفسار
              </h2>
              <p className="section-lead">
                نسعد باستقبال استفساراتكم حول المواعيد والزيارات في الرياض عبر
                حساب الدكتورة على إنستجرام.
              </p>
            </div>

            <div>
              <div
                className="inquiry-channel-card"
                role="region"
                aria-label="وسيلة التواصل المؤكدة"
              >
                <span className="eyebrow">
                  {bookPageCopy.directInquiryCard.badge}
                </span>
                <h3
                  style={{
                    fontSize: "var(--text-h2)",
                    color: "var(--ink)",
                    marginBlockEnd: "var(--space-3)",
                  }}
                >
                  {bookPageCopy.directInquiryCard.title}{" "}
                  <span
                    style={{
                      color: "var(--sky-600)",
                      fontSize: "var(--text-h3)",
                    }}
                  >
                    ({bookPageCopy.directInquiryCard.handle})
                  </span>
                </h3>
                <p
                  style={{
                    color: "var(--muted)",
                    marginBlockEnd: "var(--space-4)",
                  }}
                >
                  {bookPageCopy.directInquiryCard.description}
                </p>

                {instagramHref ? (
                  <div style={{ marginBlockEnd: "var(--space-4)" }}>
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
          <div>
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
                  border: "1px solid var(--border-hairline)",
                  fontSize: "var(--text-small)",
                  color: "var(--ink)",
                }}
              >
                {bookPageCopy.selectorLabels.invalidParamResetNote}
              </p>
            ) : null}
          </div>

          <div>
            {!isSingleClinic ? (
              <fieldset
                style={{
                  border: "none",
                  marginBlockEnd: "var(--space-5)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-3)",
                }}
              >
                <legend className="sr-only">
                  {bookPageCopy.selectorLabels.groupLegend}
                </legend>
                {bookableClinics.map((clinic) => {
                  const isSelected = clinic.id === activeClinic.id;
                  return (
                    <label
                      key={clinic.id}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "var(--space-3)",
                        padding: "var(--space-4)",
                        border: isSelected
                          ? "2px solid var(--ink)"
                          : "1px solid var(--border-hairline)",
                        backgroundColor: isSelected
                          ? "var(--sky-50)"
                          : "var(--white)",
                        cursor: "pointer",
                      }}
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

            <div className="clinic-selector-shell" aria-live="polite">
              <div style={{ marginBlockEnd: "var(--space-4)" }}>
                <span
                  style={{
                    fontSize: "var(--text-meta)",
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
                  }}
                >
                  {activeClinic.name}
                </h3>
              </div>

              {activeClinic.address ? (
                <div style={{ marginBlockEnd: "var(--space-3)" }}>
                  <strong
                    style={{
                      display: "block",
                      fontSize: "var(--text-meta)",
                      color: "var(--muted)",
                    }}
                  >
                    {bookPageCopy.selectorLabels.addressLabel}
                  </strong>
                  <p>{activeClinic.address}</p>
                </div>
              ) : null}

              {activeClinic.hours ? (
                <div style={{ marginBlockEnd: "var(--space-3)" }}>
                  <strong
                    style={{
                      display: "block",
                      fontSize: "var(--text-meta)",
                      color: "var(--muted)",
                    }}
                  >
                    {bookPageCopy.selectorLabels.hoursLabel}
                  </strong>
                  <p>{activeClinic.hours}</p>
                </div>
              ) : null}

              {activeAction.mapsHref ? (
                <div style={{ marginBlockEnd: "var(--space-4)" }}>
                  <a
                    href={activeAction.mapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="journal-chapter__all-link"
                  >
                    {bookPageCopy.selectorLabels.mapsLinkLabel} ↗
                  </a>
                </div>
              ) : null}

              <div
                style={{
                  padding: "var(--space-4)",
                  backgroundColor: "var(--sky-50)",
                  borderInlineStart: "3px solid var(--sky-600)",
                  marginBlockEnd: "var(--space-4)",
                }}
              >
                <strong
                  style={{
                    display: "block",
                    color: "var(--ink)",
                    marginBlockEnd: "var(--space-1)",
                  }}
                >
                  {bookPageCopy.selectorLabels.externalNoticeTitle}
                </strong>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: "var(--text-small)",
                  }}
                >
                  {activeAction.destinationNote}
                </p>
              </div>

              <Button href={activeAction.href} variant="primary" external>
                {activeAction.label} ↗
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
