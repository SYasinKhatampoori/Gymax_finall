const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** ارقام فارسی و عربی رو به انگلیسی تبدیل می‌کنه (کاربر ممکنه با کیبورد فارسی بنویسه) */
export function toLatinDigits(value) {
  return String(value ?? "")
    .replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)));
}

/** فقط رقم‌ها رو نگه می‌داره، با حداکثر طول */
export function digitsOnly(value, max = 99) {
  return toLatinDigits(value).replace(/\D/g, "").slice(0, max);
}

/** 123456789012 → "1234 5678 9012" */
export function groupDigits(value) {
  return digitsOnly(value, 12).replace(/(\d{4})(?=\d)/g, "$1 ");
}

/** 99000 → "99,000 تومان" */
export function formatPrice(amount) {
  return `${Number(amount ?? 0).toLocaleString("en-US")} تومان`;
}

export function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("fa-IR");
}
