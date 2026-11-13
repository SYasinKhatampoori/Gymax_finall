"use client";

import { useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import { digitsOnly } from "@/lib/format";
import { formatDate } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/labels";
import { Alert, Badge, Button, Card, EmptyState, Field, Input, Loading, Modal, PageHeader, Select, Textarea } from "@/components/ui";

const empty = { name: "", description: "", image: "", xp_cost: "500", stock: "10", is_active: true };

export default function AdminRewardsPage() {
  const [tab, setTab] = useState("rewards");

  return (
    <div className="space-y-5">
      <PageHeader title="جایزه‌ها" />
      <div className="flex gap-2">
        <Button variant={tab === "rewards" ? "primary" : "secondary"} onClick={() => setTab("rewards")}>
          جایزه‌ها
        </Button>
        <Button variant={tab === "orders" ? "primary" : "secondary"} onClick={() => setTab("orders")}>
          سفارش‌ها
        </Button>
      </div>
      {tab === "rewards" ? <RewardsTab /> : <OrdersTab />}
    </div>
  );
}

function RewardsTab() {
  const { data: rewards, loading, error, reload } = useApi("/admin/rewards");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [info, setInfo] = useState(null);

  function open(reward) {
    setEditing(reward ?? "new");
    setForm(
      reward
        ? {
            name: reward.name,
            description: reward.description ?? "",
            image: reward.image ?? "",
            xp_cost: String(reward.xp_cost),
            stock: String(reward.stock),
            is_active: Boolean(reward.is_active),
          }
        : empty,
    );
    setFormError(null);
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    const body = {
      name: form.name,
      description: form.description || null,
      image: form.image || null,
      xp_cost: Number(form.xp_cost),
      stock: Number(form.stock),
      is_active: form.is_active,
    };
    try {
      if (editing === "new") await api("/admin/rewards", { method: "POST", body });
      else await api(`/admin/rewards/${editing.id}`, { method: "PUT", body });
      setEditing(null);
      reload();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function remove(reward) {
    if (!window.confirm(`«${reward.name}» حذف بشه؟`)) return;
    setActionError(null);
    setInfo(null);
    try {
      const res = await api(`/admin/rewards/${reward.id}`, { method: "DELETE" });
      setInfo(res.message);
      reload();
    } catch (err) {
      setActionError(errorMessage(err));
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Button onClick={() => open(null)}>+ جایزه‌ی جدید</Button>
      </div>
      {actionError && <Alert>{actionError}</Alert>}
      {info && <Alert kind="info">{info}</Alert>}

      {loading && !rewards ? (
        <Loading />
      ) : error ? (
        <Alert>{error}</Alert>
      ) : rewards && rewards.length > 0 ? (
        <div className="space-y-2">
          {rewards.map((r) => (
            <Card key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="font-medium">{r.name}</p>
                <p className="text-xs text-muted">
                  {r.xp_cost} XP · موجودی: {r.stock}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={r.is_active ? "green" : "slate"}>{r.is_active ? "فعال" : "غیرفعال"}</Badge>
                <Button variant="secondary" onClick={() => open(r)}>
                  ویرایش
                </Button>
                <Button variant="danger" onClick={() => remove(r)}>
                  حذف
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState>جایزه‌ای نیست.</EmptyState>
      )}

      <Modal open={Boolean(editing)} title={editing === "new" ? "جایزه‌ی جدید" : "ویرایش جایزه"} onClose={() => setEditing(null)}>
        <form onSubmit={save} className="space-y-4">
          <Field label="نام">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </Field>
          <Field label="توضیح">
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <Field label="آدرس تصویر (اختیاری)">
            <Input dir="ltr" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="قیمت (XP)">
              <Input
                inputMode="numeric"
                value={form.xp_cost}
                onChange={(e) => setForm({ ...form, xp_cost: digitsOnly(e.target.value) })}
                required
              />
            </Field>
            <Field label="موجودی انبار">
              <Input
                inputMode="numeric"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: digitsOnly(e.target.value) })}
                required
              />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            فعال (در فروشگاه نمایش داده بشه)
          </label>
          {formError && <Alert>{formError}</Alert>}
          <div className="flex gap-2">
            <Button type="submit" loading={saving}>
              ذخیره
            </Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              انصراف
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function OrdersTab() {
  const { data: orders, loading, error, reload } = useApi("/admin/reward-orders");
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState(null);

  async function setStatus(order, status) {
    setBusyId(order.id);
    setActionError(null);
    try {
      await api(`/admin/reward-orders/${order.id}`, { method: "PUT", body: { status } });
      reload();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  if (loading && !orders) return <Loading />;
  if (error) return <Alert>{error}</Alert>;
  if (!orders || orders.length === 0) return <EmptyState>سفارشی ثبت نشده.</EmptyState>;

  return (
    <div className="space-y-2">
      {actionError && <Alert>{actionError}</Alert>}
      {orders.map((o) => (
        <Card key={o.id} className="space-y-2 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium">
              {o.reward?.name} <span className="text-sm text-muted">· {o.xp_spent} XP · {formatDate(o.created_at)}</span>
            </p>
            <Select
              className="!w-auto"
              value={o.status}
              disabled={busyId === o.id}
              onChange={(e) => setStatus(o, e.target.value)}
            >
              {Object.keys(ORDER_STATUS_LABELS).map((k) => (
                <option key={k} value={k}>
                  {ORDER_STATUS_LABELS[k]}
                </option>
              ))}
            </Select>
          </div>
          <p className="text-sm text-muted">
            {o.user?.name} ({o.user?.email}) · گیرنده: {o.full_name} · <span dir="ltr">{o.phone}</span>
          </p>
          <p className="text-sm text-muted">{o.address}</p>
        </Card>
      ))}
    </div>
  );
}
