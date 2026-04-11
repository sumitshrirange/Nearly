import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  PageTransition,
  EmptyState,
  PageLoader,
  Avatar,
} from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { timeAgo, getCat } from "../utils/helpers";
import api from "../utils/api";

export default function ChatList() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const { data } = await api.get("/chats");
      return data.chats;
    },
    refetchInterval: 20000,
  });

  if (isLoading) return <PageLoader />;
  const chats = data || [];
  const getOther = (chat) =>
    chat.participants?.find((p) => p._id !== user?._id) ||
    chat.participants?.[0];

  return (
    <PageTransition>
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 pb-4 pt-6">
        <h1 className="font-display font-bold text-xl text-gray-900">
          Messages
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {chats.length} conversation{chats.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="max-w-2xl mx-auto w-full">
        {chats.length === 0 ? (
          <EmptyState
            icon="💬"
            title="No messages yet"
            subtitle="When you offer help or someone responds to your request, chats will appear here."
            action={
              <button
                onClick={() => navigate("/")}
                className="btn btn-primary btn-lg"
              >
                Browse Requests
              </button>
            }
          />
        ) : (
          <div className="divide-y divide-gray-50">
            {chats.map((chat, i) => {
              const other = getOther(chat);
              const cat = chat.request ? getCat(chat.request?.category) : null;
              return (
                <motion.div
                  key={chat._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => navigate(`/chat/${chat._id}`)}
                  className="flex items-center gap-3 px-4 py-4 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="relative flex-shrink-0">
                    <Avatar user={other} size="md" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="font-bold text-gray-900 text-sm truncate">
                        {other?.name || "User"}
                      </p>
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                        {timeAgo(chat.lastMessageAt)}
                      </span>
                    </div>
                    {cat && (
                      <p className="text-xs text-brand-600 font-semibold mb-0.5 truncate">
                        {cat.icon} Re: {chat.request?.title}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 truncate">
                      {chat.lastMessage?.content || "Start the conversation…"}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
