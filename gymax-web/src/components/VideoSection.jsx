"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ApiError, api, errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import VideoPlayer from "./VideoPlayer";
import { Alert, Card, Loading } from "./ui";

function Locked({ guest }) {
  return (
    <Card className="flex flex-col items-center gap-3 py-10 text-center">
      <span className="text-4xl">🔒</span>
      <h2 className="text-lg font-bold">فیلم آموزشی مخصوص مشترک‌هاست</h2>
      <p className="max-w-md text-sm leading-7 text-muted">
        {guest
          ? "برای دیدن فیلم حرکت‌ها اول وارد حسابت شو و بعد یه اشتراک بخر."
          : "با خرید اشتراک می‌تونی فیلم همه‌ی حرکت‌ها رو ببینی و برنامه‌ی تمرینی رو بدون پرداخت جدا بگیری."}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {guest && (
          <Link href="/login" className="rounded-lg bg-surface2 px-4 py-2 text-sm hover:bg-line">
            ورود
          </Link>
        )}
        <Link href="/subscription" className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
          دیدن بسته‌های اشتراک
        </Link>
      </div>
    </Card>
  );
}

/** فیلم حرکت؛ آدرسش فقط از سرور و فقط برای مشترک (یا ادمین) گرفته می‌شه */
export default function VideoSection({ exerciseId, hasVideo }) {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState({ status: "idle", url: null, error: null });

  useEffect(() => {
    if (!hasVideo || authLoading) return;
    if (!user) {
      setState({ status: "guest", url: null, error: null });
      return;
    }

    let cancelled = false;
    setState({ status: "loading", url: null, error: null });

    api(`/exercises/${exerciseId}/video`)
      .then((res) => {
        if (!cancelled) setState({ status: "ready", url: res.url, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.code === "subscription_required") {
          setState({ status: "locked", url: null, error: null });
        } else {
          setState({ status: "error", url: null, error: errorMessage(err) });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [exerciseId, hasVideo, user, authLoading]);

  if (!hasVideo) return null;

  if (state.status === "guest") return <Locked guest />;
  if (state.status === "locked") return <Locked />;
  if (state.status === "error") return <Alert>{state.error}</Alert>;
  if (state.status === "ready") {
    return (
      <div className="max-w-3xl">
        <VideoPlayer url={state.url} />
      </div>
    );
  }

  return <Loading text="در حال آماده‌سازی فیلم..." />;
}
