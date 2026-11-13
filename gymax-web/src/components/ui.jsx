"use client";

import { useEffect } from "react";

const fieldStyle =
  "w-full rounded-lg border border-line bg-page px-3 py-2 text-sm text-fg placeholder:text-muted/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:opacity-60";

export function Input({ className = "", ...rest }) {
  return <input {...rest} className={`${fieldStyle} ${className}`} />;
}

export function Textarea({ className = "", ...rest }) {
  return <textarea rows={4} {...rest} className={`${fieldStyle} ${className}`} />;
}

export function Select({ className = "", ...rest }) {
  return <select {...rest} className={`${fieldStyle} ${className}`} />;
}

export function Field({ label, hint, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-fg/90">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted">{hint}</span>}
    </label>
  );
}

const buttonVariants = {
  primary: "bg-brand text-white hover:bg-brand-dark",
  secondary: "bg-surface2 text-fg hover:bg-line",
  danger: "bg-red-600 text-white hover:bg-red-700",
  ghost: "bg-transparent text-fg ring-1 ring-line hover:bg-surface2",
};

export function Button({
  variant = "primary",
  loading = false,
  className = "",
  disabled,
  type = "button",
  children,
  ...rest
}) {
  return (
    <button
      {...rest}
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${buttonVariants[variant]} ${className}`}
    >
      {loading && <Spinner small />}
      {children}
    </button>
  );
}

export function Spinner({ small = false }) {
  const size = small ? "h-4 w-4 border-2" : "h-8 w-8 border-4";
  return (
    <span
      role="status"
      aria-label="در حال بارگذاری"
      className={`inline-block animate-spin rounded-full border-current border-t-transparent ${size}`}
    />
  );
}

export function Loading({ text = "در حال بارگذاری..." }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-muted">
      <Spinner />
      <span>{text}</span>
    </div>
  );
}

const alertStyles = {
  error: "border-red-500/30 bg-red-500/10 text-red-300",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  info: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-300",
};

export function Alert({ kind = "error", children }) {
  return (
    <div role="alert" className={`rounded-lg border px-4 py-3 text-sm leading-7 ${alertStyles[kind]}`}>
      {children}
    </div>
  );
}

const badgeTones = {
  slate: "bg-surface2 text-muted",
  blue: "bg-brand/15 text-sky-300",
  green: "bg-emerald-500/15 text-emerald-300",
  amber: "bg-amber-500/15 text-amber-300",
  red: "bg-red-500/15 text-red-300",
};

export function Badge({ tone = "slate", children }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeTones[tone]}`}>
      {children}
    </span>
  );
}

export function Card({ className = "", children }) {
  return <div className={`rounded-2xl border border-line bg-surface p-5 ${className}`}>{children}</div>;
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-fg">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}

export function EmptyState({ children }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-surface/50 px-4 py-10 text-center text-sm text-muted">
      {children}
    </div>
  );
}

/** پنجره‌ی باز‌شونده روی صفحه */
export function Modal({ open, title, onClose, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-surface p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="rounded-lg px-2 py-1 text-muted hover:bg-surface2 hover:text-fg"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
