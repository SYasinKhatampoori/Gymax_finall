<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /** لیست کاربران با جستجو (?q=) */
    public function index(Request $request)
    {
        $users = User::query()
            ->when($request->filled('q'), function ($query) use ($request) {
                $term = '%' . $request->q . '%';
                $query->where(function ($w) use ($term) {
                    $w->where('name', 'like', $term)->orWhere('email', 'like', $term);
                });
            })
            ->with('subscriptions:id,user_id,ends_at')
            ->withSum('planCompletions as earned_xp', 'xp_awarded')
            ->withSum(['rewardOrders as spent_xp' => fn ($q) => $q->where('status', '!=', 'cancelled')], 'xp_spent')
            ->orderBy('id')
            ->get();

        return $users->map(function (User $user) {
            $latest = $user->subscriptions->sortByDesc('ends_at')->first();

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'created_at' => $user->created_at,
                'subscription_active' => $latest !== null && $latest->ends_at->isFuture(),
                'subscription_ends_at' => $latest?->ends_at,
                'xp_balance' => (int) $user->earned_xp - (int) $user->spent_xp,
            ];
        })->values();
    }

    /** ادمین کردن یا برداشتن ادمین. نقش خودت رو نمی‌تونی عوض کنی (تا قفل نشی). */
    public function updateRole(Request $request, User $user)
    {
        $data = $request->validate([
            'role' => 'required|in:user,admin',
        ]);

        if ((int) $user->id === (int) $request->user()->id) {
            return response()->json(['message' => 'نقش خودت رو نمی‌تونی عوض کنی.'], 422);
        }

        $user->role = $data['role'];
        $user->save();

        return response()->json(['id' => $user->id, 'role' => $user->role]);
    }
}
