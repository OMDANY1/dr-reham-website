# موقع د. ريهام القحطاني — دليل التشغيل والتسليم (`website/`)

يحتوي هذا المجلد (`website/`) على التطبيق الكامل لموقع **د. ريهام القحطاني** (طب وجراحة تجميل العيون والجفون — الرياض)، المبني باستخدام Next.js 15 (App Router) وReact 19 وTypeScript وفق الهوية الفوتوغرافية التحريرية المخصصة.

---

## 1. المتطلبات وأوامر التثبيت والتشغيل والبناء

- **Node.js**: `20+` (تم التحقق على `v24.16.0`)
- **npm**: مع ملف القفل المثبت [`package-lock.json`](./package-lock.json)

```bash
# تثبيت الحزم الاعتمادية
npm install

# تشغيل خادم التطوير المحلي (http://localhost:3000)
npm run dev

# فحص الأنواع (TypeScript)
npm run typecheck

# فحص جودة الكود (ESLint)
npm run lint

# تشغيل الاختبارات الوحدوية لبوابات المحتوى والفلترة وروابط الحجز (Vitest)
npm run test:unit

# بناء نسخة الإنتاج المحلية
npm run build

# تشغيل خادم الإنتاج بعد البناء
npm run start

# تشغيل اختبارات المتصفح الشاملة (Playwright E2E — يتطلب npm run build أولًا)
npm run test:e2e
```

---

## 2. هيكلة مجلد التطبيق (`website/`)

- `src/config/site.ts`: الإعدادات المركزية للموقع، وضع التشغيل (`preview` / `production`)، بيانات الطبيبة، والعيادات.
- `src/content/ar/`: ملفات المحتوى العربي المفصولة عن مكونات العرض:
  - `home.ts`: محتوى الصفحة الرئيسية (الافتتاحية، نبذة الدكتورة، التخصص، خطوات «قبل الاستشارة»، «من المقالات»، «تعرّف على أسلوب المحتوى»، ودعوة التواصل).
  - `articles.ts`: نصوص صفحة المقالات والمسودات الست المكتملة ومصادرها المؤسسية (`AAO`, `NHS`, `Mayo Clinic`).
  - `faq.ts`: الأسئلة العملية المختصرة حول التواصل والاستعداد للاستشارة.
  - `about.ts`: بيانات ونصوص صفحة «عن الدكتورة».
  - `book.ts`: بيانات ونصوص صفحة «تواصل للاستفسار» ومحدد العيادات.
  - `services.ts`: سجلات الخدمات الطبية المحمية ببوابة الاعتماد.
  - `privacy.ts`: سياسة الخصوصية.
- `src/lib/content-gates.ts`: دوال التحقق وبوابات النشر (`isPublicArticle`, `isPreviewableDraftArticle`, `getVisibleArticles`, `calculateReadingTimeMinutes`, `filterArticles`, `isPublicService`, `isPublicFaq`).
- `public/brand/logo-original.png`: الشعار الأصلي المعتمد المستخدم عبر `CSS mask-image`.
- `public/media/`: الأصول الفوتوغرافية التحريرية المستخدمة في الموقع والمقالات.
- `docs/`:
  - [`docs/BUILD-REPORT.md`](./docs/BUILD-REPORT.md): تقرير البناء والقبول ولقطات الشاشة.
  - [`docs/ARTICLES-GUIDE.md`](./docs/ARTICLES-GUIDE.md): دليل إضافة وتعديل واعتماد المقالات.
  - [`docs/OPEN-ITEMS.md`](./docs/OPEN-ITEMS.md): البيانات المطلوبة من العميل قبل النشر العام.

---

## 3. طريقة تعديل المحتوى واعتماد المقالات

1. **إدارة المقالات التوعوية (`/ar/journal`)**:
   - عدّل المصفوفة `articlesRecords` في [`src/content/ar/articles.ts`](./src/content/ar/articles.ts).
   - يُحسب وقت القراءة وفهرس التنقل الداخلي والمقالات المرتبطة تلقائيًا من المحتوى الفعلي.
   - في وضع المعاينة (`preview`)، تُعرض المسودات (`status: "draft"`) مع شارة «مسودة للمراجعة». لاعتماد مقال للنشر العام، اضبط `status: "published"` وأضف `author` و`reviewedBy` و`reviewedAt` و`publishedAt` (راجع [`docs/ARTICLES-GUIDE.md`](./docs/ARTICLES-GUIDE.md)).
2. **تحديث بيانات الطبيبة وتفعيل الحجز المباشر**:
   - عدّل [`src/config/site.ts`](./src/config/site.ts) لتزويد اللقب المهني (`professionalRank`) والسيرة (`biography`) والمؤهلات (`credentials`) وتفعيل العيادات الموثقة (`bookingEnabled: true`).
