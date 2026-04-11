import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Zap, Star, Shield } from "lucide-react";

const features = [
  {
    icon: MapPin,
    color: "bg-blue-100 text-blue-600",
    title: "Hyperlocal",
    sub: "Connect with people within 10km of you",
  },
  {
    icon: Zap,
    color: "bg-amber-100 text-amber-600",
    title: "< 30 seconds",
    sub: "Post a request in under half a minute",
  },
  {
    icon: Star,
    color: "bg-green-100 text-green-600",
    title: "Trusted",
    sub: "Ratings, reviews & verified profiles",
  },
  {
    icon: Shield,
    color: "bg-purple-100 text-purple-600",
    title: "Safe",
    sub: "Community-first safety features",
  },
];

const stats = [
  { value: "12K+", label: "Helpers" },
  { value: "98%", label: "Satisfaction" },
  { value: "8 min", label: "Avg. response" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      {/* Left — hero */}
      <div className="lg:w-1/2 bg-gradient-to-br from-brand-700 via-brand-600 to-indigo-500 flex flex-col justify-between p-8 lg:p-14 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-[-80px] right-[-80px] w-64 h-64 bg-white/10 rounded-full" />
        <div className="absolute bottom-[-60px] left-[-60px] w-48 h-48 bg-white/10 rounded-full" />

        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="font-display font-bold text-3xl text-white tracking-tight">
            Nearly.
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="py-10 lg:py-0"
        >
          <div className="text-6xl mb-6">🏘️</div>
          <h1 className="font-display font-bold text-4xl lg:text-5xl text-white leading-tight mb-4">
            Help is just
            <br />
            around the corner
          </h1>
          <p className="text-indigo-200 text-lg leading-relaxed max-w-md">
            Post a request and get help from real people nearby — moving,
            repairs, deliveries, and more.
          </p>

          {/* Stats */}
          <div className="flex gap-6 mt-8">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="font-display font-bold text-2xl text-white">
                  {s.value}
                </div>
                <div className="text-indigo-300 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-2"
        >
          {["⚡ Instant", "🏡 Nearby", "⭐ Trusted", "🔒 Safe"].map((t) => (
            <span
              key={t}
              className="bg-white/20 text-white text-sm font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm"
            >
              {t}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Right — CTA */}
      <div className="lg:w-1/2 flex flex-col justify-center px-6 py-10 lg:px-16 lg:py-0">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="font-display font-bold text-3xl text-gray-900 mb-2">
            Get started today
          </h2>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Join thousands of neighbours helping each other every day.
          </p>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {features.map((f) => (
              <div key={f.title} className="card p-4">
                <div
                  className={`w-9 h-9 ${f.color} rounded-xl flex items-center justify-center mb-2`}
                >
                  <f.icon className="w-5 h-5" />
                </div>
                <p className="font-bold text-gray-800 text-sm">{f.title}</p>
                <p className="text-gray-400 text-xs mt-0.5 leading-snug">
                  {f.sub}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/register")}
              className="btn btn-primary btn-xl w-full"
            >
              Create Free Account <ArrowRight className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/login")}
              className="btn btn-secondary btn-xl w-full"
            >
              Sign In to Existing Account
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
