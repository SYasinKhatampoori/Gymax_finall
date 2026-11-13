<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\PlanCompletion;
use App\Models\PlanItem;
use Illuminate\Http\Request;

class PlanController extends Controller
{
    public function index(Request $request)
    {
        return Plan::where('user_id', $request->user()->id)
            ->with([
                'items.exercise:id,name,xp',
                'items.completion:id,plan_item_id,xp_awarded',
            ])
            ->latest()
            ->get();
    }

    /** ثبت انجام یک حرکت از برنامه؛ امتیاز همون حرکت (از سرور خونده می‌شه) به کاربر می‌رسه */
    public function complete(Request $request, PlanItem $planItem)
    {
        $planItem->load(['plan', 'exercise']);
        $user = $request->user();

        if ((int) $planItem->plan->user_id !== (int) $user->id) {
            return response()->json(['message' => 'این حرکت مال برنامه‌ی شما نیست.'], 403);
        }

        $completion = PlanCompletion::firstOrCreate(
            ['plan_item_id' => $planItem->id],
            ['user_id' => $user->id, 'xp_awarded' => $planItem->exercise->xp],
        );

        if (! $completion->wasRecentlyCreated) {
            return response()->json(['message' => 'این حرکت قبلاً ثبت شده.'], 409);
        }

        return response()->json([
            'xp_awarded' => $completion->xp_awarded,
            'balance' => $user->xpSummary()['balance'],
        ], 201);
    }

    public function xp(Request $request)
    {
        return response()->json($request->user()->xpSummary());
    }
}
