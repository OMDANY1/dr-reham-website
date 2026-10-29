import { NextResponse, type NextRequest } from "next/server";
import {
  deleteCmsMedia,
  listCmsMedia,
  replaceCmsMediaUsages,
  updateCmsMediaMetadata,
  uploadCmsMedia,
} from "@/lib/cms/repository";
import {
  handleCmsApiError,
  requireAuthenticatedUser,
  revalidatePublicSitePaths,
} from "@/lib/cms/api-guard";

export async function GET() {
  try {
    await requireAuthenticatedUser();
    const media = listCmsMedia();
    return NextResponse.json({ media });
  } catch (err) {
    return handleCmsApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");
      if (!file || !(file instanceof File)) {
        return NextResponse.json(
          { error: "ملف الصورة مطلوب." },
          { status: 400 }
        );
      }

      const arrayBuf = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuf);
      const name = String(formData.get("name") ?? "");
      const alt = String(formData.get("alt") ?? "");
      const focalX = Number(formData.get("focalX") ?? 50);
      const focalY = Number(formData.get("focalY") ?? 50);

      const uploaded = uploadCmsMedia(user, {
        buffer,
        originalFilename: file.name,
        name,
        alt,
        focalX,
        focalY,
      });

      return NextResponse.json({
        ok: true,
        message: "تم رفع الصورة وحفظها في التخزين الدائم بنجاح.",
        item: uploaded,
      });
    }

    const body = await request.json();
    if (body?.action === "update_meta") {
      const updated = updateCmsMediaMetadata(user, body.id, {
        name: body.name,
        alt: body.alt,
        focalX: body.focalX,
        focalY: body.focalY,
      });
      revalidatePublicSitePaths();
      return NextResponse.json({
        ok: true,
        message: "تم حفظ بيانات الصورة ونقطة التركيز بنجاح.",
        item: updated,
      });
    }

    if (body?.action === "replace") {
      const result = replaceCmsMediaUsages(
        user,
        body.oldMediaId,
        body.newMediaId
      );
      revalidatePublicSitePaths();
      return NextResponse.json({
        ok: true,
        message: "تم استبدال الصورة في جميع المواضع المرتبطة بها بنجاح.",
        ...result,
      });
    }

    return NextResponse.json(
      { error: "الإجراء المطلوب غير مدعوم." },
      { status: 400 }
    );
  } catch (err) {
    return handleCmsApiError(err);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "معرّف الصورة مطلوب." },
        { status: 400 }
      );
    }
    deleteCmsMedia(user, id);
    revalidatePublicSitePaths();
    return NextResponse.json({
      ok: true,
      message: "تم حذف الصورة من مكتبة الصور بنجاح.",
    });
  } catch (err) {
    return handleCmsApiError(err);
  }
}
