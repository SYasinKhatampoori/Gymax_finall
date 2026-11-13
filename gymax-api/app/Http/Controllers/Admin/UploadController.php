<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    /**
     * آپلود ویدیوی حرکت. فایل روی دیسک «خصوصی» (storage/app) ذخیره می‌شه، نه public،
     * پس بدون اشتراک و لینک امضاشده از بیرون قابل دسترسی نیست.
     */
    public function video(Request $request)
    {
        $request->validate([
            // حداکثر ۱۰۰ مگابایت (عدد به کیلوبایته)
            'video' => 'required|file|mimes:mp4,webm,mov|max:102400',
        ]);

        $path = $request->file('video')->store('videos', 'local');

        return response()->json(['path' => $path], 201);
    }
}
