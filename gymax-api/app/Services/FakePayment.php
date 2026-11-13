<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Str;

/**
 * درگاه پرداخت «آزمایشی».
 *
 * هیچ پولی جابه‌جا نمی‌شه و به هیچ بانکی وصل نیست. هر شماره‌ی ۱۲ رقمی و هر کد ۶ رقمی
 * قبول می‌شه. شماره‌ی کارت و کد ذخیره نمی‌شن؛ فقط ۴ رقم آخر برای نمایش رسید نگه داشته
 * می‌شه. وقتی پروژه واقعی شد، فقط همین کلاس باید با درگاه واقعی (مثل زرین‌پال) عوض بشه.
 */
class FakePayment
{
    public static function rules(): array
    {
        return [
            'card_number' => ['required', 'regex:/^\d{12}$/'],
            'code' => ['required', 'regex:/^\d{6}$/'],
        ];
    }

    public static function messages(): array
    {
        return [
            'card_number.required' => 'شماره کارت رو وارد کن.',
            'card_number.regex' => 'شماره کارت باید ۱۲ رقم باشه.',
            'code.required' => 'کد ۶ رقمی رو وارد کن.',
            'code.regex' => 'کد باید ۶ رقم باشه.',
        ];
    }

    public static function charge(User $user, string $type, int $amount, string $description, string $cardNumber): Payment
    {
        return Payment::create([
            'user_id' => $user->id,
            'type' => $type,
            'amount' => $amount,
            'description' => $description,
            'card_last4' => substr($cardNumber, -4),
            'reference' => 'DEMO-' . strtoupper(Str::random(10)),
            'status' => 'paid',
        ]);
    }
}
