"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Alert, Loading } from "./ui";

/** فقط کاربر لاگین‌کرده (یا با admin، فقط ادمین) محتوا رو می‌بینه */
export default function RequireAuth({ admin = false, children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, router, pathname]);

  if (loading || !user) return <Loading />;

  if (admin && user.role !== "admin") {
    return <Alert>دسترسی به این بخش فقط برای ادمین‌ها مجازه.</Alert>;
  }

  return <>{children}</>;
}
