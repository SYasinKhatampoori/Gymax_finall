"use client";

import { useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import { Alert, Badge, Button, Card, Input, Loading, PageHeader } from "@/components/ui";

export default function AdminMusclesPage() {
  const { data: muscles, loading, error, reload } = useApi("/admin/muscles");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  async function add(e) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await api("/admin/muscles", { method: "POST", body: { name } });
      setName("");
      reload();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader title="عضلات" />

      <Card>
        <form onSubmit={add} className="flex gap-2">
          <Input placeholder="نام عضله‌ی جدید" value={name} onChange={(e) => setName(e.target.value)} required />
          <Button type="submit" loading={saving} className="whitespace-nowrap">
            افزودن
          </Button>
        </form>
        {formError && (
          <div className="mt-3">
            <Alert>{formError}</Alert>
          </div>
        )}
      </Card>

      {loading && !muscles ? (
        <Loading />
      ) : error ? (
        <Alert>{error}</Alert>
      ) : (
        <div className="flex flex-wrap gap-2">
          {(muscles ?? []).map((m) => (
            <Badge key={m.id} tone="blue">
              {m.name}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
