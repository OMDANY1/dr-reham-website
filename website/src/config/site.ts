export type SiteMode = "preview" | "production";
export type SupportedLocale = "ar" | "en";

export interface CredentialRecord {
  id: string;
  title: string;
  titleEn?: string;
  institution: string;
  institutionEn?: string;
  year: string | null;
  verified: boolean;
  sourceRef: string | null;
}

export interface Clinic {
  id: string;
  name: string;
  nameEn?: string;
  source: string;
  affiliationVerified: boolean;
  enabled: boolean;
  address: string | null;
  addressEn?: string | null;
  mapsUrl: string | null;
  bookingUrl: string | null;
  whatsappE164: string | null;
  hours: string | null;
  hoursEn?: string | null;
}

export interface SiteProfile {
  nameAr: string;
  nameEn: string;
  specialtyAr: string;
  specialtyEn: string;
  city: string;
  cityEn: string;
  professionalRank: string | null;
  professionalRankEn?: string | null;
  biography: string | null;
  credentials: CredentialRecord[];
}

export interface SiteConfig {
  mode: SiteMode;
  enablePreviewDrafts: boolean;
  locale: SupportedLocale;
  locales: readonly SupportedLocale[];
  profile: SiteProfile;
  domain: string | null;
  instagramUrl: string;
  whatsappE164: string;
  whatsappDisplay: string;
  whatsappUrl: string;
  introVideoUrl: string | null;
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
 * المصدر المركزي لإعدادات الموقع باللغتين العربية والإنجليزية.
 * لا تُفعّل العيادات أو الحجز المباشر أو قسم نتائج الحالات إلا بعد توثيق البيانات رسميًا.
 */
export const siteConfig: SiteConfig = {
  mode: resolvedStage,
  enablePreviewDrafts:
    resolvedStage === "preview" &&
    process.env.DISABLE_PREVIEW_DRAFTS !== "true",
  locale: "ar",
  locales: ["ar", "en"] as const,
  profile: {
    nameAr: "د. ريهام القحطاني",
    nameEn: "Dr. Reham Alqahtani",
    specialtyAr: "طب وجراحة تجميل العيون والجفون",
    specialtyEn: "Oculoplastic & Eyelid Surgery",
    city: "الرياض",
    cityEn: "Riyadh",
    professionalRank: null,
    professionalRankEn: null,
    biography: null,
    credentials: [],
  },
  domain: process.env.NEXT_PUBLIC_SITE_URL ?? "https://dr-reham-website.vercel.app",
  instagramUrl: "https://www.instagram.com/dr.rehamdq/",
  whatsappE164: "+966580779630",
  whatsappDisplay: "+966 580779630",
  whatsappUrl: "https://wa.me/966580779630",
  introVideoUrl: null,
  bookingEnabled: false,
  legalEntity: null,
  privacyContact: null,
  clinics: [
    {
      id: "safwa-majesty",
      name: "عيادات الصفوة ماجستي",
      nameEn: "Al Safwa Majesty Clinics",
      source: "Instagram public bio reviewed 2026-10-29",
      affiliationVerified: false,
      enabled: false,
      address: null,
      addressEn: null,
      mapsUrl: null,
      bookingUrl: null,
      whatsappE164: null,
      hours: null,
      hoursEn: null,
    },
    {
      id: "habib-olaya",
      name: "د. سليمان الحبيب – العليا",
      nameEn: "Dr. Sulaiman Al Habib – Olaya",
      source: "Instagram public bio reviewed 2026-10-29",
      affiliationVerified: false,
      enabled: false,
      address: null,
      addressEn: null,
      mapsUrl: null,
      bookingUrl: null,
      whatsappE164: null,
      hours: null,
      hoursEn: null,
    },
  ],
};

/**
 * بيانات اختبار آمنة ومحصورة بوضع المعاينة عند تمرير ترويسة الاختبار الآلي فقط (Playwright QA).
 */
export const qaVerifiedClinicsFixture: Clinic[] = [
  {
    id: "safwa-majesty",
    name: "عيادات الصفوة ماجستي",
    nameEn: "Al Safwa Majesty Clinics",
    source: "QA verified fixture (non-public test state)",
    affiliationVerified: true,
    enabled: true,
    address: "الرياض — حي العليا",
    addressEn: "Riyadh — Olaya District",
    mapsUrl: "https://maps.google.com/?q=Riyadh+Olaya",
    bookingUrl: null,
    whatsappE164: "+966500000000",
    hours: "الأحد – الخميس: 10:00 ص – 6:00 م",
    hoursEn: "Sun – Thu: 10:00 AM – 6:00 PM",
  },
  {
    id: "habib-olaya",
    name: "د. سليمان الحبيب – العليا",
    nameEn: "Dr. Sulaiman Al Habib – Olaya",
    source: "QA verified fixture (non-public test state)",
    affiliationVerified: true,
    enabled: true,
    address: "الرياض — طريق الملك فهد، العليا",
    addressEn: "Riyadh — King Fahd Road, Olaya",
    mapsUrl: "https://maps.google.com/?q=Dr+Sulaiman+Al+Habib+Olaya",
    bookingUrl: "https://hmgroup.com/",
    whatsappE164: null,
    hours: "السبت – الخميس: 9:00 ص – 9:00 م",
    hoursEn: "Sat – Thu: 9:00 AM – 9:00 PM",
  },
];
