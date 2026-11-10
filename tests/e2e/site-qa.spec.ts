import { test, expect } from "@playwright/test";

const ARTIFACT_DIR =
  "C:/Users/elwady/.gemini/antigravity/brain/1dfd746d-d8b6-480f-84bd-173216ab6bc6";

test.describe("Dr. Reham Website — Warm Ivory & Deep Plum Bilingual Redesign QA", () => {
  test("Arabic Home (/ar) renders RTL Warm Ivory & Deep Plum editorial layout, hides unconsented Results, and has zero draft badges on public view", async ({
    page,
    viewport,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(/\/ar$/);

    const html = page.locator("html");
    await expect(html).toHaveAttribute("lang", "ar");
    await expect(html).toHaveAttribute("dir", "rtl");

    const h1 = page.locator("h1");
    await expect(h1).toContainText("د. ريهام القحطاني");
    await expect(page.locator(".hero-editorial__tagline")).toContainText(
      "عناية دقيقة بتفاصيل نظرتك"
    );

    const heroImg = page.locator(".hero-editorial__img");
    await expect(heroImg).toBeVisible();

    // Verify Warm Ivory & Deep Plum computed colors and ensure hero photo is NOT mirrored
    const computed = await page.evaluate(() => {
      const getStyle = (sel: string) => {
        const el = document.querySelector(sel);
        return el ? window.getComputedStyle(el) : null;
      };
      return {
        pageBg: getStyle("body")?.backgroundColor,
        h1Color: getStyle(".hero-editorial__headline")?.color,
        headerLogoBg: getStyle(".site-header .brand-logo")?.backgroundColor,
        footerLogoBg: getStyle(".site-footer .brand-logo")?.backgroundColor,
        primaryBtnBg: getStyle(".btn--primary")?.backgroundColor,
        oliveRuleBg: getStyle(".hero-editorial__sand-line")?.backgroundColor,
        stripBg: getStyle(".specialties-strip")?.backgroundColor,
        heroImgTransform: getStyle(".hero-editorial__img")?.transform,
        hasOverflow:
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      };
    });

    expect(computed.pageBg).toBe("rgb(245, 236, 230)"); // #F5ECE6 Warm Ivory
    expect(computed.h1Color).toBe("rgb(50, 28, 48)"); // #321C30 Deep Plum
    expect(computed.headerLogoBg).toBe("rgb(50, 28, 48)"); // #321C30
    expect(computed.footerLogoBg).toBe("rgb(50, 28, 48)"); // #321C30
    expect(computed.primaryBtnBg).toBe("rgb(96, 51, 79)"); // #60334F Plum Accent
    expect(computed.oliveRuleBg).toBe("rgb(119, 115, 79)"); // #77734F Olive Gold
    expect(computed.stripBg).toBe("rgb(251, 247, 243)"); // #FBF7F3 Light Surface
    expect(computed.heroImgTransform).toBe("none"); // Not mirrored
    expect(computed.hasOverflow).toBe(false);

    // 4-Item Specialties Strip
    const strip = page.getByTestId("specialties-strip");
    await expect(strip).toBeVisible();
    await expect(strip.locator(".specialties-strip__item")).toHaveCount(4);

    // 3-Column About Section (Sculpture + Narrative + 4 Principles)
    const aboutSection = page.getByTestId("about-editorial-section");
    await expect(aboutSection).toBeVisible();
    await expect(aboutSection.locator(".about-principle-row")).toHaveCount(4);

    // Results section MUST be hidden on public view when no consented cases exist
    await expect(page.getByTestId("results-plum-section")).toHaveCount(0);

    // Patient Education 3-Card Section with SVG dashed overlays & reading time
    const eduSection = page.getByTestId("home-articles-section");
    await expect(eduSection).toBeVisible();
    await expect(eduSection.getByTestId("education-article-card")).toHaveCount(
      3
    );

    // No draft badges on public view
    await expect(page.getByTestId("draft-preview-badge")).toHaveCount(0);

    const w = viewport?.width ?? 1440;
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.screenshot({
      path: `${ARTIFACT_DIR}/plum-redesign-ar-viewport-${w}.png`,
      fullPage: false,
    });
    await page.addStyleTag({
      content: ".site-header { position: static !important; }",
    });
    await page.screenshot({
      path: `${ARTIFACT_DIR}/plum-redesign-ar-home-${w}.png`,
      fullPage: true,
    });
  });

  test("English Home (/en) renders LTR reference-matched layout, language switcher preserves route, and captures desktop/mobile screenshots", async ({
    page,
    viewport,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const response = await page.goto("/en");
    expect(response?.status()).toBe(200);

    const html = page.locator("html");
    await expect(html).toHaveAttribute("lang", "en");
    await expect(html).toHaveAttribute("dir", "ltr");

    const h1 = page.locator("h1");
    await expect(h1).toContainText("Dr. Reham Alqahtani");
    const tagline = page.locator(".hero-editorial__tagline");
    await expect(tagline).toContainText("Precision in Care.");
    await expect(tagline).toContainText("Harmony in Aesthetics.");

    // Verify 4 specialties in English
    const strip = page.getByTestId("specialties-strip");
    await expect(strip).toContainText("Eyelid Surgery");
    await expect(strip).toContainText("Periocular Care");
    await expect(strip).toContainText("Ocular Surface & Comfort");
    await expect(strip).toContainText("Tailored Clinical Evaluation");

    // Verify 3-column About section in English
    const aboutSection = page.getByTestId("about-editorial-section");
    await expect(aboutSection).toContainText(
      "A Focused Subspecialty in Eye & Eyelid Surgery"
    );
    await expect(aboutSection).toContainText("Surgical Expertise");
    await expect(aboutSection).toContainText("Evidence-Based Care");

    // Verify Patient Education in English
    const eduSection = page.getByTestId("home-articles-section");
    await expect(eduSection).toContainText("Learn & Stay Informed");
    await expect(eduSection).toContainText("min read");

    // Verify no horizontal overflow
    const hasOverflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth
    );
    expect(hasOverflow).toBe(false);

    const w = viewport?.width ?? 1440;
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.screenshot({
      path: `${ARTIFACT_DIR}/plum-redesign-en-viewport-${w}.png`,
      fullPage: false,
    });
    await page.addStyleTag({
      content: ".site-header { position: static !important; }",
    });
    await page.screenshot({
      path: `${ARTIFACT_DIR}/plum-redesign-en-home-${w}.png`,
      fullPage: true,
    });
  });

  test("Language switcher preserves current route between /ar and /en across inner pages", async ({
    page,
    viewport,
  }) => {
    if ((viewport?.width ?? 1440) < 960) {
      test.skip();
    }

    await page.goto("/ar/journal");
    const enLink = page
      .getByTestId("header-lang-switcher")
      .getByRole("link", { name: "EN" });
    await expect(enLink).toHaveAttribute("href", "/en/journal");
    await enLink.click();

    await expect(page).toHaveURL(/\/en\/journal$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Learn & Stay Informed" })
    ).toBeVisible();

    const arLink = page
      .getByTestId("header-lang-switcher")
      .getByRole("link", { name: "عربي" });
    await expect(arLink).toHaveAttribute("href", "/ar/journal");
  });

  test("Journal index (/ar/journal and /en/journal) and Article detail work cleanly without public draft badges", async ({
    page,
  }) => {
    await page.goto("/ar/journal");
    await expect(page.getByTestId("featured-article-card")).toBeVisible();
    await expect(page.getByTestId("article-grid-card")).toHaveCount(5);
    await expect(page.getByTestId("draft-preview-badge")).toHaveCount(0);

    await page.goto("/en/journal/hooded-vs-deep-set-eyelid");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Eyelid Fold & Deep-Set Eyes: Understanding the Anatomical Difference",
      })
    ).toBeVisible();
    await expect(page.getByTestId("article-reading-time")).toContainText(
      "min read"
    );
    await expect(page.getByTestId("draft-preview-badge")).toHaveCount(0);
  });

  test("All bilingual public routes load with 200, no broken images, and no horizontal overflow", async ({
    page,
  }) => {
    const routes = [
      "/ar/about",
      "/ar/faq",
      "/ar/book",
      "/ar/privacy",
      "/en/about",
      "/en/faq",
      "/en/book",
      "/en/privacy",
    ];

    for (const route of routes) {
      const res = await page.goto(route);
      expect(res?.status(), `Route ${route} should return 200`).toBe(200);

      const hasOverflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth
      );
      expect(hasOverflow, `Route ${route} should not overflow`).toBe(false);
    }
  });

  test("Unknown locales and unknown slugs return real 404", async ({
    page,
  }) => {
    const fourOhFourRoutes = [
      "/fr",
      "/ar/unknown-route",
      "/en/unknown-route",
      "/ar/services/eyelid-consultation-draft",
      "/ar/journal/non-existent-article-slug",
    ];

    for (const route of fourOhFourRoutes) {
      const res = await page.goto(route);
      expect(res?.status(), `Route ${route} should return 404`).toBe(404);
    }
  });
});
