"use client";

import { useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { BMI_LABELS } from "@/lib/labels";
import { Alert, Button, Card, Field, Input, PageHeader } from "@/components/ui";

const categoryStyle = {
  underweight: "text-sky-400",
  normal: "text-emerald-400",
  overweight: "text-amber-400",
  obese: "text-red-400",
};

export default function BmiPage() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api("/bmi", {
        method: "POST",
        body: { height_cm: Number(height), weight_kg: Number(weight) },
      });
      setResult(res);
    } catch (err) {
      setResult(null);
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="محاسبه BMI" subtitle="قد و وزنت رو وارد کن تا شاخص توده‌ی بدنی‌ت حساب بشه." />

      <Card>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="قد (سانتی‌متر)">
              <Input
                type="number"
                inputMode="decimal"
                step="any"
                min={50}
                max={250}
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="مثلاً 175"
                required
              />
            </Field>
            <Field label="وزن (کیلوگرم)">
              <Input
                type="number"
                inputMode="decimal"
                step="any"
                min={10}
                max={500}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="مثلاً 70"
                required
              />
            </Field>
          </div>

          {error && <Alert>{error}</Alert>}

          <Button type="submit" loading={loading}>
            محاسبه کن
          </Button>
        </form>
      </Card>

      {result && (
        <Card className="mt-6 text-center">
          <p className="text-sm text-muted">BMI شما</p>
          <p className="mt-1 text-5xl font-extrabold">{result.bmi}</p>
          <p className={`mt-2 text-lg font-bold ${categoryStyle[result.category] ?? ""}`}>
            {BMI_LABELS[result.category] ?? result.category}
          </p>
          <p className="mt-4 text-xs leading-6 text-muted">
            این عدد فقط یه شاخص کلیه و جای نظر پزشک یا مربی رو نمی‌گیره.
          </p>
        </Card>
      )}
    </div>
  );
}
