<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RewardOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RewardOrderController extends Controller
{
    public function index()
    {
        return RewardOrder::with(['user:id,name,email', 'reward:id,name'])
            ->latest()
            ->get();
    }

    /** تغییر وضعیت سفارش؛ با لغو سفارش، امتیاز برمی‌گرده (چون در موجودی حساب نمی‌شه) و موجودی انبار هم زیاد می‌شه */
    public function update(Request $request, RewardOrder $rewardOrder)
    {
        $data = $request->validate([
            'status' => 'required|in:pending,sent,cancelled',
        ]);

        DB::transaction(function () use ($rewardOrder, $data) {
            $wasCancelled = $rewardOrder->status === 'cancelled';
            $nowCancelled = $data['status'] === 'cancelled';

            if (! $wasCancelled && $nowCancelled) {
                $rewardOrder->reward()->increment('stock');
            } elseif ($wasCancelled && ! $nowCancelled) {
                $rewardOrder->reward()->decrement('stock');
            }

            $rewardOrder->update(['status' => $data['status']]);
        });

        return response()->json($rewardOrder->load(['user:id,name,email', 'reward:id,name']));
    }
}
