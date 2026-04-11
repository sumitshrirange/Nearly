import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  MessageCircle,
  CheckCircle,
  Star,
  MapPin,
  ArrowLeft,
} from "lucide-react";
import { PageTransition, EmptyState, PageLoader } from "../components/ui";
import { useNotif } from "../context/NotifContext";
import { timeAgo } from "../utils/helpers";
import api from "../utils/api";

const ICON_MAP = {
  message: { Icon: MessageCircle, bg: "bg-brand-50", color: "text-brand-600" },
  help_offered: { Icon: Bell, bg: "bg-violet-50", color: "text-violet-600" },
  help_accepted: {
    Icon: CheckCircle,
    bg: "bg-green-50",
    color: "text-green-600",
  },
  request_completed: {
    Icon: CheckCircle,
    bg: "bg-green-50",
    color: "text-green-600",
  },
  review: { Icon: Star, bg: "bg-amber-50", color: "text-amber-600" },
  system: { Icon: Bell, bg: "bg-blue-50", color: "text-blue-600" },
};

export default function Notifications() {
  const navigate = useNavigate();
  const { markAllRead, fetchUnread } = useNotif();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["notifications-full"],
    queryFn: async () => {
      const { data } = await api.get("/notifications?limit=50");
      return data;
    },
  });

  const handleMarkAll = async () => {
    await markAllRead();
    refetch();
    fetchUnread();
  };

  const handleTap = async (notif) => {
    if (!notif.isRead) {
      await api.put(`/notifications/${notif._id}/read`);
      refetch();
      fetchUnread();
    }
    if (notif.data?.chatId) navigate(`/chat/${notif.data.chatId}`);
    else if (notif.data?.requestId)
      navigate(`/request/${notif.data.requestId}`);
  };

  if (isLoading) return <PageLoader />;
  const notifications = data?.notifications || [];
  const unread = data?.unreadCount || 0;

  return (
    <PageTransition>
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 pb-4 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 lg:hidden"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="font-display font-bold text-xl">Notifications</h1>
            {unread > 0 && (
              <p className="text-xs text-brand-600 font-semibold">
                {unread} unread
              </p>
            )}
          </div>
        </div>
        {unread > 0 && (
          <button
            onClick={handleMarkAll}
            className="text-sm text-brand-600 font-semibold hover:text-brand-700"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="max-w-2xl mx-auto w-full">
        {notifications.length === 0 ? (
          <EmptyState
            icon="🔔"
            title="No notifications yet"
            subtitle="We'll alert you when someone responds or offers help."
          />
        ) : (
          <div>
            {notifications.map((notif, i) => {
              const t = ICON_MAP[notif.type] || ICON_MAP.system;
              return (
                <motion.div
                  key={notif._id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.035 }}
                  onClick={() => handleTap(notif)}
                  className={`flex items-start gap-3 px-4 py-4 cursor-pointer transition-colors border-b border-gray-50 ${notif.isRead ? "bg-white hover:bg-gray-50" : "bg-brand-50/50 hover:bg-brand-50"}`}
                >
                  <div
                    className={`w-10 h-10 ${t.bg} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}
                  >
                    <t.Icon className={`w-5 h-5 ${t.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm leading-snug ${notif.isRead ? "text-gray-700 font-medium" : "text-gray-900 font-bold"}`}
                    >
                      {notif.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                      {notif.body}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 font-medium">
                      {timeAgo(notif.createdAt)}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <div className="w-2.5 h-2.5 bg-brand-600 rounded-full flex-shrink-0 mt-1.5" />
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
