"use client";

import { useState } from "react";
import Link from "next/link";
import { api, errorMessage } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import { formatDate, formatPrice } from "@/lib/format";
import { LEVEL_LABELS, PAID_VIA_LABELS, STATUS_LABELS } from "@/lib/labels";
import RequireAuth from "@/components/RequireAuth";
import PaymentFields, { emptyPayment, paymentPayload, validatePayment } from "@/components/PaymentFields";
import { Alert, Badge, Button, Card, EmptyState, Field, Input, Loading, PageHeader, Select, Textarea } from "@/components/ui";

export default function PlanRequestPage() {
  return (
    <RequireAuth>
      <PlanRequestContent />
    </RequireAuth>
  );
}

function PlanRequestContent() {
  const requests = useApi("/plan-requests");
  const info = useApi("/subscription");

  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState("beginner");
  const [days, setDays] = useState("3");
  const [notes, setNotes] = useState("");
  const [pay, setPay] = useState(emptyPayment);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState(false);

  const hasSubscription = Boolean(info.data?.subscription);
  const price = info.data?.plan_request_price ?? 0;

  async function submit(e) {
    e.preventDefault();
    setFormError(null);
    setSuccess(false);

    if (!hasSubscription) {
      const problem = validatePayment(pay);
      if (problem) {
        setFormError(problem);
        return;
      }
    }

    setSending(true);
    try {
      await api("/plan-requests", {
        method: "POST",
        body: {
          goal,
          level,
          days_per_week: Number(days),
          notes,
          ...(hasSubscription ? {} : paymentPayload(pay)),
        },
      });
      setGoal("");
      setNotes("");
      setPay(emptyPayment);
      setSuccess(true);
      requests.reload();
      info.reload();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <PageHeader
          title="درخواست برنامه تمرینی"
          subtitle="شرایط و هدفت رو بنویس. یکی از مربی‌ها برنامه‌ی مخصوص خودت رو می‌نویسه."
        />

        {info.loading && !info.data ? (
          <Loading />
        ) : (
          <Card className="space-y-4">
            {hasSubscription ? (
              <Alert kind="success">اشتراک فعال داری، پس این درخواست برات رایگانه.</Alert>
            ) : (
              <Alert kind="warning">
                اشتراک فعال نداری، پس برای هر برنامه {formatPrice(price)} هزینه‌ی جداگانه داره.{" "}
                <Link href="/subscription" className="font-medium underline">
                  با خرید اشتراک رایگان می‌شه
                </Link>
              </Alert>
            )}

            <form onSubmit={submit} className="space-y-4">
              <Field label="هدف تمرین">
                <Input
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="مثلاً افزایش حجم عضلانی یا کاهش وزن"
                  required
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="سطح آمادگی">
                  <Select value={level} onChange={(e) => setLevel(e.target.value)}>
                    {Object.keys(LEVEL_LABELS).map((key) => (
                      <option key={key} value={key}>
                        {LEVEL_LABELS[key]}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="چند روز در هفته؟">
                  <Select value={days} onChange={(e) => setDays(e.target.value)}>
                    {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                      <option key={n} value={n}>
                        {n} روز
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <Field label="توضیحات و شرایط" hint="مثلاً مشکل زانو، دسترسی به باشگاه یا وسایل خونگی، ساعت تمرین...">
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
              </Field>

              {!hasSubscription && <PaymentFields value={pay} onChange={setPay} />}

              {formError && <Alert>{formError}</Alert>}
              {success && (
                <Alert kind="success">
                  درخواستت ثبت شد. بعد از نوشته شدن برنامه، توی «برنامه‌های من» می‌بینیش.
                </Alert>
              )}

              <Button type="submit" loading={sending}>
                {hasSubscription ? "ارسال درخواست" : `پرداخت (${formatPrice(price)})`}
              </Button>
            </form>
          </Card>
        )}
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold">درخواست‌های قبلی من</h2>

        {requests.loading && !requests.data ? (
          <Loading />
        ) : requests.error ? (
          <Alert>{requests.error}</Alert>
        ) : requests.data && requests.data.length > 0 ? (
          <ul className="space-y-3">
            {requests.data.map((r) => (
              <li key={r.id}>
                <Card className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{r.goal}</span>
                    <Badge tone={r.status === "done" ? "green" : "amber"}>{STATUS_LABELS[r.status]}</Badge>
                  </div>
                  <p className="text-sm text-muted">
                    {LEVEL_LABELS[r.level]} · {r.days_per_week} روز در هفته · {formatDate(r.created_at)}
                  </p>
                  <p className="text-xs text-muted">{PAID_VIA_LABELS[r.paid_via] ?? ""}</p>
                  {r.notes && <p className="text-sm text-muted">{r.notes}</p>}
                  {r.status === "done" && (
                    <Link href="/plans" className="inline-block text-sm font-medium text-brand hover:underline">
                      دیدن برنامه ←
                    </Link>
                  )}
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState>هنوز درخواستی نفرستادی.</EmptyState>
        )}
      </div>
    </div>
  );
}
