"use client";

import { useApi } from "@/lib/hooks";
import { formatDate, formatPrice } from "@/lib/format";
import { PAYMENT_TYPE_LABELS } from "@/lib/labels";
import { Alert, Badge, Card, EmptyState, Loading, PageHeader } from "@/components/ui";

export default function AdminPaymentsPage() {
  const { data: payments, loading, error } = useApi("/admin/payments");

  return (
    <div className="space-y-5">
      <PageHeader title="پرداخت‌ها" subtitle="همه‌ی پرداخت‌ها آزمایشی هستن و پول واقعی جابه‌جا نشده." />

      {loading ? (
        <Loading />
      ) : error ? (
        <Alert>{error}</Alert>
      ) : payments && payments.length > 0 ? (
        <div className="space-y-2">
          {payments.map((p) => (
            <Card key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
              <div>
                <p className="font-medium">
                  {p.user?.name} <span className="text-muted">· {p.description}</span>
                </p>
                <p className="text-xs text-muted">
                  {formatDate(p.created_at)} · کارت ****{p.card_last4} ·{" "}
                  <span dir="ltr">{p.reference}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge>{PAYMENT_TYPE_LABELS[p.type] ?? p.type}</Badge>
                <span className="font-bold">{formatPrice(p.amount)}</span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState>پرداختی ثبت نشده.</EmptyState>
      )}
    </div>
  );
}
