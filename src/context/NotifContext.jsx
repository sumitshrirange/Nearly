import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import toast from "react-hot-toast";
import api from "../utils/api";
import { getSocket } from "../utils/socket";
import { useAuth } from "./AuthContext";

const NotifContext = createContext(null);

export const NotifProvider = ({ children }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get("/notifications?limit=1");
      setUnreadCount(data.unreadCount);
    } catch {}
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchUnread();
    const s = getSocket();
    const handler = (data) => {
      setUnreadCount((c) => c + 1);
      toast(data.message || "New notification", { icon: "🔔" });
    };
    s.on("notification:new", handler);
    return () => s.off("notification:new", handler);
  }, [user, fetchUnread]);

  const markAllRead = useCallback(async () => {
    try {
      await api.put("/notifications/read-all");
      setUnreadCount(0);
    } catch {}
  }, []);

  return (
    <NotifContext.Provider
      value={{ unreadCount, setUnreadCount, fetchUnread, markAllRead }}
    >
      {children}
    </NotifContext.Provider>
  );
};

export const useNotif = () => useContext(NotifContext);
