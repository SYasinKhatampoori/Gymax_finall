"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Alert, Button, Card, Field, Input } from "@/components/ui";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", password_confirmation: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError(null);

    if (form.password !== form.password_confirmation) {
      setError("رمز عبور و تکرارش یکی نیستن.");
      return;
    }

    setLoading(true);
    try {
      await register(form);
      router.push("/");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <Card className="space-y-5">
        <h1 className="text-2xl font-bold">ثبت‌نام</h1>

        <form onSubmit={submit} className="space-y-4">
          <Field label="نام">
            <Input value={form.name} onChange={update("name")} autoComplete="name" required />
          </Field>
          <Field label="ایمیل">
            <Input type="email" dir="ltr" value={form.email} onChange={update("email")} autoComplete="email" required />
          </Field>
          <Field label="رمز عبور" hint="حداقل ۸ کاراکتر">
            <Input
              type="password"
              dir="ltr"
              minLength={8}
              value={form.password}
              onChange={update("password")}
              autoComplete="new-password"
              required
            />
          </Field>
          <Field label="تکرار رمز عبور">
            <Input
              type="password"
              dir="ltr"
              minLength={8}
              value={form.password_confirmation}
              onChange={update("password_confirmation")}
              autoComplete="new-password"
              required
            />
          </Field>

          {error && <Alert>{error}</Alert>}

          <Button type="submit" loading={loading} className="w-full">
            ساخت حساب
          </Button>
        </form>

        <p className="text-center text-sm text-muted">
          قبلاً ثبت‌نام کردی؟{" "}
          <Link href="/login" className="font-medium text-brand hover:underline">
            وارد شو
          </Link>
        </p>
      </Card>
    </div>
  );
}
