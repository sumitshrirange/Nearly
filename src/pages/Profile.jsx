import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Pencil,
  FileText,
  Star,
  Bell,
  Shield,
  LogOut,
  ChevronRight,
  Heart,
  Settings,
  ShieldCheck,
} from "lucide-react";
import {
  Avatar,
  StarRating,
  VerifiedBadge,
  PageTransition,
  PageLoader,
} from "../components/ui";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";

const StatCard = ({ value, label, color }) => (
  <div className="flex-1 flex flex-col items-center py-4 border-r border-gray-100 last:border-r-0">
    <span className={`font-display font-bold text-xl ${color}`}>{value}</span>
    <span className="text-xs text-gray-400 font-medium mt-0.5 text-center">
      {label}
    </span>
  </div>
);

const MenuItem = ({
  icon: Icon,
  label,
  sub,
  onClick,
  danger = false,
  iconBg = "bg-brand-50",
  iconColor = "text-brand-600",
}) => (
  <motion.button
    whileTap={{ scale: 0.99 }}
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-3.5 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
  >
    <div
      className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}
    >
      <Icon className={`w-4 h-4 ${iconColor}`} />
    </div>
    <div className="flex-1 min-w-0">
      <p
        className={`text-sm font-semibold ${danger ? "text-red-500" : "text-gray-800"}`}
      >
        {label}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
    <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
  </motion.button>
);

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Fetch fresh profile data including review count
  const { data } = useQuery({
    queryKey: ["profile-me", user?._id],
    queryFn: async () => {
      const { data } = await api.get(`/users/${user._id}`);
      return data;
    },
    enabled: !!user,
  });

  if (!user) return <PageLoader />;

  const avg = user.rating.toFixed(1);
  const reviewCount = data?.reviews?.length ?? user.totalRatings ?? 0;

  const handleLogout = () => {
    logout();
    navigate("/onboarding", { replace: true });
    toast.success("Signed out successfully");
  };

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto w-full">
        {/* Page header */}
        <div className="px-4 pb-4 pt-6 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-30">
          <h1 className="font-display font-bold text-xl">My Profile</h1>
          <button
            onClick={() => navigate("/edit-profile")}
            className="w-9 h-9 flex items-center justify-center bg-brand-50 rounded-xl hover:bg-brand-100 transition-colors"
          >
            <Pencil className="w-4 h-4 text-brand-600" />
          </button>
        </div>

        {/* Profile hero */}
        <div className="bg-white px-4 py-5 flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
              <Avatar user={user} size="xl" />
              {user.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <Shield className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display font-bold text-xl leading-tight">
                  {user.name}
                </h2>
                {user.isVerified && <VerifiedBadge />}
              </div>
              <p className="text-sm text-gray-400 mt-0.5">
                {user.location?.city || "Nagpur"},{" "}
                {user.location?.state || "Maharashtra"}
              </p>
              {user.bio && (
                <p className="text-sm text-gray-500 mt-1.5 leading-relaxed line-clamp-2">
                  {user.bio}
                </p>
              )}
              <div className="mt-1.5">
                <StarRating rating={user.rating} total={user.totalRatings} />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
            <StatCard
              value={user.helpsGiven || 0}
              label="Helps Given"
              color="text-green-500"
            />
            <StatCard
              value={user.requestsPosted || 0}
              label="Requests"
              color="text-brand-600"
            />
            <StatCard value={avg} label="Avg. Rating" color="text-amber-500" />
          </div>

          {/* Verification CTA if not verified */}
          {!user.isVerified && (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/verification")}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-brand-50 to-indigo-50 border border-brand-100 w-full text-left"
            >
              <ShieldCheck className="w-8 h-8 text-brand-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-brand-700">Get Verified</p>
                <p className="text-xs text-brand-500 mt-0.5">
                  Earn a trust badge and get 3x more help
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-brand-400 flex-shrink-0" />
            </motion.button>
          )}
        </div>

        {/* Menu sections */}
        <div className="flex flex-col gap-3 py-3 px-4 lg:px-0">
          {/* Activity section */}
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-card">
            <div className="px-4 py-2.5 border-b border-gray-50">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Activity
              </p>
            </div>
            <MenuItem
              icon={FileText}
              label="My Requests"
              sub="View and manage your posted requests"
              onClick={() => navigate("/my-requests")}
            />
            <div className="border-t border-gray-50 mx-4" />
            <MenuItem
              icon={Heart}
              label="My Helps"
              sub={`${user.helpsGiven || 0} request${user.helpsGiven !== 1 ? "s" : ""} assisted`}
              onClick={() => navigate("/my-helps")}
              iconBg="bg-rose-50"
              iconColor="text-rose-500"
            />
            <div className="border-t border-gray-50 mx-4" />
            <MenuItem
              icon={Star}
              label="Reviews & Ratings"
              sub={`${reviewCount} review${reviewCount !== 1 ? "s" : ""} · ${avg} average`}
              onClick={() => navigate("/my-reviews")}
              iconBg="bg-amber-50"
              iconColor="text-amber-500"
            />
          </div>

          {/* Account section */}
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-card">
            <div className="px-4 py-2.5 border-b border-gray-50">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Account
              </p>
            </div>
            <MenuItem
              icon={Pencil}
              label="Edit Profile"
              sub="Name, bio and photo"
              onClick={() => navigate("/edit-profile")}
            />
            <div className="border-t border-gray-50 mx-4" />
            <MenuItem
              icon={Bell}
              label="Notifications"
              sub="Manage your alerts and updates"
              onClick={() => navigate("/notifications")}
              iconBg="bg-violet-50"
              iconColor="text-violet-600"
            />
            <div className="border-t border-gray-50 mx-4" />
            <MenuItem
              icon={ShieldCheck}
              label="Verification"
              sub={
                user.isVerified
                  ? "Account verified ✓"
                  : "Verify your identity for more trust"
              }
              onClick={() => navigate("/verification")}
              iconBg="bg-green-50"
              iconColor="text-green-600"
            />
            <div className="border-t border-gray-50 mx-4" />
            <MenuItem
              icon={Settings}
              label="Settings"
              sub="Account information and deletion"
              onClick={() => navigate("/settings")}
              iconBg="bg-gray-100"
              iconColor="text-gray-600"
            />
          </div>

          {/* Sign out */}
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-card">
            <MenuItem
              icon={LogOut}
              label="Sign Out"
              onClick={handleLogout}
              danger
              iconBg="bg-red-50"
              iconColor="text-red-500"
            />
          </div>

          <p className="text-center text-xs text-gray-300 pb-4 mt-1">
            Nearly · Made with ❤️ by Sumit Shrirange
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
