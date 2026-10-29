# موقع د. ريهام القحطاني — طب وجراحة تجميل العيون والجفون (`dr-reham-website`)

المستودع الرسمي لمشروع موقع **د. ريهام القحطاني** (طب وجراحة تجميل العيون والجفون — الرياض)، ويضم تطبيق الويب الكامل داخل مجلد [`website/`](./website) إلى جانب ملفات التوجيه والمواصفات والأصول المرجعية في جذر المستودع.

---

## 1. هيكلة المستودع ومجلد التطبيق

- **[`website/`](./website)**: مجلد تطبيق Next.js 15 (App Router + React 19 + TypeScript) الذي يحتوي على الكود المصدري، المكونات، البيانات، الصور الفوتوغرافية، والشعار، والاختبارات:
  - `website/src/config/site.ts`: الإعدادات المركزية للموقع، وضع التشغيل (`preview` / `production`)، بيانات الطبيبة، والعيادات.
  - `website/src/content/ar/`: ملفات المحتوى العربي المفصولة عن مكونات العرض (`home.ts`, `about.ts`, `articles.ts`, `faq.ts`, `services.ts`, `book.ts`, `privacy.ts`).
  - `website/src/lib/content-gates.ts`: بوابات اعتماد المحتوى، فصل مسودات المعاينة عن وضع الإنتاج، وحساب وقت القراءة والفلترة.
  - `website/public/brand/logo-original.png`: ملف الشعار الأصلي المعتمد (`CSS mask-image`).
  - `website/public/media/`: الأصول الفوتوغرافية التحريرية المستخدمة في الافتتاحية وقسم التخصص والمقالات.
  - `website/docs/`: تقارير البناء والقبول (`BUILD-REPORT.md`)، العناصر المفتوحة قبل الإطلاق (`OPEN-ITEMS.md`)، ودليل إدارة المقالات (`ARTICLES-GUIDE.md`).
- **ملفات التوجيه والمواصفات في الجذر**:
  - `AGENTS.md`: عقد التنفيذ والقيود الملزمة للمشروع.
  - `docs/`: وثائق الاتجاه البصري، نظام التصميم، خريطة المسارات، وخطة الأصول.
  - `routes/` و`content/` و`assets/`: مواصفات الصفحات والأصول المرجعية.

---

## 2. خطوات التثبيت والتشغيل والبناء

انتقل إلى مجلد التطبيق [`website/`](./website) ونفّذ الأوامر التالية:

```bash
cd website

# 1. تثبيت الحزم الاعتمادية (باستخدام ملف القفل package-lock.json)
npm install

# 2. تشغيل خادم التطوير المحلي (http://localhost:3000)
npm run dev

# 3. فحص الأنواع وجودة الكود
npm run typecheck
npm run lint

# 4. تشغيل الاختبارات الوحدوية (Vitest)
npm run test:unit

# 5. بناء نسخة الإنتاج
npm run build

# 6. تشغيل نسخة الإنتاج محليًا بعد البناء
npm run start

# 7. تشغيل اختبارات المتصفح الشاملة (Playwright E2E — بعد npm run build)
npm run test:e2e
```

> **ملاحظة:** لا تشغّل `npm run build` و`npm run dev` بالتزامن على نفس مجلد إخراج Next.js (`.next`).

---

## 3. متغيرات البيئة (`.env.example`)

انسخ ملف [`.env.example`](./website/.env.example) عند الحاجة إلى تخصيص مرحلة التشغيل:

- `SITE_STAGE`: مرحلة تشغيل الخادم (`preview` افتراضيًا، أو `production` عند الإطلاق العام).
- `NEXT_PUBLIC_SITE_STAGE`: مرحلة التشغيل العامة للعميل (`preview` أو `production`).
- `DISABLE_PREVIEW_DRAFTS`: اضبطه على `"true"` إذا رغبت في إخفاء مسودات المقالات حتى أثناء وضع المعاينة.

---

## 4. طريقة تعديل المحتوى واعتماد المقالات والخدمات

تُدار جميع النصوص والسجلات من ملفات البيانات في [`website/src/content/ar/`](./website/src/content/ar) دون الحاجة لتعديل مكونات الواجهة:

1. **إضافة أو تعديل أو اعتماد مقال توعوي (`/ar/journal`)**:
   - افتح [`website/src/content/ar/articles.ts`](./website/src/content/ar/articles.ts).
   - في وضع المعاينة (`preview`)، تظهر المقالات ذات `status: "draft"` مع شارة **«مسودة للمراجعة»** لتقييم التجربة، بينما لا تدخل في `sitemap.xml` أو وضع الإنتاج العام.
   - لاعتماد مقال رسميًا للنشر العام، اضبط `status: "published"` وحدد `author` و`reviewedBy` و`reviewedAt` و`publishedAt` وفق الخطوات المشروحة في [`website/docs/ARTICLES-GUIDE.md`](./website/docs/ARTICLES-GUIDE.md).
2. **تعديل أقسام الصفحة الرئيسية والأسئلة العملية**:
   - نصوص الصفحة الرئيسية وخطوات «قبل الاستشارة» وقسم «تعرّف على أسلوب المحتوى»: [`website/src/content/ar/home.ts`](./website/src/content/ar/home.ts).
   - الأسئلة العملية المختصرة: [`website/src/content/ar/faq.ts`](./website/src/content/ar/faq.ts).
3. **تفعيل الحجز المباشر أو تحديث بيانات الطبيبة**:
   - راجع [`website/src/config/site.ts`](./website/src/config/site.ts) وقائمة البنود المطلوبة قبل الإطلاق في [`website/docs/OPEN-ITEMS.md`](./website/docs/OPEN-ITEMS.md).
