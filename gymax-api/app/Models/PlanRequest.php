<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class PlanRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'goal', 'level', 'days_per_week', 'notes',
        'status', 'paid_via', 'payment_id',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function plan(): HasOne
    {
        return $this->hasOne(Plan::class);
    }
}
