"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useApi } from "@/lib/hooks";
import { formatDate } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/labels";
import RequireAuth from "@/components/RequireAuth";
import { Alert, Badge, Button, Card, EmptyState, Field, Input, Loading, Modal, PageHeader, Textarea } from "@/components/ui";

export default function RewardsPage() {
  return (
    <RequireAuth>
      <RewardsContent />
    </RequireAuth>
  );
}

const orderTone = { pending: "amber", sent: "green", cancelled: "red" };

function RewardsContent() {
  const { user, refresh } = useAuth();
  const rewards = useApi("/rewards");
  const orders = useApi("/reward-orders");

  const [target, setTarget] = useState(null);
  const [form, setForm] = useState({ full_name: "", phone: "", address: "" });
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState(null);
  const [toast, setToast] = useState(null);

  const balance = user?.xp?.balance ?? 0;

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  function open(reward) {
    setTarget(reward);
    setFormError(null);
    setForm((prev) => ({ ...prev, full_name: prev.full_name || user?.name || "" }));
  }

  async function redeem(e) {
    e.preventDefault();
    setSending(true);
    setFormError(null);
    try {
      await api(`/rewards/${target.id}/redeem`, { method: "POST", body: form });
      setToast(`سفارش «${target.name}» ثبت شد.`);
      setTarget(null);
      await refresh();
      rewards.reload();
      orders.reload();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="فروشگاه جایزه"
        subtitle="با امتیازهایی که از انجام حرکت‌های برنامه‌ات گرفتی، جایزه بخر."
        actions={<Badge tone="blue">موجودی امتیاز: {balance} XP</Badge>}
      />

      {toast && <Alert kind="success">{toast}</Alert>}

      {rewards.loading && !rewards.data ? (
        <Loading />
      ) : rewards.error ? (
        <Alert>{rewards.error}</Alert>
      ) : rewards.data && rewards.data.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rewards.data.map((reward) => {
            const soldOut = reward.stock < 1;
            const missing = reward.xp_cost - balance;
            return (
              <Card key={reward.id} className="flex flex-col gap-3">
                {reward.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={reward.image} alt={reward.name} className="h-36 w-full rounded-xl object-cover" />
                ) : (
                  <div className="flex h-36 items-center justify-center rounded-xl bg-surface2 text-5xl">🎁</div>
                )}
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-bold">{reward.name}</h2>
                  <Badge tone="blue">{reward.xp_cost} XP</Badge>
                </div>
                {reward.description && <p className="text-sm leading-7 text-muted">{reward.description}</p>}
                <p className="text-xs text-muted">{soldOut ? "ناموجود" : `${reward.stock} عدد موجود`}</p>

                <div className="mt-auto">
                  <Button className="w-full" disabled={soldOut || missing > 0} onClick={() => open(reward)}>
                    {soldOut ? "ناموجود" : missing > 0 ? `${missing} امتیاز کم داری` : "دریافت با امتیاز"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState>فعلاً جایزه‌ای در فروشگاه نیست.</EmptyState>
      )}

      {balance === 0 && (
        <Alert kind="info">
          هنوز امتیازی نداری. توی{" "}
          <Link href="/plans" className="font-medium underline">
            برنامه‌های من
          </Link>{" "}
          حرکت‌هایی که انجام دادی رو ثبت کن تا امتیاز بگیری.
        </Alert>
      )}

      <section className="space-y-3">
        <h2 className="text-xl font-bold">سفارش‌های من</h2>
        {orders.loading && !orders.data ? (
          <Loading />
        ) : orders.data && orders.data.length > 0 ? (
          <ul className="space-y-2">
            {orders.data.map((order) => (
              <li key={order.id}>
                <Card className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                  <div>
                    <span className="font-medium">{order.reward?.name ?? "جایزه"}</span>
                    <span className="ms-2 text-muted">{order.xp_spent} XP · {formatDate(order.created_at)}</span>
                  </div>
                  <Badge tone={orderTone[order.status] ?? "slate"}>
                    {ORDER_STATUS_LABELS[order.status] ?? order.status}
                  </Badge>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState>هنوز سفارشی ثبت نکردی.</EmptyState>
        )}
      </section>

      <Modal open={Boolean(target)} title={target ? `دریافت «${target.name}»` : ""} onClose={() => setTarget(null)}>
        {target && (
          <form onSubmit={redeem} className="space-y-4">
            <p className="text-sm text-muted">
              {target.xp_cost} امتیاز از موجودی‌ت کم می‌شه. اطلاعات ارسال رو وارد کن:
            </p>
            <Field label="نام و نام خانوادگی گیرنده">
              <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
            </Field>
            <Field label="شماره تماس">
              <Input
                dir="ltr"
                inputMode="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </Field>
            <Field label="آدرس کامل">
              <Textarea rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
            </Field>

            {formError && <Alert>{formError}</Alert>}

            <div className="flex gap-2">
              <Button type="submit" loading={sending}>
                ثبت سفارش
              </Button>
              <Button variant="ghost" onClick={() => setTarget(null)}>
                انصراف
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
