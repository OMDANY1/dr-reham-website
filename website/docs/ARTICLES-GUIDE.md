# دليل إدارة المقالات التوعوية (Adding, Editing & Approving Articles)

تم فصل بيانات المقالات بالكامل عن مكونات العرض بحيث تُدار جميع السجلات النصية والبيانات الوصفية من ملف البيانات المركزي:
- **ملف بيانات المقالات:** [`src/content/ar/articles.ts`](../src/content/ar/articles.ts)
- **بوابات النشر والمعاينة وحساب وقت القراءة:** [`src/lib/content-gates.ts`](../src/lib/content-gates.ts)
- **مكونات العرض:**
  - مستكشف وفلاتر وبحث المقالات (`/ar/journal`): [`src/components/journal/JournalExplorer.tsx`](../src/components/journal/JournalExplorer.tsx)
  - شريط المشاركة ونسخ الرابط: [`src/components/journal/ArticleShareBar.tsx`](../src/components/journal/ArticleShareBar.tsx)
  - قسم «من المقالات» في الصفحة الرئيسية: [`src/components/sections/KnowledgeTeaser.tsx`](../src/components/sections/KnowledgeTeaser.tsx)
  - صفحة فهرس المقالات: [`src/app/[locale]/journal/page.tsx`](../src/app/[locale]/journal/page.tsx)
  - صفحة المقال الداخلية: [`src/app/[locale]/journal/[slug]/page.tsx`](../src/app/[locale]/journal/[slug]/page.tsx)

---

## 1. كيفية إضافة مقال جديد أو تعديل مقال حالي

افتح الملف [`src/content/ar/articles.ts`](../src/content/ar/articles.ts) وأضف كائنًا جديدًا داخل مصفوفة `articlesRecords` وفق البنية التالية:

```ts
{
  slug: "unique-article-slug",
  title: "عنوان المقال باللغة العربية",
  excerpt: "ملخص واضح ومختصر يظهر في بطاقة المقال وفي مقدمة الصفحة الداخلية.",
  category: "العين والجفون", // أحد التصنيفات: «العين والجفون» | «حول العين» | «قبل الاستشارة»
  featured: false, // اجعل مقالًا واحدًا فقط true ليظهر كمقال مميز في أعلى صفحة المقالات
  image: {
    src: "/media/your-editorial-image.jpg",
    alt: "وصف بديل دقيق للصورة التعبيرية",
  },
  author: null, // يبقى null طالما المقال مسودة غير معتمدة
  reviewedBy: null, // يبقى null حتى تتم المراجعة الطبية الفعلية
  reviewedAt: null, // يبقى null حتى تاريخ المراجعة الفعلي
  publishedAt: null, // يبقى null حتى تاريخ النشر الفعلي
  status: "draft", // "draft" للمعاينة، أو "published" بعد الاعتماد النهائي
  seo: {
    title: "عنوان الميتا لمحركات البحث",
    description: "وصف الميتا المختصر",
  },
  body: [
    {
      id: "section-1",
      heading: "العنوان الفرعي الأول",
      paragraphs: [
        "الفقرة الأولى من القسم...",
        "الفقرة الثانية من القسم...",
      ],
      bullets: [
        "نقطة توضيحية أولى عند الحاجة",
        "نقطة توضيحية ثانية",
      ],
    },
  ],
  sources: [
    {
      title: "عنوان المرجع الطبي المؤسسي",
      institution: "American Academy of Ophthalmology (AAO)",
      url: "https://www.aao.org/...",
    },
  ],
}
```

### ميزات تحسب تلقائيًا دون إدخال يدوي
1. **وقت القراءة (`Reading Time`):** يُحسب تلقائيًا من إجمالي كلمات المقال الفعلي عبر `calculateReadingTimeMinutes(article)`.
2. **فهرس التنقل الداخلي (`Table of Contents`):** يظهر تلقائيًا في صفحة المقال الداخلية للمقالات الطويلة (٣ أقسام فأكثر أو ٣٥٠ كلمة فأكثر).
3. **المقالات المرتبطة (`Related Articles`):** تُختار تلقائيًا بحسب التصنيف مع استبعاد المقال الحالي.

---

## 2. آلية فصل المعاينة (`Preview`) عن النشر العام (`Production`)

1. **في وضع المعاينة الحالي (`siteConfig.mode === "preview"`):**
   - تعرض الدالتان `getVisibleArticles()` و`getVisibleArticleBySlug()` المسودات المكتملة (`status: "draft"`) لتقييم تجربة القراءة والتصميم.
   - تظهر شارة **«مسودة للمراجعة»** تلقائيًا على كل مقال بحالة `draft`.
   - تحمل صفحات المسودات وسم `noindex, nofollow` ولا تدخل في `sitemap.xml` أو بيانات `Schema.org`.
   - يعتمد هذا السلوك على إعداد الخادم (`SITE_STAGE` / `siteConfig.mode`) ولا يقبل أي `query parameter` عام في الرابط.

2. **اعتماد المقال للنشر العام (`Production Approval`):**
   - بعد مراجعة الدكتورة ريهام القحطاني للنص واعتماده رسميًا، حدّث الحقول الأربعة التالية في سجل المقال داخل [`src/content/ar/articles.ts`](../src/content/ar/articles.ts):
     - `status: "published"`
     - `author: "د. ريهام القحطاني"` (أو الكاتب المعتمد)
     - `reviewedBy: "د. ريهام القحطاني"`
     - `reviewedAt: "YYYY-MM-DD"`
     - `publishedAt: "YYYY-MM-DD"`
   - فور استيفاء هذه الشروط تمرّ المقالة عبر بوابة `isPublicArticle(article)`، وتختفي شارة «مسودة للمراجعة»، وتُدرج تلقائيًا في `sitemap.xml` وفي وضع الإنتاج العام.
