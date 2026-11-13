"use client";

import { useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import { digitsOnly } from "@/lib/format";
import { Alert, Badge, Button, Card, EmptyState, Field, Input, Loading, Modal, PageHeader, Select, Textarea } from "@/components/ui";

const empty = {
  sport_id: "",
  name: "",
  description: "",
  how_to: "",
  xp: "10",
  muscles: [],
  videoMode: "none", // none | link | file
  video_url: "",
  video_path: "",
};

export default function AdminExercisesPage() {
  const list = useApi("/admin/exercises");
  const sports = useApi("/sports");
  const muscles = useApi("/admin/muscles");

  const [editing, setEditing] = useState(null); // null | "new" | id
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [actionError, setActionError] = useState(null);

  async function open(id) {
    setFormError(null);
    setFile(null);
    if (id === null) {
      setForm({ ...empty, sport_id: sports.data?.[0]?.id ? String(sports.data[0].id) : "" });
      setEditing("new");
      return;
    }
    try {
      const ex = await api(`/admin/exercises/${id}`);
      setForm({
        sport_id: String(ex.sport_id),
        name: ex.name,
        description: ex.description ?? "",
        how_to: ex.how_to ?? "",
        xp: String(ex.xp),
        muscles: (ex.muscles ?? []).map((m) => m.id),
        videoMode: ex.video_path ? "file" : ex.video_url ? "link" : "none",
        video_url: ex.video_url ?? "",
        video_path: ex.video_path ?? "",
      });
      setEditing(id);
    } catch (err) {
      setActionError(errorMessage(err));
    }
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      let video_url = null;
      let video_path = null;

      if (form.videoMode === "link") {
        video_url = form.video_url.trim() || null;
      } else if (form.videoMode === "file") {
        video_path = form.video_path || null;
        if (file) {
          const fd = new FormData();
          fd.append("video", file);
          const up = await api("/admin/upload/video", { method: "POST", body: fd });
          video_path = up.path;
        }
        if (!video_path) {
          setFormError("یه فایل ویدیو انتخاب کن.");
          setSaving(false);
          return;
        }
      }

      const body = {
        sport_id: Number(form.sport_id),
        name: form.name,
        description: form.description || null,
        how_to: form.how_to || null,
        xp: Number(form.xp),
        muscles: form.muscles,
        video_url,
        video_path,
      };

      if (editing === "new") await api("/admin/exercises", { method: "POST", body });
      else await api(`/admin/exercises/${editing}`, { method: "PUT", body });

      setEditing(null);
      list.reload();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function remove(ex) {
    if (!window.confirm(`حرکت «${ex.name}» حذف بشه؟`)) return;
    try {
      await api(`/admin/exercises/${ex.id}`, { method: "DELETE" });
      list.reload();
    } catch (err) {
      setActionError(errorMessage(err));
    }
  }

  const toggleMuscle = (id) =>
    setForm((f) => ({ ...f, muscles: f.muscles.includes(id) ? f.muscles.filter((m) => m !== id) : [...f.muscles, id] }));

  return (
    <div className="space-y-5">
      <PageHeader title="حرکت‌ها" actions={<Button onClick={() => open(null)}>+ حرکت جدید</Button>} />
      {actionError && <Alert>{actionError}</Alert>}

      {list.loading && !list.data ? (
        <Loading />
      ) : list.error ? (
        <Alert>{list.error}</Alert>
      ) : list.data && list.data.length > 0 ? (
        <div className="space-y-2">
          {list.data.map((ex) => (
            <Card key={ex.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="flex items-center gap-2">
                <span className="font-medium">{ex.name}</span>
                <Badge>{ex.sport?.name}</Badge>
                <Badge tone="blue">{ex.xp} XP</Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => open(ex.id)}>
                  ویرایش
                </Button>
                <Button variant="danger" onClick={() => remove(ex)}>
                  حذف
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState>حرکتی نیست.</EmptyState>
      )}

      <Modal open={editing !== null} title={editing === "new" ? "حرکت جدید" : "ویرایش حرکت"} onClose={() => setEditing(null)}>
        <form onSubmit={save} className="space-y-4">
          <Field label="ورزش">
            <Select value={form.sport_id} onChange={(e) => setForm({ ...form, sport_id: e.target.value })} required>
              <option value="">انتخاب...</option>
              {(sports.data ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="نام حرکت">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </Field>
          <Field label="امتیاز (XP)">
            <Input inputMode="numeric" value={form.xp} onChange={(e) => setForm({ ...form, xp: digitsOnly(e.target.value) })} required />
          </Field>
          <Field label="توضیح کوتاه">
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <Field label="طریقه‌ی انجام">
            <Textarea rows={4} value={form.how_to} onChange={(e) => setForm({ ...form, how_to: e.target.value })} />
          </Field>

          <Field label="عضلات درگیر">
            <div className="flex flex-wrap gap-2">
              {(muscles.data ?? []).map((m) => {
                const on = form.muscles.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleMuscle(m.id)}
                    className={`rounded-full px-3 py-1 text-xs ring-1 transition ${
                      on ? "bg-brand text-white ring-brand" : "text-muted ring-line hover:text-fg"
                    }`}
                  >
                    {m.name}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="ویدیو (فقط برای مشترک‌ها نمایش داده می‌شه)">
            <Select value={form.videoMode} onChange={(e) => setForm({ ...form, videoMode: e.target.value })}>
              <option value="none">بدون ویدیو</option>
              <option value="link">لینک (آپارات / یوتیوب)</option>
              <option value="file">آپلود فایل</option>
            </Select>
          </Field>

          {form.videoMode === "link" && (
            <Input
              dir="ltr"
              placeholder="https://www.aparat.com/v/xxxxx"
              value={form.video_url}
              onChange={(e) => setForm({ ...form, video_url: e.target.value })}
            />
          )}
          {form.videoMode === "file" && (
            <div className="space-y-2">
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-muted file:me-3 file:rounded-lg file:border-0 file:bg-surface2 file:px-3 file:py-2 file:text-fg"
              />
              {form.video_path && !file && <p className="text-xs text-muted">یه فایل قبلاً آپلود شده؛ برای تعویض، فایل جدید انتخاب کن.</p>}
              <p className="text-xs text-muted">mp4 / webm / mov، حداکثر ۱۰۰ مگابایت.</p>
            </div>
          )}

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
