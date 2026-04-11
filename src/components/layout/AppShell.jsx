import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  MessageCircle,
  Bell,
  User,
  Plus,
  LogOut,
  FileText,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNotif } from "../../context/NotifContext";
import { getInitials, getAvatarColor } from "../../utils/helpers";
import toast from "react-hot-toast";

const NAV = [
  { to: "/", icon: Home, label: "Home", exact: true },
  { to: "/chats", icon: MessageCircle, label: "Chats" },
  { to: "/notifications", icon: Bell, label: "Alerts", badge: true },
  { to: "/profile", icon: User, label: "Profile" },
];

function SidebarNavLink({ item, unreadCount }) {
  return (
    <NavLink
      to={item.to}
      end={item.exact}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
        ${
          isActive
            ? "bg-brand-600 text-white shadow-sm"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div className="relative flex-shrink-0">
            <item.icon className="w-5 h-5" />
            {item.badge && unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold min-w-[16px] h-4 px-0.5 rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
          <span className="flex-1 truncate">{item.label}</span>
          {isActive && (
            <div className="w-1.5 h-1.5 rounded-full bg-white/70 flex-shrink-0" />
          )}
        </>
      )}
    </NavLink>
  );
}

export default function AppShell() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotif();
  const navigate = useNavigate();
  const location = useLocation();

  // Full-screen pages that should hide the bottom mobile nav
  const isFullScreen = location.pathname.startsWith("/chat/");
  const isPostPage = location.pathname === "/post";

  const handleLogout = () => {
    logout();
    navigate("/onboarding", { replace: true });
    toast.success("Signed out");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ── Desktop Sidebar ──────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 fixed left-0 top-0 h-full bg-white border-r border-gray-100 z-40 shadow-sm">
        {/* Logo */}
        <div className="flex flex-shrink-0 px-5 py-5 border-b border-gray-100">
          <img src="/Nearly_Logo.png" className="size-12" alt="" />
          <div>
            <span className="text-2xl font-bold tracking-tight font-display text-brand-600">
              Nearly.
            </span>
            <p className="text-[11px] text-gray-400 mt-0.5 font-medium">
              Community Help Exchange
            </p>
          </div>
        </div>

        {/* Post button */}
        <div className="px-4 pt-4 pb-2 flex-shrink-0">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/post")}
            className="btn btn-primary btn-lg w-full"
          >
            <Plus className="w-5 h-5" />
            Post a Request
          </motion.button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-2 flex flex-col gap-0.5 overflow-y-auto">
          {NAV.map((item) => (
            <SidebarNavLink
              key={item.to}
              item={item}
              unreadCount={unreadCount}
            />
          ))}

          <div className="border-t border-gray-100 my-2" />

          <NavLink
            to="/my-requests"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
              ${isActive ? "bg-brand-600 text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`
            }
          >
            <FileText className="w-5 h-5 flex-shrink-0" />
            My Requests
          </NavLink>
        </nav>

        {/* User card at bottom */}
        <div className="border-t border-gray-100 p-3 flex-shrink-0">
          <div
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group mb-1"
            onClick={() => navigate("/profile")}
          >
            <div
              className={`w-9 h-9 rounded-full ${getAvatarColor(user?.name || "")} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt=""
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                getInitials(user?.name || "?")
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user?.location?.city || "Nagpur"}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────── */}
      <main
        className={`flex-1 lg:ml-64 flex flex-col min-h-screen
          ${!isFullScreen ? "pb-16 lg:pb-0" : ""}`}
      >
        <AnimatePresence mode="wait">
          <Outlet key={location.pathname} />
        </AnimatePresence>
      </main>

      {/* ── Mobile Bottom Nav ────────────────────────────────── */}
      {!isFullScreen && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 lg:hidden shadow-nav">
          <div className="flex items-center justify-around h-14 px-1 max-w-screen-md mx-auto">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors relative min-w-[48px]
                  ${isActive ? "text-brand-600" : "text-gray-400"}`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="relative">
                      <item.icon
                        className={`w-5 h-5 ${isActive ? "stroke-[2.2px]" : ""}`}
                      />
                      {item.badge && unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold min-w-[14px] h-3.5 px-0.5 rounded-full flex items-center justify-center">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] font-semibold">
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
