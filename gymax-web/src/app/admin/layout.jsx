"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import RequireAuth from "@/components/RequireAuth";

const tabs = [
  { href: "/admin", label: "داشبورد" },
  { href: "/admin/users", label: "کاربران" },
  { href: "/admin/requests", label: "درخواست‌های برنامه" },
  { href: "/admin/comments", label: "نظرها" },
  { href: "/admin/sports", label: "ورزش‌ها" },
  { href: "/admin/exercises", label: "حرکت‌ها" },
  { href: "/admin/muscles", label: "عضلات" },
  { href: "/admin/rewards", label: "جایزه‌ها" },
  { href: "/admin/payments", label: "پرداخت‌ها" },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  return (
    <RequireAuth admin>
      <nav className="mb-8 flex flex-wrap gap-2 rounded-2xl border border-line bg-surface p-2">
        {tabs.map((tab) => {
          const active = tab.href === "/admin" ? pathname === "/admin" : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                active ? "bg-brand text-white" : "text-muted hover:bg-surface2 hover:text-fg"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      {children}
    </RequireAuth>
  );
}
