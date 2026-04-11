import { motion } from "framer-motion";
import { ShieldCheck, ArrowLeft, Star } from "lucide-react";
import { getInitials, getAvatarColor } from "../../utils/helpers";

/* ── Avatar ──────────────────────────────────────── */
export function Avatar({ user, size = "md", className = "" }) {
  const sz = {
    xs: "w-7 h-7 text-xs",
    sm: "w-9 h-9 text-sm",
    md: "w-11 h-11 text-sm",
    lg: "w-14 h-14 text-lg",
    xl: "w-20 h-20 text-2xl",
  };
  const bg = getAvatarColor(user?.name || "");
  return (
    <div
      className={`${sz[size]} ${bg} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${className}`}
    >
      {user?.avatar ? (
        <img
          src={user.avatar}
          alt={user?.name}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        getInitials(user?.name || "?")
      )}
    </div>
  );
}

/* ── StarRating ──────────────────────────────────── */
export function StarRating({ rating = 0, total = 0, size = "sm" }) {
  const avg = rating.toFixed(1);
  const filled = Math.round(parseFloat(avg));
  const txt = size === "sm" ? "text-xs" : "text-sm";
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`${size === "sm" ? "w-3 h-3" : "w-4 h-4"} ${i <= filled ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`}
          />
        ))}
      </div>
      <span className={`${txt} text-gray-500 font-medium`}>{avg}</span>
      {total > 0 && <span className={`${txt} text-gray-400`}>({total})</span>}
    </div>
  );
}

/* ── VerifiedBadge ───────────────────────────────── */
export function VerifiedBadge({ size = "sm" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 bg-green-50 text-green-700 font-bold rounded-full ${size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-2.5 py-1"}`}
    >
      <ShieldCheck className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />
      Verified
    </span>
  );
}

/* ── Spinner ─────────────────────────────────────── */
export function Spinner({ size = "md", color = "indigo", className = "" }) {
  const sz = {
    sm: "w-4 h-4 border-2",
    md: "w-7 h-7 border-2",
    lg: "w-10 h-10 border-[3px]",
  };
  const cl = {
    indigo: "border-brand-600 border-t-transparent",
    white: "border-white border-t-white/30",
    gray: "border-gray-400 border-t-transparent",
  };
  return (
    <div
      className={`${sz[size]} ${cl[color]} rounded-full animate-spin ${className}`}
    />
  );
}

/* ── PageLoader ──────────────────────────────────── */
export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner size="lg" />
    </div>
  );
}

/* ── EmptyState ──────────────────────────────────── */
export function EmptyState({ icon, title, subtitle, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-display font-bold text-gray-800 text-lg mb-1">
        {title}
      </h3>
      <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
        {subtitle}
      </p>
      {action}
    </motion.div>
  );
}

/* ── BackButton ──────────────────────────────────── */
export function BackButton({ onClick, className = "" }) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className={`w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0 ${className}`}
    >
      <ArrowLeft className="w-5 h-5 text-gray-700" />
    </motion.button>
  );
}

/* ── PageHeader (mobile-style) ───────────────────── */
export function PageHeader({ title, onBack, actions, className = "" }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 pt-12 pb-4 bg-white border-b border-gray-100 lg:pt-6 sticky top-0 z-30 ${className}`}
    >
      {onBack && <BackButton onClick={onBack} />}
      <h1 className="font-display font-bold text-lg flex-1">{title}</h1>
      {actions}
    </div>
  );
}

/* ── PageTransition ──────────────────────────────── */
export function PageTransition({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col min-h-full ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ── Input ───────────────────────────────────────── */
export function Input({ label, error, icon: Icon, className = "", ...props }) {
  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        )}
        <input
          className={`input ${Icon ? "pl-9" : ""} ${error ? "border-red-400 focus:ring-red-300" : ""} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>
      )}
    </div>
  );
}

/* ── Textarea ────────────────────────────────────── */
export function Textarea({ label, error, className = "", ...props }) {
  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <textarea
        className={`input resize-none ${error ? "border-red-400 focus:ring-red-300" : ""} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>
      )}
    </div>
  );
}

/* ── Select ──────────────────────────────────────── */
export function Select({ label, error, children, className = "", ...props }) {
  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <select
        className={`input cursor-pointer ${error ? "border-red-400" : ""} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>
      )}
    </div>
  );
}

/* ── Toggle ──────────────────────────────────────── */
export function Toggle({ checked, onChange, label, sub }) {
  return (
    <div
      onClick={onChange}
      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all select-none
      ${checked ? "border-amber-400 bg-amber-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
    >
      <div
        className={`w-11 h-6 rounded-full relative flex-shrink-0 transition-colors ${checked ? "bg-amber-400" : "bg-gray-200"}`}
      >
        <motion.div
          animate={{ x: checked ? 22 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
        />
      </div>
      <div>
        <p className="text-sm font-bold text-gray-800">{label}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

/* ── SkeletonCard ────────────────────────────────── */
export function SkeletonCard() {
  return (
    <div className="card p-4 animate-pulse">
      <div className="flex gap-2 mb-3">
        <div className="h-5 w-20 bg-gray-100 rounded-full" />
        <div className="h-5 w-14 bg-gray-100 rounded-full" />
      </div>
      <div className="h-4 bg-gray-100 rounded w-4/5 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-full mb-1.5" />
      <div className="h-3 bg-gray-100 rounded w-3/4 mb-4" />
      <div className="flex justify-between items-center pt-3 border-t border-gray-50">
        <div className="flex gap-2 items-center">
          <div className="w-7 h-7 bg-gray-100 rounded-full" />
          <div className="h-3 w-20 bg-gray-100 rounded" />
        </div>
        <div className="h-8 w-16 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}
