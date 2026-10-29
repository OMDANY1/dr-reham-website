import { NextResponse, type NextRequest } from "next/server";
import {
  deleteCmsFaq,
  listCmsFaqs,
  saveCmsFaq,
} from "@/lib/cms/repository";
import {
  handleCmsApiError,
  requireAuthenticatedUser,
  revalidatePublicSitePaths,
} from "@/lib/cms/api-guard";

export async function GET() {
  try {
    await requireAuthenticatedUser();
    const faqs = listCmsFaqs(false);
    return NextResponse.json({ faqs });
  } catch (err) {
    return handleCmsApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const body = await request.json();
    const saved = saveCmsFaq(user, body);
    revalidatePublicSitePaths();
    return NextResponse.json({
      ok: true,
      message:
        saved.status === "published"
          ? "تم حفظ ونشر السؤال بنجاح."
          : "تم حفظ السؤال كمسودة بنجاح.",
      faq: saved,
      faqs: listCmsFaqs(false),
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
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "معرّف السؤال مطلوب." },
        { status: 400 }
      );
    }
    deleteCmsFaq(admin, id);
    revalidatePublicSitePaths();
    return NextResponse.json({
      ok: true,
      message: "تم حذف السؤال بنجاح.",
      faqs: listCmsFaqs(false),
    });
  } catch (err) {
    return handleCmsApiError(err);
  }
}
