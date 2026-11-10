import {
  getSessionPayloadFromCookies,
  isProtectedPreviewEnabled,
} from "./auth";
import {
  getCmsSiteSettings,
  getCmsUserById,
  getEffectiveHomePageData,
  listCmsArticles,
  listCmsClinics,
  listCmsFaqs,
  resolveArticleBySlugWithRedirect,
} from "./repository";
import { articlesTranslationsEn, faqTranslationsEn } from "@/content/en";
import type { CmsArticle, CmsUser, HomePageCmsData } from "./types";
import type { ArticleRecord, FaqRecord } from "@/lib/content-gates";
import type { Clinic, SupportedLocale } from "@/config/site";

export async function getActivePreviewUser(
  previewQueryParam?: boolean
): Promise<{
  isPreviewSession: boolean;
  user: CmsUser | null;
}> {
  const session = await getSessionPayloadFromCookies();
  if (!session) {
    return { isPreviewSession: false, user: null };
  }
  const user = getCmsUserById(session.userId);
  if (!user || !user.active) {
    return { isPreviewSession: false, user: null };
  }
  const cookiePreview = await isProtectedPreviewEnabled();
  return {
    isPreviewSession: Boolean(cookiePreview || previewQueryParam),
    user,
  };
}

function isArticleVisibleToPublicVisitor(
  article: CmsArticle,
  enablePreviewDrafts: boolean,
  locale: SupportedLocale = "ar"
): boolean {
  if (article.deletedAt || article.status === "archived") {
    return false;
  }

  if (locale === "en") {
    const enData = article.en ?? articlesTranslationsEn[article.slug];
    if (!enData || !enData.title?.trim() || !enData.body?.length) {
      return false;
    }
    if (article.en?.status === "archived") {
      return false;
    }
    if (article.en?.status === "published" && article.en?.approvedAt) {
      return true;
    }
  } else {
    if (article.status === "published" && article.approvedAt) {
      return true;
    }
  }

  // Initial 6 seeded educational articles remain visible in preview stage unless archived/deleted
  if (
    enablePreviewDrafts &&
    article.status === "draft" &&
    article.updatedBy === "تهيئة المحتوى الأولي"
  ) {
    if (locale === "en") {
      const enStatus = article.en?.status ?? "draft";
      return enStatus !== "archived" && Boolean(article.en?.title || articlesTranslationsEn[article.slug]);
    }
    return true;
  }

  return false;
}

export function mapCmsArticleToPublicRecord(
  article: CmsArticle,
  locale: SupportedLocale = "ar"
): ArticleRecord {
  const enFallback = articlesTranslationsEn[article.slug];
  const enSource = article.en ?? enFallback;

  if (locale === "en" && enSource) {
    const isEnPublished =
      article.en?.status === "published" && Boolean(article.en?.approvedAt);
    return {
      slug: article.slug,
      title: enSource.title,
      excerpt: enSource.excerpt,
      category: enSource.category,
      featured: article.featured,
      image: {
        src: article.image.src,
        alt: article.image.altEn ?? enSource.title,
      },
      body: enSource.body.map((s) => ({
        id: s.id,
        heading: s.heading,
        paragraphs: s.paragraphs,
        ...(s.bullets ? { bullets: s.bullets } : {}),
      })),
      author: isEnPublished ? article.author : null,
      reviewedBy: isEnPublished
        ? article.en?.reviewedBy ?? article.en?.approvedBy ?? null
        : null,
      reviewedAt:
        isEnPublished && article.en?.approvedAt
          ? article.en.approvedAt.slice(0, 10)
          : null,
      publishedAt:
        isEnPublished && article.en?.approvedAt
          ? article.en.approvedAt.slice(0, 10)
          : null,
      status: isEnPublished ? "published" : "draft",
      seo: {
        title: enSource.seo?.title ?? enSource.title,
        description: enSource.seo?.description ?? enSource.excerpt,
      },
      sources: article.sources,
    };
  }

  const isPublished =
    article.status === "published" && Boolean(article.approvedAt);
  return {
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    category: article.category,
    featured: article.featured,
    image: {
      src: article.image.src,
      alt: article.image.alt,
    },
    body: article.body.map((s) => ({
      id: s.id,
      heading: s.heading,
      paragraphs: s.paragraphs,
      ...(s.bullets ? { bullets: s.bullets } : {}),
    })),
    author: article.author,
    reviewedBy:
      article.reviewedBy ?? (isPublished ? article.approvedBy : null),
    reviewedAt:
      article.reviewedAt ??
      (isPublished && article.approvedAt
        ? article.approvedAt.slice(0, 10)
        : null),
    publishedAt:
      article.publishedAt ??
      (isPublished && article.approvedAt
        ? article.approvedAt.slice(0, 10)
        : null),
    status: isPublished ? "published" : "draft",
    seo: {
      title: article.seo.title ?? article.title,
      description: article.seo.description ?? article.excerpt,
    },
    sources: article.sources,
  };
}

export async function getPublicOrPreviewHomeData(
  previewParam?: boolean
): Promise<{
  homeData: HomePageCmsData;
  isPreviewSession: boolean;
  previewUser: CmsUser | null;
}> {
  const { isPreviewSession, user } = await getActivePreviewUser(previewParam);
  const homeData = getEffectiveHomePageData({
    previewDraft: isPreviewSession,
  });
  return {
    homeData,
    isPreviewSession,
    previewUser: user,
  };
}

export async function getPublicOrPreviewArticles(
  previewParam?: boolean,
  locale: SupportedLocale = "ar"
): Promise<{
  articles: ArticleRecord[];
  isPreviewSession: boolean;
}> {
  const { isPreviewSession } = await getActivePreviewUser(previewParam);
  const settings = getCmsSiteSettings();
  const all = listCmsArticles({ includeDeleted: false });

  const filtered = all.filter((art) => {
    if (art.deletedAt || art.status === "archived") {
      return false;
    }
    if (isPreviewSession) {
      if (locale === "en") {
        return Boolean(
          art.en?.title?.trim() || articlesTranslationsEn[art.slug]
        );
      }
      return true;
    }
    return isArticleVisibleToPublicVisitor(
      art,
      settings.enablePreviewDrafts,
      locale
    );
  });

  return {
    articles: filtered.map((art) => mapCmsArticleToPublicRecord(art, locale)),
    isPreviewSession,
  };
}

export async function getPublicOrPreviewArticleBySlug(
  slug: string,
  previewParam?: boolean,
  locale: SupportedLocale = "ar"
): Promise<{
  article: ArticleRecord | null;
  cmsArticle: CmsArticle | null;
  redirectToSlug: string | null;
  isPreviewSession: boolean;
  availableInOtherLocale?: boolean;
}> {
  const { isPreviewSession } = await getActivePreviewUser(previewParam);
  const settings = getCmsSiteSettings();
  const resolved = resolveArticleBySlugWithRedirect(slug);

  if (!resolved.article) {
    return {
      article: null,
      cmsArticle: null,
      redirectToSlug: null,
      isPreviewSession,
    };
  }

  const art = resolved.article;
  if (art.deletedAt || art.status === "archived") {
    return {
      article: null,
      cmsArticle: null,
      redirectToSlug: null,
      isPreviewSession,
    };
  }

  const allowedInRequestedLocale =
    isPreviewSession
      ? locale === "en"
        ? Boolean(art.en?.title?.trim() || articlesTranslationsEn[art.slug])
        : true
      : isArticleVisibleToPublicVisitor(
          art,
          settings.enablePreviewDrafts,
          locale
        );

  if (!allowedInRequestedLocale) {
    const otherLocale: SupportedLocale = locale === "en" ? "ar" : "en";
    const allowedInOther = isArticleVisibleToPublicVisitor(
      art,
      settings.enablePreviewDrafts,
      otherLocale
    );
    return {
      article: null,
      cmsArticle: art,
      redirectToSlug: resolved.redirectToSlug,
      isPreviewSession,
      availableInOtherLocale: allowedInOther,
    };
  }

  return {
    article: mapCmsArticleToPublicRecord(art, locale),
    cmsArticle: art,
    redirectToSlug: resolved.redirectToSlug,
    isPreviewSession,
    availableInOtherLocale: true,
  };
}

export function getStrictlyPublishedArticlesForSitemap(
  locale: SupportedLocale = "ar"
): ArticleRecord[] {
  const all = listCmsArticles({ includeDeleted: false });
  if (locale === "en") {
    return all
      .filter(
        (a) =>
          !a.deletedAt &&
          a.en?.status === "published" &&
          Boolean(a.en?.approvedAt)
      )
      .map((a) => mapCmsArticleToPublicRecord(a, "en"));
  }
  return all
    .filter(
      (a) =>
        a.status === "published" && !a.deletedAt && Boolean(a.approvedAt)
    )
    .map((a) => mapCmsArticleToPublicRecord(a, "ar"));
}

export async function getPublicOrPreviewFaqs(
  previewParam?: boolean,
  locale: SupportedLocale = "ar"
): Promise<FaqRecord[]> {
  const { isPreviewSession } = await getActivePreviewUser(previewParam);
  const all = listCmsFaqs(false);
  return all
    .filter((f) => {
      if (f.deletedAt) return false;
      if (locale === "en") {
        const qEn = f.questionEn || faqTranslationsEn[f.id]?.question;
        const aEn = f.answerEn || faqTranslationsEn[f.id]?.answer;
        if (!qEn?.trim() || !aEn?.trim()) return false;
        const stEn = f.statusEn ?? f.status;
        return isPreviewSession ? true : stEn === "published";
      }
      if (!f.answer || !f.answer.trim()) return false;
      return isPreviewSession ? true : f.status === "published";
    })
    .map((f) => {
      const enTrans = faqTranslationsEn[f.id];
      return {
        id: f.id,
        question:
          locale === "en"
            ? f.questionEn || enTrans?.question || f.question
            : f.question,
        answer:
          locale === "en"
            ? f.answerEn || enTrans?.answer || f.answer
            : f.answer,
        category: f.category,
        status: locale === "en" ? f.statusEn ?? f.status : f.status,
        reviewedBy: f.reviewedBy ?? (locale === "en" ? "Approved" : "معتمد"),
      };
    });
}

export function getPublicClinicsFromCms(
  locale: SupportedLocale = "ar"
): Clinic[] {
  const clinics = listCmsClinics();
  return clinics.map((c) => ({
    id: c.id,
    name: locale === "en" && c.nameEn ? c.nameEn : c.name,
    nameEn: c.nameEn,
    source: c.source,
    affiliationVerified: c.affiliationVerified,
    enabled: c.enabled,
    address: locale === "en" && c.addressEn ? c.addressEn : c.address,
    addressEn: c.addressEn,
    mapsUrl: c.mapsUrl,
    bookingUrl: c.bookingUrl,
    whatsappE164: c.whatsappE164 ?? c.phone,
    hours: locale === "en" && c.hoursEn ? c.hoursEn : c.hours,
    hoursEn: c.hoursEn,
  }));
}
