<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reward;
use Illuminate\Http\Request;

class RewardController extends Controller
{
    public function index()
    {
        return Reward::orderBy('xp_cost')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate($this->rules());

        return response()->json(Reward::create($data), 201);
    }

    public function update(Request $request, Reward $reward)
    {
        $data = $request->validate($this->rules(true));

        $reward->update($data);

        return response()->json($reward);
    }

    /** اگه برای جایزه سفارش ثبت شده باشه، حذف نمی‌شه و فقط غیرفعال می‌شه */
    public function destroy(Reward $reward)
    {
        if ($reward->orders()->exists()) {
            $reward->update(['is_active' => false]);

            return response()->json(['message' => 'چون برای این جایزه سفارش ثبت شده، فقط غیرفعال شد.']);
        }

        $reward->delete();

        return response()->json(['message' => 'جایزه حذف شد.']);
    }

    private function rules(bool $partial = false): array
    {
        $required = $partial ? 'sometimes|required' : 'required';

        return [
            'name' => $required . '|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|string|max:500',
            'xp_cost' => $required . '|integer|min:1',
            'stock' => $required . '|integer|min:0',
            'is_active' => 'sometimes|boolean',
        ];
    }
}
