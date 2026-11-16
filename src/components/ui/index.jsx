import Link from "next/link";

import { cn } from "@/lib/cn";

/* ==========================================================================
   Primitives shared by every Wanderlust Atlas surface.
   ========================================================================== */

export function Container({ as: Tag = "div", className, children, ...props }) {
  return (
    <Tag className={cn("container-page", className)} {...props}>
      {children}
    </Tag>
  );
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  align = "left",
  as: Tag = "h2",
  className,
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-brand-ink">
          {eyebrow}
        </p>
      ) : null}
      <Tag id={id} className="scroll-mt-24 text-balance text-3xl leading-tight text-ink sm:text-4xl">
        {title}
      </Tag>
      {description ? (
        <p className="mt-4 text-base leading-relaxed text-ink-muted">{description}</p>
      ) : null}
    </div>
  );
}

const BUTTON_VARIANTS = {
  primary:
    "bg-brand text-on-brand hover:bg-brand-hover active:bg-brand-hover shadow-sm",
  accent:
    "bg-sunset-500 text-ocean-950 hover:bg-sunset-600 active:bg-sunset-700 shadow-sm",
  secondary:
    "bg-surface text-ink border border-line-strong hover:bg-surface-muted active:bg-surface-muted",
  ghost: "bg-transparent text-ink-muted hover:bg-surface-muted hover:text-ink",
  danger: "bg-danger text-white hover:brightness-110 active:brightness-95",
  quiet:
    "bg-brand-soft text-brand-ink border border-brand-line hover:brightness-105",
};

const BUTTON_SIZES = {
  sm: "px-3 py-1.5 text-sm gap-1.5",
  md: "px-4 py-2.5 text-sm gap-2",
  lg: "px-6 py-3 text-base gap-2",
};

const BUTTON_BASE =
  "inline-flex items-center justify-center rounded-full font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-inherit";

export function buttonClasses({ variant = "primary", size = "md", className } = {}) {
  return cn(BUTTON_BASE, BUTTON_VARIANTS[variant] || BUTTON_VARIANTS.primary, BUTTON_SIZES[size] || BUTTON_SIZES.md, className);
}

export function Button({ variant, size, className, type = "button", ...props }) {
  return <button type={type} className={buttonClasses({ variant, size, className })} {...props} />;
}

export function ButtonLink({ href, variant, size, className, children, ...props }) {
  return (
    <Link href={href} className={buttonClasses({ variant, size, className })} {...props}>
      {children}
    </Link>
  );
}

const BADGE_TONES = {
  neutral: "bg-surface-muted text-ink-muted border-line",
  lagoon: "bg-brand-soft text-brand-ink border-brand-line",
  success: "bg-success-soft text-success border-success-line",
  warning: "bg-warning-soft text-warning border-warning-line",
  danger: "bg-danger-soft text-danger border-danger-line",
  info: "bg-info-soft text-info border-info-line",
  onDark: "bg-white/10 text-white border-white/20",
};

export function Badge({ tone = "neutral", className, children, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        BADGE_TONES[tone] || BADGE_TONES.neutral,
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

const ALERT_TONES = {
  info: "border-info-line bg-info-soft text-info",
  success: "border-success-line bg-success-soft text-success",
  warning: "border-warning-line bg-warning-soft text-warning",
  danger: "border-danger-line bg-danger-soft text-danger",
  neutral: "border-line bg-surface-muted text-ink-muted",
};

export function Alert({ tone = "info", title, children, className, role = "status" }) {
  return (
    <div role={role} className={cn("rounded-xl border p-4 text-sm", ALERT_TONES[tone] || ALERT_TONES.info, className)}>
      {title ? <p className="font-semibold">{title}</p> : null}
      {children ? <div className={cn(title && "mt-1", "leading-relaxed")}>{children}</div> : null}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-14 text-center",
        className,
      )}
    >
      {Icon ? (
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-ink-subtle">
          <Icon size={22} aria-hidden="true" />
        </span>
      ) : null}
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      {description ? <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-muted">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function Spinner({ className, label = "Loading" }) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        "inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent",
        className,
      )}
    />
  );
}

export function LoadingState({ label = "Loading", className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-20 text-ink-muted", className)}>
      <Spinner className="h-8 w-8 text-brand" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

export function Skeleton({ className }) {
  return <div aria-hidden="true" className={cn("skeleton rounded-lg", className)} />;
}

export function Field({ label, htmlFor, hint, error, required, children, className }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-ink">
        {label}
        {required ? (
          <span className="ml-1 text-danger" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${htmlFor}-hint`} className="text-xs text-ink-subtle">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function inputClasses({ invalid = false } = {}) {
  return cn(
    "w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-ink shadow-sm transition-colors",
    "placeholder:text-ink-subtle",
    invalid ? "border-danger-line" : "border-line-strong hover:border-ink-subtle",
  );
}

export function StatTile({ label, value, hint, tone = "neutral" }) {
  const tones = {
    neutral: "text-ink",
    warning: "text-warning",
    success: "text-success",
    danger: "text-danger",
    lagoon: "text-brand-ink",
  };
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-subtle">{label}</p>
      <p className={cn("mt-2 font-display text-3xl", tones[tone] || tones.neutral)}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink-muted">{hint}</p> : null}
    </div>
  );
}
