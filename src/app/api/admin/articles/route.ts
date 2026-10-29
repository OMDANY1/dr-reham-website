import { NextResponse, type NextRequest } from "next/server";
import {
  getCmsArticleById,
  listCmsArticles,
  listEntityRevisions,
  saveCmsArticle,
  softDeleteOrRestoreArticle,
} from "@/lib/cms/repository";
import {
  handleCmsApiError,
  requireAuthenticatedUser,
  revalidatePublicSitePaths,
} from "@/lib/cms/api-guard";
import { calculateReadingTimeMinutes } from "@/lib/content-gates";

export async function GET(request: NextRequest) {
  try {
    await requireAuthenticatedUser();
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");
    if (id) {
      const article = getCmsArticleById(id);
      if (!article) {
        return NextResponse.json(
          { error: "المقال غير موجود." },
          { status: 404 }
        );
      }
      const revisions = listEntityRevisions("article", id);
      return NextResponse.json({
        article,
        readingTimeMinutes: calculateReadingTimeMinutes(article),
        revisions,
      });
    }

    const status = searchParams.get("status") ?? undefined;
    const category = searchParams.get("category") ?? undefined;
    const query = searchParams.get("query") ?? undefined;
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    const articles = listCmsArticles({
      status,
      category,
      query,
      includeDeleted,
    }).map((art) => ({
      ...art,
      readingTimeMinutes: calculateReadingTimeMinutes(art),
    }));

    return NextResponse.json({ articles });
  } catch (err) {
    return handleCmsApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const body = await request.json();
    const saved = saveCmsArticle(user, body);
    revalidatePublicSitePaths(saved.slug);
    const revisions = listEntityRevisions("article", saved.id);
    return NextResponse.json({
      ok: true,
      message:
        saved.status === "published"
          ? "تم حفظ ونشر المقال بنجاح."
          : saved.status === "archived"
          ? "تم أرشفة المقال وإخفاؤه من العرض العام."
          : saved.status === "in_review"
          ? "تم حفظ المقال وإرساله للمراجعة."
          : "تم حفظ المسودة في قاعدة البيانات بنجاح.",
      article: {
        ...saved,
        readingTimeMinutes: calculateReadingTimeMinutes(saved),
      },
      revisions,
    });
  } catch (err) {
    return handleCmsApiError(err);
  }
}

export async function PUT(request: NextRequest) {
  return POST(request);
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await requireAuthenticatedUser("admin");
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");
    const restore = searchParams.get("restore") === "true";
    if (!id) {
      return NextResponse.json({ error: "معرّف المقال مطلوب." }, { status: 400 });
    }
    const article = softDeleteOrRestoreArticle(admin, id, restore);
    revalidatePublicSitePaths(article.slug);
    return NextResponse.json({
      ok: true,
      message: restore
        ? "تمت استعادة المقال بنجاح."
        : "تم نقل المقال إلى المحذوفات القابلة للاسترجاع.",
      article,
    });
  } catch (err) {
    return handleCmsApiError(err);
  }
}
