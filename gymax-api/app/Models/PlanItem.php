<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class PlanItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'plan_id', 'exercise_id', 'day', 'sets', 'reps', 'note',
    ];

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function exercise(): BelongsTo
    {
        return $this->belongsTo(Exercise::class);
    }

    public function completion(): HasOne
    {
        return $this->hasOne(PlanCompletion::class);
    }
}
