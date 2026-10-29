import { NextResponse, type NextRequest } from "next/server";
import {
  listEntityRevisions,
  restoreRevisionById,
} from "@/lib/cms/repository";
import {
  handleCmsApiError,
  requireAuthenticatedUser,
  revalidatePublicSitePaths,
} from "@/lib/cms/api-guard";
import type { CmsRevision } from "@/lib/cms/types";

export async function GET(request: NextRequest) {
  try {
    await requireAuthenticatedUser();
    const { searchParams } = request.nextUrl;
    const entityType = searchParams.get(
      "entityType"
    ) as CmsRevision["entityType"];
    const entityId = searchParams.get("entityId") ?? "";
    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: "نوع العنصر ومعرّفه مطلوبان." },
        { status: 400 }
      );
    }
    const revisions = listEntityRevisions(entityType, entityId);
    return NextResponse.json({ revisions });
  } catch (err) {
    return handleCmsApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAuthenticatedUser("admin");
    const body = await request.json();
    const revisionId = body?.revisionId;
    if (!revisionId) {
      return NextResponse.json(
        { error: "معرّف النسخة المراد استرجاعها مطلوب." },
        { status: 400 }
      );
    }
    const result = restoreRevisionById(admin, revisionId);
    revalidatePublicSitePaths();
    return NextResponse.json({
      ok: true,
      message: "تم استرجاع النسخة السابقة بنجاح.",
      ...result,
    });
  } catch (err) {
    return handleCmsApiError(err);
  }
}
