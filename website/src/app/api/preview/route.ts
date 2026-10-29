import { NextRequest, NextResponse } from "next/server";
import {
  isValidPreviewKey,
  PREVIEW_DRAFTS_COOKIE,
  sanitizeInternalRedirectPath,
} from "@/lib/preview-auth";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const key = searchParams.get("key");
  const redirectPath = sanitizeInternalRedirectPath(
    searchParams.get("redirect")
  );

  if (!isValidPreviewKey(key)) {
    return NextResponse.json(
      {
        error: "مفتاح المعاينة المحمية غير صالح أو غير مفعل في هذه البيئة.",
      },
      { status: 401 }
    );
  }

  const targetUrl = new URL(redirectPath, request.url);
  const response = NextResponse.redirect(targetUrl, { status: 303 });
  response.cookies.set({
    name: PREVIEW_DRAFTS_COOKIE,
    value: "1",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return response;
}
