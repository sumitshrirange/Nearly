import { formatDistanceToNow } from "date-fns";

export const timeAgo = (date) => {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return "";
  }
};

export const formatDist = (km) => {
  if (km == null) return null;
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
};

export const formatRupees = (n) =>
  n > 0 ? `₹${Number(n).toLocaleString("en-IN")}` : null;

export const getInitials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

export const avatarColors = [
  "bg-indigo-500",
  "bg-violet-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-teal-500",
  "bg-pink-500",
  "bg-orange-500",
  "bg-cyan-500",
];
export const getAvatarColor = (name = "") => {
  let h = 0;
  for (let c of name) h = c.charCodeAt(0) + ((h << 5) - h);
  return avatarColors[Math.abs(h) % avatarColors.length];
};

export const CATEGORIES = [
  "Moving",
  "Repairs",
  "Delivery",
  "Emergency",
  "Cleaning",
  "Teaching",
  "Tech Help",
  "Pet Care",
  "Gardening",
  "Others",
];

export const CATEGORY_META = {
  Moving: {
    icon: "🚛",
    color: "bg-blue-50 text-blue-700",
    border: "border-blue-200",
  },
  Repairs: {
    icon: "🔧",
    color: "bg-orange-50 text-orange-700",
    border: "border-orange-200",
  },
  Delivery: {
    icon: "🛵",
    color: "bg-green-50 text-green-700",
    border: "border-green-200",
  },
  Emergency: {
    icon: "🚨",
    color: "bg-red-50 text-red-600",
    border: "border-red-200",
  },
  Cleaning: {
    icon: "🧹",
    color: "bg-teal-50 text-teal-700",
    border: "border-teal-200",
  },
  Teaching: {
    icon: "📚",
    color: "bg-purple-50 text-purple-700",
    border: "border-purple-200",
  },
  "Tech Help": {
    icon: "💻",
    color: "bg-sky-50 text-sky-700",
    border: "border-sky-200",
  },
  "Pet Care": {
    icon: "🐾",
    color: "bg-pink-50 text-pink-700",
    border: "border-pink-200",
  },
  Gardening: {
    icon: "🌿",
    color: "bg-lime-50 text-lime-700",
    border: "border-lime-200",
  },
  Others: {
    icon: "✦",
    color: "bg-gray-100 text-gray-600",
    border: "border-gray-200",
  },
};

export const getCat = (cat) => CATEGORY_META[cat] || CATEGORY_META.Others;
