"use client";

import { useState } from "react";
import Link from "next/link";
import { api, errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useApi } from "@/lib/hooks";
import { formatDate, formatPrice } from "@/lib/format";
import { PAYMENT_TYPE_LABELS } from "@/lib/labels";
import PaymentFields, { emptyPayment, paymentPayload, validatePayment } from "@/components/PaymentFields";
import { Alert, Badge, Button, Card, EmptyState, Loading, PageHeader } from "@/components/ui";

export default function SubscriptionPage() {
  const { user, refresh } = useAuth();
  const { data: plans, loading, error } = useApi("/subscription-plans");
  const info = useApi(user ? "/subscription" : null);

  const [selected, setSelected] = useState(null);
  const [pay, setPay] = useState(emptyPayment);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState(null);
  const [receipt, setReceipt] = useState(null);

  const current = info.data?.subscription ?? null;
  const payments = info.data?.payments ?? [];

  async function checkout(e) {
    e.preventDefault();
    setPayError(null);

    const problem = validatePayment(pay);
    if (problem) {
      setPayError(problem);
      return;
    }

    setPaying(true);
    try {
      const res = await api("/subscription/checkout", {
        method: "POST",
        body: { subscription_plan_id: selected.id, ...paymentPayload(pay) },
      });
      setReceipt({ ...res.payment, planName: selected.name });
      setSelected(null);
      setPay(emptyPayment);
      await refresh();
      info.reload();
    } catch (err) {
      setPayError(errorMessage(err));
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="اشتراک GymaX"
        subtitle="با اشتراک فیلم همه‌ی حرکت‌ها رو ببین و برنامه‌ی تمرینی رو بدون پرداخت جدا بگیر."
      />

      {receipt && (
        <Alert kind="success">
          پرداخت آزمایشی انجام شد و «{receipt.planName}» فعال شد. مبلغ: {formatPrice(receipt.amount)} · کد پیگیری:{" "}
          <span dir="ltr">{receipt.reference}</span>
        </Alert>
      )}

      {user && current && (
        <Card className="flex flex-wrap items-center justify-between gap-3 border-emerald-500/30">
          <div>
            <p className="text-sm text-muted">اشتراک فعال شما</p>
            <p className="mt-1 text-lg font-bold">{current.plan ?? "اشتراک"}</p>
          </div>
          <div className="text-end text-sm">
            <p>تا {formatDate(current.ends_at)}</p>
            <Badge tone="green">{current.days_left} روز مونده</Badge>
          </div>
        </Card>
      )}

      {loading ? (
        <Loading />
      ) : error ? (
        <Alert>{error}</Alert>
      ) : plans && plans.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => {
            const best = plan.days >= 365;
            return (
              <Card
                key={plan.id}
                className={`flex flex-col gap-4 ${best ? "border-brand/70 ring-1 ring-brand/40" : ""}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg font-bold">{plan.name}</h2>
                  {best && <Badge tone="blue">به‌صرفه‌ترین</Badge>}
                </div>
                <p className="text-3xl font-extrabold">{formatPrice(plan.price)}</p>
                <ul className="space-y-1.5 text-sm text-muted">
                  <li>✓ {plan.days} روز دسترسی</li>
                  <li>✓ فیلم آموزشی همه‌ی حرکت‌ها</li>
                  <li>✓ درخواست برنامه‌ی تمرینی بدون پرداخت جدا</li>
                </ul>
                <div className="mt-auto">
                  {user ? (
                    <Button
                      className="w-full"
                      variant={selected?.id === plan.id ? "secondary" : "primary"}
                      onClick={() => {
                        setSelected(plan);
                        setPayError(null);
                        setReceipt(null);
                      }}
                    >
                      {current ? "تمدید این بسته" : "خرید این بسته"}
                    </Button>
                  ) : (
                    <Link
                      href="/login?next=/subscription"
                      className="block rounded-lg bg-brand px-4 py-2 text-center text-sm font-medium text-white hover:bg-brand-dark"
                    >
                      برای خرید وارد شو
                    </Link>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState>هنوز بسته‌ای تعریف نشده.</EmptyState>
      )}

      {user && selected && (
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold">پرداخت: {selected.name}</h2>
            <span className="text-lg font-bold text-brand">{formatPrice(selected.price)}</span>
          </div>

          <form onSubmit={checkout} className="space-y-4">
            <PaymentFields value={pay} onChange={setPay} />

            {payError && <Alert>{payError}</Alert>}

            <div className="flex gap-2">
              <Button type="submit" loading={paying}>
                پرداخت آزمایشی
              </Button>
              <Button variant="ghost" onClick={() => setSelected(null)}>
                انصراف
              </Button>
            </div>
          </form>
        </Card>
      )}

      {user && payments.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold">تاریخچه‌ی پرداخت‌ها</h2>
          <ul className="space-y-2">
            {payments.map((p) => (
              <li key={p.id}>
                <Card className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                  <div>
                    <span className="font-medium">{PAYMENT_TYPE_LABELS[p.type] ?? p.type}</span>
                    <span className="ms-2 text-muted">{p.description}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted">
                    <span dir="ltr">{p.reference}</span>
                    <span>{formatDate(p.created_at)}</span>
                    <span className="font-medium text-fg">{formatPrice(p.amount)}</span>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
