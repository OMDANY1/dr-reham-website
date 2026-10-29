import { NextResponse, type NextRequest } from "next/server";
import {
  getCmsSiteSettings,
  isSupabaseConfigured,
  listEntityRevisions,
  updateCmsSiteSettings,
} from "@/lib/cms/repository";
import {
  handleCmsApiError,
  requireAuthenticatedUser,
  revalidatePublicSitePaths,
} from "@/lib/cms/api-guard";

export async function GET() {
  try {
    await requireAuthenticatedUser();
    const settings = getCmsSiteSettings();
    const revisions = listEntityRevisions("settings", "default");
    return NextResponse.json({
      settings,
      revisions,
      supabaseConnected: isSupabaseConfigured(),
    });
  } catch (err) {
    return handleCmsApiError(err);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAuthenticatedUser("admin");
    const body = await request.json();
    const updated = updateCmsSiteSettings(admin, body);
    revalidatePublicSitePaths();
    const revisions = listEntityRevisions("settings", "default");
    return NextResponse.json({
      ok: true,
      message: "تم حفظ إعدادات الموقع والخصوصية وتحديث الكاش بنجاح.",
      settings: updated,
      revisions,
    });
  } catch (err) {
    return handleCmsApiError(err);
  }
}
