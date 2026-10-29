import fs from "node:fs";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import { getSessionPayloadFromCookies } from "@/lib/cms/auth";
import { getCmsMediaById, getCmsUserById } from "@/lib/cms/repository";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const media = getCmsMediaById(id);
  if (!media) {
    return NextResponse.json({ error: "الصورة غير موجودة." }, { status: 404 });
  }

  // Draft/unpublished media protection: require authenticated Admin/Editor session if not public
  if (!media.isPublic) {
    const session = await getSessionPayloadFromCookies();
    const activeUser = session ? getCmsUserById(session.userId) : null;
    if (!activeUser) {
      return NextResponse.json(
        {
          error:
            "هذه الصورة مرتبطة بمسودة غير منشورة ولا تتاح للعامة إلا للمسجلين في لوحة الإدارة.",
        },
        { status: 403 }
      );
    }
  }

  let filePath = media.storagePath;
  if (filePath.startsWith("/media/")) {
    filePath = path.join(process.cwd(), "public", filePath);
  }

  if (!fs.existsSync(filePath)) {
    return NextResponse.json(
      { error: "ملف الصورة غير موجود على الخادم." },
      { status: 404 }
    );
  }

  const fileBuffer = fs.readFileSync(filePath);
  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      "Content-Type": media.mimeType,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": media.isPublic
        ? "public, max-age=3600, stale-while-revalidate=86400"
        : "private, no-store, no-cache, must-revalidate",
    },
  });
}
