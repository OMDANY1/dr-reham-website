import {
  siteConfig,
  type Clinic,
  type SiteConfig,
  type SiteMode,
  type SupportedLocale,
} from "@/config/site";
import { getVerifiedBookableClinics } from "@/lib/booking-links";

export type RecordStatus = "draft" | "published";

export interface ServiceFaqItem {
  question: string;
  answer: string;
}

export interface ServiceRecord {
  slug: string;
  title: string;
  titleEn?: string;
  summary: string;
  summaryEn?: string;
  category: string;
  categoryEn?: string;
  overview: string | null;
  overviewEn?: string | null;
  consultationNotes: string | null;
  preparation: string | null;
  recovery: string | null;
  risks: string | null;
  faq: ServiceFaqItem[];
  status: RecordStatus;
  approvedBy: string | null;
  reviewedAt: string | null;
  contourVariant?: "upper-lid" | "lower-arc" | "lateral-balance";
}

export interface ArticleSource {
  title: string;
  institution: string;
  url: string;
}

export interface ArticleSection {
  id?: string;
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export type ArticleCategory =
  | "العين والجفون"
  | "حول العين"
  | "قبل الاستشارة"
  | "Eyelids & Orbit"
  | "Periocular Care"
  | "Consultation Prep"
  | string;

export interface ArticleLocaleContent {
  title: string;
  excerpt: string | null;
  category: ArticleCategory;
  body: ArticleSection[];
  status: RecordStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  publishedAt: string | null;
  seo: {
    title: string | null;
    description: string | null;
  };
}

export interface ArticleRecord {
  slug: string;
  title: string;
  excerpt: string | null;
  body: ArticleSection[];
  category: ArticleCategory;
  featured?: boolean;
  image?: {
    src: string;
    alt: string;
    altEn?: string;
  };
  author: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  publishedAt: string | null;
  status: RecordStatus;
  seo: {
    title: string | null;
    description: string | null;
  };
  en?: ArticleLocaleContent;
  sources?: (string | ArticleSource)[];
  relatedServiceSlugs?: string[];
  sourceNote?: string;
}

export type FaqCategory = "appointments" | "consultation" | "procedure";

export interface FaqRecord {
  id: string;
  question: string;
  questionEn?: string;
  answer: string | null;
  answerEn?: string | null;
  category: FaqCategory;
  status: RecordStatus;
  statusEn?: RecordStatus;
  reviewedBy: string | null;
  isAdministrativeSeed?: boolean;
}

export interface AssetRecord {
  id: string;
  path: string;
  role: "brand-logo" | "editorial-illustration" | "clinical-case";
  alt: string;
  rights: string | null;
  consentRef: string | null;
  approved: boolean;
}

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return locale === "ar" || locale === "en";
}

/**
 * بوابة نشر الخدمة الطبية: تتطلب status === "published" واعتمادًا طبيًا صريحًا ومحتوى أساسيًا.
 */
export function isPublicService(service: ServiceRecord): boolean {
  return (
    service.status === "published" &&
    Boolean(service.approvedBy && service.approvedBy.trim().length > 0) &&
    Boolean(service.reviewedAt && service.reviewedAt.trim().length > 0) &&
    Boolean(service.title && service.title.trim().length > 0) &&
    Boolean(service.summary && service.summary.trim().length > 0) &&
    Boolean(service.overview && service.overview.trim().length > 0)
  );
}

/**
 * بوابة نشر المقال التوعوي للإنتاج العام (Production):
 * تتطلب status === "published" ومراجعًا وتاريخ مراجعة ونشر ومحتوى فعليًا.
 */
export function isPublicArticle(article: ArticleRecord): boolean {
  return (
    article.status === "published" &&
    Boolean(article.reviewedBy && article.reviewedBy.trim().length > 0) &&
    Boolean(article.reviewedAt && article.reviewedAt.trim().length > 0) &&
    Boolean(article.publishedAt && article.publishedAt.trim().length > 0) &&
    Boolean(article.title && article.title.trim().length > 0) &&
    Boolean(article.excerpt && article.excerpt.trim().length > 0) &&
    Array.isArray(article.body) &&
    article.body.length > 0 &&
    article.body.every((section) => section.paragraphs.length > 0)
  );
}

/**
 * يتحقق من أن مسودة المقال مكتملة العناصر وجاهزة للعرض داخل وضع المعاينة الخادمي فقط.
 */
export function isPreviewableDraftArticle(article: ArticleRecord): boolean {
  return (
    article.status === "draft" &&
    Boolean(article.title && article.title.trim().length > 0) &&
    Boolean(article.excerpt && article.excerpt.trim().length > 0) &&
    Array.isArray(article.body) &&
    article.body.length > 0 &&
    article.body.every((section) => section.paragraphs.length > 0)
  );
}

export function isArticlePreviewStage(
  modeOverride?: SiteMode,
  enablePreviewDraftsOverride?: boolean
): boolean {
  const mode = modeOverride ?? siteConfig.mode;
  const draftsEnabled =
    enablePreviewDraftsOverride ?? siteConfig.enablePreviewDrafts;
  return mode === "preview" && draftsEnabled;
}

export function isPublicFaq(faq: FaqRecord): boolean {
  return (
    faq.status === "published" &&
    Boolean(faq.reviewedBy && faq.reviewedBy.trim().length > 0) &&
    Boolean(faq.question && faq.question.trim().length > 0) &&
    Boolean(faq.answer && faq.answer.trim().length > 0)
  );
}

export function isPublicAsset(asset: AssetRecord): boolean {
  if (!asset.approved || !asset.rights || !asset.alt.trim()) {
    return false;
  }
  if (
    asset.role === "clinical-case" &&
    (!asset.consentRef || !asset.consentRef.trim())
  ) {
    return false;
  }
  return true;
}

export function getPublicServices(records: ServiceRecord[]): ServiceRecord[] {
  return records.filter(isPublicService);
}

export function getPublicServiceBySlug(
  records: ServiceRecord[],
  slug: string
): ServiceRecord | null {
  const found = records.find((item) => item.slug === slug);
  if (!found || !isPublicService(found)) {
    return null;
  }
  return found;
}

export function getPublicArticles(records: ArticleRecord[]): ArticleRecord[] {
  return records.filter(isPublicArticle);
}

export function getPublicArticleBySlug(
  records: ArticleRecord[],
  slug: string
): ArticleRecord | null {
  const found = records.find((item) => item.slug === slug);
  if (!found || !isPublicArticle(found)) {
    return null;
  }
  return found;
}

export function getVisibleArticles(
  records: ArticleRecord[],
  modeOverride?: SiteMode,
  enablePreviewDraftsOverride?: boolean
): ArticleRecord[] {
  if (isArticlePreviewStage(modeOverride, enablePreviewDraftsOverride)) {
    return records.filter(
      (article) =>
        isPublicArticle(article) || isPreviewableDraftArticle(article)
    );
  }
  return getPublicArticles(records);
}

export function getVisibleArticleBySlug(
  records: ArticleRecord[],
  slug: string,
  modeOverride?: SiteMode,
  enablePreviewDraftsOverride?: boolean
): ArticleRecord | null {
  const found = records.find((item) => item.slug === slug);
  if (!found) {
    return null;
  }
  if (isPublicArticle(found)) {
    return found;
  }
  if (
    isArticlePreviewStage(modeOverride, enablePreviewDraftsOverride) &&
    isPreviewableDraftArticle(found)
  ) {
    return found;
  }
  return null;
}

export function calculateArticleWordCount(
  article: Pick<ArticleRecord, "title" | "excerpt" | "body">
): number {
  const chunks: string[] = [article.title, article.excerpt ?? ""];
  for (const section of article.body) {
    chunks.push(section.heading);
    chunks.push(...section.paragraphs);
    if (section.bullets && section.bullets.length > 0) {
      chunks.push(...section.bullets);
    }
  }
  const words = chunks
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return words.length;
}

export function calculateReadingTimeMinutes(
  article: Pick<ArticleRecord, "title" | "excerpt" | "body">
): number {
  const words = calculateArticleWordCount(article);
  return Math.max(1, Math.round(words / 150));
}

export function formatReadingTimeAr(minutes: number): string {
  if (minutes <= 1) return "دقيقة واحدة للقراءة";
  if (minutes === 2) return "دقيقتان للقراءة";
  if (minutes >= 3 && minutes <= 10) return `${minutes} دقائق للقراءة`;
  return `${minutes} دقيقة للقراءة`;
}

export function formatReadingTimeEn(minutes: number): string {
  return `${Math.max(1, minutes)} min read`;
}

export function formatReadingTime(
  minutes: number,
  locale: SupportedLocale = "ar"
): string {
  return locale === "en"
    ? formatReadingTimeEn(minutes)
    : formatReadingTimeAr(minutes);
}

export function filterArticles(
  articles: ArticleRecord[],
  options: { category?: string; query?: string }
): ArticleRecord[] {
  const normalizedCategory = options.category?.trim() ?? "الكل";
  const normalizedQuery = options.query?.trim().toLowerCase() ?? "";

  return articles.filter((article) => {
    const matchesCategory =
      !normalizedCategory ||
      normalizedCategory === "الكل" ||
      normalizedCategory === "All" ||
      article.category === normalizedCategory;

    if (!matchesCategory) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystack = `${article.title} ${article.excerpt ?? ""} ${article.category}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  });
}

export function getPublicFaqs(records: FaqRecord[]): FaqRecord[] {
  return records.filter(isPublicFaq);
}

export function isLiveBookingReady(
  config: SiteConfig,
  clinicsOverride?: Clinic[]
): boolean {
  const clinics = clinicsOverride ?? config.clinics;
  if (!config.bookingEnabled && !clinicsOverride) {
    return false;
  }
  return getVerifiedBookableClinics(clinics).length > 0;
}

export function getBookingCtaLabel(
  config: SiteConfig,
  clinicsOverride?: Clinic[],
  locale: SupportedLocale = "ar"
): string {
  const ready = isLiveBookingReady(config, clinicsOverride);
  if (locale === "en") {
    return ready ? "Book a Consultation" : "Book a Consultation";
  }
  return ready ? "احجز موعدًا" : "تواصل للاستفسار";
}
