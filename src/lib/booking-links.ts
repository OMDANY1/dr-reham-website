import type { Clinic } from "@/config/site";

const E164_REGEX = /^\+[1-9]\d{7,14}$/;

/**
 * يتحقق من أن الرابط خارجي آمن يبدأ بـ https:// فقط ولا يحتوي على بيانات صحية أو بروتوكولات خطرة.
 */
export function validateExternalHttpsUrl(
  rawUrl: string | null | undefined,
  allowedHosts?: string[]
): string | null {
  if (!rawUrl || typeof rawUrl !== "string") {
    return null;
  }
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:") {
      return null;
    }
    if (parsed.username || parsed.password) {
      return null;
    }
    if (allowedHosts && allowedHosts.length > 0) {
      const host = parsed.hostname.toLowerCase();
      const isAllowed = allowedHosts.some(
        (allowed) =>
          host === allowed.toLowerCase() ||
          host.endsWith(`.${allowed.toLowerCase()}`)
      );
      if (!isAllowed) {
        return null;
      }
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * يبني رابط واتساب رسمي ومحايد إداريًا من رقم بصيغة E.164 دون تضمين أي معلومات طبية.
 */
export function buildWhatsAppBookingUrl(
  whatsappE164: string | null | undefined
): string | null {
  if (!whatsappE164 || typeof whatsappE164 !== "string") {
    return null;
  }
  const trimmed = whatsappE164.trim();
  if (!E164_REGEX.test(trimmed)) {
    return null;
  }
  const digits = trimmed.slice(1);
  return `https://wa.me/${digits}`;
}

export interface VerifiedClinicAction {
  type: "portal" | "whatsapp";
  href: string;
  label: string;
  destinationNote: string;
  mapsHref: string | null;
}

/**
 * يستخرج وسيلة الحجز الموثقة للعيادة إن وجدت، أو يعيد null عند نقص التوثيق.
 */
export function resolveClinicAction(clinic: Clinic): VerifiedClinicAction | null {
  if (!clinic.enabled || !clinic.affiliationVerified || !clinic.name.trim()) {
    return null;
  }

  const portalHref = validateExternalHttpsUrl(clinic.bookingUrl);
  const whatsappHref = buildWhatsAppBookingUrl(clinic.whatsappE164);
  const mapsHref = validateExternalHttpsUrl(clinic.mapsUrl);

  if (portalHref) {
    return {
      type: "portal",
      href: portalHref,
      label: `الانتقال إلى حجز ${clinic.name}`,
      destinationNote: `سيتم نقلك إلى بوابة المواعيد الخارجية الخاصة بـ «${clinic.name}» عبر اتصال آمن (HTTPS). اختيار الرابط لا يعني تأكيد الموعد تلقائيًا.`,
      mapsHref,
    };
  }

  if (whatsappHref) {
    return {
      type: "whatsapp",
      href: whatsappHref,
      label: `التواصل عبر واتساب ${clinic.name}`,
      destinationNote: `سيتم فتح محادثة واتساب الرسمية الخاصة بـ «${clinic.name}» للاستفسار الإداري عن المواعيد. يُرجى عدم إرسال تفاصيل طبية خاصة عبر الرسائل الأولية.`,
      mapsHref,
    };
  }

  return null;
}

/**
 * يعيد قائمة العيادات المفعلة والموثقة فقط والتي تملك وجهة حجز صالحة.
 */
export function getVerifiedBookableClinics(clinics: Clinic[]): Clinic[] {
  return clinics.filter((clinic) => resolveClinicAction(clinic) !== null);
}

export interface SelectedClinicResolution {
  bookableClinics: Clinic[];
  selectedClinic: Clinic | null;
  selectedAction: VerifiedClinicAction | null;
  wasInvalidQueryReset: boolean;
}

/**
 * يحدد العيادة المختارة بأمان بناءً على معرّف الرابط (?clinic=ID).
 * إذا كان المعرّف غير صالح أو يشير لعيادة غير مفعلة، يعيد الضبط تلقائيًا دون خطأ.
 */
export function resolveSelectedClinic(
  clinics: Clinic[],
  queryClinicId?: string | null
): SelectedClinicResolution {
  const bookableClinics = getVerifiedBookableClinics(clinics);

  if (bookableClinics.length === 0) {
    return {
      bookableClinics: [],
      selectedClinic: null,
      selectedAction: null,
      wasInvalidQueryReset: Boolean(queryClinicId && queryClinicId.trim()),
    };
  }

  const cleanQuery = queryClinicId?.trim() || null;

  if (!cleanQuery) {
    const first = bookableClinics[0];
    return {
      bookableClinics,
      selectedClinic: first,
      selectedAction: resolveClinicAction(first),
      wasInvalidQueryReset: false,
    };
  }

  const matched = bookableClinics.find((c) => c.id === cleanQuery);
  if (matched) {
    return {
      bookableClinics,
      selectedClinic: matched,
      selectedAction: resolveClinicAction(matched),
      wasInvalidQueryReset: false,
    };
  }

  const fallback = bookableClinics[0];
  return {
    bookableClinics,
    selectedClinic: fallback,
    selectedAction: resolveClinicAction(fallback),
    wasInvalidQueryReset: true,
  };
}
