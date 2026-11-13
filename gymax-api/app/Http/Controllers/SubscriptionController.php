<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Services\FakePayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SubscriptionController extends Controller
{
    /** لیست بسته‌های اشتراک (عمومی) */
    public function plans()
    {
        return SubscriptionPlan::where('is_active', true)->orderBy('days')->get();
    }

    /** وضعیت اشتراک کاربر، قیمت درخواست برنامه و تاریخچه‌ی پرداخت‌ها */
    public function show(Request $request)
    {
        $user = $request->user();
        $profile = $user->profile();

        return response()->json([
            'subscription' => $profile['subscription'],
            'plan_request_price' => config('gymax.plan_price'),
            'payments' => Payment::where('user_id', $user->id)->latest()->limit(20)->get(),
        ]);
    }

    /** خرید اشتراک با درگاه آزمایشی؛ اگه اشتراک فعال داشته باشه، از پایانش تمدید می‌شه */
    public function checkout(Request $request)
    {
        $data = $request->validate(
            ['subscription_plan_id' => 'required|integer', ...FakePayment::rules()],
            FakePayment::messages(),
        );

        $plan = SubscriptionPlan::where('is_active', true)->findOrFail($data['subscription_plan_id']);
        $user = $request->user();

        [$payment, $subscription] = DB::transaction(function () use ($user, $plan, $data) {
            $payment = FakePayment::charge(
                $user,
                'subscription',
                $plan->price,
                'خرید اشتراک ' . $plan->name,
                $data['card_number'],
            );

            $current = $user->activeSubscription();
            $start = $current ? $current->ends_at->copy() : now();

            $subscription = Subscription::create([
                'user_id' => $user->id,
                'subscription_plan_id' => $plan->id,
                'payment_id' => $payment->id,
                'starts_at' => $start,
                'ends_at' => $start->copy()->addDays($plan->days),
            ]);

            return [$payment, $subscription];
        });

        return response()->json([
            'payment' => $payment,
            'subscription' => $subscription,
        ], 201);
    }
}
