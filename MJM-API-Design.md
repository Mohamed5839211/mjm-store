## تصميم واجهات البرمجة (API Design) لمتجر MJM

> هذا المستند يكمّل `MJM-Store-Plan-v2.md` ويحوّل المتطلبات إلى واجهات برمجية واضحة للباك إند (NestJS + PostgreSQL + Prisma/TypeORM).

---

## 1. المبادئ العامة للـ API

- **النمط**: RESTful JSON APIs.
- **المسار الأساسي**: `/api/v1`.
- **المصادقة**:
  - JWT في الهيدر: `Authorization: Bearer <token>`.
  - بعض المسارات عامة (المنتجات، الأقسام، البكجات…)، وبعضها يتطلب تسجيل دخول (السلة المحفوظة، الطلبات، الحساب، الإدارة).
- **إرجاع الأخطاء**:
  - تنسيق موحد:
    - `statusCode`, `message`, `errorCode`, `details?`.

---

## 2. موارد المنتجات والأقسام (Products & Catalog)

### 2.1 المنتجات – `Products`

#### GET `/api/v1/products`

- **الوصف**: جلب قائمة المنتجات مع دعم التصفية والفرز.
- **بارامترات الاستعلام** (Query):
  - `category`: `bags | water | carton | hospitality | bundle_component`.
  - `search`: نص بحث في الاسم/الوصف.
  - `minPrice`, `maxPrice`: فلترة بحسب السعر.
  - `hasOffer`: `true/false` لعرض المنتجات التي عليها عروض فقط.
  - `sortBy`: `newest | price_asc | price_desc | best_selling`.
  - `page`: رقم الصفحة (افتراضي 1).
  - `limit`: عدد النتائج في الصفحة (افتراضي 20).
- **الاستجابة 200**:
  - `items`: مصفوفة منتجات.
  - `meta`: `total`, `page`, `limit`, `hasNextPage`.

#### GET `/api/v1/products/:id`

- **الوصف**: جلب تفاصيل منتج واحد مع العروض ذات الصلة.
- **الاستجابة 200**:
  - بيانات المنتج.
  - `offers`: قائمة بالعروض المنطبقة عليه (إن وجدت).
  - `relatedProducts`: منتجات ذات صلة.

#### POST `/api/v1/products` (لوحة التحكم – يتطلب دور أدمن)

- **الوصف**: إنشاء منتج جديد.
- **Body**:
  - `name`, `description`, `category`, `price`, `discount_price?`, `weight?`, `gallon_capacity?`, `stock_quantity`, `sku`, `images`.
- **الاستجابة 201**: المنتج بعد الإنشاء.

#### PATCH `/api/v1/products/:id` (أدمن)

- تحديث أي من خصائص المنتج.

#### DELETE `/api/v1/products/:id` (أدمن)

- **الوصف**: تعطيل/حذف منتج (يفضّل جعل `is_active = false` بدل الحذف الفعلي).

---

### 2.2 العروض – `Offers`

#### GET `/api/v1/offers`

- **الوصف**: قائمة العروض النشطة.
- **بارامترات اختيارية**:
  - `type`, `productId`.

#### POST `/api/v1/offers` (أدمن)

- **الوصف**: إنشاء عرض جديد.
- **Body**:
  - `type`: `B1G1 | percentage | fixed_bundle_offer | second_item_for_1_sar`.
  - `discount_value`.
  - `productIds`: مصفوفة معرفات المنتجات المشمولة.
  - `start_date`, `end_date`.

#### PATCH `/api/v1/offers/:id` (أدمن)

#### DELETE `/api/v1/offers/:id` (أدمن)

---

## 3. السلة والدفع (Cart & Checkout)

> يمكن إدارة السلة على مستوى الـ Frontend (Local Storage) مع مزامنة اختيارية مع الباك إند، أو تخزينها للمستخدمين المسجلين. هنا نعرّف واجهة للسلة المدارة على الخادم للمستخدم المسجّل.

### 3.1 السلة – `Cart`

#### GET `/api/v1/cart` (يتطلب JWT)

- **الوصف**: جلب محتوى السلة للمستخدم الحالي.
- **الاستجابة**:
  - `items`: مصفوفة من:
    - `productId`, `name`, `unitPrice`, `quantity`, `lineTotal`, `appliedOffers`.
  - `summary`:
    - `subtotal`, `discounts`, `shippingFee`, `total`, `freeShippingApplied`.

#### POST `/api/v1/cart/items` (JWT)

- **الوصف**: إضافة منتج إلى السلة أو تحديث كميته.
- **Body**:
  - `productId`, `quantity`.

#### PATCH `/api/v1/cart/items/:productId` (JWT)

- **الوصف**: تعديل كمية منتج في السلة.

#### DELETE `/api/v1/cart/items/:productId` (JWT)

- **الوصف**: إزالة منتج من السلة.

---

### 3.2 إتمام الطلب – `Checkout & Orders`

#### POST `/api/v1/checkout` (JWT)

- **الوصف**: بدء عملية إتمام الطلب وإنشاء طلب وتهيئة Session دفع.
- **Body**:
  - `shippingAddressId`.
  - `shippingMethodId`.
  - `paymentMethod`: `mada | visa | apple_pay | tamara`.
- **الاستجابة 201**:
  - `orderId`.
  - `paymentSessionUrl` أو بيانات الدفع (حسب مزود البوابة).

#### Webhook `/api/v1/payments/webhook`

- **الوصف**: يستقبل إشعارات الدفع من Moyasar/Tap/Tamara لتحديث:
  - حالة الدفع (`payment_status`).
  - حالة الطلب (مثلاً من `pending` إلى `paid`).

#### GET `/api/v1/orders` (JWT)

- **الوصف**: جلب قائمة طلبات المستخدم.

#### GET `/api/v1/orders/:id` (JWT)

- **الوصف**: جلب تفاصيل طلب واحد للمستخدم.

#### مسارات الإدارة – `Admin Orders`

- `GET /api/v1/admin/orders` مع فلاتر حسب الحالة وطرق الدفع ونوع العميل.
- `PATCH /api/v1/admin/orders/:id/status` لتحديث الحالة (جديد، قيد التغليف، مشحون، مكتمل…).

---

## 4. طلبات الطباعة الخاصة (B2B Printing Requests)

### 4.1 واجهات العميل (Frontend)

#### POST `/api/v1/printing-requests`

- **الوصف**: إنشاء طلب طباعة جديد.
- **Body**:
  - `business_name`.
  - `business_type`.
  - `is_existing_customer` (اختياري).
  - `contact_person`.
  - `phone`.
  - `email`.
  - `product_type`.
  - `expected_quantity`.
  - `notes`.
  - `logo_url` أو رفع ملف عبر مسار رفع مستقل.

#### GET `/api/v1/printing-requests` (JWT – لعرض طلبات عميل B2B)

- **الوصف**: قائمة طلبات الطباعة الخاصة بالعميل المسجّل.

---

### 4.2 واجهات الإدارة (Admin)

#### GET `/api/v1/admin/printing-requests`

- فلاتر حسب:
  - `status`: `new | under_review | quoted | approved | rejected | completed`.
  - `dateFrom`, `dateTo`.

#### GET `/api/v1/admin/printing-requests/:id`

#### PATCH `/api/v1/admin/printing-requests/:id`

- **Body**:
  - تحديث `status`.
  - `quoted_price`.
  - `internal_notes`.

---

## 5. اشتراكات / طلبات المياه (Water_Subscription)

### 5.1 للمستخدم النهائي

#### POST `/api/v1/water-subscriptions`

- **الوصف**: إنشاء اشتراك/طلب متكرر للمياه.
- **Body**:
  - `type`: `one_time | monthly`.
  - `quantity_per_order`.
  - `frequency`: `weekly | monthly`.
  - `addressId`.

#### GET `/api/v1/water-subscriptions` (JWT)

#### PATCH `/api/v1/water-subscriptions/:id` (JWT)

#### PATCH `/api/v1/water-subscriptions/:id/status` (JWT)

- تحديث الحالة إلى `paused` أو `cancelled`.

---

## 6. المستخدمون والحسابات (Auth & Users)

### 6.1 مصادقة المستخدمين (Customers)

#### POST `/api/v1/auth/register`

- **Body**:
  - `name`, `email`, `phone`, `password`.
  - `is_business?`, `business_name?`, `cr_number?`.

#### POST `/api/v1/auth/login`

- **Body**:
  - `email_or_phone`, `password`.
- **الاستجابة**:
  - `accessToken`, `refreshToken`, `user`.

#### GET `/api/v1/auth/me` (JWT)

#### POST `/api/v1/auth/refresh`

#### POST `/api/v1/auth/logout`

---

### 6.2 عناوين الشحن – `Addresses`

#### GET `/api/v1/addresses` (JWT)

#### POST `/api/v1/addresses` (JWT)

- **Body**:
  - `city`, `district`, `street`, `building_no`, `additional_info?`, `is_default?`.

#### PATCH `/api/v1/addresses/:id` (JWT)

#### DELETE `/api/v1/addresses/:id` (JWT)

---

## 7. إدارة المحتوى (CMS) – الهيدر، السلايدر، الصفحات الثابتة

### 7.1 محتوى الصفحة الرئيسية

#### GET `/api/v1/cms/home`

- **الوصف**: جلب إعدادات الهيرو، السلايدر، أقسام الملخص، إلخ.

#### PATCH `/api/v1/admin/cms/home` (أدمن)

- **Body (مثال)**:
  - `hero`: عنوان، نص، صور، CTA.
  - `banners`: قائمة بنرات مع روابط.
  - `maintenance_mode`: boolean.
  - `seasonal_offer`: بيانات العرض الحالي.

### 7.2 الصفحات الثابتة

#### GET `/api/v1/cms/pages/:slug`

- أمثلة `slug`: `about`, `shipping-policy`, `privacy-policy`, `terms`, `contact`.

#### PATCH `/api/v1/admin/cms/pages/:slug` (أدمن)

- تحديث محتوى الصفحة (Markdown / HTML خاضع للفلترة).

---

## 8. تحليلات ولوحة الإدارة (Admin Analytics)

### 8.1 إحصائيات المبيعات

#### GET `/api/v1/admin/analytics/sales`

- **Query**:
  - `range`: `daily | weekly | monthly`.
  - `from`, `to`.
- **الاستجابة**:
  - بيانات جاهزة للرسم البياني (تواريخ + قيم).

### 8.2 المنتجات الأكثر مبيعاً

#### GET `/api/v1/admin/analytics/top-products`

- **Query**:
  - `limit` (افتراضي 10).

---

## 9. ملاحظات للتنفيذ في NestJS

- إنشاء Modules رئيسية:
  - `ProductsModule`, `OffersModule`, `CartModule`, `OrdersModule`, `PrintingRequestsModule`, `WaterSubscriptionsModule`, `AuthModule`, `UsersModule`, `AddressesModule`, `CmsModule`, `AnalyticsModule`.
- لكل Module:
  - `Controller` للمسارات.
  - `Service` للمنطق.
  - `Repository`/`PrismaService` للوصول للبيانات.
- استخدام Guards:
  - `JwtAuthGuard` للمسارات المحمية.
  - `RolesGuard` لمسارات الأدمن.

> بعد هذا التصميم، يمكننا في الخطوة التالية إنشاء ملف `schema.prisma` (أو Entities لـ TypeORM) مطابقاً لنموذج البيانات، ثم توليد Modules وControllers في NestJS تباعاً.

