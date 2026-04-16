import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotifProvider } from "./context/NotifContext";
import AppShell from "./components/layout/AppShell";
import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import PostRequest from "./pages/PostRequest";
import RequestDetail from "./pages/RequestDetail";
import ChatList from "./pages/ChatList";
import ChatRoom from "./pages/ChatRoom";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import MyRequests from "./pages/MyRequests";
import MyHelps from "./pages/MyHelps";
import ReviewsPage from "./pages/ReviewsPage";
import SettingsPage from "./pages/SettingsPage";
import VerificationPage from "./pages/VerificationPage";
import EditProfile from "./pages/EditProfile";
import UserProfile from "./pages/UserProfile";

const SplashScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-brand-600">
    <div className="text-white font-display font-bold text-5xl mb-3 tracking-tight">
      Nearly
    </div>
    <div className="flex gap-2 mt-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-white/70 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <SplashScreen />;
  if (!user) return <Navigate to="/onboarding" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <SplashScreen />;
  if (user) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <NotifProvider>
        <Routes>
          {/* Public */}
          <Route
            path="/onboarding"
            element={
              <PublicRoute>
                <Onboarding />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Protected — within AppShell (sidebar + bottom nav) */}
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/chats" element={<ChatList />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-requests" element={<MyRequests />} />
            <Route path="/my-helps" element={<MyHelps />} />
            <Route path="/my-reviews" element={<ReviewsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/verification" element={<VerificationPage />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/request/:id" element={<RequestDetail />} />
            <Route path="/user/:id" element={<UserProfile />} />
            <Route path="/post" element={<PostRequest />} />
            <Route path="/chat/:chatId" element={<ChatRoom />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </NotifProvider>
    </AuthProvider>
  );
}
