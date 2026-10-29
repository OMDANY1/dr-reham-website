import { NextResponse, type NextRequest } from "next/server";
import {
  deleteCmsClinic,
  getCmsSiteSettings,
  listCmsClinics,
  saveCmsClinic,
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
    const clinics = listCmsClinics();
    const settings = getCmsSiteSettings();
    return NextResponse.json({
      clinics,
      contactSettings: {
        instagramUrl: settings.instagramUrl,
        whatsappUrl: settings.whatsappUrl,
        phone: settings.phone,
        email: settings.email,
        defaultInquiryDestination: settings.defaultInquiryDestination,
        bookingEnabled: settings.bookingEnabled,
        version: settings.version,
      },
    });
  } catch (err) {
    return handleCmsApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const body = await request.json();

    if (body?.action === "update_contact") {
      const admin = await requireAuthenticatedUser("admin");
      const settings = updateCmsSiteSettings(admin, {
        instagramUrl: body.instagramUrl,
        whatsappUrl: body.whatsappUrl,
        phone: body.phone,
        email: body.email,
        defaultInquiryDestination: body.defaultInquiryDestination,
        bookingEnabled: body.bookingEnabled,
        expectedVersion: body.expectedVersion,
      });
      revalidatePublicSitePaths();
      return NextResponse.json({
        ok: true,
        message: "تم حفظ إعدادات التواصل بنجاح.",
        contactSettings: {
          instagramUrl: settings.instagramUrl,
          whatsappUrl: settings.whatsappUrl,
          phone: settings.phone,
          email: settings.email,
          defaultInquiryDestination: settings.defaultInquiryDestination,
          bookingEnabled: settings.bookingEnabled,
          version: settings.version,
        },
      });
    }

    const saved = saveCmsClinic(user, body);
    revalidatePublicSitePaths();
    return NextResponse.json({
      ok: true,
      message: "تم حفظ بيانات العيادة بنجاح.",
      clinic: saved,
      clinics: listCmsClinics(),
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
        { error: "معرّف العيادة مطلوب." },
        { status: 400 }
      );
    }
    deleteCmsClinic(admin, id);
    revalidatePublicSitePaths();
    return NextResponse.json({
      ok: true,
      message: "تم حذف العيادة بنجاح.",
      clinics: listCmsClinics(),
    });
  } catch (err) {
    return handleCmsApiError(err);
  }
}
