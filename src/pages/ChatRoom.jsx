import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Send, Phone, ArrowLeft } from "lucide-react";
import { Avatar, Spinner, PageLoader } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { getSocket } from "../utils/socket";
import { timeAgo } from "../utils/helpers";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function ChatRoom() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const typerTimer = useRef(null);

  const { data: chatInfo, isLoading } = useQuery({
    queryKey: ["chat-info", chatId],
    queryFn: async () => {
      const { data } = await api.get("/chats");
      return data.chats.find((c) => c._id === chatId);
    },
  });

  const { isLoading: msgsLoading } = useQuery({
    queryKey: ["messages", chatId],
    queryFn: async () => {
      const { data } = await api.get(`/chats/${chatId}/messages`);
      setMessages(data.messages);
      return data.messages;
    },
  });

  useEffect(() => {
    const s = getSocket();
    s.emit("chat:join", chatId);
    const onMsg = (msg) =>
      setMessages((prev) =>
        prev.some((m) => m._id === msg._id) ? prev : [...prev, msg],
      );
    const onTyp = (d) => {
      if (d.userId !== user?._id) {
        setTyping(d.isTyping);
        if (d.isTyping) {
          clearTimeout(typerTimer.current);
          typerTimer.current = setTimeout(() => setTyping(false), 3000);
        }
      }
    };
    s.on("chat:message", onMsg);
    s.on("chat:typing", onTyp);
    return () => {
      s.off("chat:message", onMsg);
      s.off("chat:typing", onTyp);
    };
  }, [chatId, user?._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const other = chatInfo?.participants?.find((p) => p._id !== user?._id);

  const handleInput = (e) => {
    setInput(e.target.value);
    const s = getSocket();
    s.emit("chat:typing", { chatId, userId: user._id, isTyping: true });
    clearTimeout(typerTimer.current);
    typerTimer.current = setTimeout(
      () =>
        s.emit("chat:typing", { chatId, userId: user._id, isTyping: false }),
      1500,
    );
  };

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    const tmp = {
      _id: `tmp-${Date.now()}`,
      content: text,
      sender: { _id: user._id, name: user.name },
      createdAt: new Date().toISOString(),
      _tmp: true,
    };
    setMessages((prev) => [...prev, tmp]);
    setInput("");
    try {
      const { data } = await api.post(`/chats/${chatId}/messages`, {
        content: text,
      });
      setMessages((prev) =>
        prev.map((m) => (m._id === tmp._id ? data.message : m)),
      );
      qc.invalidateQueries({ queryKey: ["chats"] });
    } catch {
      setMessages((prev) => prev.filter((m) => m._id !== tmp._id));
      setInput(text);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }, [input, sending, chatId, user, qc]);

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isLoading || msgsLoading) return <PageLoader />;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-6 pb-3 flex items-center gap-3 flex-shrink-0 z-30">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <Avatar user={other} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm">
            {other?.name || "User"}
          </p>
          <p className="text-xs text-gray-400">
            {chatInfo?.request
              ? `Re: ${chatInfo.request.title}`
              : "Direct message"}
          </p>
        </div>
        <a href={`tel:${other.phone}`}>
          <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200">
            <Phone className="w-4 h-4 text-gray-600" />
          </button>
        </a>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2.5 max-w-2xl w-full mx-auto">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-4xl mb-3">👋</div>
            <p className="font-bold text-gray-700">
              Say hello to {other?.name}!
            </p>
            <p className="text-sm text-gray-400 mt-1">
              This is the start of your conversation.
            </p>
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe =
            msg.sender?._id === user?._id ||
            msg.sender?._id?.toString() === user?._id;
          const showAv =
            !isMe &&
            (i === 0 || messages[i - 1]?.sender?._id !== msg.sender?._id);
          const showTime =
            i === messages.length - 1 ||
            messages[i + 1]?.sender?._id !== msg.sender?._id;
          return (
            <motion.div
              key={msg._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}
            >
              <div className="w-7 flex-shrink-0">
                {!isMe && showAv && <Avatar user={msg.sender} size="xs" />}
              </div>
              <div
                className={`flex flex-col max-w-[72%] ${isMe ? "items-end" : "items-start"}`}
              >
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe ? "bg-brand-600 text-white rounded-br-sm" : "bg-white text-gray-900 border border-gray-100 shadow-sm rounded-bl-sm"} ${msg._tmp ? "opacity-70" : ""}`}
                >
                  {msg.content}
                </div>
                {showTime && (
                  <p className="text-[11px] text-gray-400 mt-1 px-1">
                    {timeAgo(msg.createdAt)}
                    {isMe && !msg._tmp && " · Sent"}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
        <AnimatePresence>
          {typing && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-end gap-2"
            >
              <div className="w-7 flex-shrink-0">
                <Avatar user={other} size="xs" />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -5, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.8,
                      delay: i * 0.15,
                    }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-2 flex-shrink-0 max-w-2xl w-full mx-auto">
        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 flex items-center">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInput}
            onKeyDown={onKey}
            placeholder="Type a message…"
            rows={1}
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none resize-none max-h-28"
          />
        </div>
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={sendMessage}
          disabled={!input.trim() || sending}
          className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${input.trim() ? "bg-brand-600 text-white shadow-md" : "bg-gray-200 text-gray-400"}`}
        >
          {sending ? (
            <Spinner size="sm" color="white" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </motion.button>
      </div>
    </div>
  );
}
