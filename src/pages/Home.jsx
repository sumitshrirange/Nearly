import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  Bell,
  MapPin,
  TrendingUp,
  Plus,
  X,
  RefreshCw,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { useNotif } from "../context/NotifContext";
import { getSocket } from "../utils/socket";
import {
  Avatar,
  PageTransition,
  EmptyState,
  SkeletonCard,
  Spinner,
} from "../components/ui";
import RequestCard from "../components/feature/RequestCard";
import api from "../utils/api";
import { CATEGORIES, getCat } from "../utils/helpers";
import { getLocationWithAddress } from "../utils/geocode";
import toast from "react-hot-toast";

const ALL_CATS = ["All", ...CATEGORIES];
const SORTS = [
  { v: "recent", l: "🕐 Recent" },
  { v: "reward", l: "💰 Reward" },
  { v: "urgent", l: "🚨 Urgent" },
];

export default function Home() {
  const { user } = useAuth();
  const { unreadCount } = useNotif();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("recent");
  const [showFilters, setShowFilters] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [coords, setCoords] = useState(null);
  const [locationLabel, setLocationLabel] = useState(
    user?.location?.city || "Nagpur",
  );
  const [locating, setLocating] = useState(false);

  // Detect and reverse-geocode on mount
  useEffect(() => {
    const savedLat = localStorage.getItem("nearly_lat");
    const savedLng = localStorage.getItem("nearly_lng");
    const savedLabel = localStorage.getItem("nearly_loc_label");
    if (savedLat && savedLng) {
      setCoords({ lat: parseFloat(savedLat), lng: parseFloat(savedLng) });
      setLocationLabel(savedLabel || "My Location");
    } else {
      autoDetectLocation();
    }
  }, []);

  const autoDetectLocation = async () => {
    setLocating(true);
    try {
      const loc = await getLocationWithAddress();
      setCoords({ lat: loc.lat, lng: loc.lng });
      const label = loc.city || loc.address?.split(",")[0] || "My Location";
      setLocationLabel(label);
      localStorage.setItem("nearly_lat", loc.lat);
      localStorage.setItem("nearly_lng", loc.lng);
      localStorage.setItem("nearly_loc_label", label);
    } catch {
      setCoords({ lat: 18.5204, lng: 73.8567 });
      setLocationLabel("Pune");
    } finally {
      setLocating(false);
    }
  };

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [
      "requests",
      { category, sort, lat: coords?.lat, lng: coords?.lng },
    ],
    queryFn: async () => {
      const params = { status: "open", sort, limit: 40 };
      if (category !== "All") params.category = category;
      if (coords) {
        params.lat = coords.lat;
        params.lng = coords.lng;
        params.radius = 20000;
      }
      const { data } = await api.get("/requests", { params });
      return data;
    },
    enabled: true,
    refetchInterval: 60_000,
  });

  // Live new-request updates via socket
  useEffect(() => {
    const s = getSocket();
    const handler = () => {
      qc.invalidateQueries({ queryKey: ["requests"] });
      toast("📍 New request nearby!");
    };
    s.on("request:new", handler);
    return () => s.off("request:new", handler);
  }, [qc]);

  const requests = data?.requests || [];
  const filtered = search
    ? requests.filter(
        (r) =>
          r.title.toLowerCase().includes(search.toLowerCase()) ||
          r.description?.toLowerCase().includes(search.toLowerCase()),
      )
    : requests;

  return (
    <PageTransition>
      {/* ── Sticky Header ───────────────────────────── */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 pt-6 pb-3">
          <div className="flex flex-col gap-1">
            <h1 className="font-display font-bold text-lg text-gray-900 hidden lg:block">
              Good {getGreeting()}, {user?.name?.split(" ")[0]}!
            </h1>
            {/* Location button — opens picker */}
            <button
              onClick={() => setShowLocationPicker(true)}
              className="flex items-center gap-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 text-sm font-semibold px-3 py-1.5 rounded-full transition-colors"
            >
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="max-w-[160px] truncate">{locationLabel}</span>
              {locating ? (
                <Spinner size="sm" color="indigo" />
              ) : (
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path d="M6 9l6 6 6-6" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
          <div className="flex items-center gap-2">
            {isFetching && !isLoading && <Spinner size="sm" />}
            <button
              onClick={() => navigate("/notifications")}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 lg:hidden"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
              )}
            </button>
            <button onClick={() => navigate("/profile")} className="lg:hidden">
              <Avatar user={user} size="sm" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search help requests…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9 pr-10"
            />
            {search ? (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            ) : (
              <button
                onClick={() => setShowFilters((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <SlidersHorizontal
                  className={`w-4 h-4 ${showFilters ? "text-brand-600" : "text-gray-400"}`}
                />
              </button>
            )}
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-2"
              >
                <div className="flex gap-2">
                  {SORTS.map((s) => (
                    <button
                      key={s.v}
                      onClick={() => setSort(s.v)}
                      className={`btn btn-sm whitespace-nowrap border flex-shrink-0 transition-all
                        ${sort === s.v ? "bg-brand-600 text-white border-brand-600" : "border-gray-200 text-gray-600 bg-white hover:border-brand-300"}`}
                    >
                      {s.l}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Category tabs — horizontally scrollable, FIXED width */}
        <div className="px-4 pb-3 w-screen lg:w-full">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {ALL_CATS.map((cat) => {
              const meta = cat !== "All" ? getCat(cat) : null;
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-none border transition-all
                    ${
                      category === cat
                        ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                        : "bg-white text-gray-600 border-gray-200 hover:border-brand-300 hover:bg-brand-50"
                    }`}
                >
                  {meta && <span>{meta.icon}</span>}
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Location Picker Modal ────────────────────── */}
      <AnimatePresence>
        {showLocationPicker && (
          <LocationPicker
            current={locationLabel}
            onClose={() => setShowLocationPicker(false)}
            onSelect={(loc) => {
              setCoords({ lat: loc.lat, lng: loc.lng });
              setLocationLabel(loc.label);
              localStorage.setItem("nearly_lat", loc.lat);
              localStorage.setItem("nearly_lng", loc.lng);
              localStorage.setItem("nearly_loc_label", loc.label);
              setShowLocationPicker(false);
              qc.invalidateQueries({ queryKey: ["requests"] });
            }}
            onAutoDetect={async () => {
              setShowLocationPicker(false);
              await autoDetectLocation();
              qc.invalidateQueries({ queryKey: ["requests"] });
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Feed + Right Sidebar ─────────────────────── */}
      <div className="flex flex-col xl:flex-row gap-0 xl:gap-6 flex-1">
        {/* Main feed */}
        <div className="flex-1 px-4 py-4 lg:px-6 lg:py-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-gray-800 text-base">
              {category === "All" ? "Nearby Requests" : `${category} Help`}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => refetch()}
                title="Refresh"
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
              >
                <RefreshCw
                  className={`w-4 h-4 text-gray-400 ${isFetching ? "animate-spin" : ""}`}
                />
              </button>
              <button
                onClick={() => navigate("/post")}
                className="btn btn-primary btn-sm inline-flex"
              >
                <Plus className="w-4 h-4" />
                Post Request
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={category === "All" ? "🏘️" : getCat(category).icon}
              title="No requests nearby"
              subtitle={
                search
                  ? "Try different keywords."
                  : "Be the first to post a request in your area!"
              }
              action={
                <button
                  onClick={() => navigate("/post")}
                  className="btn btn-primary btn-lg"
                >
                  Post a Request
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map((req, i) => (
                <RequestCard key={req._id} request={req} index={i} />
              ))}
            </div>
          )}
        </div>

        {/* Right sidebar (xl only) */}
        <aside className="hidden xl:flex flex-col w-72 flex-shrink-0 px-0 py-5 pr-6 gap-5">
          <StatsWidget total={data?.total} />
          <QuickActions navigate={navigate} />
        </aside>
      </div>
    </PageTransition>
  );
}

// ── Location Picker (Nagpur) ──────────────────────────────────────────────────────
const QUICK_LOCATIONS = [
  { label: "Sitabuldi, Nagpur", lat: 21.1458, lng: 79.0882 },
  { label: "Dharampeth, Nagpur", lat: 21.1352, lng: 79.0706 },
  { label: "Manish Nagar, Nagpur", lat: 21.0903, lng: 79.0475 },
  { label: "Trimurti Nagar, Nagpur", lat: 21.1146, lng: 79.0592 },
  { label: "Mahal, Nagpur", lat: 21.1523, lng: 79.1025 },
];

function LocationPicker({ current, onClose, onSelect, onAutoDetect }) {
  const [customLoc, setCustomLoc] = useState("");
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!customLoc.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(customLoc)}&format=json&limit=3&countrycodes=in`,
        { headers: { "Accept-Language": "en" } },
      );
      const results = await res.json();
      if (results.length > 0) {
        const r = results[0];
        const parts = r.display_name.split(",");
        const label = parts.slice(0, 2).join(",").trim();
        onSelect({ lat: parseFloat(r.lat), lng: parseFloat(r.lon), label });
      } else {
        toast.error("Location not found. Try a different name.");
      }
    } catch {
      toast.error("Search failed. Try again.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-display font-bold text-base">Select Location</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-3">
          {/* Search box */}
          <div className="flex gap-2">
            <input
              value={customLoc}
              onChange={(e) => setCustomLoc(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search area, locality, city…"
              className="input flex-1"
            />
            <button
              onClick={handleSearch}
              disabled={searching}
              className="btn btn-primary btn-md px-4"
            >
              {searching ? <Spinner size="sm" color="white" /> : "Go"}
            </button>
          </div>

          {/* Use current location */}
          <button
            onClick={onAutoDetect}
            className="flex items-center gap-3 p-3.5 rounded-xl border-2 border-brand-200 bg-brand-50 hover:bg-brand-100 transition-colors w-full text-left"
          >
            <MapPin className="w-5 h-5 text-brand-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-brand-700 text-sm">
                Use My Current Location
              </p>
              <p className="text-xs text-brand-500">Auto-detect using GPS</p>
            </div>
          </button>

          {/* Quick locations */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
              Popular Areas in Nagpur
            </p>
            <div className="flex flex-col gap-1">
              {QUICK_LOCATIONS.map((loc) => (
                <button
                  key={loc.label}
                  onClick={() => onSelect(loc)}
                  className={`flex items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left w-full
                    ${current === loc.label ? "bg-brand-50 text-brand-700 font-semibold" : "text-gray-700"}`}
                >
                  <MapPin
                    className={`w-4 h-4 flex-shrink-0 ${current === loc.label ? "text-brand-600" : "text-gray-400"}`}
                  />
                  <span className="text-sm">{loc.label}</span>
                  {current === loc.label && (
                    <span className="ml-auto text-xs text-brand-600">
                      Current
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Sidebar widgets ───────────────────────────────────────────────────────
function StatsWidget({ total }) {
  return (
    <div className="card p-4">
      <h3 className="font-display font-bold text-sm text-gray-700 mb-3 flex items-center gap-1.5">
        <TrendingUp className="w-4 h-4 text-brand-600" /> Live Stats
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {[
          { n: total ?? "—", l: "Open requests", c: "text-brand-600" },
          { n: "< 10 min", l: "Avg response", c: "text-green-600" },
        ].map((s) => (
          <div key={s.l} className="bg-gray-50 rounded-xl p-3 text-center">
            <div className={`font-display font-bold text-lg ${s.c}`}>{s.n}</div>
            <div className="text-xs text-gray-400 font-medium mt-0.5">
              {s.l}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickActions({ navigate }) {
  const actions = [
    { icon: "🚛", label: "Need movers?", cat: "Moving" },
    { icon: "🔧", label: "Need repairs?", cat: "Repairs" },
    { icon: "🛵", label: "Need delivery?", cat: "Delivery" },
    { icon: "🚨", label: "Emergency help", cat: "Emergency" },
    { icon: "🧹", label: "Need Cleaners?", cat: "Cleaning" },
    { icon: "📚", label: "Teaching help", cat: "Teaching" },
  ];
  return (
    <div className="card p-4">
      <h3 className="font-display font-bold text-sm text-gray-700 mb-3">
        Quick Post
      </h3>
      <div className="flex flex-col gap-1">
        {actions.map((a) => (
          <button
            key={a.cat}
            onClick={() => navigate(`/post?cat=${a.cat}`)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-brand-50 transition-colors text-left group"
          >
            <span className="text-xl">{a.icon}</span>
            <span className="text-sm font-medium text-gray-700 group-hover:text-brand-700">
              {a.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
