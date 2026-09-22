# CI Quality Fix Report — quality.yml (Backend + Frontend)

> النطاق: إصلاح فشل workflow `quality` فقط. لا تغيير في منطق التطبيق، لا إخفاء أخطاء، لا `git push` (يُسلَّم: الملفات المعدلة + نتائج التحقق).

## 1. سبب فشل Backend

- العرض: `Module "@prisma/client" has no exported member "PrismaClient"` وغياب نماذج (`address`, `customer`, `adminUser`, `order`, `product`) عند `tsc`.
- السبب الجذري: `npm ci` على checkout نظيف لا يولّد Prisma Client (يُولَّد محليًا سابقًا وبقي في `node_modules`، لهذا لم يظهر الخطأ محليًا)، وخطوة `tsc` كانت تعمل **قبل** أي `prisma generate`.
- الإصلاح (`backend` job في `.github/workflows/quality.yml`): خطوة جديدة بعد `npm ci` مباشرة وقبل tsc/build/lint:
  `npx prisma generate` (أمر المشروع الفعلي — لا schema ولا migrations مُست).
- ملاحظة بيئية موثقة في الملف: `generate` يقرأ `DATABASE_URL` من الإعداد دون الاتصال بقاعدة، لذا زُوّدت الوظيفة بقيمة localhost غير سرية (`mysql://root@localhost:3306/mjm_store`) لهذا الغرض فقط.

## 2. سبب فشل Frontend

- العرض: `frontend/tests/fixtures/base.ts:16` — `react-hooks/rules-of-hooks`: استدعاء `use` داخل دالة `errors`.
- التحليل: **false positive مثبت**: `use` هنا هو Playwright fixture-scoping callback (إلزامي في API الـ fixtures)، وليس React Hook — الملف بلا React أصلًا (لا مكونات ولا JSX)، والقاعدة تبلّغ عند سطر الاستدعاء (`await use(errors)`) لا عند التعريف. إعادة التسمية مستحيلة لأن المواصفات تفكك `{ errors }` — أي تغيير للاسم يغيّر سلوك الاختبارات.
- الإصلاح (`frontend/tests/fixtures/base.ts` فقط): `eslint-disable-next-line` **موجَّه لسطر واحد** مع توثيق السبب في تعليق مجاور (لا تعطيل عام، لا تغيير سلوكي، لا مساس بمواصفات Playwright/Accessibility).

## 3. الملفات المعدلة (2 فقط)

1. `.github/workflows/quality.yml` — خطوة `prisma generate` + متغير `DATABASE_URL` الوهمي + تحديث التعليق التوضيحي.
2. `frontend/tests/fixtures/base.ts` — تعطيل موثق لسطر واحد (بعد تصحيح موضعه من سطر التعريف إلى سطر الاستدعاء — المحاولة الأولى وُضعت خطأً وكشفها التحقق المحلي).

## 4. أوامر التحقق (نُفذت محليًا حرفيًا)

```text
cd backend
npm ci
npx prisma generate
npx tsc --noEmit
npm run lint
npm run build
npm test
npm run test:e2e
cd ../frontend
npm ci
npx tsc --noEmit
npx eslint .
```

## 5. نتائج التحقق

| الفحص | النتيجة |
|---|---|
| backend `npm ci` + `prisma generate` | Generated Prisma Client v7.4.2 ✓ |
| backend `tsc --noEmit` | نظيف ✓ |
| backend `npm run lint` (سكربت المشروع) | نظيف، ولم يُنتج تعديلات إضافية (`git status` فيه الملفان المقصودان فقط) ✓ |
| backend `npm run build` | نظيف ✓ |
| backend `npm test` | 29/29 ✓ |
| backend `test:e2e` | 9/9 (على `mjm_store_test`، تُنظف نفسها) ✓ |
| frontend `npm ci` + `tsc --noEmit` | نظيف ✓ |
| frontend `eslint tests/fixtures/base.ts` | نظيف ✓ |
| frontend `eslint src tests next.config.ts playwright.config.ts` | **0 errors** (15 تحذيرًا مسبقًا لم تُمس ولم تُحوَّل لأخطاء) ✓ |
| `quality.yml` | YAML سليم، والخطوات بالترتيب المطلوب ✓ |

ملاحظة: `npx eslint .` الكامل محليًا يظهر أخطاء في `playwright-report/trace/*.js` — مجلدات مولّدة محليًا (تقارير HTML سابقة) غير موجودة في checkout نظيف للـ CI، وليست كود المشروع؛ لم تُمس.

## 6. تأكيد عدم التعطيل/الإخفاء

- لا `continue-on-error`، لا تغيير عتبات، لا حذف اختبارات؛ الـ e2e والـ unit يعملان وينجحان.
- تعطيل ESLint الوحيد سطر واحد موثق كـ false-positive مثبت، والقاعدة فعالة في كل الملف.
- التحذيرات الـ 15 تُركت كما هي (ممنوع إصلاحها الآن).
- لم يُدفع أي شيء (`git status`: الملفان المعدلان فقط، غير مُرحّلين للتسليم كملفات).
