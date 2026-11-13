"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api, errorMessage } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import { LEVEL_LABELS, PAID_VIA_LABELS } from "@/lib/labels";
import { Alert, Badge, Button, Card, Field, Input, Loading, Select, Textarea } from "@/components/ui";

const newItem = () => ({ key: Math.random().toString(36).slice(2), exercise_id: "", day: "1", sets: "3", reps: "10", note: "" });

export default function AdminRequestDetailPage() {
  const { id } = useParams();
  const request = useApi(id ? `/admin/plan-requests/${id}` : null);
  const exercises = useApi("/admin/exercises");

  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [items, setItems] = useState([newItem()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const r = request.data;

  const setItem = (key, patch) => setItems((prev) => prev.map((i) => (i.key === key ? { ...i, ...patch } : i)));

  async function submit(e) {
    e.preventDefault();
    setError(null);

    if (items.some((i) => !i.exercise_id)) {
      setError("برای همه‌ی ردیف‌ها یه حرکت انتخاب کن.");
      return;
    }

    setSaving(true);
    try {
      await api(`/admin/plan-requests/${id}/plan`, {
        method: "POST",
        body: {
          title,
          note,
          items: items.map((i) => ({
            exercise_id: Number(i.exercise_id),
            day: Number(i.day),
            sets: Number(i.sets),
            reps: i.reps,
            note: i.note || null,
          })),
        },
      });
      request.reload();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (request.loading && !r) return <Loading />;
  if (request.error) return <Alert>{request.error}</Alert>;
  if (!r) return null;

  const done = r.status === "done" && r.plan;

  return (
    <div className="space-y-6">
      <Link href="/admin/requests" className="text-sm text-brand hover:underline">
        ← همه‌ی درخواست‌ها
      </Link>

      <Card className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-xl font-bold">{r.goal}</h1>
          <Badge tone={done ? "green" : "amber"}>{done ? "برنامه نوشته شده" : "در انتظار برنامه"}</Badge>
        </div>
        <p className="text-sm text-muted">
          {r.user?.name} ({r.user?.email}) · {LEVEL_LABELS[r.level]} · {r.days_per_week} روز در هفته
        </p>
        <p className="text-xs text-muted">{PAID_VIA_LABELS[r.paid_via] ?? ""}</p>
        {r.notes && <p className="text-sm leading-7">{r.notes}</p>}
      </Card>

      {done ? (
        <Card className="space-y-3">
          <h2 className="text-lg font-bold">{r.plan.title}</h2>
          {r.plan.note && <p className="text-sm text-muted">{r.plan.note}</p>}
          <ul className="space-y-2">
            {(r.plan.items ?? []).map((i) => (
              <li key={i.id} className="rounded-xl bg-surface2 px-4 py-2 text-sm">
                روز {i.day} · {i.exercise?.name} · {i.sets} ست × {i.reps}
                {i.note ? ` · ${i.note}` : ""}
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <Card>
          <h2 className="mb-4 text-lg font-bold">نوشتن برنامه</h2>

          {exercises.loading ? (
            <Loading />
          ) : exercises.error ? (
            <Alert>{exercises.error}</Alert>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <Field label="عنوان برنامه">
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
              </Field>
              <Field label="توضیح کلی (اختیاری)">
                <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
              </Field>

              <div className="space-y-3">
                <p className="text-sm font-medium">حرکت‌ها</p>
                {items.map((i) => (
                  <div key={i.key} className="grid gap-2 rounded-xl bg-surface2 p-3 sm:grid-cols-12">
                    <div className="sm:col-span-4">
                      <Select value={i.exercise_id} onChange={(e) => setItem(i.key, { exercise_id: e.target.value })}>
                        <option value="">انتخاب حرکت...</option>
                        {(exercises.data ?? []).map((ex) => (
                          <option key={ex.id} value={ex.id}>
                            {ex.sport?.name} - {ex.name} ({ex.xp} XP)
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="sm:col-span-2">
                      <Select value={i.day} onChange={(e) => setItem(i.key, { day: e.target.value })}>
                        {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                          <option key={d} value={d}>
                            روز {d}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="sm:col-span-1">
                      <Input
                        type="number"
                        min={1}
                        max={20}
                        title="تعداد ست"
                        value={i.sets}
                        onChange={(e) => setItem(i.key, { sets: e.target.value })}
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Input
                        title="تکرار"
                        placeholder="تکرار (مثلاً 12)"
                        value={i.reps}
                        onChange={(e) => setItem(i.key, { reps: e.target.value })}
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Input placeholder="نکته" value={i.note} onChange={(e) => setItem(i.key, { note: e.target.value })} />
                    </div>
                    <div className="sm:col-span-1">
                      <Button
                        variant="danger"
                        className="w-full"
                        disabled={items.length === 1}
                        onClick={() => setItems((prev) => prev.filter((x) => x.key !== i.key))}
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="secondary" onClick={() => setItems((prev) => [...prev, newItem()])}>
                  + افزودن حرکت
                </Button>
              </div>

              {error && <Alert>{error}</Alert>}

              <Button type="submit" loading={saving}>
                ثبت برنامه
              </Button>
            </form>
          )}
        </Card>
      )}
    </div>
  );
}
