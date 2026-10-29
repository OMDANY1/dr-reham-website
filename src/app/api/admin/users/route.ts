import { NextResponse, type NextRequest } from "next/server";
import {
  createCmsUser,
  listCmsUsers,
  updateCmsUser,
} from "@/lib/cms/repository";
import { handleCmsApiError, requireAuthenticatedUser } from "@/lib/cms/api-guard";

export async function GET() {
  try {
    await requireAuthenticatedUser("admin");
    const users = listCmsUsers();
    return NextResponse.json({ users });
  } catch (err) {
    return handleCmsApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAuthenticatedUser("admin");
    const body = await request.json();
    const created = createCmsUser(admin, {
      name: body.name,
      email: body.email,
      role: body.role,
      password: body.password,
    });
    return NextResponse.json({
      ok: true,
      message: "تم إنشاء الحساب الجديد بنجاح.",
      user: created,
      users: listCmsUsers(),
    });
  } catch (err) {
    return handleCmsApiError(err);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAuthenticatedUser("admin");
    const body = await request.json();
    const updated = updateCmsUser(admin, body.id, {
      name: body.name,
      role: body.role,
      active: body.active,
      password: body.password,
    });
    return NextResponse.json({
      ok: true,
      message: "تم تحديث بيانات وصلاحيات المستخدم بنجاح.",
      user: updated,
      users: listCmsUsers(),
    });
  } catch (err) {
    return handleCmsApiError(err);
  }
}
