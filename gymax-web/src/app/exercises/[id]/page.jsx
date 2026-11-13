"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useApi } from "@/lib/hooks";
import { Alert, Badge, Card, Loading } from "@/components/ui";
import VideoSection from "@/components/VideoSection";
import Comments from "@/components/Comments";

export default function ExercisePage() {
  const { id } = useParams();
  const { data: exercise, loading, error } = useApi(id ? `/exercises/${id}` : null);

  if (loading) return <Loading />;
  if (error) return <Alert>{error}</Alert>;
  if (!exercise) return null;

  const muscles = exercise.muscles ?? [];

  return (
    <div className="space-y-8">
      <div>
        {exercise.sport && (
          <Link href={`/sports/${exercise.sport.slug}`} className="text-sm text-brand hover:underline">
            ← {exercise.sport.name}
          </Link>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold">{exercise.name}</h1>
          <Badge tone="blue">{exercise.xp} XP</Badge>
        </div>
        {exercise.description && (
          <p className="mt-3 max-w-3xl whitespace-pre-line leading-8 text-muted">{exercise.description}</p>
        )}
      </div>

      <VideoSection exerciseId={exercise.id} hasVideo={exercise.has_video} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="mb-3 text-lg font-bold">طریقه‌ی انجام حرکت</h2>
          {exercise.how_to ? (
            <p className="whitespace-pre-line leading-8 text-fg/90">{exercise.how_to}</p>
          ) : (
            <p className="text-sm text-muted">توضیحی برای طریقه‌ی انجام این حرکت ثبت نشده.</p>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 text-lg font-bold">عضلات درگیر</h2>
          {muscles.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {muscles.map((muscle) => (
                <Badge key={muscle.id}>{muscle.name}</Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">عضله‌ای ثبت نشده.</p>
          )}
        </Card>
      </div>

      <Comments exerciseId={exercise.id} />
    </div>
  );
}
