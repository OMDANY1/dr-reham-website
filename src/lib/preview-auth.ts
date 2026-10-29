import { cookies, headers } from "next/headers";
import { siteConfig } from "@/config/site";

export const PREVIEW_DRAFTS_COOKIE = "dr_reham_preview_drafts";
export const DEFAULT_PREVIEW_KEY = "gaze-editorial-2026";

export function getPreviewSecretKey(): string {
  return process.env.PREVIEW_DRAFTS_KEY?.trim() || DEFAULT_PREVIEW_KEY;
}

export function isValidPreviewKey(input: string | null | undefined): boolean {
  if (!input || siteConfig.mode === "production") {
    return false;
  }
  return input.trim() === getPreviewSecretKey();
}

export function sanitizeInternalRedirectPath(
  rawPath: string | null | undefined
): string {
  if (!rawPath || typeof rawPath !== "string") {
    return "/ar/journal";
  }
  const trimmed = rawPath.trim();
  if (!trimmed.startsWith("/ar") || trimmed.startsWith("//")) {
    return "/ar/journal";
  }
  return trimmed;
}

/**
 * يتحقق مما إذا كان الطلب الحالي داخل «المعاينة المحمية» للمسودات:
 * - لا يُفعل أبدًا في وضع الإنتاج الصريح (`siteConfig.mode === "production"`).
 * - يتطلب إما ترويسة الاختبار الخادمية (`x-qa-preview-drafts: 1`)
 *   أو كوكي المعاينة المحمية (`dr_reham_preview_drafts=1`) الذي يُضبط عبر `/api/preview`.
 * - وبذلك لا تظهر مقالات «مسودة للمراجعة» في النسخة العامة للزوار إطلاقًا.
 */
export async function isProtectedDraftPreviewActive(): Promise<boolean> {
  if (siteConfig.mode === "production") {
    return false;
  }

  try {
    const reqHeaders = await headers();
    if (reqHeaders.get("x-qa-preview-drafts") === "1") {
      return true;
    }

    const reqCookies = await cookies();
    const cookieVal = reqCookies.get(PREVIEW_DRAFTS_COOKIE)?.value;
    if (cookieVal === "1") {
      return true;
    }
  } catch {
    // في حال الاستدعاء خارج سياق طلب ديناميكي، تبقى المسودات محجوبة افتراضيًا
    return false;
  }

  return false;
}
