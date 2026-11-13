"use client";

import { useState } from "react";
import Link from "next/link";
import { api, errorMessage } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import { formatDate } from "@/lib/format";
import { Alert, Badge, Button, Card, EmptyState, Loading, PageHeader, Textarea } from "@/components/ui";

export default function AdminCommentsPage() {
  const [onlyNew, setOnlyNew] = useState(false);
  const { data: comments, loading, error, reload } = useApi(`/admin/comments${onlyNew ? "?unanswered=1" : ""}`);
  const [drafts, setDrafts] = useState({});
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState(null);

  async function reply(c) {
    const body = (drafts[c.id] ?? "").trim();
    if (!body) return;
    setBusyId(c.id);
    setActionError(null);
    try {
      await api(`/admin/comments/${c.id}/reply`, { method: "POST", body: { body } });
      setDrafts((d) => ({ ...d, [c.id]: "" }));
      reload();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  async function remove(c) {
    if (!window.confirm("این نظر حذف بشه؟")) return;
    try {
      await api(`/admin/comments/${c.id}`, { method: "DELETE" });
      reload();
    } catch (err) {
      setActionError(errorMessage(err));
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="نظرها"
        actions={
          <label className="flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" checked={onlyNew} onChange={(e) => setOnlyNew(e.target.checked)} />
            فقط بدون پاسخ
          </label>
        }
      />

      {actionError && <Alert>{actionError}</Alert>}

      {loading && !comments ? (
        <Loading />
      ) : error ? (
        <Alert>{error}</Alert>
      ) : comments && comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((c) => (
            <Card key={c.id} className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm">
                  <span className="font-medium">{c.user?.name}</span>
                  <span className="text-muted"> در </span>
                  <Link href={`/exercises/${c.exercise_id}`} className="text-brand hover:underline">
                    {c.exercise?.name}
                  </Link>
                  <span className="ms-2 text-xs text-muted">{formatDate(c.created_at)}</span>
                </p>
                <Button variant="ghost" onClick={() => remove(c)}>
                  حذف
                </Button>
              </div>
              <p className="whitespace-pre-line leading-7">{c.body}</p>

              {(c.replies ?? []).map((rep) => (
                <div key={rep.id} className="rounded-xl border-s-4 border-brand bg-surface2 px-4 py-2 text-sm">
                  <Badge tone="blue">{rep.user?.name ?? "ادمین"}</Badge>
                  <p className="mt-1 whitespace-pre-line leading-7">{rep.body}</p>
                </div>
              ))}

              <div className="flex gap-2">
                <Textarea
                  rows={2}
                  placeholder="پاسخ ادمین..."
                  value={drafts[c.id] ?? ""}
                  onChange={(e) => setDrafts((d) => ({ ...d, [c.id]: e.target.value }))}
                />
                <Button loading={busyId === c.id} onClick={() => reply(c)}>
                  ارسال
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState>نظری نیست.</EmptyState>
      )}
    </div>
  );
}
