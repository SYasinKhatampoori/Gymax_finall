<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\PlanRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PlanController extends Controller
{
    public function store(Request $request, PlanRequest $planRequest)
    {
        if ($planRequest->plan()->exists()) {
            return response()->json(
                ['message' => 'برای این درخواست قبلاً برنامه نوشته شده.'],
                422
            );
        }

        $data = $request->validate([
            'title' => 'required|string|max:255',
            'note' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.exercise_id' => 'required|exists:exercises,id',
            'items.*.day' => 'required|integer|min:1|max:7',
            'items.*.sets' => 'required|integer|min:1|max:20',
            'items.*.reps' => 'required|string|max:50',
            'items.*.note' => 'nullable|string',
        ]);

        $plan = DB::transaction(function () use ($data, $planRequest, $request) {
            $plan = Plan::create([
                'plan_request_id' => $planRequest->id,
                'user_id' => $planRequest->user_id,
                'admin_id' => $request->user()->id,
                'title' => $data['title'],
                'note' => $data['note'] ?? null,
            ]);

            $plan->items()->createMany($data['items']);
            $planRequest->update(['status' => 'done']);

            return $plan;
        });

        return response()->json($plan->load('items.exercise:id,name,xp'), 201);
    }
}
