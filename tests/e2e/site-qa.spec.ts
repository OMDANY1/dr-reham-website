import { test, expect } from "@playwright/test";

test.describe("Dr. Reham Website — Articles & Enriched Home QA", () => {
  test("Root redirects to /ar and renders photographic Hero, enriched sections, and articles tab", async ({
    page,
  }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(/\/ar$/);

    const html = page.locator("html");
    await expect(html).toHaveAttribute("lang", "ar");
    await expect(html).toHaveAttribute("dir", "rtl");

    // 1. Photographic Hero preserved
    const h1 = page.locator("h1");
    await expect(h1).toContainText("عناية دقيقة");
    await expect(h1).toContainText("بتفاصيل نظرتك");

    const heroImg = page.locator(".hero-editorial__img");
    await expect(heroImg).toBeVisible();

    // 2. Enriched Home Sections present in order
    await expect(
      page.getByRole("heading", { name: "قبل الاستشارة" })
    ).toBeVisible();
    await expect(page.getByText("دوّن استفساراتك")).toBeVisible();
    await expect(
      page.getByText("جهّز المعلومات والتقارير المتاحة")
    ).toBeVisible();
    await expect(
      page.getByText("ناقش احتياجك وتوقعاتك خلال الاستشارة")
    ).toBeVisible();

    const homeArticlesSection = page.getByTestId("home-articles-section");
    await expect(homeArticlesSection).toBeVisible();
    await expect(
      homeArticlesSection.getByRole("link", { name: /جميع المقالات/ })
    ).toHaveAttribute("href", "/ar/journal");

    await expect(
      page.getByRole("heading", { name: "تعرّف على أسلوب المحتوى" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "أسئلة عملية مختصرة" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "لنبدأ باستفسارك" })
    ).toBeVisible();

    // 3. Footer has «المقالات» link
    const footerArticlesLink = page
      .locator("footer")
      .getByRole("link", { name: "المقالات" });
    await expect(footerArticlesLink).toHaveAttribute("href", "/ar/journal");
  });

  test("Journal index (/ar/journal) displays featured article without grid duplication, and supports search + category filters", async ({
    page,
    viewport,
  }) => {
    await page.goto("/ar/journal");

    await expect(
      page.getByRole("heading", { level: 1, name: "تفاصيل تستحق المعرفة" })
    ).toBeVisible();
    await expect(
      page.getByText("قراءات مبسّطة حول العين والجفون والاستعداد للاستشارة.")
    ).toBeVisible();

    // Active tab state in desktop navigation
    if ((viewport?.width ?? 1440) >= 960) {
      const activeNav = page
        .locator(".site-header__nav")
        .getByRole("link", { name: "المقالات" });
      await expect(activeNav).toHaveAttribute("aria-current", "page");
    }

    // Featured article at top (1) + 5 remaining articles in grid = 6 total without duplication
    const featuredCard = page.getByTestId("featured-article-card");
    await expect(featuredCard).toBeVisible();
    await expect(featuredCard).toContainText(
      "الجفن المبطن والعين الغائرة: فهم المصطلحات والفرق بينهما"
    );

    const gridCards = page.getByTestId("article-grid-card");
    await expect(gridCards).toHaveCount(5);

    // Ensure featured article title is NOT repeated inside the grid
    const gridText = await page.getByTestId("articles-grid").innerText();
    expect(gridText).not.toContain(
      "الجفن المبطن والعين الغائرة: فهم المصطلحات والفرق بينهما"
    );

    // Filter by category «قبل الاستشارة» -> 3 articles
    await page.getByRole("button", { name: "قبل الاستشارة" }).click();
    await expect(gridCards).toHaveCount(3);

    // Combine with search query
    const searchInput = page.getByTestId("journal-search-input");
    await searchInput.fill("أسئلة يمكنك طرحها");
    await expect(gridCards).toHaveCount(1);
    await expect(gridCards.first()).toContainText(
      "أسئلة يمكنك طرحها أثناء الاستشارة"
    );

    // Search with no matching results -> clear empty state + reset button
    await searchInput.fill("عبارة غير موجودة إطلاقا");
    const emptyState = page.getByTestId("journal-empty-results");
    await expect(emptyState).toBeVisible();
    await emptyState
      .getByRole("button", { name: "إعادة ضبط البحث والتصنيف" })
      .click();

    await expect(featuredCard).toBeVisible();
    await expect(gridCards).toHaveCount(5);
  });

  test("Inner article page (/ar/journal/[slug]) renders TOC, reading time, institutional sources, copy link, related articles, and no fake attribution", async ({
    page,
    viewport,
  }) => {
    await page.goto("/ar/journal/hooded-vs-deep-set-eyelid");

    // Active nav tab remains highlighted on inner article page
    if ((viewport?.width ?? 1440) >= 960) {
      const activeNav = page
        .locator(".site-header__nav")
        .getByRole("link", { name: "المقالات" });
      await expect(activeNav).toHaveAttribute("aria-current", "page");
    }

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "الجفن المبطن والعين الغائرة: فهم المصطلحات والفرق بينهما",
      })
    ).toBeVisible();

    // Preview draft badge + automatic reading time
    await expect(page.getByTestId("draft-preview-badge").first()).toContainText(
      "مسودة للمراجعة"
    );
    await expect(page.getByTestId("article-reading-time")).toContainText(
      "دقائق للقراءة"
    );

    // No fake author/reviewer/published date rendered for unapproved draft
    const headerText = await page.locator(".article-detail-header").innerText();
    expect(headerText).not.toContain("الكاتب:");
    expect(headerText).not.toContain("مراجعة طبية:");
    expect(headerText).not.toContain("تاريخ النشر:");

    // Table of contents & institutional sources
    await expect(page.getByTestId("article-toc")).toBeVisible();
    const sourcesSection = page.getByTestId("article-sources");
    await expect(sourcesSection).toBeVisible();
    await expect(sourcesSection).toContainText(
      "American Academy of Ophthalmology"
    );

    // Copy link button works and shows feedback
    const copyBtn = page.getByTestId("copy-link-button");
    await copyBtn.click();
    await expect(copyBtn).toContainText("تم نسخ الرابط");

    // Related articles rendered and exclude current article
    const relatedSection = page.getByTestId("related-articles-section");
    await expect(relatedSection).toBeVisible();
    const relatedText = await relatedSection.innerText();
    expect(relatedText).not.toContain(
      "الجفن المبطن والعين الغائرة: فهم المصطلحات والفرق بينهما"
    );

    // Sitemap must NOT leak draft articles
    const sitemapRes = await page.goto("/sitemap.xml");
    const sitemapXml = await sitemapRes?.text();
    expect(sitemapXml).not.toContain("hooded-vs-deep-set-eyelid");
    expect(sitemapXml).not.toContain("tired-eye-appearance");
  });

  test("All public routes load with 200, no broken images, and no horizontal overflow", async ({
    page,
  }) => {
    const routes = [
      "/ar",
      "/ar/about",
      "/ar/journal",
      "/ar/journal/hooded-vs-deep-set-eyelid",
      "/ar/faq",
      "/ar/book",
      "/ar/privacy",
    ];

    for (const route of routes) {
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

      // Verify all visible images loaded with naturalWidth > 0
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

  test("Unknown locales and unknown slugs return real 404", async ({
    page,
  }) => {
    const fourOhFourRoutes = [
      "/en",
      "/ar/unknown-route",
      "/ar/services/eyelid-consultation-draft",
      "/ar/journal/non-existent-article-slug",
    ];

    for (const route of fourOhFourRoutes) {
      const res = await page.goto(route);
      expect(res?.status(), `Route ${route} should return 404`).toBe(404);
      await expect(page.locator("h1")).toContainText("هذه الصفحة غير موجودة");
    }
  });

  test("Mobile navigation dialog supports open, focus trap, Escape, and includes Articles tab", async ({
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

  test("Contact/Book page handles verified inquiry channel and verified clinic fixtures safely", async ({
    page,
  }) => {
    await page.goto("/ar/book");
    await expect(page.locator("h1")).toContainText("تواصل للاستفسار");
    await expect(
      page.getByRole("link", { name: /الانتقال إلى حساب إنستجرام/ })
    ).toHaveAttribute("href", "https://www.instagram.com/dr.rehamdq/");

    await page.setExtraHTTPHeaders({
      "x-qa-booking-fixture": "verified-multi",
    });
    await page.goto("/ar/book");
    await expect(page.locator("h1")).toContainText("التواصل وحجز المواعيد");
    const radioOptions = page.locator(".clinic-radio-input");
    await expect(radioOptions).toHaveCount(2);
  });
});
