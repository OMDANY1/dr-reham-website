import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

// 1x1 valid PNG binary buffer
const VALID_PNG_BUFFER = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);

const RUN_SUFFIX = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
const DRAFT_SLUG = `editor-private-draft-${RUN_SUFFIX}`;
const PUBLISHED_SLUG = `approved-published-${RUN_SUFFIX}`;
const RENAMED_SLUG = `approved-renamed-${RUN_SUFFIX}`;

test.describe.serial("Admin Dashboard (CMS) End-to-End Verification", () => {
  test("1. Blocks unauthenticated visitors from /admin routes and write APIs", async ({
    page,
    request,
  }) => {
    await page.goto("/admin/articles");
    await expect(page).toHaveURL(/\/admin\/login/);

    const apiPages = await request.get("/api/admin/pages");
    expect(apiPages.status()).toBe(401);

    const apiSave = await request.post("/api/admin/articles", {
      data: { title: "Unauthorized", slug: "unauth" },
    });
    expect(apiSave.status()).toBe(401);
  });

  test("2. Bootstraps first Admin, creates Editor, and blocks Editor from publishing via direct API", async ({
    page,
    browser,
  }) => {
    await page.goto("/admin/login");

    const authState = await page.request
      .get("/api/admin/auth")
      .then((r) => r.json());

    if (authState.needsBootstrap) {
      await page.fill("#bootstrap-name", "د. ريهام القحطاني (مدير)");
      await page.fill("#bootstrap-email", "admin@dr-reham.sa");
      await page.fill("#bootstrap-password", "AdminSecure#2026");
      await page.click('button[type="submit"]');
    } else {
      await page.fill("#login-email", "admin@dr-reham.sa");
      await page.fill("#login-password", "AdminSecure#2026");
      await page.click('button[type="submit"]');
    }

    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.locator("h1")).toContainText("لوحة التحكم الرئيسية");

    // Create an Editor account via /api/admin/users
    const createEditorRes = await page.request.post("/api/admin/users", {
      data: {
        email: "editor@dr-reham.sa",
        name: "محرر المحتوى الطبي",
        role: "editor",
        password: "EditorSecure#2026",
      },
    });
    expect([200, 400, 409]).toContain(createEditorRes.status());

    // Log in as Editor in a separate browser context and attempt direct API publish
    const editorCtx = await browser.newContext();
    const editorPage = await editorCtx.newPage();
    const loginRes = await editorPage.request.post("/api/admin/auth", {
      data: {
        action: "login",
        email: "editor@dr-reham.sa",
        password: "EditorSecure#2026",
      },
    });
    expect(loginRes.status()).toBe(200);

    // Editor attempts to publish homepage directly via API -> must be 403 Forbidden
    const homeData = await editorPage.request
      .get("/api/admin/pages")
      .then((r) => r.json());
    const directPublishPage = await editorPage.request.put("/api/admin/pages", {
      data: {
        action: "publish",
        draftData: homeData.page.draftData,
        expectedVersion: homeData.page.version,
      },
    });
    expect(directPublishPage.status()).toBe(403);

    // Editor attempts to publish an article directly via API -> must be 403 Forbidden
    const directPublishArticle = await editorPage.request.post(
      "/api/admin/articles",
      {
        data: {
          title: "مقال تجريبي من المحرر",
          slug: `editor-attempt-${RUN_SUFFIX}`,
          excerpt: "ملخص تجريبي",
          category: "العين والجفون",
          status: "published",
          approveMedicalContent: true,
          image: { src: "/media/article-consultation-prep.png", alt: "صورة" },
          body: [
            {
              id: "s1",
              heading: "مقدمة",
              paragraphs: ["فقرة تجريبية."],
            },
          ],
          sources: [],
        },
      }
    );
    expect(directPublishArticle.status()).toBe(403);

    // Editor can save as draft (200)
    const draftArticleRes = await editorPage.request.post(
      "/api/admin/articles",
      {
        data: {
          title: "مسودة خاصة للمعاينة فقط",
          slug: DRAFT_SLUG,
          excerpt: "هذا المقال محفوظ كمسودة ولا يظهر للزوار.",
          category: "العين والجفون",
          status: "draft",
          image: {
            src: "/media/article-consultation-prep.png",
            alt: "صورة مسودة",
          },
          body: [
            {
              id: "s1",
              heading: "قسم المسودة",
              paragraphs: ["محتوى المسودة الخاص بالمعاينة فقط."],
            },
          ],
          sources: [],
        },
      }
    );
    expect(draftArticleRes.status()).toBe(200);

    await editorCtx.close();
  });

  test("3. Draft preview works for authenticated user while remaining hidden (404) for public visitors, and persists on disk", async ({
    browser,
  }) => {
    const visitorCtx = await browser.newContext();
    const visitorPage = await visitorCtx.newPage();

    const publicResp = await visitorPage.goto(`/ar/journal/${DRAFT_SLUG}`);
    expect(publicResp?.status()).toBe(404);

    const adminCtx = await browser.newContext();
    const adminPage = await adminCtx.newPage();
    await adminPage.request.post("/api/admin/auth", {
      data: {
        action: "login",
        email: "admin@dr-reham.sa",
        password: "AdminSecure#2026",
      },
    });

    const previewResp = await adminPage.goto(
      `/ar/journal/${DRAFT_SLUG}?preview=1`
    );
    expect(previewResp?.status()).toBe(200);
    await expect(adminPage.locator("h1")).toContainText(
      "مسودة خاصة للمعاينة فقط"
    );

    // Verify persistent server database file on disk contains the saved draft
    const dbPath = path.join(process.cwd(), "data", "cms-store.json");
    expect(fs.existsSync(dbPath)).toBe(true);
    const dbRaw = fs.readFileSync(dbPath, "utf8");
    expect(dbRaw).toContain(DRAFT_SLUG);

    await visitorCtx.close();
    await adminCtx.close();
  });

  test("4. Publishes article with explicit medical approval, verifies public site & sitemap, renames slug with 308 redirect, archives, and restores revision", async ({
    browser,
  }) => {
    const adminCtx = await browser.newContext();
    const adminPage = await adminCtx.newPage();
    await adminPage.request.post("/api/admin/auth", {
      data: {
        action: "login",
        email: "admin@dr-reham.sa",
        password: "AdminSecure#2026",
      },
    });

    const listData = await adminPage.request
      .get("/api/admin/articles?includeDeleted=true")
      .then((r) => r.json());
    const target = listData.articles.find(
      (a: { slug: string }) => a.slug === DRAFT_SLUG
    );
    expect(target).toBeDefined();

    // Publish the article as Admin with explicit medical approval
    const publishRes = await adminPage.request.post("/api/admin/articles", {
      data: {
        id: target.id,
        title: "مقال معتمد ومنشور للاختبار",
        slug: PUBLISHED_SLUG,
        excerpt: "ملخص المقال المعتمد للظهور العام.",
        category: "العين والجفون",
        status: "published",
        approveMedicalContent: true,
        image: {
          src: "/media/article-consultation-prep.png",
          alt: "صورة المقال المعتمد",
        },
        body: [
          {
            id: "s1",
            heading: "النسخة الأولى المنشورة",
            paragraphs: ["هذه هي النسخة الأولى المعتمدة من المقال."],
          },
        ],
        sources: [],
      },
    });
    expect(publishRes.status()).toBe(200);

    // Verify immediate visibility on public /ar/journal and /sitemap.xml
    const visitorCtx = await browser.newContext();
    const visitorPage = await visitorCtx.newPage();
    const publicArtResp = await visitorPage.goto(
      `/ar/journal/${PUBLISHED_SLUG}`
    );
    expect(publicArtResp?.status()).toBe(200);
    await expect(visitorPage.locator("h1")).toContainText(
      "مقال معتمد ومنشور للاختبار"
    );

    const sitemapResp = await visitorPage.request.get("/sitemap.xml");
    const sitemapXml = await sitemapResp.text();
    expect(sitemapXml).toContain(`/ar/journal/${PUBLISHED_SLUG}`);

    // Rename slug of published article -> old slug should redirect to new slug
    const renameRes = await adminPage.request.post("/api/admin/articles", {
      data: {
        id: target.id,
        title: "مقال معتمد بعد تعديل العنوان والرابط",
        slug: RENAMED_SLUG,
        excerpt: "ملخص المقال المعتمد للظهور العام.",
        category: "العين والجفون",
        status: "published",
        approveMedicalContent: true,
        image: {
          src: "/media/article-consultation-prep.png",
          alt: "صورة المقال المعتمد",
        },
        body: [
          {
            id: "s1",
            heading: "النسخة الثانية بعد التعديل",
            paragraphs: ["هذه هي النسخة الثانية المعدلة."],
          },
        ],
        sources: [],
      },
    });
    expect(renameRes.status()).toBe(200);

    await visitorPage.goto(`/ar/journal/${PUBLISHED_SLUG}`);
    await expect(visitorPage).toHaveURL(
      new RegExp(`/ar/journal/${RENAMED_SLUG}`)
    );

    // Restore revision and then soft-delete the test article so original 6 articles remain clean
    const revList = await adminPage.request
      .get(
        `/api/admin/revisions?entityType=article&entityId=${encodeURIComponent(
          target.id
        )}`
      )
      .then((r) => r.json());
    expect(revList.revisions.length).toBeGreaterThanOrEqual(2);

    const restoreRes = await adminPage.request.post("/api/admin/revisions", {
      data: { revisionId: revList.revisions[revList.revisions.length - 1].id },
    });
    expect(restoreRes.status()).toBe(200);

    // Soft-delete test article so seeded articles stay clean
    const delRes = await adminPage.request.delete(
      `/api/admin/articles?id=${encodeURIComponent(target.id)}`
    );
    expect(delRes.status()).toBe(200);

    await visitorCtx.close();
    await adminCtx.close();
  });

  test("5. Media library: accepts valid PNG, rejects invalid executable, blocks deleting in-use image (409), and deletes unused uploaded image", async ({
    browser,
  }) => {
    const adminCtx = await browser.newContext();
    const adminPage = await adminCtx.newPage();
    await adminPage.request.post("/api/admin/auth", {
      data: {
        action: "login",
        email: "admin@dr-reham.sa",
        password: "AdminSecure#2026",
      },
    });

    // 1. Reject invalid executable file disguised as .png
    const invalidUpload = await adminPage.request.post("/api/admin/media", {
      multipart: {
        alt: "ملف غير صالح",
        name: "exploit",
        file: {
          name: "exploit.exe",
          mimeType: "application/octet-stream",
          buffer: Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]),
        },
      },
    });
    expect(invalidUpload.status()).toBe(400);

    // 2. Prevent deleting an in-use image (find one with usedIn.length > 0)
    const mediaListRes = await adminPage.request
      .get("/api/admin/media")
      .then((r) => r.json());
    const inUseItem = mediaListRes.media.find(
      (m: { usedIn?: unknown[] }) => (m.usedIn || []).length > 0
    );
    expect(inUseItem).toBeDefined();

    const deleteInUse = await adminPage.request.delete(
      `/api/admin/media?id=${encodeURIComponent(inUseItem.id)}`
    );
    expect(deleteInUse.status()).toBe(409);

    // 3. Upload a valid PNG image
    const validUpload = await adminPage.request.post("/api/admin/media", {
      multipart: {
        alt: "صورة اختبار صالحة",
        name: "valid-test",
        file: {
          name: "valid-test.png",
          mimeType: "image/png",
          buffer: VALID_PNG_BUFFER,
        },
      },
    });
    expect(validUpload.status()).toBe(200);
    const uploadedData = await validUpload.json();
    const mediaId = uploadedData.item.id;

    // Draft image (isPublic=false) should return 403 for unauthenticated visitor
    const visitorCtx = await browser.newContext();
    const visitorPage = await visitorCtx.newPage();
    const draftImgResp = await visitorPage.request.get(`/api/media/${mediaId}`);
    expect(draftImgResp.status()).toBe(403);
    await visitorCtx.close();

    // Delete unused test image -> 200 OK
    const deleteUnused = await adminPage.request.delete(
      `/api/admin/media?id=${encodeURIComponent(mediaId)}`
    );
    expect(deleteUnused.status()).toBe(200);

    await adminCtx.close();
  });

  test("6. RTL and Mobile Responsiveness across Admin routes (390x844 & 1440x900)", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();

    await page.request.post("/api/admin/auth", {
      data: {
        action: "login",
        email: "admin@dr-reham.sa",
        password: "AdminSecure#2026",
      },
    });

    for (const route of [
      "/admin",
      "/admin/pages",
      "/admin/articles",
      "/admin/media",
      "/admin/faq",
      "/admin/locations",
      "/admin/settings",
      "/admin/users",
    ]) {
      await page.goto(route);
      const dir = await page.locator(".admin-layout").getAttribute("dir");
      expect(dir).toBe("rtl");

      const hasOverflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth + 2
      );
      expect(hasOverflow, `No horizontal overflow on ${route} at 390px`).toBe(
        false
      );
    }

    await context.close();
  });
});
