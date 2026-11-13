"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: "/", label: "ورزش‌ها" },
    { href: "/subscription", label: "اشتراک" },
    { href: "/bmi", label: "محاسبه BMI" },
  ];
  if (user) {
    links.push({ href: "/plan-request", label: "درخواست برنامه" });
    links.push({ href: "/plans", label: "برنامه‌های من" });
    links.push({ href: "/rewards", label: "جایزه‌ها" });
  }
  if (user?.role === "admin") {
    links.push({ href: "/admin", label: "پنل ادمین" });
  }

  const isActive = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <header className="border-b border-line bg-surface/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-xl font-extrabold tracking-wide">
          Gyma<span className="text-brand">X</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-1 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-1.5 transition ${
                isActive(link.href) ? "bg-brand text-white" : "text-muted hover:bg-surface2 hover:text-fg"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          {loading ? null : user ? (
            <>
              {user.subscription ? (
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300">
                  اشتراک فعال
                </span>
              ) : (
                <Link
                  href="/subscription"
                  className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-300 hover:bg-amber-500/25"
                >
                  بدون اشتراک
                </Link>
              )}
              <span className="rounded-full bg-brand/15 px-3 py-1 text-xs font-medium text-sky-300">
                {user.xp?.balance ?? 0} XP
              </span>
              <span className="hidden text-muted sm:inline">{user.name}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg bg-surface2 px-3 py-1.5 text-muted hover:bg-line hover:text-fg"
              >
                خروج
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-lg px-3 py-1.5 text-muted hover:bg-surface2 hover:text-fg">
                ورود
              </Link>
              <Link href="/register" className="rounded-lg bg-brand px-3 py-1.5 font-medium text-white hover:bg-brand-dark">
                ثبت‌نام
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
