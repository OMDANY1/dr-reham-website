import fs from "node:fs";
import path from "node:path";
import { randomBytes, randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  buildInitialArticles,
  buildInitialClinics,
  buildInitialFaqs,
  buildInitialMediaItems,
  buildInitialPageRecord,
  buildInitialSettings,
} from "./seed";
import {
  hashPassword,
  hashResetToken,
  verifyPassword,
} from "./auth";
import {
  inspectUploadedImageBuffer,
  sanitizeNullableText,
  sanitizeSlug,
  sanitizeText,
  validateSafeUrl,
} from "./sanitize";
import type {
  CmsArticle,
  CmsArticleStatus,
  CmsAuditLog,
  CmsClinicItem,
  CmsFaqItem,
  CmsMediaItem,
  CmsMediaUsage,
  CmsPageRecord,
  CmsRevision,
  CmsRole,
  CmsSiteSettings,
  CmsSlugRedirect,
  CmsUser,
  CmsUserInternal,
  HomePageCmsData,
} from "./types";

export class CmsError extends Error {
  status: number;
  code: string;
  constructor(message: string, status = 400, code = "CMS_ERROR") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

interface LoginAttemptRecord {
  count: number;
  firstAttemptAt: number;
  lockedUntil: number | null;
}

interface PasswordResetRecord {
  tokenHash: string;
  userId: string;
  expiresAt: number;
  usedAt: number | null;
}

interface PersistentCmsStore {
  schemaVersion: number;
  seededAt: string;
  users: CmsUserInternal[];
  loginAttempts: Record<string, LoginAttemptRecord>;
  passwordResets: PasswordResetRecord[];
  pages: Record<string, CmsPageRecord>;
  articles: CmsArticle[];
  slugRedirects: CmsSlugRedirect[];
  media: CmsMediaItem[];
  faqs: CmsFaqItem[];
  clinics: CmsClinicItem[];
  settings: CmsSiteSettings;
  revisions: CmsRevision[];
  auditLogs: CmsAuditLog[];
}

function resolveDataDir(): string {
  if (process.env.CMS_DATA_DIR) {
    return path.resolve(process.env.CMS_DATA_DIR);
  }
  // On Vercel serverless, /tmp is writable if Supabase is not yet connected
  if (process.env.VERCEL === "1") {
    return path.join("/tmp", "dr-reham-cms-data");
  }
  return path.join(process.cwd(), "data");
}

function getDbFilePath(): string {
  return path.join(resolveDataDir(), "cms-store.json");
}

function getUploadsDir(): string {
  return path.join(resolveDataDir(), "uploads");
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

let cachedSupabaseAdmin: SupabaseClient | null = null;
export function getSupabaseServerClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!cachedSupabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    cachedSupabaseAdmin = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cachedSupabaseAdmin;
}

function ensureStoreInitialized(): PersistentCmsStore {
  const dataDir = resolveDataDir();
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const uploadsDir = getUploadsDir();
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const dbFile = getDbFilePath();
  if (fs.existsSync(dbFile)) {
    try {
      const raw = fs.readFileSync(dbFile, "utf8");
      const parsed = JSON.parse(raw) as PersistentCmsStore;
      if (parsed && parsed.schemaVersion >= 1) {
        return parsed;
      }
    } catch {
      // Fall through to re-seed if corrupted
    }
  }

  const initialPage = buildInitialPageRecord();
  const initialArticles = buildInitialArticles();
  const initialMedia = buildInitialMediaItems();
  const initialFaqs = buildInitialFaqs();
  const initialClinics = buildInitialClinics();
  const initialSettings = buildInitialSettings();

  const initialStore: PersistentCmsStore = {
    schemaVersion: 1,
    seededAt: new Date().toISOString(),
    users: [],
    loginAttempts: {},
    passwordResets: [],
    pages: {
      home: initialPage,
    },
    articles: initialArticles,
    slugRedirects: [],
    media: initialMedia,
    faqs: initialFaqs,
    clinics: initialClinics,
    settings: initialSettings,
    revisions: [
      {
        id: randomUUID(),
        entityType: "page",
        entityId: "home",
        version: 1,
        snapshot: structuredClone(initialPage.publishedData),
        summary: "النسخة الأولية المرحلة من محتوى الموقع",
        actorEmail: "system@dr-reham.local",
        actorName: "تهيئة النظام",
        createdAt: initialPage.updatedAt,
      },
      ...initialArticles.map((art) => ({
        id: randomUUID(),
        entityType: "article" as const,
        entityId: art.id,
        version: 1,
        snapshot: structuredClone(art),
        summary: "النسخة الأولية المرحلة من المقالات",
        actorEmail: "system@dr-reham.local",
        actorName: "تهيئة النظام",
        createdAt: art.updatedAt,
      })),
    ],
    auditLogs: [
      {
        id: randomUUID(),
        action: "seed_migration",
        entityType: "system",
        entityId: "initial",
        summary:
          "تم ترحيل المحتوى الحالي للموقع (الصفحة الرئيسية، ٦ مقالات، الأسئلة الشائعة، العيادات، والصور) إلى قاعدة البيانات بنجاح.",
        actorEmail: "system@dr-reham.local",
        actorName: "تهيئة النظام",
        actorRole: "admin",
        createdAt: new Date().toISOString(),
      },
    ],
  };

  saveStore(initialStore);
  return initialStore;
}

function saveStore(store: PersistentCmsStore): void {
  const dataDir = resolveDataDir();
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const dbFile = getDbFilePath();
  const tempFile = `${dbFile}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(tempFile, JSON.stringify(store, null, 2), "utf8");
  fs.renameSync(tempFile, dbFile);
}

function stripPassword(user: CmsUserInternal): CmsUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    active: user.active,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.lastLoginAt,
  };
}

function recordAudit(
  store: PersistentCmsStore,
  entry: Omit<CmsAuditLog, "id" | "createdAt">
): void {
  store.auditLogs.unshift({
    ...entry,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  });
  if (store.auditLogs.length > 500) {
    store.auditLogs.length = 500;
  }
}

function recordRevision(
  store: PersistentCmsStore,
  entry: Omit<CmsRevision, "id" | "createdAt">
): void {
  store.revisions.unshift({
    ...entry,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  });
  if (store.revisions.length > 500) {
    store.revisions.length = 500;
  }
}

/**
 * يحدث حالة الظهور العام (isPublic) لكل صورة بناءً على ارتباطها بمحتوى منشور فعليًا.
 * صور المسودات أو المواد غير المنشورة تظل غير عامة (isPublic: false).
 */
function syncMediaPublicVisibility(store: PersistentCmsStore): void {
  const publicUrls = new Set<string>();

  // 1. Published home page images
  const homePub = store.pages.home?.publishedData;
  if (homePub) {
    if (homePub.hero?.image?.src) publicUrls.add(homePub.hero.image.src);
    if (homePub.specialtySection?.image?.src)
      publicUrls.add(homePub.specialtySection.image.src);
    if (homePub.contentStyleSection?.instagramCard?.image?.src)
      publicUrls.add(homePub.contentStyleSection.instagramCard.image.src);
  }

  // 2. Published articles images
  for (const art of store.articles) {
    if (art.status === "published" && !art.deletedAt && art.approvedAt) {
      if (art.image?.src) publicUrls.add(art.image.src);
      if (art.seo?.ogImage) publicUrls.add(art.seo.ogImage);
      for (const sec of art.body) {
        if (sec.imageSrc) publicUrls.add(sec.imageSrc);
      }
    }
  }

  // 3. Site settings images
  if (store.settings.logoPath) publicUrls.add(store.settings.logoPath);
  if (store.settings.faviconPath) publicUrls.add(store.settings.faviconPath);
  if (store.settings.defaultOgImage)
    publicUrls.add(store.settings.defaultOgImage);

  for (const item of store.media) {
    item.isPublic = publicUrls.has(item.url);
  }
}

export function computeMediaUsages(
  store: PersistentCmsStore,
  mediaUrl: string
): CmsMediaUsage[] {
  const usages: CmsMediaUsage[] = [];

  for (const art of store.articles) {
    if (art.deletedAt) continue;
    const inHero = art.image?.src === mediaUrl;
    const inOg = art.seo?.ogImage === mediaUrl;
    const inBody = art.body.some((s) => s.imageSrc === mediaUrl);
    if (inHero || inOg || inBody) {
      usages.push({
        type: "article",
        id: art.id,
        label: `مقال: ${art.title}`,
      });
    }
  }

  const homePage = store.pages.home;
  if (homePage) {
    const checkHome = (data: HomePageCmsData, suffix: string) => {
      if (data.hero?.image?.src === mediaUrl) {
        usages.push({
          type: "page",
          id: "home:hero",
          label: `الصفحة الرئيسية — صورة الافتتاحية (${suffix})`,
        });
      }
      if (data.specialtySection?.image?.src === mediaUrl) {
        usages.push({
          type: "page",
          id: "home:specialty",
          label: `الصفحة الرئيسية — صورة التخصص (${suffix})`,
        });
      }
      if (data.contentStyleSection?.instagramCard?.image?.src === mediaUrl) {
        usages.push({
          type: "page",
          id: "home:contentStyle",
          label: `الصفحة الرئيسية — بطاقة أسلوب المحتوى (${suffix})`,
        });
      }
    };
    checkHome(homePage.publishedData, "منشور");
    if (homePage.hasUnpublishedChanges) {
      checkHome(homePage.draftData, "مسودة");
    }
  }

  if (
    store.settings.defaultOgImage === mediaUrl ||
    store.settings.logoPath === mediaUrl ||
    store.settings.faviconPath === mediaUrl
  ) {
    usages.push({
      type: "settings",
      id: "default",
      label: "إعدادات الموقع العامة",
    });
  }

  // Deduplicate by type+id
  const seen = new Set<string>();
  return usages.filter((u) => {
    const key = `${u.type}:${u.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ============================================================================
// 1. Auth, Users & First-Admin Bootstrap Operations
// ============================================================================

export function hasAnyAdminUser(): boolean {
  const store = ensureStoreInitialized();
  return store.users.some((u) => u.role === "admin" && u.active);
}

export function getBootstrapSetupInstruction(): {
  needsBootstrap: boolean;
  requiresEnvToken: boolean;
} {
  return {
    needsBootstrap: !hasAnyAdminUser(),
    requiresEnvToken: Boolean(process.env.ADMIN_BOOTSTRAP_TOKEN),
  };
}

export function bootstrapFirstAdmin(input: {
  name: string;
  email: string;
  password: string;
  bootstrapToken?: string;
}): CmsUser {
  const store = ensureStoreInitialized();
  if (store.users.some((u) => u.role === "admin" && u.active)) {
    throw new CmsError(
      "تم إعداد حساب المدير الأول مسبقًا. يرجى تسجيل الدخول.",
      403,
      "ALREADY_BOOTSTRAPPED"
    );
  }

  const requiredEnvToken = process.env.ADMIN_BOOTSTRAP_TOKEN;
  if (requiredEnvToken && input.bootstrapToken !== requiredEnvToken) {
    throw new CmsError(
      "رمز التهيئة الأولية (ADMIN_BOOTSTRAP_TOKEN) غير صحيح.",
      403,
      "INVALID_BOOTSTRAP_TOKEN"
    );
  }

  const name = sanitizeText(input.name, 120);
  const email = sanitizeText(input.email, 160).toLowerCase();
  const password = input.password ?? "";

  if (!name || !email || !email.includes("@")) {
    throw new CmsError("الاسم والبريد الإلكتروني الصحيح مطلوبان.", 400);
  }
  if (password.length < 10) {
    throw new CmsError(
      "يجب ألا تقل كلمة المرور عن 10 أحرف لضمان الأمان.",
      400
    );
  }

  const now = new Date().toISOString();
  const newUser: CmsUserInternal = {
    id: randomUUID(),
    email,
    name,
    role: "admin",
    active: true,
    passwordHash: hashPassword(password),
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now,
  };

  store.users.push(newUser);
  recordAudit(store, {
    action: "bootstrap_first_admin",
    entityType: "user",
    entityId: newUser.id,
    summary: `تم إنشاء حساب المدير الأول (${newUser.email}).`,
    actorEmail: newUser.email,
    actorName: newUser.name,
    actorRole: "admin",
  });
  saveStore(store);
  return stripPassword(newUser);
}

const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export function authenticateCmsUser(input: {
  email: string;
  password: string;
  clientIp?: string;
}): CmsUser {
  const store = ensureStoreInitialized();
  const email = sanitizeText(input.email, 160).toLowerCase();
  const rateKey = `${input.clientIp ?? "local"}:${email}`;
  const now = Date.now();

  const attempt = store.loginAttempts[rateKey];
  if (attempt && attempt.lockedUntil && now < attempt.lockedUntil) {
    const minutesLeft = Math.ceil((attempt.lockedUntil - now) / 60000);
    throw new CmsError(
      `تم إيقاف المحاولات مؤقتًا بسبب تكرار الفشل. يرجى المحاولة بعد ${minutesLeft} دقيقة.`,
      429,
      "RATE_LIMITED"
    );
  }

  const user = store.users.find((u) => u.email === email);
  if (!user || !user.active || !verifyPassword(input.password ?? "", user.passwordHash)) {
    const prev =
      attempt && now - attempt.firstAttemptAt < LOGIN_WINDOW_MS
        ? attempt.count
        : 0;
    const nextCount = prev + 1;
    store.loginAttempts[rateKey] = {
      count: nextCount,
      firstAttemptAt: prev === 0 ? now : attempt.firstAttemptAt,
      lockedUntil:
        nextCount >= MAX_LOGIN_ATTEMPTS ? now + LOCKOUT_DURATION_MS : null,
    };
    saveStore(store);

    if (nextCount >= MAX_LOGIN_ATTEMPTS) {
      throw new CmsError(
        "تم تجاوز الحد المسموح لمحاولات الدخول الفاشلة. تم قفل المحاولة مؤقتًا لمدة 15 دقيقة.",
        429,
        "RATE_LIMITED"
      );
    }
    throw new CmsError(
      "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
      401,
      "INVALID_CREDENTIALS"
    );
  }

  delete store.loginAttempts[rateKey];
  user.lastLoginAt = new Date().toISOString();
  recordAudit(store, {
    action: "user_login",
    entityType: "user",
    entityId: user.id,
    summary: `تسجيل دخول ناجح (${user.email}).`,
    actorEmail: user.email,
    actorName: user.name,
    actorRole: user.role,
  });
  saveStore(store);
  return stripPassword(user);
}

export function requestPasswordReset(emailInput: string): {
  requested: boolean;
  resetTokenForPreview?: string;
} {
  const store = ensureStoreInitialized();
  const email = sanitizeText(emailInput, 160).toLowerCase();
  const user = store.users.find((u) => u.email === email && u.active);
  if (!user) {
    return { requested: true };
  }

  const rawToken = randomBytes(24).toString("hex");
  const tokenHash = hashResetToken(rawToken);
  store.passwordResets.push({
    tokenHash,
    userId: user.id,
    expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes
    usedAt: null,
  });
  recordAudit(store, {
    action: "password_reset_requested",
    entityType: "user",
    entityId: user.id,
    summary: `طلب استعادة كلمة المرور للحساب (${user.email}).`,
    actorEmail: user.email,
    actorName: user.name,
    actorRole: user.role,
  });
  saveStore(store);

  return {
    requested: true,
    ...(process.env.NODE_ENV !== "production" || process.env.SITE_STAGE !== "production"
      ? { resetTokenForPreview: rawToken }
      : {}),
  };
}

export function confirmPasswordReset(input: {
  token: string;
  newPassword: string;
}): void {
  const store = ensureStoreInitialized();
  if (!input.token || (input.newPassword ?? "").length < 10) {
    throw new CmsError(
      "رمز الاستعادة مطلوب ويجب ألا تقل كلمة المرور الجديدة عن 10 أحرف.",
      400
    );
  }
  const tokenHash = hashResetToken(input.token.trim());
  const record = store.passwordResets.find(
    (r) =>
      r.tokenHash === tokenHash &&
      r.usedAt === null &&
      Date.now() < r.expiresAt
  );
  if (!record) {
    throw new CmsError(
      "رمز استعادة كلمة المرور غير صالح أو منتهي الصلاحية.",
      400
    );
  }

  const user = store.users.find((u) => u.id === record.userId && u.active);
  if (!user) {
    throw new CmsError("الحساب غير موجود أو غير نشط.", 404);
  }

  record.usedAt = Date.now();
  user.passwordHash = hashPassword(input.newPassword);
  user.updatedAt = new Date().toISOString();
  recordAudit(store, {
    action: "password_reset_completed",
    entityType: "user",
    entityId: user.id,
    summary: `تم تعيين كلمة مرور جديدة للحساب (${user.email}).`,
    actorEmail: user.email,
    actorName: user.name,
    actorRole: user.role,
  });
  saveStore(store);
}

export function getCmsUserById(userId: string): CmsUser | null {
  const store = ensureStoreInitialized();
  const user = store.users.find((u) => u.id === userId && u.active);
  return user ? stripPassword(user) : null;
}

export function listCmsUsers(): CmsUser[] {
  const store = ensureStoreInitialized();
  return store.users.map(stripPassword);
}

export function createCmsUser(
  actor: CmsUser,
  input: {
    name: string;
    email: string;
    role: CmsRole;
    password: string;
  }
): CmsUser {
  if (actor.role !== "admin") {
    throw new CmsError("إدارة المستخدمين متاحة للمدير فقط.", 403, "FORBIDDEN");
  }
  const store = ensureStoreInitialized();
  const name = sanitizeText(input.name, 120);
  const email = sanitizeText(input.email, 160).toLowerCase();
  const role: CmsRole = input.role === "admin" ? "admin" : "editor";

  if (!name || !email || !email.includes("@")) {
    throw new CmsError("الاسم والبريد الإلكتروني الصحيح مطلوبان.", 400);
  }
  if ((input.password ?? "").length < 10) {
    throw new CmsError("يجب ألا تقل كلمة المرور عن 10 أحرف.", 400);
  }
  if (store.users.some((u) => u.email === email)) {
    throw new CmsError("هذا البريد الإلكتروني مسجل بالفعل.", 409);
  }

  const now = new Date().toISOString();
  const created: CmsUserInternal = {
    id: randomUUID(),
    email,
    name,
    role,
    active: true,
    passwordHash: hashPassword(input.password),
    createdAt: now,
    updatedAt: now,
    lastLoginAt: null,
  };
  store.users.push(created);
  recordAudit(store, {
    action: "create_user",
    entityType: "user",
    entityId: created.id,
    summary: `إضافة مستخدم جديد (${created.email}) بصلاحية «${
      role === "admin" ? "مدير" : "محرر"
    }».`,
    actorEmail: actor.email,
    actorName: actor.name,
    actorRole: actor.role,
  });
  saveStore(store);
  return stripPassword(created);
}

export function updateCmsUser(
  actor: CmsUser,
  userId: string,
  input: {
    name?: string;
    role?: CmsRole;
    active?: boolean;
    password?: string;
  }
): CmsUser {
  if (actor.role !== "admin") {
    throw new CmsError("تعديل المستخدمين متاح للمدير فقط.", 403, "FORBIDDEN");
  }
  const store = ensureStoreInitialized();
  const target = store.users.find((u) => u.id === userId);
  if (!target) {
    throw new CmsError("المستخدم غير موجود.", 404);
  }

  // Prevent removing or deactivating the last active admin
  if (
    target.role === "admin" &&
    (input.role === "editor" || input.active === false)
  ) {
    const activeAdmins = store.users.filter(
      (u) => u.role === "admin" && u.active && u.id !== target.id
    );
    if (activeAdmins.length === 0) {
      throw new CmsError(
        "لا يمكن إلغاء صلاحية المدير الوحيد النشط في النظام.",
        400
      );
    }
  }

  if (input.name !== undefined) {
    const cleaned = sanitizeText(input.name, 120);
    if (!cleaned) throw new CmsError("الاسم لا يمكن أن يكون فارغًا.", 400);
    target.name = cleaned;
  }
  if (input.role === "admin" || input.role === "editor") {
    target.role = input.role;
  }
  if (typeof input.active === "boolean") {
    target.active = input.active;
  }
  if (input.password && input.password.trim().length > 0) {
    if (input.password.length < 10) {
      throw new CmsError("يجب ألا تقل كلمة المرور عن 10 أحرف.", 400);
    }
    target.passwordHash = hashPassword(input.password);
  }
  target.updatedAt = new Date().toISOString();

  recordAudit(store, {
    action: "update_user",
    entityType: "user",
    entityId: target.id,
    summary: `تحديث بيانات/صلاحيات المستخدم (${target.email}) — الدور: ${
      target.role === "admin" ? "مدير" : "محرر"
    }، النشاط: ${target.active ? "نشط" : "موقوف"}.`,
    actorEmail: actor.email,
    actorName: actor.name,
    actorRole: actor.role,
  });
  saveStore(store);
  return stripPassword(target);
}

// ============================================================================
// 2. Dashboard Summary (Real Metrics Only — Zero Fake Analytics/Visitors)
// ============================================================================

export function getDashboardOverview() {
  const store = ensureStoreInitialized();
  const activeArticles = store.articles.filter((a) => !a.deletedAt);

  const publishedCount = activeArticles.filter(
    (a) => a.status === "published"
  ).length;
  const draftCount = activeArticles.filter((a) => a.status === "draft").length;
  const inReviewArticles = activeArticles.filter(
    (a) => a.status === "in_review"
  );
  const archivedCount = activeArticles.filter(
    (a) => a.status === "archived"
  ).length;

  return {
    supabaseConnected: isSupabaseConfigured(),
    counts: {
      publishedArticles: publishedCount,
      draftArticles: draftCount,
      inReviewArticles: inReviewArticles.length,
      archivedArticles: archivedCount,
      mediaCount: store.media.length,
      publishedFaqs: store.faqs.filter(
        (f) => !f.deletedAt && f.status === "published"
      ).length,
      homeHasUnpublishedDraft: Boolean(
        store.pages.home?.hasUnpublishedChanges
      ),
    },
    pendingReviewList: inReviewArticles.map((a) => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      category: a.category,
      updatedAt: a.updatedAt,
      updatedBy: a.updatedBy,
    })),
    recentAuditLogs: store.auditLogs.slice(0, 12),
  };
}

// ============================================================================
// 3. Site Pages Management (Draft vs Published, Section Reorder & Visibility)
// ============================================================================

export function getHomePageRecord(): CmsPageRecord {
  const store = ensureStoreInitialized();
  return structuredClone(store.pages.home);
}

export function getEffectiveHomePageData(options: {
  previewDraft?: boolean;
} = {}): HomePageCmsData {
  const store = ensureStoreInitialized();
  const page = store.pages.home;
  if (options.previewDraft && page.hasUnpublishedChanges) {
    return structuredClone(page.draftData);
  }
  return structuredClone(page.publishedData);
}

function validateAndSanitizeHomePageData(input: HomePageCmsData): HomePageCmsData {
  const primaryHrefCheck = validateSafeUrl(input.hero?.primaryHref, {
    allowInternal: true,
    allowEmpty: false,
    allowMailtoTel: true,
  });
  if (!primaryHrefCheck.valid) {
    throw new CmsError(
      `رابط الزر الأساسي في الافتتاحية غير صالح: ${primaryHrefCheck.error}`,
      400
    );
  }

  const secondaryHrefCheck = validateSafeUrl(input.hero?.secondaryHref, {
    allowInternal: true,
    allowEmpty: false,
  });
  if (!secondaryHrefCheck.valid) {
    throw new CmsError(
      `رابط الزر الثانوي في الافتتاحية غير صالح: ${secondaryHrefCheck.error}`,
      400
    );
  }

  const finalHrefCheck = validateSafeUrl(input.finalInquiry?.primaryHref, {
    allowInternal: true,
    allowEmpty: false,
    allowMailtoTel: true,
  });
  if (!finalHrefCheck.valid) {
    throw new CmsError(
      `رابط زر قسم التواصل غير صالح: ${finalHrefCheck.error}`,
      400
    );
  }

  const headlineLine1 = sanitizeText(input.hero?.headlineLine1, 140);
  const headlineLine2 = sanitizeText(input.hero?.headlineLine2, 140);
  if (!headlineLine1 || !headlineLine2) {
    throw new CmsError("عنوان الافتتاحية الرئيسي والسطر المميز مطلوبان.", 400);
  }

  // Ensure navigation labels are never empty (prevent breaking essential navigation)
  const nav = input.headerFooter;
  if (
    !sanitizeText(nav?.aboutLabel, 40) ||
    !sanitizeText(nav?.specialtyLabel, 40) ||
    !sanitizeText(nav?.journalLabel, 40) ||
    !sanitizeText(nav?.contactLabel, 40) ||
    !sanitizeText(nav?.primaryInquiryCta, 50)
  ) {
    throw new CmsError(
      "لا يمكن ترك تسميات روابط التنقل الأساسية في الهيدر والفوتر فارغة.",
      400
    );
  }

  return structuredClone(input);
}

export function saveHomePageDraft(
  actor: CmsUser,
  input: {
    draftData: HomePageCmsData;
    expectedVersion: number;
  }
): CmsPageRecord {
  const store = ensureStoreInitialized();
  const page = store.pages.home;

  if (
    typeof input.expectedVersion === "number" &&
    input.expectedVersion !== page.version
  ) {
    throw new CmsError(
      "تعارض في التعديلات: تم تحديث الصفحة بواسطة مستخدم آخر. يرجى تحديث الصفحة ومراجعة التغييرات قبل الحفظ.",
      409,
      "VERSION_CONFLICT"
    );
  }

  const sanitized = validateAndSanitizeHomePageData(input.draftData);
  const now = new Date().toISOString();

  page.draftData = sanitized;
  page.hasUnpublishedChanges = true;
  page.version += 1;
  page.updatedAt = now;
  page.updatedBy = actor.name;

  recordRevision(store, {
    entityType: "page",
    entityId: "home",
    version: page.version,
    snapshot: structuredClone(page.draftData),
    summary: "حفظ مسودة تعديلات الصفحة الرئيسية",
    actorEmail: actor.email,
    actorName: actor.name,
  });

  recordAudit(store, {
    action: "save_page_draft",
    entityType: "page",
    entityId: "home",
    summary: "حفظ مسودة تعديلات الصفحة الرئيسية (دون تغيير الموقع العام).",
    actorEmail: actor.email,
    actorName: actor.name,
    actorRole: actor.role,
  });

  syncMediaPublicVisibility(store);
  saveStore(store);
  return structuredClone(page);
}

export function publishHomePageChanges(
  actor: CmsUser,
  input: {
    draftData?: HomePageCmsData;
    expectedVersion: number;
  }
): CmsPageRecord {
  if (actor.role !== "admin") {
    throw new CmsError(
      "نشر تعديلات الصفحات للعامة متاح للمدير فقط. يمكنك حفظ التعديل كمسودة ومعاينته.",
      403,
      "FORBIDDEN"
    );
  }

  const store = ensureStoreInitialized();
  const page = store.pages.home;

  if (
    typeof input.expectedVersion === "number" &&
    input.expectedVersion !== page.version
  ) {
    throw new CmsError(
      "تعارض في التعديلات: تم تحديث الصفحة بواسطة مستخدم آخر قبل النشر.",
      409,
      "VERSION_CONFLICT"
    );
  }

  const nextData = input.draftData
    ? validateAndSanitizeHomePageData(input.draftData)
    : validateAndSanitizeHomePageData(page.draftData);
  const now = new Date().toISOString();

  page.draftData = structuredClone(nextData);
  page.publishedData = structuredClone(nextData);
  page.hasUnpublishedChanges = false;
  page.version += 1;
  page.updatedAt = now;
  page.updatedBy = actor.name;
  page.publishedAt = now;
  page.publishedBy = actor.name;

  recordRevision(store, {
    entityType: "page",
    entityId: "home",
    version: page.version,
    snapshot: structuredClone(page.publishedData),
    summary: "نشر تعديلات الصفحة الرئيسية للعامة",
    actorEmail: actor.email,
    actorName: actor.name,
  });

  recordAudit(store, {
    action: "publish_page",
    entityType: "page",
    entityId: "home",
    summary: "نشر تعديلات الصفحة الرئيسية وتحديث الموقع العام.",
    actorEmail: actor.email,
    actorName: actor.name,
    actorRole: actor.role,
  });

  syncMediaPublicVisibility(store);
  saveStore(store);
  return structuredClone(page);
}

// ============================================================================
// 4. Articles Management (Lifecycle, Medical Approval, Slug Redirects, Soft Delete)
// ============================================================================

export function listCmsArticles(options: {
  includeDeleted?: boolean;
  status?: string;
  category?: string;
  query?: string;
} = {}): CmsArticle[] {
  const store = ensureStoreInitialized();
  let list = store.articles.filter((a) =>
    options.includeDeleted ? true : !a.deletedAt
  );

  if (options.status && options.status !== "all") {
    list = list.filter((a) => a.status === options.status);
  }
  if (
    options.category &&
    options.category !== "all" &&
    options.category !== "الكل"
  ) {
    list = list.filter((a) => a.category === options.category);
  }
  if (options.query && options.query.trim().length > 0) {
    const q = options.query.trim().toLowerCase();
    list = list.filter((a) =>
      `${a.title} ${a.slug} ${a.excerpt} ${a.category}`
        .toLowerCase()
        .includes(q)
    );
  }
  return structuredClone(list);
}

export function getCmsArticleById(id: string): CmsArticle | null {
  const store = ensureStoreInitialized();
  const found = store.articles.find((a) => a.id === id);
  return found ? structuredClone(found) : null;
}

export function resolveArticleBySlugWithRedirect(slug: string): {
  article: CmsArticle | null;
  redirectToSlug: string | null;
} {
  const store = ensureStoreInitialized();
  const direct = store.articles.find(
    (a) => a.slug === slug && !a.deletedAt
  );
  if (direct) {
    return { article: structuredClone(direct), redirectToSlug: null };
  }

  const redirect = store.slugRedirects.find((r) => r.oldSlug === slug);
  if (redirect) {
    const target = store.articles.find(
      (a) => a.id === redirect.articleId && !a.deletedAt
    );
    if (target) {
      return { article: structuredClone(target), redirectToSlug: target.slug };
    }
  }

  return { article: null, redirectToSlug: null };
}

export function saveCmsArticle(
  actor: CmsUser,
  input: {
    id?: string;
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    featured?: boolean;
    image: { src: string; alt: string; focalX?: number; focalY?: number };
    body: CmsArticle["body"];
    author?: string | null;
    reviewedBy?: string | null;
    reviewedAt?: string | null;
    status?: CmsArticleStatus;
    approveMedicalContent?: boolean;
    seo?: { title?: string | null; description?: string | null; ogImage?: string | null };
    sources?: CmsArticle["sources"];
    disclaimer?: string;
    expectedVersion?: number;
  }
): CmsArticle {
  const store = ensureStoreInitialized();

  const title = sanitizeText(input.title, 220);
  const slug = sanitizeSlug(input.slug || input.title);
  const excerpt = sanitizeText(input.excerpt, 600);
  const category = sanitizeText(input.category, 80) || "العين والجفون";

  if (!title || !slug || !excerpt) {
    throw new CmsError("عنوان المقال والرابط المختصر (slug) والمقدمة حقول مطلوبة.", 400);
  }

  // Editors cannot publish or archive or approve medical content
  const requestedStatus: CmsArticleStatus = input.status ?? "draft";
  if (
    actor.role !== "admin" &&
    (requestedStatus === "published" ||
      requestedStatus === "archived" ||
      input.approveMedicalContent)
  ) {
    throw new CmsError(
      "صلاحية المحرر تسمح بحفظ المسودات وإرسالها للمراجعة فقط. النشر والأرشفة واعتماد المحتوى الطبي متاحة للمدير فقط.",
      403,
      "FORBIDDEN"
    );
  }

  // Check duplicate slug across all articles
  const duplicate = store.articles.find(
    (a) => a.slug === slug && a.id !== input.id
  );
  if (duplicate) {
    throw new CmsError(
      `الرابط المختصر (${slug}) مستخدم بالفعل في مقال آخر. يرجى اختيار رابط مختصر فريد.`,
      409,
      "DUPLICATE_SLUG"
    );
  }

  // Validate source URLs
  const cleanedSources = (input.sources ?? []).map((src) => {
    const check = validateSafeUrl(src.url, { allowInternal: false, allowEmpty: false });
    if (!check.valid || !check.normalized) {
      throw new CmsError(
        `رابط المصدر (${src.title || src.url}) غير صالح: ${check.error}`,
        400
      );
    }
    return {
      title: sanitizeText(src.title, 200),
      institution: sanitizeText(src.institution, 160),
      url: check.normalized,
    };
  });

  // Clean body sections and validate any section links
  const cleanedBody = (input.body ?? [])
    .map((sec, idx) => {
      if (sec.linkUrl) {
        const linkCheck = validateSafeUrl(sec.linkUrl, {
          allowInternal: true,
          allowEmpty: true,
        });
        if (!linkCheck.valid) {
          throw new CmsError(
            `الرابط داخل القسم (${sec.heading}) غير صالح: ${linkCheck.error}`,
            400
          );
        }
      }
      return {
        id: sanitizeSlug(sec.id || `section-${idx + 1}`) || `section-${idx + 1}`,
        heading: sanitizeText(sec.heading, 200),
        paragraphs: (sec.paragraphs ?? [])
          .map((p) => sanitizeText(p, 5000))
          .filter(Boolean),
        ...(sec.bullets && sec.bullets.length > 0
          ? {
              bullets: sec.bullets
                .map((b) => sanitizeText(b, 1000))
                .filter(Boolean),
            }
          : {}),
        ...(sec.linkLabel ? { linkLabel: sanitizeText(sec.linkLabel, 120) } : {}),
        ...(sec.linkUrl ? { linkUrl: sec.linkUrl.trim() } : {}),
        ...(sec.imageSrc ? { imageSrc: sec.imageSrc.trim() } : {}),
        ...(sec.imageAlt ? { imageAlt: sanitizeText(sec.imageAlt, 220) } : {}),
      };
    })
    .filter((s) => s.heading && s.paragraphs.length > 0);

  if (cleanedBody.length === 0) {
    throw new CmsError(
      "يجب أن يحتوي المقال على قسم واحد على الأقل بعنوان وفقرة نصية.",
      400
    );
  }

  const now = new Date().toISOString();
  const existing = input.id
    ? store.articles.find((a) => a.id === input.id)
    : undefined;

  if (input.id && !existing) {
    throw new CmsError("المقال المطلوب تعديله غير موجود.", 404);
  }

  if (
    existing &&
    typeof input.expectedVersion === "number" &&
    input.expectedVersion !== existing.version
  ) {
    throw new CmsError(
      "تعارض في التعديلات: تم تعديل هذا المقال بواسطة مستخدم آخر أثناء عملك عليه.",
      409,
      "VERSION_CONFLICT"
    );
  }

  // Handle medical approval & publishing requirements:
  // Never automatically assign Dr. Reham as reviewer unless explicitly entered;
  // Record who approved and when!
  const author = sanitizeNullableText(input.author, 140);
  const reviewedBy = sanitizeNullableText(input.reviewedBy, 160);
  let approvedBy = existing?.approvedBy ?? null;
  let approvedAt = existing?.approvedAt ?? null;
  let reviewedAt = existing?.reviewedAt ?? null;

  if (input.approveMedicalContent && actor.role === "admin") {
    approvedBy = `${actor.name} (${actor.email})`;
    approvedAt = now;
    reviewedAt = now.slice(0, 10);
  }

  if (requestedStatus === "published") {
    if (!approvedBy || !approvedAt) {
      // If admin publishes directly with approveMedicalContent or existing approval
      if (actor.role === "admin" && input.approveMedicalContent !== false) {
        approvedBy = `${actor.name} (${actor.email})`;
        approvedAt = now;
        reviewedAt = reviewedAt ?? now.slice(0, 10);
      } else {
        throw new CmsError(
          "يتطلب نشر المقال اعتماد المحتوى الطبي صراحةً من قِبل المدير.",
          400
        );
      }
    }
  }

  // If featured is set to true, unset featured on other articles if needed
  if (input.featured) {
    for (const art of store.articles) {
      if (art.id !== existing?.id) {
        art.featured = false;
      }
    }
  }

  if (existing) {
    const previousSlug = existing.slug;
    const wasPublished = existing.status === "published" || Boolean(existing.publishedAt);

    existing.title = title;
    existing.slug = slug;
    existing.excerpt = excerpt;
    existing.category = category;
    existing.featured = Boolean(input.featured);
    existing.image = {
      src: input.image?.src?.trim() || existing.image.src,
      alt: sanitizeText(input.image?.alt || title, 220),
      focalX: Number(input.image?.focalX ?? existing.image.focalX ?? 50),
      focalY: Number(input.image?.focalY ?? existing.image.focalY ?? 50),
    };
    existing.body = cleanedBody;
    existing.author = author;
    existing.reviewedBy = reviewedBy;
    existing.reviewedAt = reviewedAt;
    existing.approvedBy = approvedBy;
    existing.approvedAt = approvedAt;
    existing.status = requestedStatus;
    if (requestedStatus === "published" && !existing.publishedAt) {
      existing.publishedAt = now.slice(0, 10);
    }
    existing.updatedAt = now;
    existing.updatedBy = actor.name;
    existing.seo = {
      title: sanitizeNullableText(input.seo?.title, 200) ?? title,
      description: sanitizeNullableText(input.seo?.description, 320) ?? excerpt,
      ogImage: input.seo?.ogImage?.trim() || existing.image.src,
    };
    existing.sources = cleanedSources;
    if (input.disclaimer) {
      existing.disclaimer = sanitizeText(input.disclaimer, 500);
    }
    existing.version += 1;

    // If a published article's slug changed, record a permanent redirect from oldSlug -> newSlug
    if (wasPublished && previousSlug !== slug) {
      store.slugRedirects = store.slugRedirects.filter(
        (r) => r.oldSlug !== previousSlug && r.oldSlug !== slug
      );
      store.slugRedirects.push({
        oldSlug: previousSlug,
        newSlug: slug,
        articleId: existing.id,
        createdAt: now,
      });
      // Update chained redirects
      for (const r of store.slugRedirects) {
        if (r.articleId === existing.id) {
          r.newSlug = slug;
        }
      }
    }

    const actionLabel =
      requestedStatus === "published"
        ? "نشر/تحديث مقال منشور"
        : requestedStatus === "archived"
        ? "أرشفة مقال"
        : requestedStatus === "in_review"
        ? "إرسال مقال للمراجعة"
        : "حفظ مسودة مقال";

    recordRevision(store, {
      entityType: "article",
      entityId: existing.id,
      version: existing.version,
      snapshot: structuredClone(existing),
      summary: `${actionLabel}: ${existing.title}`,
      actorEmail: actor.email,
      actorName: actor.name,
    });

    recordAudit(store, {
      action: `article_${requestedStatus}`,
      entityType: "article",
      entityId: existing.id,
      summary: `${actionLabel} «${existing.title}» (${existing.slug}).`,
      actorEmail: actor.email,
      actorName: actor.name,
      actorRole: actor.role,
    });

    syncMediaPublicVisibility(store);
    saveStore(store);
    return structuredClone(existing);
  }

  // Create new article
  const newArticle: CmsArticle = {
    id: `article-${Date.now()}-${slug.slice(0, 32)}`,
    slug,
    title,
    excerpt,
    category,
    featured: Boolean(input.featured),
    image: {
      src: input.image?.src?.trim() || "/media/article-hooded-vs-deepset.jpg",
      alt: sanitizeText(input.image?.alt || title, 220),
      focalX: Number(input.image?.focalX ?? 50),
      focalY: Number(input.image?.focalY ?? 50),
    },
    body: cleanedBody,
    author,
    reviewedBy,
    reviewedAt,
    approvedBy,
    approvedAt,
    publishedAt: requestedStatus === "published" ? now.slice(0, 10) : null,
    updatedAt: now,
    updatedBy: actor.name,
    status: requestedStatus,
    seo: {
      title: sanitizeNullableText(input.seo?.title, 200) ?? title,
      description: sanitizeNullableText(input.seo?.description, 320) ?? excerpt,
      ogImage:
        input.seo?.ogImage?.trim() ||
        input.image?.src?.trim() ||
        "/media/article-hooded-vs-deepset.jpg",
    },
    sources: cleanedSources,
    disclaimer:
      sanitizeText(input.disclaimer, 500) ||
      "هذه المادة مخصصة للتثقيف الصحي العام فقط، ولا تمثل تشخيصًا شخصيًا أو توصية علاجية ولا تُغني عن الفحص الطبي المباشر.",
    version: 1,
    deletedAt: null,
  };

  store.articles.unshift(newArticle);

  recordRevision(store, {
    entityType: "article",
    entityId: newArticle.id,
    version: 1,
    snapshot: structuredClone(newArticle),
    summary: `إنشاء مقال جديد: ${newArticle.title}`,
    actorEmail: actor.email,
    actorName: actor.name,
  });

  recordAudit(store, {
    action: "create_article",
    entityType: "article",
    entityId: newArticle.id,
    summary: `إنشاء مقال جديد «${newArticle.title}» بحالة (${newArticle.status}).`,
    actorEmail: actor.email,
    actorName: actor.name,
    actorRole: actor.role,
  });

  syncMediaPublicVisibility(store);
  saveStore(store);
  return structuredClone(newArticle);
}

export function softDeleteOrRestoreArticle(
  actor: CmsUser,
  articleId: string,
  restore = false
): CmsArticle {
  if (actor.role !== "admin") {
    throw new CmsError("حذف أو استعادة المقالات متاح للمدير فقط.", 403, "FORBIDDEN");
  }
  const store = ensureStoreInitialized();
  const article = store.articles.find((a) => a.id === articleId);
  if (!article) {
    throw new CmsError("المقال غير موجود.", 404);
  }

  article.deletedAt = restore ? null : new Date().toISOString();
  if (!restore && article.status === "published") {
    article.status = "archived";
  }
  article.version += 1;
  article.updatedAt = new Date().toISOString();
  article.updatedBy = actor.name;

  recordAudit(store, {
    action: restore ? "restore_deleted_article" : "soft_delete_article",
    entityType: "article",
    entityId: article.id,
    summary: `${restore ? "استعادة المقال المحذوف" : "نقل المقال إلى سلة المحذوفات"}: «${article.title}».`,
    actorEmail: actor.email,
    actorName: actor.name,
    actorRole: actor.role,
  });

  syncMediaPublicVisibility(store);
  saveStore(store);
  return structuredClone(article);
}

// ============================================================================
// 5. Revisions History & Restore
// ============================================================================

export function listEntityRevisions(
  entityType: CmsRevision["entityType"],
  entityId: string
): CmsRevision[] {
  const store = ensureStoreInitialized();
  return store.revisions
    .filter((r) => r.entityType === entityType && r.entityId === entityId)
    .slice(0, 50);
}

export function restoreRevisionById(
  actor: CmsUser,
  revisionId: string
): { entityType: string; entityId: string; restoredVersion: number } {
  if (actor.role !== "admin") {
    throw new CmsError("استرجاع النسخ السابقة متاح للمدير فقط.", 403, "FORBIDDEN");
  }
  const store = ensureStoreInitialized();
  const rev = store.revisions.find((r) => r.id === revisionId);
  if (!rev) {
    throw new CmsError("النسخة المطلوبة غير موجودة.", 404);
  }

  const now = new Date().toISOString();

  if (rev.entityType === "article") {
    const target = store.articles.find((a) => a.id === rev.entityId);
    if (!target) {
      throw new CmsError("المقال المرتبط بهذه النسخة غير موجود.", 404);
    }
    const snap = structuredClone(rev.snapshot) as CmsArticle;
    const nextVersion = target.version + 1;
    Object.assign(target, snap, {
      version: nextVersion,
      updatedAt: now,
      updatedBy: actor.name,
      deletedAt: null,
    });

    recordRevision(store, {
      entityType: "article",
      entityId: target.id,
      version: nextVersion,
      snapshot: structuredClone(target),
      summary: `استرجاع النسخة رقم ${rev.version}`,
      actorEmail: actor.email,
      actorName: actor.name,
    });

    recordAudit(store, {
      action: "restore_revision",
      entityType: "article",
      entityId: target.id,
      summary: `استرجاع النسخة رقم (${rev.version}) للمقال «${target.title}».`,
      actorEmail: actor.email,
      actorName: actor.name,
      actorRole: actor.role,
    });

    syncMediaPublicVisibility(store);
    saveStore(store);
    return {
      entityType: "article",
      entityId: target.id,
      restoredVersion: nextVersion,
    };
  }

  if (rev.entityType === "page" && rev.entityId === "home") {
    const page = store.pages.home;
    const snap = structuredClone(rev.snapshot) as HomePageCmsData;
    page.draftData = snap;
    page.hasUnpublishedChanges = true;
    page.version += 1;
    page.updatedAt = now;
    page.updatedBy = actor.name;

    recordRevision(store, {
      entityType: "page",
      entityId: "home",
      version: page.version,
      snapshot: structuredClone(page.draftData),
      summary: `استرجاع النسخة رقم ${rev.version} كمسودة للصفحة الرئيسية`,
      actorEmail: actor.email,
      actorName: actor.name,
    });

    recordAudit(store, {
      action: "restore_revision",
      entityType: "page",
      entityId: "home",
      summary: `استرجاع النسخة رقم (${rev.version}) للصفحة الرئيسية.`,
      actorEmail: actor.email,
      actorName: actor.name,
      actorRole: actor.role,
    });

    saveStore(store);
    return {
      entityType: "page",
      entityId: "home",
      restoredVersion: page.version,
    };
  }

  throw new CmsError("نوع النسخة غير مدعوم للاسترجاع المباشر.", 400);
}

// ============================================================================
// 6. Media Library (Magic-Byte Verified Upload, Focal Point, Usage Protection)
// ============================================================================

export function listCmsMedia(): CmsMediaItem[] {
  const store = ensureStoreInitialized();
  syncMediaPublicVisibility(store);
  return store.media.map((item) => ({
    ...structuredClone(item),
    usedIn: computeMediaUsages(store, item.url),
  }));
}

export function getCmsMediaById(id: string): CmsMediaItem | null {
  const store = ensureStoreInitialized();
  syncMediaPublicVisibility(store);
  const item = store.media.find((m) => m.id === id);
  if (!item) return null;
  return {
    ...structuredClone(item),
    usedIn: computeMediaUsages(store, item.url),
  };
}

export function uploadCmsMedia(
  actor: CmsUser,
  input: {
    buffer: Uint8Array;
    originalFilename: string;
    name?: string;
    alt?: string;
    focalX?: number;
    focalY?: number;
  }
): CmsMediaItem {
  const inspection = inspectUploadedImageBuffer(
    input.buffer,
    input.originalFilename
  );
  if (!inspection.valid || !inspection.mimeType || !inspection.extension) {
    throw new CmsError(
      inspection.error ?? "ملف الصورة غير صالح.",
      400,
      "INVALID_MEDIA_FILE"
    );
  }

  const store = ensureStoreInitialized();
  const id = `media-${Date.now()}-${randomBytes(4).toString("hex")}`;
  const storedFilename = `${id}.${inspection.extension}`;
  const storageFilePath = path.join(getUploadsDir(), storedFilename);

  fs.writeFileSync(storageFilePath, Buffer.from(input.buffer));

  const now = new Date().toISOString();
  const cleanName =
    sanitizeText(input.name, 140) ||
    sanitizeText(input.originalFilename.replace(/\.[^.]+$/, ""), 140) ||
    storedFilename;
  const cleanAlt = sanitizeText(input.alt, 220) || cleanName;

  const mediaItem: CmsMediaItem = {
    id,
    name: cleanName,
    filename: storedFilename,
    mimeType: inspection.mimeType,
    sizeBytes: input.buffer.byteLength,
    width: inspection.width ?? null,
    height: inspection.height ?? null,
    alt: cleanAlt,
    focalX: Math.min(100, Math.max(0, Number(input.focalX ?? 50))),
    focalY: Math.min(100, Math.max(0, Number(input.focalY ?? 50))),
    storagePath: storageFilePath,
    url: `/api/media/${id}`,
    isPublic: false, // Draft/unattached media is NEVER public by default
    uploadedBy: actor.name,
    createdAt: now,
    updatedAt: now,
  };

  store.media.unshift(mediaItem);
  recordAudit(store, {
    action: "upload_media",
    entityType: "media",
    entityId: mediaItem.id,
    summary: `رفع صورة جديدة «${mediaItem.name}» (${mediaItem.mimeType}، ${Math.round(
      mediaItem.sizeBytes / 1024
    )} ك.ب).`,
    actorEmail: actor.email,
    actorName: actor.name,
    actorRole: actor.role,
  });

  saveStore(store);
  return {
    ...structuredClone(mediaItem),
    usedIn: [],
  };
}

export function updateCmsMediaMetadata(
  actor: CmsUser,
  mediaId: string,
  input: {
    name?: string;
    alt?: string;
    focalX?: number;
    focalY?: number;
  }
): CmsMediaItem {
  const store = ensureStoreInitialized();
  const item = store.media.find((m) => m.id === mediaId);
  if (!item) {
    throw new CmsError("الصورة غير موجودة.", 404);
  }

  if (input.name !== undefined) {
    const cleaned = sanitizeText(input.name, 140);
    if (!cleaned) throw new CmsError("اسم الصورة مطلوب.", 400);
    item.name = cleaned;
  }
  if (input.alt !== undefined) {
    item.alt = sanitizeText(input.alt, 220);
  }
  if (input.focalX !== undefined) {
    item.focalX = Math.min(100, Math.max(0, Number(input.focalX)));
  }
  if (input.focalY !== undefined) {
    item.focalY = Math.min(100, Math.max(0, Number(input.focalY)));
  }
  item.updatedAt = new Date().toISOString();

  // Propagate focal point & alt updates to matching image references
  for (const art of store.articles) {
    if (art.image?.src === item.url) {
      art.image.focalX = item.focalX;
      art.image.focalY = item.focalY;
      if (input.alt !== undefined && item.alt) {
        art.image.alt = item.alt;
      }
    }
  }

  recordAudit(store, {
    action: "update_media",
    entityType: "media",
    entityId: item.id,
    summary: `تحديث بيانات/نقطة تركيز الصورة «${item.name}» (${item.focalX}%، ${item.focalY}%).`,
    actorEmail: actor.email,
    actorName: actor.name,
    actorRole: actor.role,
  });

  saveStore(store);
  return {
    ...structuredClone(item),
    usedIn: computeMediaUsages(store, item.url),
  };
}

export function replaceCmsMediaUsages(
  actor: CmsUser,
  oldMediaId: string,
  newMediaId: string
): { replacedCount: number; oldMedia: CmsMediaItem; newMedia: CmsMediaItem } {
  const store = ensureStoreInitialized();
  const oldItem = store.media.find((m) => m.id === oldMediaId);
  const newItem = store.media.find((m) => m.id === newMediaId);
  if (!oldItem || !newItem) {
    throw new CmsError("إحدى الصورتين غير موجودة.", 404);
  }

  let replacedCount = 0;
  const oldUrl = oldItem.url;
  const newUrl = newItem.url;

  for (const art of store.articles) {
    if (art.image?.src === oldUrl) {
      art.image.src = newUrl;
      art.image.alt = newItem.alt || art.image.alt;
      art.image.focalX = newItem.focalX;
      art.image.focalY = newItem.focalY;
      replacedCount++;
    }
    if (art.seo?.ogImage === oldUrl) {
      art.seo.ogImage = newUrl;
    }
    for (const sec of art.body) {
      if (sec.imageSrc === oldUrl) {
        sec.imageSrc = newUrl;
        replacedCount++;
      }
    }
  }

  const replaceInHome = (data: HomePageCmsData) => {
    if (data.hero?.image?.src === oldUrl) {
      data.hero.image.src = newUrl;
      data.hero.image.alt = newItem.alt || data.hero.image.alt;
      data.hero.image.focalX = newItem.focalX;
      data.hero.image.focalY = newItem.focalY;
      replacedCount++;
    }
    if (data.specialtySection?.image?.src === oldUrl) {
      data.specialtySection.image.src = newUrl;
      data.specialtySection.image.alt =
        newItem.alt || data.specialtySection.image.alt;
      data.specialtySection.image.focalX = newItem.focalX;
      data.specialtySection.image.focalY = newItem.focalY;
      replacedCount++;
    }
    if (data.contentStyleSection?.instagramCard?.image?.src === oldUrl) {
      data.contentStyleSection.instagramCard.image.src = newUrl;
      replacedCount++;
    }
  };
  if (store.pages.home) {
    replaceInHome(store.pages.home.draftData);
    replaceInHome(store.pages.home.publishedData);
  }

  if (store.settings.defaultOgImage === oldUrl) {
    store.settings.defaultOgImage = newUrl;
    replacedCount++;
  }

  syncMediaPublicVisibility(store);
  recordAudit(store, {
    action: "replace_media",
    entityType: "media",
    entityId: oldItem.id,
    summary: `استبدال الصورة «${oldItem.name}» بالصورة «${newItem.name}» في كافة المواضع المرتبطة.`,
    actorEmail: actor.email,
    actorName: actor.name,
    actorRole: actor.role,
  });
  saveStore(store);

  return {
    replacedCount,
    oldMedia: {
      ...structuredClone(oldItem),
      usedIn: computeMediaUsages(store, oldItem.url),
    },
    newMedia: {
      ...structuredClone(newItem),
      usedIn: computeMediaUsages(store, newItem.url),
    },
  };
}

export function deleteCmsMedia(actor: CmsUser, mediaId: string): void {
  const store = ensureStoreInitialized();
  const index = store.media.findIndex((m) => m.id === mediaId);
  if (index === -1) {
    throw new CmsError("الصورة غير موجودة.", 404);
  }

  const item = store.media[index];
  const usages = computeMediaUsages(store, item.url);
  if (usages.length > 0) {
    const places = usages.map((u) => u.label).join("، ");
    throw new CmsError(
      `لا يمكن حذف هذه الصورة لأنها مستخدمة حاليًا في: (${places}). يرجى استبدالها أو إزالة ارتباطها أولًا.`,
      409,
      "MEDIA_IN_USE"
    );
  }

  if (
    item.storagePath &&
    !item.storagePath.startsWith("/media/") &&
    fs.existsSync(item.storagePath)
  ) {
    try {
      fs.unlinkSync(item.storagePath);
    } catch {
      // ignore fs cleanup error
    }
  }

  store.media.splice(index, 1);
  recordAudit(store, {
    action: "delete_media",
    entityType: "media",
    entityId: item.id,
    summary: `حذف الصورة غير المستخدمة «${item.name}».`,
    actorEmail: actor.email,
    actorName: actor.name,
    actorRole: actor.role,
  });
  saveStore(store);
}

// ============================================================================
// 7. FAQs, Clinics & Site Settings
// ============================================================================

export function listCmsFaqs(includeDeleted = false): CmsFaqItem[] {
  const store = ensureStoreInitialized();
  return store.faqs
    .filter((f) => (includeDeleted ? true : !f.deletedAt))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((f) => structuredClone(f));
}

export function saveCmsFaq(
  actor: CmsUser,
  input: {
    id?: string;
    question: string;
    answer: string;
    category?: CmsFaqItem["category"];
    sortOrder?: number;
    status?: "draft" | "published";
    expectedVersion?: number;
  }
): CmsFaqItem {
  const store = ensureStoreInitialized();
  const question = sanitizeText(input.question, 300);
  const answer = sanitizeText(input.answer, 3000);
  const status = input.status === "published" ? "published" : "draft";

  if (!question) {
    throw new CmsError("نص السؤال مطلوب.", 400);
  }
  if (status === "published" && !answer) {
    throw new CmsError("لا يمكن نشر سؤال بدون إجابة مكتملة.", 400);
  }
  if (status === "published" && actor.role !== "admin") {
    throw new CmsError("نشر الأسئلة للعامة متاح للمدير فقط.", 403, "FORBIDDEN");
  }

  const now = new Date().toISOString();
  if (input.id) {
    const existing = store.faqs.find((f) => f.id === input.id);
    if (!existing) throw new CmsError("السؤال غير موجود.", 404);
    if (
      typeof input.expectedVersion === "number" &&
      input.expectedVersion !== existing.version
    ) {
      throw new CmsError(
        "تعارض في التعديلات: تم تعديل هذا السؤال بواسطة مستخدم آخر.",
        409,
        "VERSION_CONFLICT"
      );
    }
    existing.question = question;
    existing.answer = answer;
    if (input.category) existing.category = input.category;
    if (typeof input.sortOrder === "number") existing.sortOrder = input.sortOrder;
    existing.status = status;
    if (status === "published" && !existing.reviewedBy) {
      existing.reviewedBy = actor.name;
    }
    existing.version += 1;
    existing.updatedAt = now;
    existing.updatedBy = actor.name;

    recordAudit(store, {
      action: "update_faq",
      entityType: "faq",
      entityId: existing.id,
      summary: `تحديث السؤال «${existing.question}» (${existing.status}).`,
      actorEmail: actor.email,
      actorName: actor.name,
      actorRole: actor.role,
    });
    saveStore(store);
    return structuredClone(existing);
  }

  const created: CmsFaqItem = {
    id: `faq-${Date.now()}-${randomBytes(3).toString("hex")}`,
    question,
    answer,
    category: input.category ?? "consultation",
    sortOrder:
      typeof input.sortOrder === "number"
        ? input.sortOrder
        : store.faqs.length + 1,
    status,
    reviewedBy: status === "published" ? actor.name : null,
    version: 1,
    deletedAt: null,
    updatedAt: now,
    updatedBy: actor.name,
  };
  store.faqs.push(created);
  recordAudit(store, {
    action: "create_faq",
    entityType: "faq",
    entityId: created.id,
    summary: `إضافة سؤال شائع جديد «${created.question}».`,
    actorEmail: actor.email,
    actorName: actor.name,
    actorRole: actor.role,
  });
  saveStore(store);
  return structuredClone(created);
}

export function deleteCmsFaq(actor: CmsUser, id: string): void {
  if (actor.role !== "admin") {
    throw new CmsError("حذف الأسئلة متاح للمدير فقط.", 403, "FORBIDDEN");
  }
  const store = ensureStoreInitialized();
  const target = store.faqs.find((f) => f.id === id);
  if (!target) throw new CmsError("السؤال غير موجود.", 404);
  target.deletedAt = new Date().toISOString();
  target.status = "draft";
  target.version += 1;
  recordAudit(store, {
    action: "delete_faq",
    entityType: "faq",
    entityId: target.id,
    summary: `حذف السؤال «${target.question}».`,
    actorEmail: actor.email,
    actorName: actor.name,
    actorRole: actor.role,
  });
  saveStore(store);
}

export function listCmsClinics(): CmsClinicItem[] {
  const store = ensureStoreInitialized();
  return store.clinics
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((c) => structuredClone(c));
}

export function saveCmsClinic(
  actor: CmsUser,
  input: {
    id?: string;
    name: string;
    address?: string | null;
    mapsUrl?: string | null;
    hours?: string | null;
    bookingUrl?: string | null;
    whatsappE164?: string | null;
    phone?: string | null;
    affiliationVerified?: boolean;
    enabled?: boolean;
    sortOrder?: number;
    expectedVersion?: number;
  }
): CmsClinicItem {
  if (actor.role !== "admin" && (input.enabled || input.affiliationVerified)) {
    throw new CmsError(
      "نشر وتفعيل العيادات على الموقع متاح للمدير فقط.",
      403,
      "FORBIDDEN"
    );
  }
  const store = ensureStoreInitialized();
  const name = sanitizeText(input.name, 160);
  if (!name) throw new CmsError("اسم العيادة أو المركز الطبي مطلوب.", 400);

  const mapsCheck = validateSafeUrl(input.mapsUrl, {
    allowInternal: false,
    allowEmpty: true,
  });
  if (!mapsCheck.valid) {
    throw new CmsError(`رابط الخريطة غير صالح: ${mapsCheck.error}`, 400);
  }

  const bookingCheck = validateSafeUrl(input.bookingUrl, {
    allowInternal: false,
    allowEmpty: true,
  });
  if (!bookingCheck.valid) {
    throw new CmsError(`رابط الحجز غير صالح: ${bookingCheck.error}`, 400);
  }

  const now = new Date().toISOString();
  if (input.id) {
    const existing = store.clinics.find((c) => c.id === input.id);
    if (!existing) throw new CmsError("العيادة غير موجودة.", 404);
    if (
      typeof input.expectedVersion === "number" &&
      input.expectedVersion !== existing.version
    ) {
      throw new CmsError(
        "تعارض في التعديلات: تم تحديث بيانات العيادة بواسطة مستخدم آخر.",
        409,
        "VERSION_CONFLICT"
      );
    }

    existing.name = name;
    existing.address = sanitizeNullableText(input.address, 250);
    existing.mapsUrl = mapsCheck.normalized;
    existing.hours = sanitizeNullableText(input.hours, 200);
    existing.bookingUrl = bookingCheck.normalized;
    existing.whatsappE164 = sanitizeNullableText(input.whatsappE164, 30);
    existing.phone = sanitizeNullableText(input.phone, 30);
    if (typeof input.affiliationVerified === "boolean") {
      existing.affiliationVerified = input.affiliationVerified;
    }
    if (typeof input.enabled === "boolean") {
      existing.enabled = input.enabled;
    }
    if (typeof input.sortOrder === "number") {
      existing.sortOrder = input.sortOrder;
    }
    existing.version += 1;
    existing.updatedAt = now;
    existing.updatedBy = actor.name;

    recordAudit(store, {
      action: "update_clinic",
      entityType: "clinic",
      entityId: existing.id,
      summary: `تحديث بيانات العيادة «${existing.name}» (الظهور: ${
        existing.enabled && existing.affiliationVerified ? "مفعل" : "مخفي"
      }).`,
      actorEmail: actor.email,
      actorName: actor.name,
      actorRole: actor.role,
    });
    saveStore(store);
    return structuredClone(existing);
  }

  const created: CmsClinicItem = {
    id: sanitizeSlug(name) || `clinic-${Date.now()}`,
    name,
    source: `أضيفت عبر لوحة الإدارة بواسطة ${actor.name}`,
    affiliationVerified: Boolean(input.affiliationVerified),
    enabled: Boolean(input.enabled),
    address: sanitizeNullableText(input.address, 250),
    mapsUrl: mapsCheck.normalized,
    bookingUrl: bookingCheck.normalized,
    whatsappE164: sanitizeNullableText(input.whatsappE164, 30),
    phone: sanitizeNullableText(input.phone, 30),
    hours: sanitizeNullableText(input.hours, 200),
    sortOrder:
      typeof input.sortOrder === "number"
        ? input.sortOrder
        : store.clinics.length + 1,
    version: 1,
    updatedAt: now,
    updatedBy: actor.name,
  };
  store.clinics.push(created);
  recordAudit(store, {
    action: "create_clinic",
    entityType: "clinic",
    entityId: created.id,
    summary: `إضافة عيادة جديدة «${created.name}».`,
    actorEmail: actor.email,
    actorName: actor.name,
    actorRole: actor.role,
  });
  saveStore(store);
  return structuredClone(created);
}

export function deleteCmsClinic(actor: CmsUser, id: string): void {
  if (actor.role !== "admin") {
    throw new CmsError("حذف العيادات متاح للمدير فقط.", 403, "FORBIDDEN");
  }
  const store = ensureStoreInitialized();
  const idx = store.clinics.findIndex((c) => c.id === id);
  if (idx === -1) throw new CmsError("العيادة غير موجودة.", 404);
  const [removed] = store.clinics.splice(idx, 1);
  recordAudit(store, {
    action: "delete_clinic",
    entityType: "clinic",
    entityId: removed.id,
    summary: `حذف العيادة «${removed.name}».`,
    actorEmail: actor.email,
    actorName: actor.name,
    actorRole: actor.role,
  });
  saveStore(store);
}

export function getCmsSiteSettings(): CmsSiteSettings {
  const store = ensureStoreInitialized();
  return structuredClone(store.settings);
}

export function updateCmsSiteSettings(
  actor: CmsUser,
  input: Partial<CmsSiteSettings> & { expectedVersion?: number }
): CmsSiteSettings {
  if (actor.role !== "admin") {
    throw new CmsError("تعديل إعدادات الموقع العامة متاح للمدير فقط.", 403, "FORBIDDEN");
  }
  const store = ensureStoreInitialized();
  const current = store.settings;

  if (
    typeof input.expectedVersion === "number" &&
    input.expectedVersion !== current.version
  ) {
    throw new CmsError(
      "تعارض في التعديلات: تم تحديث الإعدادات بواسطة مستخدم آخر.",
      409,
      "VERSION_CONFLICT"
    );
  }

  if (input.instagramUrl !== undefined) {
    const check = validateSafeUrl(input.instagramUrl, {
      allowInternal: false,
      allowEmpty: false,
    });
    if (!check.valid || !check.normalized) {
      throw new CmsError(`رابط إنستجرام غير صالح: ${check.error}`, 400);
    }
    current.instagramUrl = check.normalized;
  }

  if (input.whatsappUrl !== undefined) {
    const check = validateSafeUrl(input.whatsappUrl, {
      allowInternal: false,
      allowEmpty: true,
    });
    if (!check.valid) {
      throw new CmsError(`رابط واتساب غير صالح: ${check.error}`, 400);
    }
    current.whatsappUrl = check.normalized;
  }

  if (input.domain !== undefined) {
    const check = validateSafeUrl(input.domain, {
      allowInternal: false,
      allowEmpty: true,
    });
    if (!check.valid) {
      throw new CmsError(`نطاق الموقع (Domain) غير صالح: ${check.error}`, 400);
    }
    current.domain = check.normalized;
  }

  if (input.siteName !== undefined) {
    const val = sanitizeText(input.siteName, 140);
    if (!val) throw new CmsError("اسم الموقع مطلوب.", 400);
    current.siteName = val;
  }
  if (input.siteDescription !== undefined) {
    current.siteDescription = sanitizeText(input.siteDescription, 400);
  }
  if (input.specialtyTitle !== undefined) {
    current.specialtyTitle = sanitizeText(input.specialtyTitle, 160);
  }
  if (input.city !== undefined) {
    current.city = sanitizeText(input.city, 80);
  }
  if (input.logoPath !== undefined && input.logoPath.trim()) {
    current.logoPath = input.logoPath.trim();
  }
  if (input.faviconPath !== undefined && input.faviconPath.trim()) {
    current.faviconPath = input.faviconPath.trim();
  }
  if (input.defaultOgImage !== undefined && input.defaultOgImage.trim()) {
    current.defaultOgImage = input.defaultOgImage.trim();
  }
  if (input.seoTitleTemplate !== undefined) {
    current.seoTitleTemplate = sanitizeText(input.seoTitleTemplate, 160);
  }
  if (input.seoDefaultDescription !== undefined) {
    current.seoDefaultDescription = sanitizeText(
      input.seoDefaultDescription,
      400
    );
  }
  if (input.phone !== undefined) {
    current.phone = sanitizeNullableText(input.phone, 40);
  }
  if (input.email !== undefined) {
    current.email = sanitizeNullableText(input.email, 140);
  }
  if (input.defaultInquiryDestination !== undefined) {
    current.defaultInquiryDestination = input.defaultInquiryDestination;
  }
  if (typeof input.bookingEnabled === "boolean") {
    current.bookingEnabled = input.bookingEnabled;
  }
  if (typeof input.enablePreviewDrafts === "boolean") {
    current.enablePreviewDrafts = input.enablePreviewDrafts;
  }
  if (input.legalEntity !== undefined) {
    current.legalEntity = sanitizeNullableText(input.legalEntity, 200);
  }
  if (input.privacyContact !== undefined) {
    current.privacyContact = sanitizeNullableText(input.privacyContact, 200);
  }
  if (Array.isArray(input.privacySections)) {
    current.privacySections = input.privacySections
      .map((sec, idx) => ({
        id: sanitizeSlug(sec.id || `sec-${idx + 1}`) || `sec-${idx + 1}`,
        heading: sanitizeText(sec.heading, 180),
        paragraphs: (sec.paragraphs ?? [])
          .map((p) => sanitizeText(p, 3000))
          .filter(Boolean),
      }))
      .filter((s) => s.heading && s.paragraphs.length > 0);
  }

  current.version += 1;
  current.updatedAt = new Date().toISOString();
  current.updatedBy = actor.name;

  recordRevision(store, {
    entityType: "settings",
    entityId: "default",
    version: current.version,
    snapshot: structuredClone(current),
    summary: "تحديث إعدادات الموقع والخصوصية والتواصل",
    actorEmail: actor.email,
    actorName: actor.name,
  });

  recordAudit(store, {
    action: "update_settings",
    entityType: "settings",
    entityId: "default",
    summary: "تحديث إعدادات الموقع وبيانات التواصل والخصوصية.",
    actorEmail: actor.email,
    actorName: actor.name,
    actorRole: actor.role,
  });

  syncMediaPublicVisibility(store);
  saveStore(store);
  return structuredClone(current);
}
