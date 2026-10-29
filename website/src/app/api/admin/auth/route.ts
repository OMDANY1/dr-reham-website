import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_PREVIEW_COOKIE,
  ADMIN_SESSION_COOKIE,
  getSessionPayloadFromCookies,
  isProtectedPreviewEnabled,
  signSessionToken,
} from "@/lib/cms/auth";
import {
  authenticateCmsUser,
  bootstrapFirstAdmin,
  confirmPasswordReset,
  getBootstrapSetupInstruction,
  getCmsUserById,
  isSupabaseConfigured,
  requestPasswordReset,
} from "@/lib/cms/repository";
import { handleCmsApiError, requireAuthenticatedUser } from "@/lib/cms/api-guard";

export async function GET() {
  try {
    const setupInfo = getBootstrapSetupInstruction();
    const session = await getSessionPayloadFromCookies();
    const user = session ? getCmsUserById(session.userId) : null;
    const previewEnabled = await isProtectedPreviewEnabled();

    return NextResponse.json({
      authenticated: Boolean(user),
      user,
      needsBootstrap: setupInfo.needsBootstrap,
      requiresEnvToken: setupInfo.requiresEnvToken,
      supabaseConnected: isSupabaseConfigured(),
      previewEnabled,
    });
  } catch (err) {
    return handleCmsApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body?.action;

    if (action === "bootstrap") {
      const user = bootstrapFirstAdmin({
        name: body.name,
        email: body.email,
        password: body.password,
        bootstrapToken: body.bootstrapToken,
      });
      const token = signSessionToken(user);
      const response = NextResponse.json({ user, ok: true });
      response.cookies.set(ADMIN_SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 12,
      });
      return response;
    }

    if (action === "login") {
      const clientIp =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        "local";
      const user = authenticateCmsUser({
        email: body.email,
        password: body.password,
        clientIp,
      });
      const token = signSessionToken(user);
      const response = NextResponse.json({ user, ok: true });
      response.cookies.set(ADMIN_SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 12,
      });
      return response;
    }

    if (action === "logout") {
      const response = NextResponse.json({ ok: true });
      response.cookies.delete(ADMIN_SESSION_COOKIE);
      response.cookies.delete(ADMIN_PREVIEW_COOKIE);
      return response;
    }

    if (action === "reset_request") {
      const result = requestPasswordReset(body.email ?? "");
      return NextResponse.json({
        ok: true,
        message:
          "إذا كان البريد الإلكتروني مسجلًا في النظام، فقد تم إنشاء رمز استعادة كلمة المرور.",
        ...result,
      });
    }

    if (action === "reset_confirm") {
      confirmPasswordReset({
        token: body.token ?? "",
        newPassword: body.newPassword ?? "",
      });
      return NextResponse.json({
        ok: true,
        message: "تم تحديث كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.",
      });
    }

    if (action === "toggle_preview") {
      await requireAuthenticatedUser();
      const enable = Boolean(body.enable);
      const response = NextResponse.json({
        ok: true,
        previewEnabled: enable,
      });
      if (enable) {
        response.cookies.set(ADMIN_PREVIEW_COOKIE, "1", {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 4,
        });
      } else {
        response.cookies.delete(ADMIN_PREVIEW_COOKIE);
      }
      return response;
    }

    return NextResponse.json(
      { error: "الإجراء المطلوب غير معروف." },
      { status: 400 }
    );
  } catch (err) {
    return handleCmsApiError(err);
  }
}
