export type SiteMode = "preview" | "production";
export type SupportedLocale = "ar";

export interface CredentialRecord {
  id: string;
  title: string;
  institution: string;
  year: string | null;
  verified: boolean;
  sourceRef: string | null;
}

export interface Clinic {
  id: string;
  name: string;
  source: string;
  affiliationVerified: boolean;
  enabled: boolean;
  address: string | null;
  mapsUrl: string | null;
  bookingUrl: string | null;
  whatsappE164: string | null;
  hours: string | null;
}

export interface SiteProfile {
  nameAr: string;
  nameEn: string;
  specialtyAr: string;
  city: string;
  professionalRank: string | null;
  biography: string | null;
  credentials: CredentialRecord[];
}

export interface SiteConfig {
  mode: SiteMode;
  enablePreviewDrafts: boolean;
  locale: SupportedLocale;
  profile: SiteProfile;
  domain: string | null;
  instagramUrl: string;
  bookingEnabled: boolean;
  legalEntity: string | null;
  privacyContact: string | null;
  clinics: Clinic[];
}

const resolvedStage: SiteMode =
  process.env.SITE_STAGE === "production" ||
  process.env.NEXT_PUBLIC_SITE_STAGE === "production"
    ? "production"
    : "preview";

/**
 * المصدر المركزي لإعدادات الموقع — مبني مباشرة على content/site-draft.json
 * وسجل الحقائق في docs/01-SOURCES-AND-FACTS.md.
 * لا تُفعّل العيادات أو الحجز المباشر إلا بعد توثيق البيانات رسميًا.
 * إتاحة مسودات المقالات للمعاينة مشروطة بإعداد الخادم (mode === "preview" && enablePreviewDrafts)
 * ولا تعتمد على أي query parameter عام.
 */
export const siteConfig: SiteConfig = {
  mode: resolvedStage,
  enablePreviewDrafts:
    resolvedStage === "preview" &&
    process.env.DISABLE_PREVIEW_DRAFTS !== "true",
  locale: "ar",
  profile: {
    nameAr: "د. ريهام القحطاني",
    nameEn: "Reham AlQahtani",
    specialtyAr: "طب وجراحة تجميل العيون والجفون",
    city: "الرياض",
    professionalRank: null,
    biography: null,
    credentials: [],
  },
  domain: null,
  instagramUrl: "https://www.instagram.com/dr.rehamdq/",
  bookingEnabled: false,
  legalEntity: null,
  privacyContact: null,
  clinics: [
    {
      id: "safwa-majesty",
      name: "عيادات الصفوة ماجستي",
      source: "Instagram public bio reviewed 2026-10-29",
      affiliationVerified: false,
      enabled: false,
      address: null,
      mapsUrl: null,
      bookingUrl: null,
      whatsappE164: null,
      hours: null,
    },
    {
      id: "habib-olaya",
      name: "د. سليمان الحبيب – العليا",
      source: "Instagram public bio reviewed 2026-10-29",
      affiliationVerified: false,
      enabled: false,
      address: null,
      mapsUrl: null,
      bookingUrl: null,
      whatsappE164: null,
      hours: null,
    },
  ],
};

/**
 * بيانات اختبار آمنة ومحصورة بوضع المعاينة عند تمرير ترويسة الاختبار الآلي فقط (Playwright QA).
 * لا تُستخدم في العرض الافتراضي ولا تقبل أي روابط من عنوان الصفحة.
 */
export const qaVerifiedClinicsFixture: Clinic[] = [
  {
    id: "safwa-majesty",
    name: "عيادات الصفوة ماجستي",
    source: "QA verified fixture (non-public test state)",
    affiliationVerified: true,
    enabled: true,
    address: "الرياض — حي العليا",
    mapsUrl: "https://maps.google.com/?q=Riyadh+Olaya",
    bookingUrl: null,
    whatsappE164: "+966500000000",
    hours: "الأحد – الخميس: 10:00 ص – 6:00 م",
  },
  {
    id: "habib-olaya",
    name: "د. سليمان الحبيب – العليا",
    source: "QA verified fixture (non-public test state)",
    affiliationVerified: true,
    enabled: true,
    address: "الرياض — طريق الملك فهد، العليا",
    mapsUrl: "https://maps.google.com/?q=Dr+Sulaiman+Al+Habib+Olaya",
    bookingUrl: "https://hmgroup.com/",
    whatsappE164: null,
    hours: "السبت – الخميس: 9:00 ص – 9:00 م",
  },
];
