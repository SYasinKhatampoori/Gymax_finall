const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api").replace(/\/+$/, "");

const TOKEN_KEY = "gymax_token";

export function getToken() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  if (typeof window === "undefined") return;
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // اگه مرورگر localStorage رو بسته باشه، فقط لاگین ماندگار نمی‌شه
  }
}

export class ApiError extends Error {
  constructor(message, status, errors = {}, code = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors; // خطاهای اعتبارسنجی لاراول
    this.code = code; // مثلاً subscription_required
  }
}

/**
 * همه‌ی درخواست‌ها به لاراول از همین تابع رد می‌شن.
 * options: { method, body, query }  (body می‌تونه آبجکت JSON یا FormData باشه)
 */
export async function api(path, options = {}) {
  const { method = "GET", body, query } = options;

  let url = `${BASE}${path.startsWith("/") ? path : `/${path}`}`;
  if (query) {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") qs.set(key, String(value));
    }
    const text = qs.toString();
    if (text) url += `?${text}`;
  }

  const headers = { Accept: "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  // برای آپلود فایل (FormData) مرورگر خودش Content-Type رو با boundary درست می‌ذاره
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  if (body !== undefined && !isForm) headers["Content-Type"] = "application/json";

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    throw new ApiError("ارتباط با سرور برقرار نشد. مطمئن شو php artisan serve روشنه.", 0);
  }

  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    // توکن نامعتبر یا منقضی: کاربر رو از حالت لاگین خارج می‌کنیم
    if (response.status === 401 && token) {
      setToken(null);
      window.dispatchEvent(new Event("auth:logout"));
    }
    const err = data ?? {};
    throw new ApiError(
      err.message ?? `خطای ناشناخته (${response.status})`,
      response.status,
      err.errors ?? {},
      err.code ?? null,
    );
  }

  return data;
}

/** یه متن قابل نمایش از هر خطایی می‌سازه (خطاهای اعتبارسنجی لاراول رو هم جمع می‌کنه) */
export function errorMessage(error) {
  if (error instanceof ApiError) {
    if (error.status === 404) return "مورد درخواستی پیدا نشد.";
    const messages = Object.values(error.errors).flat();
    return messages.length > 0 ? messages.join(" • ") : error.message;
  }
  return error instanceof Error ? error.message : "خطای ناشناخته";
}
