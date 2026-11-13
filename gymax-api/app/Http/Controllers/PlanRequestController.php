<?php

namespace App\Http\Controllers;

use App\Models\PlanRequest;
use App\Services\FakePayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PlanRequestController extends Controller
{
    public function index(Request $request)
    {
        return PlanRequest::where('user_id', $request->user()->id)
            ->latest()
            ->get();
    }

    /**
     * کاربر دارای اشتراک فعال: درخواست رایگانه.
     * کاربر بدون اشتراک: باید پرداخت (آزمایشی) هم بفرسته (card_number و code).
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $hasSubscription = $user->hasActiveSubscription();

        $rules = [
            'goal' => 'required|string|max:255',
            'level' => 'required|in:beginner,intermediate,advanced',
            'days_per_week' => 'required|integer|min:1|max:7',
            'notes' => 'nullable|string',
        ];

        if (! $hasSubscription) {
            $rules = array_merge($rules, FakePayment::rules());
        }

        $data = $request->validate($rules, FakePayment::messages());

        $planRequest = DB::transaction(function () use ($user, $hasSubscription, $data) {
            $payment = null;

            if (! $hasSubscription) {
                $payment = FakePayment::charge(
                    $user,
                    'plan_request',
                    (int) config('gymax.plan_price'),
                    'خرید برنامه تمرینی',
                    $data['card_number'],
                );
            }

            return PlanRequest::create([
                'user_id' => $user->id,
                'goal' => $data['goal'],
                'level' => $data['level'],
                'days_per_week' => $data['days_per_week'],
                'notes' => $data['notes'] ?? null,
                'paid_via' => $hasSubscription ? 'subscription' : 'payment',
                'payment_id' => $payment?->id,
            ]);
        });

        return response()->json($planRequest, 201);
    }
}
