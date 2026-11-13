"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useApi } from "@/lib/hooks";
import { Alert, Badge, EmptyState, Loading } from "@/components/ui";

export default function SportPage() {
  const { slug } = useParams();
  const { data: sport, loading, error } = useApi(slug ? `/sports/${slug}` : null);

  if (loading) return <Loading />;
  if (error) return <Alert>{error}</Alert>;
  if (!sport) return null;

  const exercises = sport.exercises ?? [];

  return (
    <div className="space-y-8">
      <div>
        <Link href="/" className="text-sm text-brand hover:underline">
          ← همه‌ی ورزش‌ها
        </Link>
        <h1 className="mt-2 text-3xl font-bold">{sport.name}</h1>
        {sport.description && (
          <p className="mt-3 max-w-3xl whitespace-pre-line leading-8 text-muted">{sport.description}</p>
        )}
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">حرکت‌ها ({exercises.length})</h2>

        {exercises.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {exercises.map((exercise) => (
              <li key={exercise.id}>
                <Link
                  href={`/exercises/${exercise.id}`}
                  className="flex items-center justify-between rounded-xl border border-line bg-surface px-4 py-4 transition hover:border-brand/60 hover:bg-surface2"
                >
                  <span className="font-medium">{exercise.name}</span>
                  <Badge tone="blue">{exercise.xp} XP</Badge>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState>برای این ورزش هنوز حرکتی اضافه نشده.</EmptyState>
        )}
      </section>
    </div>
  );
}
