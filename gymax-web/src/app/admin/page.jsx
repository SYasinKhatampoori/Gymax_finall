"use client";

import Link from "next/link";
import { useApi } from "@/lib/hooks";
import { Card, PageHeader } from "@/components/ui";

export default function AdminDashboard() {
  const users = useApi("/admin/users");
  const requests = useApi("/admin/plan-requests?status=pending");
  const comments = useApi("/admin/comments?unanswered=1");
  const orders = useApi("/admin/reward-orders");

  const count = (r) => (r.data ? r.data.length : "…");
  const pendingOrders = orders.data ? orders.data.filter((o) => o.status === "pending").length : "…";

  const cards = [
    { href: "/admin/requests", label: "درخواست برنامه‌ی در انتظار", value: count(requests) },
    { href: "/admin/comments", label: "نظر بدون پاسخ", value: count(comments) },
    { href: "/admin/rewards", label: "سفارش جایزه در انتظار", value: pendingOrders },
    { href: "/admin/users", label: "کل کاربران", value: count(users) },
  ];

  return (
    <div>
      <PageHeader title="پنل مدیریت" subtitle="خلاصه‌ی کارهایی که منتظر شما هستن." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.href} href={c.href}>
            <Card className="transition hover:border-brand/60">
              <p className="text-sm text-muted">{c.label}</p>
              <p className="mt-2 text-4xl font-extrabold text-brand">{c.value}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
