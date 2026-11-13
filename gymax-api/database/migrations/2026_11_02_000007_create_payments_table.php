<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // پرداخت‌ها «آزمایشی» هستن: هیچ پولی جابه‌جا نمی‌شه و شماره کارت ذخیره نمی‌شه.
        // فقط ۴ رقم آخر برای نمایش رسید نگه داشته می‌شه.
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type'); // subscription | plan_request
            $table->unsignedInteger('amount');
            $table->string('description');
            $table->string('card_last4', 4);
            $table->string('reference')->unique();
            $table->string('status')->default('paid');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
