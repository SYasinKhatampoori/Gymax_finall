<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exercises', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sport_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->text('how_to')->nullable();
            // لینک یوتیوب / آپارات / فایل مستقیم
            $table->string('video_url', 500)->nullable();
            // مسیر ویدیوی آپلودشده (روی دیسک خصوصی، فقط با اشتراک قابل پخش)
            $table->string('video_path')->nullable();
            $table->unsignedInteger('xp')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exercises');
    }
};
