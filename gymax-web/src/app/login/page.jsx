"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Alert, Button, Card, Field, Input } from "@/components/ui";

/** فقط مسیرهای داخل خود سایت قبول می‌شن (جلوگیری از ریدایرکت به سایت دیگه) */
function safeNext() {
  if (typeof window === "undefined") return "/";
  const next = new URLSearchParams(window.location.search).get("next");
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      router.push(safeNext());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <Card className="space-y-5">
        <h1 className="text-2xl font-bold">ورود به حساب</h1>

        <form onSubmit={submit} className="space-y-4">
          <Field label="ایمیل">
            <Input
              type="email"
              dir="ltr"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <Field label="رمز عبور">
            <Input
              type="password"
              dir="ltr"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>

          {error && <Alert>{error}</Alert>}

          <Button type="submit" loading={loading} className="w-full">
            ورود
          </Button>
        </form>

        <p className="text-center text-sm text-muted">
          حساب نداری؟{" "}
          <Link href="/register" className="font-medium text-brand hover:underline">
            ثبت‌نام کن
          </Link>
        </p>
      </Card>
    </div>
  );
}
