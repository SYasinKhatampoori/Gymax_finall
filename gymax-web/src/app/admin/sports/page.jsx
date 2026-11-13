"use client";

import { useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import { Alert, Button, Card, EmptyState, Field, Input, Loading, Modal, PageHeader, Textarea } from "@/components/ui";

const empty = { name: "", slug: "", description: "", image: "" };

export default function AdminSportsPage() {
  const { data: sports, loading, error, reload } = useApi("/sports");
  const [editing, setEditing] = useState(null); // null | "new" | sport
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [actionError, setActionError] = useState(null);

  function open(sport) {
    setEditing(sport ?? "new");
    setForm(sport ? { name: sport.name, slug: sport.slug, description: sport.description ?? "", image: sport.image ?? "" } : empty);
    setFormError(null);
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    const body = { ...form, description: form.description || null, image: form.image || null };
    try {
      if (editing === "new") await api("/admin/sports", { method: "POST", body });
      else await api(`/admin/sports/${editing.id}`, { method: "PUT", body });
      setEditing(null);
      reload();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function remove(sport) {
    if (!window.confirm(`ورزش «${sport.name}» و همه‌ی حرکت‌هاش حذف بشه؟`)) return;
    try {
      await api(`/admin/sports/${sport.id}`, { method: "DELETE" });
      reload();
    } catch (err) {
      setActionError(errorMessage(err));
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader title="ورزش‌ها" actions={<Button onClick={() => open(null)}>+ ورزش جدید</Button>} />
      {actionError && <Alert>{actionError}</Alert>}

      {loading && !sports ? (
        <Loading />
      ) : error ? (
        <Alert>{error}</Alert>
      ) : sports && sports.length > 0 ? (
        <div className="space-y-2">
          {sports.map((s) => (
            <Card key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-xs text-muted" dir="ltr" style={{ textAlign: "start" }}>
                  {s.slug}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => open(s)}>
                  ویرایش
                </Button>
                <Button variant="danger" onClick={() => remove(s)}>
                  حذف
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState>ورزشی نیست.</EmptyState>
      )}

      <Modal open={Boolean(editing)} title={editing === "new" ? "ورزش جدید" : "ویرایش ورزش"} onClose={() => setEditing(null)}>
        <form onSubmit={save} className="space-y-4">
          <Field label="نام">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </Field>
          <Field label="اسلاگ (لاتین، برای آدرس)" hint="مثلاً bodybuilding">
            <Input dir="ltr" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
          </Field>
          <Field label="توضیح">
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <Field label="آدرس تصویر (اختیاری)">
            <Input dir="ltr" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          </Field>
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
