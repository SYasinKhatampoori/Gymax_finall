<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Exercise;
use Illuminate\Http\Request;

class ExerciseController extends Controller
{
    /** لیست کوتاه همه‌ی حرکت‌ها (برای پنل و انتخاب حرکت موقع نوشتن برنامه) */
    public function index()
    {
        return Exercise::with('sport:id,name,slug')
            ->orderBy('sport_id')
            ->orderBy('name')
            ->get(['id', 'sport_id', 'name', 'xp']);
    }

    /** اطلاعات کامل یک حرکت، همراه آدرس ویدیو (برای فرم ویرایش) */
    public function show(Exercise $exercise)
    {
        return $exercise->load('muscles:id,name');
    }

    public function store(Request $request)
    {
        $data = $request->validate($this->rules());

        $muscles = $data['muscles'] ?? [];
        unset($data['muscles']);

        $exercise = Exercise::create($data);
        $exercise->muscles()->sync($muscles);

        return response()->json($exercise->load('muscles'), 201);
    }

    public function update(Request $request, Exercise $exercise)
    {
        $data = $request->validate($this->rules(true));

        $muscles = $data['muscles'] ?? null;
        unset($data['muscles']);

        $exercise->update($data);

        if ($muscles !== null) {
            $exercise->muscles()->sync($muscles);
        }

        return response()->json($exercise->load('muscles'));
    }

    public function destroy(Exercise $exercise)
    {
        $exercise->delete();

        return response()->json(['message' => 'حرکت حذف شد.']);
    }

    private function rules(bool $partial = false): array
    {
        $required = $partial ? 'sometimes|required' : 'required';

        return [
            'sport_id' => $required . '|exists:sports,id',
            'name' => $required . '|string|max:255',
            'description' => 'nullable|string',
            'how_to' => 'nullable|string',
            'video_url' => 'nullable|url|max:500',
            'video_path' => 'nullable|string|max:255',
            'xp' => $required . '|integer|min:0',
            'muscles' => 'array',
            'muscles.*' => 'exists:muscles,id',
        ];
    }
}
