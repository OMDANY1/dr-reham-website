import { NextRequest, NextResponse } from "next/server";
import {
  PREVIEW_DRAFTS_COOKIE,
  sanitizeInternalRedirectPath,
} from "@/lib/preview-auth";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const redirectPath = sanitizeInternalRedirectPath(
    searchParams.get("redirect") || "/ar"
  );

  const targetUrl = new URL(redirectPath, request.url);
  const response = NextResponse.redirect(targetUrl, { status: 303 });
  response.cookies.delete(PREVIEW_DRAFTS_COOKIE);
  return response;
}
