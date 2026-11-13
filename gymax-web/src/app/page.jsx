"use client";

import Link from "next/link";
import { useApi } from "@/lib/hooks";
import { Alert, Card, EmptyState, Loading } from "@/components/ui";

const features = [
  {
    icon: "🎬",
    title: "فیلم آموزشی حرکت‌ها",
    text: "فیلم تک‌تک حرکت‌ها همراه با عضلات درگیر و طریقه‌ی درست انجام، مخصوص مشترک‌ها.",
  },
  {
    icon: "📋",
    title: "برنامه‌ی تمرینی شخصی",
    text: "هدفت رو بنویس تا مربی برنامه‌ی مخصوص خودت رو بنویسه. مشترک‌ها بدون پرداخت جدا.",
  },
  {
    icon: "🏆",
    title: "امتیاز و جایزه",
    text: "با انجام هر حرکت از برنامه‌ات امتیاز بگیر و با امتیازها کراتین، ست ورزشی و ... بخر.",
  },
];

export default function HomePage() {
  const { data: sports, loading, error } = useApi("/sports");

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl border border-line bg-surface px-6 py-12 sm:px-12">
        <div className="pointer-events-none absolute -start-24 -top-24 h-72 w-72 rounded-full bg-brand/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -end-16 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative">
          <h1 className="text-3xl font-bold leading-relaxed sm:text-4xl">
            تمرین درست، <span className="text-brand">نتیجه‌ی بهتر</span>
          </h1>
          <p className="mt-3 max-w-2xl leading-8 text-muted">
            حرکت‌های هر ورزش رو یاد بگیر، BMI خودت رو حساب کن و از مربی‌ها برنامه‌ی تمرینی شخصی بخواه. با انجام هر
            حرکت امتیاز بگیر و با امتیازها جایزه بخر.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/subscription" className="rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-dark">
              دیدن بسته‌های اشتراک
            </Link>
            <Link href="/plan-request" className="rounded-lg bg-surface2 px-5 py-2.5 text-sm font-medium hover:bg-line">
              درخواست برنامه تمرینی
            </Link>
            <Link href="/bmi" className="rounded-lg px-5 py-2.5 text-sm font-medium text-muted ring-1 ring-line hover:text-fg">
              محاسبه BMI
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {features.map((f) => (
          <Card key={f.title} className="space-y-2">
            <span className="text-3xl">{f.icon}</span>
            <h3 className="font-bold">{f.title}</h3>
            <p className="text-sm leading-7 text-muted">{f.text}</p>
          </Card>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">ورزش‌ها</h2>

        {loading ? (
          <Loading />
        ) : error ? (
          <Alert>{error}</Alert>
        ) : sports && sports.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sports.map((sport) => (
              <Link
                key={sport.id}
                href={`/sports/${sport.slug}`}
                className="group overflow-hidden rounded-2xl border border-line bg-surface transition hover:-translate-y-0.5 hover:border-brand/60"
              >
                {sport.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={sport.image} alt={sport.name} className="h-40 w-full object-cover" />
                ) : (
                  <div className="flex h-40 items-center justify-center bg-surface2 text-5xl">🏋️</div>
                )}
                <div className="space-y-2 p-5">
                  <h3 className="text-lg font-bold group-hover:text-brand">{sport.name}</h3>
                  {sport.description && (
                    <p className="line-clamp-3 text-sm leading-7 text-muted">{sport.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState>هنوز ورزشی اضافه نشده. ادمین می‌تونه از پنل ادمین ورزش اضافه کنه.</EmptyState>
        )}
      </section>
    </div>
  );
}
