"use client";

import Link from "next/link";
import { useApi } from "@/lib/hooks";
import { formatDate } from "@/lib/format";
import { LEVEL_LABELS, PAID_VIA_LABELS, STATUS_LABELS } from "@/lib/labels";
import { Alert, Badge, Card, EmptyState, Loading, PageHeader } from "@/components/ui";

export default function AdminRequestsPage() {
  const { data: requests, loading, error } = useApi("/admin/plan-requests");

  return (
    <div>
      <PageHeader title="درخواست‌های برنامه" subtitle="روی هر درخواست بزن تا برنامه‌اش رو بنویسی." />

      {loading ? (
        <Loading />
      ) : error ? (
        <Alert>{error}</Alert>
      ) : requests && requests.length > 0 ? (
        <div className="space-y-2">
          {requests.map((r) => (
            <Link key={r.id} href={`/admin/requests/${r.id}`} className="block">
              <Card className="flex flex-wrap items-center justify-between gap-3 py-3 transition hover:border-brand/60">
                <div>
                  <p className="font-medium">{r.goal}</p>
                  <p className="text-sm text-muted">
                    {r.user?.name} · {LEVEL_LABELS[r.level]} · {r.days_per_week} روز در هفته · {formatDate(r.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">{PAID_VIA_LABELS[r.paid_via] ?? ""}</span>
                  <Badge tone={r.status === "done" ? "green" : "amber"}>{STATUS_LABELS[r.status]}</Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState>درخواستی نیست.</EmptyState>
      )}
    </div>
  );
}
