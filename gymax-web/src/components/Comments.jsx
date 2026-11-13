"use client";

import { useState } from "react";
import Link from "next/link";
import { api, errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useApi } from "@/lib/hooks";
import { formatDate } from "@/lib/format";
import { Alert, Badge, Button, Card, EmptyState, Loading, Textarea } from "./ui";

export default function Comments({ exerciseId }) {
  const { user } = useAuth();
  const { data: comments, loading, error, reload } = useApi(`/exercises/${exerciseId}/comments`);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setSending(true);
    setFormError(null);
    try {
      await api(`/exercises/${exerciseId}/comments`, { method: "POST", body: { body } });
      setBody("");
      reload();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold">نظرات</h2>

      {user ? (
        <form onSubmit={submit} className="space-y-3">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="سوال یا نظرت درباره‌ی این حرکت رو بنویس..."
            maxLength={1000}
            required
          />
          {formError && <Alert>{formError}</Alert>}
          <Button type="submit" loading={sending} disabled={body.trim().length === 0}>
            ارسال نظر
          </Button>
        </form>
      ) : (
        <Alert kind="info">
          برای نوشتن نظر باید{" "}
          <Link href="/login" className="font-medium underline">
            وارد حساب‌ت بشی
          </Link>
          .
        </Alert>
      )}

      {loading && !comments ? (
        <Loading />
      ) : error ? (
        <Alert>{error}</Alert>
      ) : comments && comments.length > 0 ? (
        <ul className="space-y-3">
          {comments.map((comment) => (
            <li key={comment.id}>
              <Card className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{comment.user?.name ?? "کاربر"}</span>
                  <span className="text-xs text-muted">{formatDate(comment.created_at)}</span>
                </div>
                <p className="whitespace-pre-line text-sm leading-7 text-fg/90">{comment.body}</p>

                {comment.replies && comment.replies.length > 0 && (
                  <ul className="space-y-2 border-s-2 border-brand/40 ps-4">
                    {comment.replies.map((reply) => (
                      <li key={reply.id} className="rounded-lg bg-surface2 p-3 text-sm">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="font-medium">{reply.user?.name ?? "ادمین"}</span>
                          {reply.user?.role === "admin" && <Badge tone="blue">ادمین</Badge>}
                        </div>
                        <p className="whitespace-pre-line leading-7 text-fg/90">{reply.body}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState>هنوز نظری ثبت نشده. اولین نفر باش!</EmptyState>
      )}
    </section>
  );
}
