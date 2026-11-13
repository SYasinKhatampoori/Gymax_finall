<?php

namespace App\Http\Controllers;

use App\Models\Reward;
use App\Models\RewardOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RewardController extends Controller
{
    /** فروشگاه جایزه (عمومی) */
    public function index()
    {
        return Reward::where('is_active', true)->orderBy('xp_cost')->get();
    }

    /** خرید جایزه با امتیاز */
    public function redeem(Request $request, Reward $reward)
    {
        $data = $request->validate([
            'full_name' => 'required|string|max:100',
            'phone' => 'required|string|max:30',
            'address' => 'required|string|max:500',
        ]);

        $user = $request->user();

        $order = DB::transaction(function () use ($user, $reward, $data) {
            $locked = Reward::whereKey($reward->id)->lockForUpdate()->firstOrFail();

            if (! $locked->is_active) {
                throw ValidationException::withMessages(['reward' => ['این جایزه فعلاً در دسترس نیست.']]);
            }

            if ($locked->stock < 1) {
                throw ValidationException::withMessages(['reward' => ['موجودی این جایزه تموم شده.']]);
            }

            if ($user->xpSummary()['balance'] < $locked->xp_cost) {
                throw ValidationException::withMessages(['reward' => ['امتیاز کافی نداری.']]);
            }

            $locked->decrement('stock');

            return RewardOrder::create([
                'user_id' => $user->id,
                'reward_id' => $locked->id,
                'xp_spent' => $locked->xp_cost,
                'full_name' => $data['full_name'],
                'phone' => $data['phone'],
                'address' => $data['address'],
            ]);
        });

        return response()->json($order->load('reward:id,name'), 201);
    }

    /** سفارش‌های جایزه‌ی کاربر */
    public function orders(Request $request)
    {
        return RewardOrder::where('user_id', $request->user()->id)
            ->with('reward:id,name,image')
            ->latest()
            ->get();
    }
}
