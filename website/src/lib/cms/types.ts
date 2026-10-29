import type {
  ArticleCategory,
  ArticleSection,
  ArticleSource,
  FaqCategory,
} from "@/lib/content-gates";

export type CmsRole = "admin" | "editor";

export interface CmsUser {
  id: string;
  email: string;
  name: string;
  role: CmsRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

export interface CmsUserInternal extends CmsUser {
  passwordHash: string;
}

export type CmsArticleStatus = "draft" | "in_review" | "published" | "archived";

export interface CmsArticleImage {
  src: string;
  alt: string;
  focalX?: number;
  focalY?: number;
}

export interface CmsArticleSection extends ArticleSection {
  id: string;
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  linkLabel?: string;
  linkUrl?: string;
  imageSrc?: string;
  imageAlt?: string;
}

export interface CmsArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: ArticleCategory;
  featured: boolean;
  image: CmsArticleImage;
  body: CmsArticleSection[];
  author: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  publishedAt: string | null;
  updatedAt: string;
  updatedBy: string | null;
  status: CmsArticleStatus;
  seo: {
    title: string | null;
    description: string | null;
    ogImage?: string | null;
  };
  sources: ArticleSource[];
  disclaimer: string;
  version: number;
  deletedAt: string | null;
}

export interface CmsSlugRedirect {
  oldSlug: string;
  newSlug: string;
  articleId: string;
  createdAt: string;
}

export type HomeSectionKey =
  | "doctorIntro"
  | "specialtySection"
  | "beforeConsultationSection"
  | "knowledgeSection"
  | "contentStyleSection"
  | "faqSection"
  | "finalInquiry";

export interface HomePageCmsData {
  hero: {
    doctorTag: string;
    specialtyTag: string;
    headlineLine1: string;
    headlineLine2: string;
    support: string;
    primaryCta: string;
    primaryHref: string;
    secondaryCta: string;
    secondaryHref: string;
    destinationHint: string;
    image: {
      src: string;
      alt: string;
      focalX?: number;
      focalY?: number;
    };
  };
  doctorIntro: {
    id: string;
    eyebrow: string;
    name: string;
    specialty: string;
    professionalRank: string | null;
    city: string;
    leadStatement: string;
    pillars: Array<{
      title: string;
      text: string;
    }>;
    credentials: Array<{
      id: string;
      title: string;
      institution: string;
      year: string | null;
      verified: boolean;
    }>;
    moreLinkLabel: string;
    moreLinkHref: string;
  };
  specialtySection: {
    id: string;
    eyebrow: string;
    title: string;
    lead: string;
    image: {
      src: string;
      alt: string;
      focalX?: number;
      focalY?: number;
    };
    highlights: Array<{
      number: string;
      title: string;
      description: string;
    }>;
  };
  beforeConsultationSection: {
    id: string;
    eyebrow: string;
    title: string;
    intro: string;
    steps: Array<{
      stepNumber: string;
      title: string;
      description: string;
    }>;
    generalNote: string;
  };
  knowledgeSection: {
    eyebrow: string;
    title: string;
    intro: string;
    viewAllLabel: string;
    readArticleLabel: string;
  };
  contentStyleSection: {
    id: string;
    eyebrow: string;
    title: string;
    lead: string;
    pillars: Array<{
      title: string;
      text: string;
    }>;
    instagramCard: {
      badge: string;
      handle: string;
      title: string;
      description: string;
      ctaLabel: string;
      image: {
        src: string;
        alt: string;
        focalX?: number;
        focalY?: number;
      };
    };
  };
  faqSection: {
    id: string;
    eyebrow: string;
    title: string;
    intro: string;
    viewAllLabel: string;
  };
  finalInquiry: {
    eyebrow: string;
    heading: string;
    support: string;
    primaryCta: string;
    primaryHref: string;
    destinationCaption: string;
  };
  headerFooter: {
    aboutLabel: string;
    specialtyLabel: string;
    journalLabel: string;
    faqLabel: string;
    contactLabel: string;
    privacyLabel: string;
    primaryInquiryCta: string;
    footerTagline: string;
    footerDisclaimer: string;
  };
  sectionVisibility: Record<HomeSectionKey, boolean>;
  sectionOrder: HomeSectionKey[];
}

export interface CmsPageRecord {
  slug: "home";
  title: string;
  draftData: HomePageCmsData;
  publishedData: HomePageCmsData;
  hasUnpublishedChanges: boolean;
  version: number;
  deletedAt: string | null;
  updatedAt: string;
  updatedBy: string | null;
  publishedAt: string | null;
  publishedBy: string | null;
}

export interface CmsMediaUsage {
  type: "article" | "page" | "settings";
  id: string;
  label: string;
}

export interface CmsMediaItem {
  id: string;
  name: string;
  filename: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp" | "image/avif";
  sizeBytes: number;
  width: number | null;
  height: number | null;
  alt: string;
  focalX: number;
  focalY: number;
  storagePath: string;
  url: string;
  isPublic: boolean;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
  usedIn?: CmsMediaUsage[];
}

export interface CmsFaqItem {
  id: string;
  question: string;
  answer: string;
  category: FaqCategory;
  sortOrder: number;
  status: "draft" | "published";
  reviewedBy: string | null;
  version: number;
  deletedAt: string | null;
  updatedAt: string;
  updatedBy: string | null;
}

export interface CmsClinicItem {
  id: string;
  name: string;
  source: string;
  affiliationVerified: boolean;
  enabled: boolean;
  address: string | null;
  mapsUrl: string | null;
  bookingUrl: string | null;
  whatsappE164: string | null;
  phone: string | null;
  hours: string | null;
  sortOrder: number;
  version: number;
  updatedAt: string;
  updatedBy: string | null;
}

export interface CmsSiteSettings {
  siteName: string;
  siteDescription: string;
  specialtyTitle: string;
  city: string;
  logoPath: string;
  faviconPath: string;
  defaultOgImage: string;
  seoTitleTemplate: string;
  seoDefaultDescription: string;
  domain: string | null;
  instagramUrl: string;
  whatsappUrl: string | null;
  phone: string | null;
  email: string | null;
  defaultInquiryDestination: "instagram" | "whatsapp" | "phone" | "email" | "book_page";
  bookingEnabled: boolean;
  enablePreviewDrafts: boolean;
  legalEntity: string | null;
  privacyContact: string | null;
  privacySections: Array<{
    id: string;
    heading: string;
    paragraphs: string[];
  }>;
  version: number;
  updatedAt: string;
  updatedBy: string | null;
}

export interface CmsRevision {
  id: string;
  entityType: "page" | "article" | "faq" | "clinic" | "settings";
  entityId: string;
  version: number;
  snapshot: unknown;
  summary: string;
  actorEmail: string;
  actorName: string;
  createdAt: string;
}

export interface CmsAuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  actorEmail: string;
  actorName: string;
  actorRole: CmsRole;
  createdAt: string;
  metadata?: Record<string, unknown>;
}
