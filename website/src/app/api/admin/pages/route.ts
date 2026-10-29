import { NextResponse, type NextRequest } from "next/server";
import {
  getDashboardOverview,
  getHomePageRecord,
  listEntityRevisions,
  publishHomePageChanges,
  saveHomePageDraft,
} from "@/lib/cms/repository";
import {
  handleCmsApiError,
  requireAuthenticatedUser,
  revalidatePublicSitePaths,
} from "@/lib/cms/api-guard";

export async function GET() {
  try {
    await requireAuthenticatedUser();
    const page = getHomePageRecord();
    const revisions = listEntityRevisions("page", "home");
    const overview = getDashboardOverview();
    return NextResponse.json({ page, revisions, overview });
  } catch (err) {
    return handleCmsApiError(err);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body?.action === "publish" ? "publish" : "save_draft";

    if (action === "publish") {
      const admin = await requireAuthenticatedUser("admin");
      const page = publishHomePageChanges(admin, {
        draftData: body.draftData,
        expectedVersion: body.expectedVersion,
      });
      revalidatePublicSitePaths();
      const revisions = listEntityRevisions("page", "home");
      return NextResponse.json({
        ok: true,
        message: "تم نشر التغييرات وتحديث الموقع العام بنجاح.",
        page,
        revisions,
      });
    }

    const user = await requireAuthenticatedUser();
    const page = saveHomePageDraft(user, {
      draftData: body.draftData,
      expectedVersion: body.expectedVersion,
    });
    const revisions = listEntityRevisions("page", "home");
    return NextResponse.json({
      ok: true,
      message: "تم حفظ المسودة بنجاح (دون تغيير الموقع العام حتى النشر).",
      page,
      revisions,
    });
  } catch (err) {
    return handleCmsApiError(err);
  }
}
