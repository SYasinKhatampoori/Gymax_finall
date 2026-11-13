<?php

namespace App\Http\Controllers;

use App\Models\Exercise;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

class ExerciseController extends Controller
{
    /**
     * اطلاعات عمومی حرکت. آدرس فیلم عمداً اینجا نیست؛ فقط has_video برمی‌گرده
     * و آدرس واقعی از endpoint جداگانه‌ی /video و فقط با اشتراک داده می‌شه.
     */
    public function show(Exercise $exercise)
    {
        $exercise->load(['sport:id,name,slug', 'muscles:id,name']);

        $data = $exercise->toArray();
        unset($data['video_url'], $data['video_path']);
        $data['has_video'] = filled($exercise->video_url) || filled($exercise->video_path);

        return response()->json($data);
    }

    /** آدرس فیلم؛ فقط برای ادمین یا کاربر دارای اشتراک فعال */
    public function video(Request $request, Exercise $exercise)
    {
        if (! $request->user()->canWatchVideos()) {
            return response()->json([
                'message' => 'برای دیدن فیلم حرکت‌ها باید اشتراک داشته باشی.',
                'code' => 'subscription_required',
            ], 403);
        }

        if ($exercise->video_path) {
            // لینک امضاشده و موقت؛ بدون اشتراک و بدون این امضا فایل قابل دانلود نیست
            $url = URL::temporarySignedRoute('exercises.stream', now()->addHours(2), [
                'exercise' => $exercise->id,
            ]);

            return response()->json(['type' => 'file', 'url' => $url]);
        }

        if ($exercise->video_url) {
            return response()->json(['type' => 'link', 'url' => $exercise->video_url]);
        }

        return response()->json(['message' => 'برای این حرکت فیلمی ثبت نشده.'], 404);
    }

    /** پخش فایل ویدیوی آپلودشده (با پشتیبانی از جلو/عقب بردن). فقط با لینک امضاشده. */
    public function stream(Exercise $exercise)
    {
        $disk = Storage::disk('local');

        abort_unless($exercise->video_path && $disk->exists($exercise->video_path), 404);

        return response()->file($disk->path($exercise->video_path));
    }
}
