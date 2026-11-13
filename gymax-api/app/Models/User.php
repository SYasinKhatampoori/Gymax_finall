<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    // role عمداً اینجا نیست تا هیچ‌کس موقع ثبت‌نام نتونه خودش رو ادمین کنه
    protected $fillable = ['name', 'email', 'password'];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function planCompletions(): HasMany
    {
        return $this->hasMany(PlanCompletion::class);
    }

    public function rewardOrders(): HasMany
    {
        return $this->hasMany(RewardOrder::class);
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function activeSubscription(): ?Subscription
    {
        return $this->subscriptions()
            ->with('plan')
            ->where('ends_at', '>', now())
            ->orderByDesc('ends_at')
            ->first();
    }

    public function hasActiveSubscription(): bool
    {
        return $this->subscriptions()->where('ends_at', '>', now())->exists();
    }

    /** ادمین‌ها و کاربرانِ دارای اشتراک فعال می‌تونن فیلم ببینن */
    public function canWatchVideos(): bool
    {
        return $this->isAdmin() || $this->hasActiveSubscription();
    }

    /** امتیاز کسب‌شده، خرج‌شده (سفارش‌های لغوشده حساب نمی‌شن) و موجودی */
    public function xpSummary(): array
    {
        $earned = (int) PlanCompletion::where('user_id', $this->id)->sum('xp_awarded');
        $spent = (int) RewardOrder::where('user_id', $this->id)
            ->where('status', '!=', 'cancelled')
            ->sum('xp_spent');

        return [
            'earned' => $earned,
            'spent' => $spent,
            'balance' => $earned - $spent,
        ];
    }

    /** اطلاعاتی که فرانت از کاربر لازم داره */
    public function profile(): array
    {
        $sub = $this->activeSubscription();

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'subscription' => $sub ? [
                'plan' => $sub->plan?->name,
                'ends_at' => $sub->ends_at->toIso8601String(),
                'days_left' => max(0, (int) ceil(($sub->ends_at->getTimestamp() - time()) / 86400)),
            ] : null,
            'xp' => $this->xpSummary(),
        ];
    }
}
