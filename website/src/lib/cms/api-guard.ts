import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSessionPayloadFromCookies } from "./auth";
import { CmsError, getCmsUserById } from "./repository";
import type { CmsRole, CmsUser } from "./types";

export async function requireAuthenticatedUser(
  requiredRole?: CmsRole
): Promise<CmsUser> {
  const session = await getSessionPayloadFromCookies();
  if (!session) {
    throw new CmsError(
      "يجب تسجيل الدخول للوصول إلى لوحة الإدارة.",
      401,
      "UNAUTHORIZED"
    );
  }
  const user = getCmsUserById(session.userId);
  if (!user || !user.active) {
    throw new CmsError(
      "انتهت صلاحية الجلسة أو تم إيقاف الحساب.",
      401,
      "UNAUTHORIZED"
    );
  }
  if (requiredRole === "admin" && user.role !== "admin") {
    throw new CmsError(
      "هذه العملية متاحة للمدير فقط ولا تتوفر لصلاحية المحرر.",
      403,
      "FORBIDDEN"
    );
  }
  return user;
}

export function handleCmsApiError(err: unknown): NextResponse {
  if (err instanceof CmsError) {
    return NextResponse.json(
      { error: err.message, code: err.code },
      { status: err.status }
    );
  }
  const message =
    err instanceof Error ? err.message : "حدث خطأ غير متوقع في الخادم.";
  return NextResponse.json(
    { error: message, code: "INTERNAL_ERROR" },
    { status: 500 }
  );
}

export function revalidatePublicSitePaths(articleSlug?: string): void {
  try {
    revalidatePath("/", "layout");
    for (const locale of ["ar", "en"]) {
      revalidatePath(`/${locale}`);
      revalidatePath(`/${locale}/journal`);
      revalidatePath(`/${locale}/faq`);
      revalidatePath(`/${locale}/book`);
      revalidatePath(`/${locale}/about`);
      revalidatePath(`/${locale}/privacy`);
      if (articleSlug) {
        revalidatePath(`/${locale}/journal/${articleSlug}`);
      }
    }
    revalidatePath("/sitemap.xml");
  } catch {
    // Ignore revalidatePath errors when called outside Next.js request context (e.g. unit tests)
  }
}
