<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    use HasFactory;

    protected $fillable = [
        'plan_request_id', 'user_id', 'admin_id', 'title', 'note',
    ];

    public function planRequest(): BelongsTo
    {
        return $this->belongsTo(PlanRequest::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(PlanItem::class);
    }
}
