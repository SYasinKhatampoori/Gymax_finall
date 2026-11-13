"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ApiError, api, errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useApi } from "@/lib/hooks";
import RequireAuth from "@/components/RequireAuth";
import { Alert, Badge, Button, Card, EmptyState, Loading, PageHeader } from "@/components/ui";

export default function PlansPage() {
  return (
    <RequireAuth>
      <PlansContent />
    </RequireAuth>
  );
}

function groupByDay(items) {
  const map = new Map();
  for (const item of items) {
    map.set(item.day, [...(map.get(item.day) ?? []), item]);
  }
  return [...map.entries()].sort((a, b) => a[0] - b[0]);
}

function PlansContent() {
  const { user, refresh } = useAuth();
  const { data: plans, setData: setPlans, loading, error } = useApi("/plans");
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState(null);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  function markDone(itemId, xpAwarded) {
    setPlans((prev) =>
      prev
        ? prev.map((plan) => ({
            ...plan,
            items: plan.items?.map((item) =>
              item.id === itemId
                ? { ...item, completion: { id: 0, plan_item_id: itemId, xp_awarded: xpAwarded } }
                : item,
            ),
          }))
        : prev,
    );
  }

  async function complete(item) {
    setBusyId(item.id);
    setActionError(null);
    try {
      const res = await api(`/plan-items/${item.id}/complete`, { method: "POST" });
      markDone(item.id, res.xp_awarded);
      setToast(`آفرین! ${res.xp_awarded} امتیاز گرفتی 🎉`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        // قبلاً ثبت شده بوده
        markDone(item.id, item.exercise?.xp ?? 0);
      } else {
        setActionError(errorMessage(err));
      }
    } finally {
      setBusyId(null);
      refresh(); // امتیاز بالای سایت به‌روز بشه
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="برنامه‌های من"
        subtitle="هر حرکتی رو که انجام دادی تیک بزن تا امتیازش به حسابت اضافه بشه."
        actions={
          <div className="flex items-center gap-2">
            <Badge tone="blue">موجودی امتیاز: {user?.xp?.balance ?? 0} XP</Badge>
            <Link href="/rewards" className="text-sm font-medium text-brand hover:underline">
              خرید جایزه ←
            </Link>
          </div>
        }
      />

      {toast && <Alert kind="success">{toast}</Alert>}
      {actionError && <Alert>{actionError}</Alert>}

      {loading && !plans ? (
        <Loading />
      ) : error ? (
        <Alert>{error}</Alert>
      ) : plans && plans.length > 0 ? (
        <div className="space-y-8">
          {plans.map((plan) => {
            const items = plan.items ?? [];
            const done = items.filter((i) => i.completion).length;
            return (
              <Card key={plan.id} className="space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold">{plan.title}</h2>
                    {plan.note && <p className="mt-1 text-sm text-muted">{plan.note}</p>}
                  </div>
                  <Badge tone={done === items.length && items.length > 0 ? "green" : "slate"}>
                    {done} از {items.length} حرکت انجام شد
                  </Badge>
                </div>

                {groupByDay(items).map(([day, dayItems]) => (
                  <div key={day} className="space-y-2">
                    <h3 className="text-sm font-bold text-muted">روز {day}</h3>
                    <ul className="space-y-2">
                      {dayItems.map((item) => (
                        <li
                          key={item.id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface2 px-4 py-3"
                        >
                          <div>
                            <Link href={`/exercises/${item.exercise_id}`} className="font-medium hover:text-brand">
                              {item.exercise?.name ?? `حرکت ${item.exercise_id}`}
                            </Link>
                            <p className="text-sm text-muted">
                              {item.sets} ست × {item.reps} تکرار
                              {item.note ? ` · ${item.note}` : ""}
                            </p>
                          </div>

                          {item.completion ? (
                            <Badge tone="green">انجام شد · +{item.completion.xp_awarded} XP</Badge>
                          ) : (
                            <Button
                              loading={busyId === item.id}
                              onClick={() => complete(item)}
                              className="whitespace-nowrap"
                            >
                              انجام دادم (+{item.exercise?.xp ?? 0} XP)
                            </Button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState>
          هنوز برنامه‌ای برات نوشته نشده.{" "}
          <Link href="/plan-request" className="font-medium text-brand hover:underline">
            درخواست برنامه بده
          </Link>
        </EmptyState>
      )}
    </div>
  );
}
