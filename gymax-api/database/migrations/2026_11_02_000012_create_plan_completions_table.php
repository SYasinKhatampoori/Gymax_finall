<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plan_completions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            // unique: هر حرکت از برنامه فقط یک بار امتیاز می‌ده
            $table->foreignId('plan_item_id')->unique()->constrained()->cascadeOnDelete();
            $table->unsignedInteger('xp_awarded');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plan_completions');
    }
};
