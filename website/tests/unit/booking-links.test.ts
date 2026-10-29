import { describe, expect, it } from "vitest";
import { siteConfig, qaVerifiedClinicsFixture } from "@/config/site";
import {
  buildWhatsAppBookingUrl,
  getVerifiedBookableClinics,
  resolveClinicAction,
  resolveSelectedClinic,
  validateExternalHttpsUrl,
} from "@/lib/booking-links";

describe("booking-links", () => {
  it("validates external HTTPS URLs and rejects unsafe protocols", () => {
    expect(
      validateExternalHttpsUrl("https://www.instagram.com/dr.rehamdq/")
    ).toBe("https://www.instagram.com/dr.rehamdq/");
    expect(validateExternalHttpsUrl("http://example.com")).toBeNull();
    expect(validateExternalHttpsUrl("javascript:alert(1)")).toBeNull();
    expect(validateExternalHttpsUrl("data:text/html,hello")).toBeNull();
    expect(validateExternalHttpsUrl("/relative/path")).toBeNull();
    expect(validateExternalHttpsUrl(null)).toBeNull();
  });

  it("validates E.164 WhatsApp numbers strictly without health data", () => {
    expect(buildWhatsAppBookingUrl("+966500000000")).toBe(
      "https://wa.me/966500000000"
    );
    expect(buildWhatsAppBookingUrl("0500000000")).toBeNull();
    expect(buildWhatsAppBookingUrl("+966500000000?text=medical")).toBeNull();
    expect(buildWhatsAppBookingUrl(null)).toBeNull();
  });

  it("treats source-note clinics with enabled=false as non-bookable", () => {
    expect(getVerifiedBookableClinics(siteConfig.clinics)).toHaveLength(0);
    expect(resolveClinicAction(siteConfig.clinics[0])).toBeNull();
    expect(resolveClinicAction(siteConfig.clinics[1])).toBeNull();
  });

  it("resolves selected clinic from query param and resets invalid IDs safely", () => {
    const validResolution = resolveSelectedClinic(
      qaVerifiedClinicsFixture,
      "habib-olaya"
    );
    expect(validResolution.selectedClinic?.id).toBe("habib-olaya");
    expect(validResolution.wasInvalidQueryReset).toBe(false);
    expect(validResolution.selectedAction?.type).toBe("portal");

    const invalidResolution = resolveSelectedClinic(
      qaVerifiedClinicsFixture,
      "arbitrary-invalid-id"
    );
    expect(invalidResolution.selectedClinic?.id).toBe("safwa-majesty");
    expect(invalidResolution.wasInvalidQueryReset).toBe(true);
    expect(invalidResolution.selectedAction?.type).toBe("whatsapp");
  });
});
