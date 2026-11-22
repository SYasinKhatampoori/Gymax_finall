# GymaX 🏋️

سایت آموزش ورزش و برنامه تمرینی با تم دارک و آبی.
بک‌اند با **Laravel (API)** و فرانت با **Next.js (JSX)**.

> ⚠️ پرداخت‌ها **آزمایشی** هستن و هیچ پول واقعی جابه‌جا نمی‌شه. قبل از انتشار واقعی باید درگاه واقعی جایگزین بشه.

## قابلیت‌ها

- ورزش‌ها و حرکت‌ها همراه با عضلات درگیر و امتیاز (XP)
- **فیلم حرکت‌ها فقط برای مشترک‌ها** (و ادمین). ویدیوهای آپلودی خصوصی‌ان و با لینک امضاشده‌ی موقت پخش می‌شن. لینک آپارات/یوتیوب هم پشتیبانی می‌شه.
- **اشتراک** (۳۰ روزه، ۹۰ روزه، ۳۶۵ روزه)
- **درخواست برنامه تمرینی**: رایگان با اشتراک فعال، وگرنه با پرداخت آزمایشی
- برنامه‌ی نوشته‌شده توسط ادمین؛ با انجام هر حرکت، XP آن حرکت به کاربر می‌رسه
- **فروشگاه جایزه** با XP (مثل کراتین و ست ورزشی)، با فرم آدرس، موجودی انبار و پیگیری سفارش
- **پرداخت آزمایشی**: کارت ۱۶ رقمی + کد ۶ رقمی؛ هر عددی با همین تعداد رقم قبول می‌شه. شماره کارت و کد ذخیره نمی‌شن (فقط ۴ رقم آخر).
- نظرها با پاسخ ادمین
- ماشین‌حساب BMI
- **پنل ادمین**: داشبورد، مدیریت کاربران (ادمین کردن/برداشتن)، درخواست‌های برنامه، نظرها، ورزش‌ها، حرکت‌ها (با آپلود ویدیو)، عضله‌ها، جایزه‌ها و سفارش‌ها، پرداخت‌ها
- فونت وزیرمتن، راست‌چین (RTL)

## ساختار پروژه

```
gymax-api/   بک‌اند Laravel (API)
gymax-web/   فرانت Next.js (JSX، Tailwind v4)
```

`gymax-api` فقط شامل فایل‌هایی (`app`، `config`، `database`، `routes`) است که روی یک پروژه‌ی تازه‌ی لاراول قرار می‌گیرن.

## پیش‌نیازها

- PHP 8.2+ و Composer
- Node.js 18.18+ (ترجیحاً 20+) و npm
- MySQL (یا SQLite که پیش‌فرض لاراوله)

## راه‌اندازی بک‌اند

```bash
composer create-project laravel/laravel gymax-live
cd gymax-live
php artisan install:api      # اگه پرسید migrate بزنم؟ no
```

محتوای پوشه‌های `app`، `config`، `database` و `routes` از `gymax-api` رو داخل پروژه کپی کن (با جایگزینی فایل‌ها). بعد:

```bash
php artisan migrate:fresh --seed
php artisan serve
```

API روی `http://127.0.0.1:8000/api` بالا می‌آد. تست: `http://127.0.0.1:8000/api/sports`

### استفاده از MySQL

دیتابیس خالی (مثلاً `gymax` با `utf8mb4_unicode_ci`) بساز و توی `.env` بذار:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gymax
DB_USERNAME=root
DB_PASSWORD=
```

سپس `php artisan config:clear` و `php artisan migrate:fresh --seed`.
اگه خطای `could not find driver` دیدی، توی `php.ini` خط `extension=pdo_mysql` رو فعال کن.

### آپلود ویدیو

در `php.ini` مقدار `upload_max_filesize` و `post_max_size` رو حداقل `100M` کن (سقف پروژه ۱۰۰ مگابایت، فرمت‌های mp4/webm/mov).

### تنظیمات پرداخت

قیمت درخواست برنامه (برای کاربر بدون اشتراک) توی `config/gymax.php` با کلید `plan_price` (تومان) تنظیم می‌شه.

## راه‌اندازی فرانت

```bash
cd gymax-web
npm install
npm run dev
```

سایت روی `http://localhost:3000` بالا می‌آد. آدرس API توی `gymax-web/.env.local`:

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

اگه فرانت روی دامنه‌ی دیگه‌ای باشه و خطای CORS دیدی، `config/cors.php` رو بررسی کن.

## حساب‌های نمونه (بعد از seed)

| نقش | ایمیل | رمز |
|---|---|---|
| ادمین | `admin@gymax.test` | `password` |
| کاربر | `user@gymax.test` | `password` |

**قبل از انتشار حتماً رمزها رو عوض کن.**

برای ادمین کردن یک کاربر دیگر: از پنل ادمین، بخش «کاربران». (نقش خودت رو نمی‌تونی عوض کنی.)

## نمای کلی API

همه‌ی درخواست‌ها با هدر `Accept: application/json`. احراز هویت با توکن Bearer (Laravel Sanctum).

| دسته | مسیرها |
|---|---|
| عمومی | `POST /register`، `POST /login`، `GET /sports`، `GET /sports/{slug}`، `GET /exercises/{id}`، `GET /exercises/{id}/comments`، `POST /bmi`، `GET /subscription-plans`، `GET /rewards` |
| کاربر | `GET /me`، `POST /logout`، `GET /exercises/{id}/video` (فقط مشترک)، `POST /exercises/{id}/comments`، `GET /subscription`، `POST /subscription/checkout`، `GET/POST /plan-requests`، `GET /plans`، `POST /plan-items/{id}/complete`، `GET /xp`، `POST /rewards/{id}/redeem`، `GET /reward-orders` |
| ادمین (`/admin/...`) | ورزش‌ها، عضله‌ها، حرکت‌ها، `upload/video`، درخواست‌های برنامه و نوشتن برنامه، نظرها و پاسخ، کاربران و `PUT users/{id}/role`، جایزه‌ها، سفارش‌ها، پرداخت‌ها |

اگه کاربر بدون اشتراک ویدیو رو بخواد، پاسخ `403` با `code: subscription_required` برمی‌گرده.

## دیپلوی

راهنمای هاست رایگان (InfinityFree) توی `DEPLOY-INFINITYFREE.md` هست. هاست‌های رایگان محدودیت دارن (بدون SSH، سقف آپلود کم، چالش ضدربات)، پس برای پروژه‌ی جدی یه هاست یا VPS واقعی بهتره.

## تکنولوژی‌ها

Laravel · Sanctum · MySQL/SQLite · Next.js 15 (App Router) · React 19 · Tailwind CSS v4 · وزیرمتن

## لایسنس

یکی انتخاب کن (مثلاً MIT) و فایل `LICENSE` اضافه کن.
