import { io } from "socket.io-client";

let socket = null;
let currentUserId = null;
let heartbeatInterval = null;

export const getSocket = () => {
  if (!socket) {
    socket = io("https://nearly-backend-production-48b3.up.railway.app", {
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      timeout: 20000,
      transports: ["websocket", "polling"],
    });

    // Re-join rooms after reconnect
    socket.on("reconnect", () => {
      console.log("[Socket] Reconnected ✅");
      if (currentUserId) {
        socket.emit("user:join", currentUserId);
      }
    });

    socket.on("reconnect_attempt", (n) => {
      console.log(`[Socket] Reconnect attempt #${n}`);
    });

    socket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
      // If server disconnected us, manually reconnect
      if (reason === "io server disconnect") {
        setTimeout(() => socket.connect(), 1000);
      }
      stopHeartbeat();
    });

    socket.on("connect", () => {
      console.log("[Socket] Connected ✅", socket.id);
      if (currentUserId) socket.emit("user:join", currentUserId);
      startHeartbeat();
    });

    socket.on("connect_error", (err) => {
      console.warn("[Socket] Connection error:", err.message);
    });
  }
  return socket;
};

const startHeartbeat = () => {
  stopHeartbeat();
  heartbeatInterval = setInterval(() => {
    if (socket?.connected) socket.emit("ping");
  }, 25000);
};

const stopHeartbeat = () => {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
};

export const connectSocket = (userId) => {
  currentUserId = userId;
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  } else {
    s.emit("user:join", userId);
    startHeartbeat();
  }
  return s;
};

export const disconnectSocket = () => {
  stopHeartbeat();
  currentUserId = null;
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};

export const joinChat = (chatId) => {
  getSocket().emit("chat:join", chatId);
};
