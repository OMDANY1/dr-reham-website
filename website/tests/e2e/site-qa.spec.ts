import { test, expect } from "@playwright/test";

test.describe("Dr. Reham Website — «للنظرة تفاصيل» Radical Redesign QA", () => {
  test("Root redirects to /ar, renders Panoramic Opening and 6 chapters, and separates drafts from public view", async ({
    page,
  }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(/\/ar$/);

    const html = page.locator("html");
    await expect(html).toHaveAttribute("lang", "ar");
    await expect(html).toHaveAttribute("dir", "rtl");

    // 1. Panoramic Opening («للنظرة تفاصيل.»)
    const h1 = page.locator("h1");
    await expect(h1).toContainText("للنظرة");
    await expect(h1).toContainText("تفاصيل.");

    const panoImg = page.locator(".panoramic-opening__image");
    await expect(panoImg).toBeVisible();

    // 2. Chapters 2 to 6 present in order, and old «تعرّف على أسلوب المحتوى» is removed
    await expect(
      page.getByRole("heading", { name: "تخصص يبدأ من التفاصيل" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "د. ريهام القحطاني" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "اقرأ النظرة عن قرب" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "قبل زيارتك" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "تواصل للاستفسار" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "تعرّف على أسلوب المحتوى" })
    ).toHaveCount(0);

    // 3. Public view does NOT display «مسودة للمراجعة» badge or claim «الحساب الرسمي الموثق»
    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toContain("مسودة للمراجعة");
    expect(bodyText).not.toContain("الحساب الرسمي الموثق");
    expect(bodyText).toContain("حساب الدكتورة على إنستجرام");

    // 4. Draft slug returns 404 on public unauthenticated request
    const draftRes = await page.goto("/ar/journal/hooded-vs-deep-set-eyelid");
    expect(draftRes?.status()).toBe(404);
  });

  test("Journal index (/ar/journal) «عن العين وتفاصيلها» works in Protected Preview with 6 drafts, search, and filters", async ({
    page,
    viewport,
  }) => {
    await page.setExtraHTTPHeaders({
      "x-qa-preview-drafts": "1",
    });
    await page.goto("/ar/journal");

    await expect(
      page.getByRole("heading", { level: 1, name: "عن العين وتفاصيلها" })
    ).toBeVisible();

    if ((viewport?.width ?? 1440) >= 960) {
      const activeNav = page
        .locator(".site-header__nav")
        .getByRole("link", { name: "المقالات" });
      await expect(activeNav).toHaveAttribute("aria-current", "page");
    }

    // Featured opening article (1) + 5 editorial rows = 6 total without duplication
    const featuredCard = page.getByTestId("featured-article-card");
    await expect(featuredCard).toBeVisible();
    await expect(featuredCard).toContainText(
      "الجفن المبطن والعين الغائرة: فهم المصطلحات والفرق بينهما"
    );

    const rowCards = page.getByTestId("article-grid-card");
    await expect(rowCards).toHaveCount(5);

    const rowsText = await page.getByTestId("articles-grid").innerText();
    expect(rowsText).not.toContain(
      "الجفن المبطن والعين الغائرة: فهم المصطلحات والفرق بينهما"
    );

    // Filter by category «قبل الاستشارة» -> 3 articles
    await page.getByRole("button", { name: "قبل الاستشارة" }).click();
    await expect(rowCards).toHaveCount(3);

    // Combine with search query
    const searchInput = page.getByTestId("journal-search-input");
    await searchInput.fill("أسئلة يمكنك طرحها");
    await expect(rowCards).toHaveCount(1);
    await expect(rowCards.first()).toContainText(
      "أسئلة يمكنك طرحها أثناء الاستشارة"
    );

    // Empty search results state + reset
    await searchInput.fill("عبارة غير موجودة إطلاقا");
    const emptyState = page.getByTestId("journal-empty-results");
    await expect(emptyState).toBeVisible();
    await emptyState
      .getByRole("button", { name: "إعادة ضبط البحث والتصنيف" })
      .click();

    await expect(featuredCard).toBeVisible();
    await expect(rowCards).toHaveCount(5);
  });

  test("Inner article page (/ar/journal/[slug]) renders in Protected Preview with TOC, reading time, sources, share bar, and related rows", async ({
    page,
  }) => {
    await page.setExtraHTTPHeaders({
      "x-qa-preview-drafts": "1",
    });
    await page.goto("/ar/journal/hooded-vs-deep-set-eyelid");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "الجفن المبطن والعين الغائرة: فهم المصطلحات والفرق بينهما",
      })
    ).toBeVisible();

    await expect(page.getByTestId("draft-preview-badge").first()).toContainText(
      "مسودة للمراجعة"
    );
    await expect(page.getByTestId("article-reading-time")).toContainText(
      "دقائق للقراءة"
    );

    await expect(page.getByTestId("article-toc")).toBeVisible();
    const sourcesSection = page.getByTestId("article-sources");
    await expect(sourcesSection).toBeVisible();
    await expect(sourcesSection).toContainText(
      "American Academy of Ophthalmology"
    );

    const copyBtn = page.getByTestId("copy-link-button");
    await copyBtn.click();
    await expect(copyBtn).toContainText("تم نسخ الرابط");

    const relatedSection = page.getByTestId("related-articles-section");
    await expect(relatedSection).toBeVisible();

    // Sitemap must NOT leak draft articles
    const sitemapRes = await page.goto("/sitemap.xml");
    const sitemapXml = await sitemapRes?.text();
    expect(sitemapXml).not.toContain("hooded-vs-deep-set-eyelid");
  });

  test("All routes load with 200, no broken images, and no horizontal overflow", async ({
    page,
  }) => {
    const publicRoutes = [
      "/ar",
      "/ar/about",
      "/ar/journal",
      "/ar/faq",
      "/ar/book",
      "/ar/privacy",
    ];

    for (const route of publicRoutes) {
      const res = await page.goto(route);
      expect(res?.status(), `Route ${route} should return 200`).toBe(200);

      const hasOverflow = await page.evaluate(() => {
        return (
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth
        );
      });
      expect(
        hasOverflow,
        `Route ${route} should have no horizontal overflow`
      ).toBe(false);

      const brokenImages = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll("img"));
        return imgs
          .filter((img) => !img.complete || img.naturalWidth === 0)
          .map((img) => img.getAttribute("src"));
      });
      expect(
        brokenImages,
        `Route ${route} should have no broken images`
      ).toEqual([]);
    }
  });

  test("Mobile navigation dialog supports open, Escape, and includes Articles tab", async ({
    page,
    viewport,
  }) => {
    if ((viewport?.width ?? 1440) >= 960) {
      test.skip();
    }

    await page.goto("/ar");
    const trigger = page.locator(".mobile-menu-trigger").first();
    await expect(trigger).toBeVisible();
    await trigger.click();

    const dialog = page.locator("#mobile-navigation-dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("link", { name: "المقالات" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("Contact/Book page uses «حساب الدكتورة على إنستجرام» and supports verified clinic fixtures", async ({
    page,
  }) => {
    await page.goto("/ar/book");
    await expect(page.locator("h1")).toContainText("تواصل للاستفسار");
    await expect(
      page.getByRole("link", {
        name: /الانتقال إلى حساب الدكتورة على إنستجرام/,
      })
    ).toHaveAttribute("href", "https://www.instagram.com/dr.rehamdq/");

    await page.setExtraHTTPHeaders({
      "x-qa-booking-fixture": "verified-multi",
    });
    await page.goto("/ar/book");
    await expect(page.locator("h1")).toContainText("التواصل وحجز المواعيد");
    const radioOptions = page.locator(".clinic-radio-input");
    await expect(radioOptions).toHaveCount(2);
  });

  test("Capture visual QA screenshots of Home and Journal on Desktop and Mobile", async ({
    page,
    viewport,
  }) => {
    const isMobile = (viewport?.width ?? 1440) < 768;
    const suffix = isMobile ? "390" : "1440";
    const artifactDir =
      "C:/Users/elwady/.gemini/antigravity/brain/1dfd746d-d8b6-480f-84bd-173216ab6bc6";

    await page.goto("/ar", { waitUntil: "networkidle" });
    await page.screenshot({
      path: `${artifactDir}/gaze-opening-${suffix}.png`,
      fullPage: false,
    });
    await page.screenshot({
      path: `${artifactDir}/gaze-home-full-${suffix}.png`,
      fullPage: true,
    });

    await page.setExtraHTTPHeaders({
      "x-qa-preview-drafts": "1",
    });
    await page.goto("/ar/journal", { waitUntil: "networkidle" });
    await page.screenshot({
      path: `${artifactDir}/gaze-journal-full-${suffix}.png`,
      fullPage: true,
    });

    await page.goto("/ar/journal/hooded-vs-deep-set-eyelid", {
      waitUntil: "networkidle",
    });
    await page.screenshot({
      path: `${artifactDir}/gaze-article-detail-${suffix}.png`,
      fullPage: false,
    });
  });
});
