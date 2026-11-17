"use client";
 
import { digitsOnly, groupDigits } from "@/lib/format";
import { Field, Input } from "./ui";
 
export const emptyPayment = { card_number: "", code: "" };
 
export function validatePayment(value) {
  if (digitsOnly(value.card_number, 16).length !== 16) return "شماره کارت باید ۱۶ رقم باشه.";
  if (digitsOnly(value.code, 6).length !== 6) return "کد باید ۶ رقم باشه.";
  return null;
}
 
export function paymentPayload(value) {
  return {
    card_number: digitsOnly(value.card_number, 16),
    code: digitsOnly(value.code, 6),
  };
}
 

export default function PaymentFields({ value, onChange }) {
  return (
    <div className="space-y-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
      <div className="flex items-start gap-2 text-sm leading-7 text-amber-300">
        <span aria-hidden="true">🧪</span>
        <p>
          <strong>درگاه پرداخت آزمایشی:</strong> هیچ پولی کم نمی‌شه. یه شماره‌ی دلخواه ۱۶ رقمی و یه کد دلخواه ۶ رقمی
          بزن. <strong>اطلاعات کارت واقعی‌ت رو وارد نکن.</strong>
        </p>
      </div>
 
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="شماره کارت (۱۶ رقم)">
          <Input
            dir="ltr"
            inputMode="numeric"
            autoComplete="off"
            placeholder="1234 5678 9012 3456"
            value={groupDigits(value.card_number)}
            onChange={(e) => onChange({ ...value, card_number: digitsOnly(e.target.value, 16) })}
          />
        </Field>
        <Field label="کد ۶ رقمی">
          <Input
            dir="ltr"
            inputMode="numeric"
            autoComplete="off"
            maxLength={6}
            placeholder="••••••"
            value={value.code}
            onChange={(e) => onChange({ ...value, code: digitsOnly(e.target.value, 6) })}
          />
        </Field>
      </div>
    </div>
  );
}
 