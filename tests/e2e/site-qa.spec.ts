import { test, expect } from "@playwright/test";

const ARTIFACT_DIR =
  "C:/Users/elwady/.gemini/antigravity/brain/1dfd746d-d8b6-480f-84bd-173216ab6bc6";

test.describe("Dr. Reham Website — Almarai Font, WhatsApp (+966 580779630) & Before/After Carousel QA", () => {
  test("Arabic Home (/ar) uses Almarai font, updates WhatsApp to +966 580779630 everywhere, and renders Before/After Carousel", async ({
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

    // Verify Favicon & OpenGraph Preview Image meta tags
    const ogImageAr = await page
      .locator('meta[property="og:image"]')
      .getAttribute("content");
    expect(ogImageAr).toContain("/media/og-preview.jpg");
    const faviconLinks = await page
      .locator('link[rel="icon"], link[rel="apple-touch-icon"]')
      .evaluateAll((els) => els.map((el) => el.getAttribute("href") || ""));
    expect(faviconLinks.some((h) => h.includes("favicon.ico") || h.includes("icon.png"))).toBe(true);

    const h1 = page.locator("h1");
    await expect(h1).toContainText("د. ريهام القحطاني");
    await expect(page.locator(".hero-editorial__tagline")).toContainText(
      "عناية دقيقة بتفاصيل نظرتك"
    );

    // Verify floating WhatsApp CTA and all WhatsApp links point to https://wa.me/966580779630
    const floatingWa = page.getByTestId("floating-whatsapp-cta");
    await expect(floatingWa).toBeVisible();
    await expect(floatingWa).toHaveAttribute(
      "href",
      "https://wa.me/966580779630"
    );
    await expect(floatingWa).toContainText("+966 580779630");

    const waLinks = await page
      .locator('a[href*="wa.me"]')
      .evaluateAll((els) => els.map((el) => el.getAttribute("href") || ""));
    expect(waLinks.length).toBeGreaterThanOrEqual(4);
    for (const href of waLinks) {
      expect(href).toBe("https://wa.me/966580779630");
    }

    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toContain("045 0425");
    expect(bodyText).not.toContain("966540450425");

    // Verify Warm Ivory & Deep Plum colors, Almarai font-family, and non-mirrored hero photo
    const computed = await page.evaluate(() => {
      const getStyle = (sel: string) => {
        const el = document.querySelector(sel);
        return el ? window.getComputedStyle(el) : null;
      };
      return {
        pageBg: getStyle("body")?.backgroundColor,
        bodyFont: getStyle("body")?.fontFamily || "",
        h1Font: getStyle(".hero-editorial__headline")?.fontFamily || "",
        aboutTitleFont: getStyle(".about-editorial__title")?.fontFamily || "",
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
    expect(computed.bodyFont.toLowerCase()).toContain("almarai");
    expect(computed.h1Font.toLowerCase()).toContain("almarai");
    expect(computed.aboutTitleFont.toLowerCase()).toContain("almarai");
    expect(computed.h1Color).toBe("rgb(50, 28, 48)"); // #321C30 Deep Plum
    expect(computed.headerLogoBg).toBe("rgb(50, 28, 48)");
    expect(computed.footerLogoBg).toBe("rgb(50, 28, 48)");
    expect(computed.primaryBtnBg).toBe("rgb(96, 51, 79)"); // #60334F Plum Accent
    expect(computed.oliveRuleBg).toBe("rgb(119, 115, 79)"); // #77734F Olive Gold
    expect(computed.stripBg).toBe("rgb(251, 247, 243)"); // #FBF7F3 Light Surface
    expect(computed.heroImgTransform).toBe("none");
    expect(computed.hasOverflow).toBe(false);

    // 4-Item Specialties Strip
    const strip = page.getByTestId("specialties-strip");
    await expect(strip).toBeVisible();
    await expect(strip.locator(".specialties-strip__item")).toHaveCount(4);

    // 3-Column About Section with Dr. Reham's cropped photo
    const aboutSection = page.getByTestId("about-editorial-section");
    await expect(aboutSection).toBeVisible();
    await expect(aboutSection.locator(".about-principle-row")).toHaveCount(4);
    await expect(aboutSection.locator("img.about-editorial__img")).toHaveAttribute(
      "src",
      "/media/dr-reham-about.jpg"
    );

    // Results section (Before & After Carousel) renders between About and Education
    await expect(page.getByTestId("results-plum-section")).toBeVisible();

    // Patient Education 3-Card Section
    const eduSection = page.getByTestId("home-articles-section");
    await expect(eduSection).toBeVisible();
    await expect(eduSection.getByTestId("education-article-card")).toHaveCount(
      3
    );

    const w = viewport?.width ?? 1440;
    await page.screenshot({
      path: `${ARTIFACT_DIR}/plum-redesign-ar-viewport-${w}.png`,
      fullPage: false,
    });
  });

  test("Before & After Carousel (/ar and /en) renders directly between About and Education with side-by-side cases, controls, and captures Desktop/Mobile screenshots", async ({
    page,
    viewport,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });

    const w = viewport?.width ?? 1440;

    // 1. Arabic Home (/ar)
    await page.goto("/ar");
    const arResults = page.getByTestId("results-plum-section");
    await expect(arResults).toBeVisible();

    // Verify exact placement: right after #about-doctor and right before #education
    const sectionOrder = await page.evaluate(() => {
      const ids = Array.from(
        document.querySelectorAll("main section[id]")
      ).map((el) => el.id);
      return ids;
    });
    const aboutIdx = sectionOrder.indexOf("about-doctor");
    const resultsIdx = sectionOrder.indexOf("results");
    const eduIdx = sectionOrder.indexOf("education");
    expect(aboutIdx).toBeGreaterThanOrEqual(0);
    expect(resultsIdx).toBe(aboutIdx + 1);
    expect(eduIdx).toBe(resultsIdx + 1);

    // Verify exact Arabic copy
    await expect(arResults).toContainText("حالات مختارة");
    await expect(arResults).toContainText("قبل وبعد");
    await expect(arResults).toContainText(
      "نماذج من حالات الدكتورة، مع اختلاف النتائج بحسب طبيعة كل حالة."
    );

    // Verify side-by-side Before & After images, equal heights, counter 01 / 03, dots, prev/next, pause/resume
    const activeSlide = page.getByTestId("results-active-slide");
    await expect(activeSlide).toBeVisible();
    await expect(activeSlide.getByTestId("results-before-badge")).toHaveText(
      "قبل"
    );
    await expect(activeSlide.getByTestId("results-after-badge")).toHaveText(
      "بعد"
    );
    await expect(activeSlide).toContainText(
      "تجميل جفون سفلية مع إعادة توزيع الدهون"
    );
    await expect(page.getByTestId("results-counter")).toHaveText("01 / 03");
    await expect(page.getByTestId("results-dot-btn")).toHaveCount(3);
    await expect(page.getByTestId("results-autoplay-toggle")).toBeVisible();

    // Capture dedicated About & Before/After section screenshots (Arabic) without sticky header overlap
    await page.addStyleTag({
      content:
        ".site-header { position: static !important; } .floating-whatsapp-cta { display: none !important; }",
    });

    const arAbout = page.getByTestId("about-editorial-section");
    await arAbout.scrollIntoViewIfNeeded();
    await arAbout.screenshot({
      path: `${ARTIFACT_DIR}/about-doctor-ar-${w}.png`,
    });

    await arResults.scrollIntoViewIfNeeded();
    await arResults.screenshot({
      path: `${ARTIFACT_DIR}/before-after-ar-${w}.png`,
    });

    // Verify clicking Next advances to 02 / 03 (Case 2) and 03 / 03 (Case 3)
    await page.getByTestId("results-next-btn").click();
    await expect(page.getByTestId("results-counter")).toHaveText("02 / 03");
    await expect(page.getByTestId("results-active-slide")).toContainText(
      "تجميل الجفون العلوية والجفون السفلية مع إعادة توزيع الدهون بجرح مخفي + توسيع العيون من الزوايا الخارجية"
    );
    await arResults.screenshot({
      path: `${ARTIFACT_DIR}/before-after-case2-ar-${w}.png`,
    });

    await page.getByTestId("results-next-btn").click();
    await expect(page.getByTestId("results-counter")).toHaveText("03 / 03");
    await expect(page.getByTestId("results-active-slide")).toContainText(
      "تجميل الجفون العلوية مع رفع الحواجب وتعديل التناسق فيما بينهم"
    );
    await arResults.screenshot({
      path: `${ARTIFACT_DIR}/before-after-case3-ar-${w}.png`,
    });

    // Return to 01 / 03
    await page.getByTestId("results-next-btn").click();
    await expect(page.getByTestId("results-counter")).toHaveText("01 / 03");

    // Verify Follower Testimonials section («آراء المتابعين»)
    const arTestimonials = page.getByTestId("testimonials-section");
    await expect(arTestimonials).toBeVisible();
    await expect(arTestimonials).toContainText("آراء المتابعين");
    await expect(arTestimonials.getByTestId("testimonial-card")).toHaveCount(4);
    await expect(page.getByTestId("testimonials-counter")).toHaveText(
      "01 / 04"
    );
    await arTestimonials.scrollIntoViewIfNeeded();
    await arTestimonials.screenshot({
      path: `${ARTIFACT_DIR}/testimonials-ar-${w}.png`,
    });

    // Verify FAQ phone number (+966 580779630) is isolated in <bdi dir="ltr">
    const firstFaq = page.locator("#faq-how-to-inquire-appointments");
    await expect(firstFaq).toBeVisible();
    const faqBdi = firstFaq.locator('bdi[dir="ltr"]');
    await expect(faqBdi.first()).toHaveText("+966 580779630");
    await firstFaq.scrollIntoViewIfNeeded();
    await firstFaq.screenshot({
      path: `${ARTIFACT_DIR}/faq-phone-ar-${w}.png`,
    });

    // Capture full-page Arabic screenshot including Before & After and Follower Testimonials
    await page.screenshot({
      path: `${ARTIFACT_DIR}/plum-redesign-ar-home-${w}.png`,
      fullPage: true,
    });

    // 2. English Home (/en)
    await page.goto("/en");
    const enResults = page.getByTestId("results-plum-section");
    await expect(enResults).toBeVisible();

    await expect(enResults).toContainText("Selected Cases");
    await expect(enResults).toContainText("Before & After");
    await expect(enResults).toContainText(
      "Selected cases from Dr. Reham’s practice. Individual results vary."
    );
    await expect(page.getByTestId("results-counter")).toHaveText("01 / 03");

    await page.addStyleTag({
      content:
        ".site-header { position: static !important; } .floating-whatsapp-cta { display: none !important; }",
    });
    await enResults.scrollIntoViewIfNeeded();
    await enResults.screenshot({
      path: `${ARTIFACT_DIR}/before-after-en-${w}.png`,
    });

    const enTestimonials = page.getByTestId("testimonials-section");
    await expect(enTestimonials).toBeVisible();
    await expect(enTestimonials).toContainText("Follower Reflections");
    await expect(enTestimonials.getByTestId("testimonial-card")).toHaveCount(4);
    await enTestimonials.scrollIntoViewIfNeeded();
    await enTestimonials.screenshot({
      path: `${ARTIFACT_DIR}/testimonials-en-${w}.png`,
    });

    await page.screenshot({
      path: `${ARTIFACT_DIR}/plum-redesign-en-home-${w}.png`,
      fullPage: true,
    });
  });

  test("English Home (/en) renders LTR layout, preserves English fonts, and updates WhatsApp to +966 580779630", async ({
    page,
    viewport,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const response = await page.goto("/en");
    expect(response?.status()).toBe(200);

    const html = page.locator("html");
    await expect(html).toHaveAttribute("lang", "en");
    await expect(html).toHaveAttribute("dir", "ltr");

    const ogImageEn = await page
      .locator('meta[property="og:image"]')
      .getAttribute("content");
    expect(ogImageEn).toContain("/media/og-preview-en.jpg");

    const h1 = page.locator("h1");
    await expect(h1).toContainText("Dr. Reham Alqahtani");

    const floatingWa = page.getByTestId("floating-whatsapp-cta");
    await expect(floatingWa).toBeVisible();
    await expect(floatingWa).toHaveAttribute(
      "href",
      "https://wa.me/966580779630"
    );

    const hasOverflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth
    );
    expect(hasOverflow).toBe(false);

    const w = viewport?.width ?? 1440;
    await page.screenshot({
      path: `${ARTIFACT_DIR}/plum-redesign-en-viewport-${w}.png`,
      fullPage: false,
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

  test("All bilingual public routes load with 200, updated WhatsApp (+966 580779630), and no horizontal overflow", async ({
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

      const bodyText = await page.locator("body").innerText();
      expect(bodyText).not.toContain("045 0425");
      expect(bodyText).not.toContain("966540450425");

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
