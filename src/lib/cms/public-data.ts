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
import type { CmsArticle, CmsUser, HomePageCmsData } from "./types";
import type { ArticleRecord, FaqRecord } from "@/lib/content-gates";
import type { Clinic } from "@/config/site";

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
  enablePreviewDrafts: boolean
): boolean {
  if (article.deletedAt || article.status === "archived") {
    return false;
  }
  if (article.status === "published" && article.approvedAt) {
    return true;
  }
  // Initial 6 seeded educational preview drafts remain visible in preview mode unless archived/deleted
  if (
    enablePreviewDrafts &&
    article.status === "draft" &&
    article.updatedBy === "تهيئة المحتوى الأولي"
  ) {
    return true;
  }
  return false;
}

export function mapCmsArticleToPublicRecord(article: CmsArticle): ArticleRecord {
  const isPublished = article.status === "published" && Boolean(article.approvedAt);
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
  previewParam?: boolean
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
      return true;
    }
    return isArticleVisibleToPublicVisitor(art, settings.enablePreviewDrafts);
  });

  return {
    articles: filtered.map(mapCmsArticleToPublicRecord),
    isPreviewSession,
  };
}

export async function getPublicOrPreviewArticleBySlug(
  slug: string,
  previewParam?: boolean
): Promise<{
  article: ArticleRecord | null;
  cmsArticle: CmsArticle | null;
  redirectToSlug: string | null;
  isPreviewSession: boolean;
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

  const allowed =
    isPreviewSession ||
    isArticleVisibleToPublicVisitor(art, settings.enablePreviewDrafts);

  if (!allowed) {
    return {
      article: null,
      cmsArticle: null,
      redirectToSlug: null,
      isPreviewSession,
    };
  }

  return {
    article: mapCmsArticleToPublicRecord(art),
    cmsArticle: art,
    redirectToSlug: resolved.redirectToSlug,
    isPreviewSession,
  };
}

export function getStrictlyPublishedArticlesForSitemap(): ArticleRecord[] {
  const all = listCmsArticles({ includeDeleted: false });
  return all
    .filter(
      (a) =>
        a.status === "published" && !a.deletedAt && Boolean(a.approvedAt)
    )
    .map(mapCmsArticleToPublicRecord);
}

export async function getPublicOrPreviewFaqs(
  previewParam?: boolean
): Promise<FaqRecord[]> {
  const { isPreviewSession } = await getActivePreviewUser(previewParam);
  const all = listCmsFaqs(false);
  return all
    .filter((f) => {
      if (f.deletedAt) return false;
      if (!f.answer || !f.answer.trim()) return false;
      return isPreviewSession ? true : f.status === "published";
    })
    .map((f) => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
      category: f.category,
      status: f.status,
      reviewedBy: f.reviewedBy ?? "معتمد",
    }));
}

export function getPublicClinicsFromCms(): Clinic[] {
  const clinics = listCmsClinics();
  return clinics.map((c) => ({
    id: c.id,
    name: c.name,
    source: c.source,
    affiliationVerified: c.affiliationVerified,
    enabled: c.enabled,
    address: c.address,
    mapsUrl: c.mapsUrl,
    bookingUrl: c.bookingUrl,
    whatsappE164: c.whatsappE164 ?? c.phone,
    hours: c.hours,
  }));
}
