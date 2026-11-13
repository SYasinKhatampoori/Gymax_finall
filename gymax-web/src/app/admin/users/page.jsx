"use client";

import { useEffect, useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useApi } from "@/lib/hooks";
import { formatDate } from "@/lib/format";
import { Alert, Badge, Button, Card, EmptyState, Input, Loading, PageHeader } from "@/components/ui";

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState(null);

  // جستجو با کمی تأخیر تا برای هر حرف درخواست نره
  useEffect(() => {
    const t = setTimeout(() => setQuery(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);

  const { data: users, loading, error, reload } = useApi(`/admin/users${query ? `?q=${encodeURIComponent(query)}` : ""}`);

  async function toggle(u) {
    const role = u.role === "admin" ? "user" : "admin";
    const text = role === "admin" ? `«${u.name}» ادمین بشه؟` : `ادمین بودن «${u.name}» برداشته بشه؟`;
    if (!window.confirm(text)) return;

    setBusyId(u.id);
    setActionError(null);
    try {
      await api(`/admin/users/${u.id}/role`, { method: "PUT", body: { role } });
      reload();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader title="مدیریت کاربران" subtitle="کاربرها رو ادمین کن یا ادمین بودنشون رو بردار." />

      <Input placeholder="جستجو با نام یا ایمیل..." value={q} onChange={(e) => setQ(e.target.value)} />

      {actionError && <Alert>{actionError}</Alert>}

      {loading && !users ? (
        <Loading />
      ) : error ? (
        <Alert>{error}</Alert>
      ) : users && users.length > 0 ? (
        <div className="space-y-2">
          {users.map((u) => (
            <Card key={u.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="font-medium">
                  {u.name} {u.id === me?.id && <span className="text-xs text-muted">(خودت)</span>}
                </p>
                <p className="text-sm text-muted" dir="ltr" style={{ textAlign: "start" }}>
                  {u.email}
                </p>
                <p className="mt-1 text-xs text-muted">عضویت: {formatDate(u.created_at)} · امتیاز: {u.xp_balance} XP</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={u.subscription_active ? "green" : "slate"}>
                  {u.subscription_active ? "اشتراک فعال" : "بدون اشتراک"}
                </Badge>
                <Badge tone={u.role === "admin" ? "blue" : "slate"}>{u.role === "admin" ? "ادمین" : "کاربر"}</Badge>
                <Button
                  variant={u.role === "admin" ? "danger" : "primary"}
                  loading={busyId === u.id}
                  disabled={u.id === me?.id}
                  onClick={() => toggle(u)}
                >
                  {u.role === "admin" ? "برداشتن ادمین" : "ادمین کردن"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState>کاربری پیدا نشد.</EmptyState>
      )}
    </div>
  );
}
