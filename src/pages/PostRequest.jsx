import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin,
  IndianRupee,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  BackButton,
  Input,
  Textarea,
  Spinner,
  Toggle,
  PageTransition,
} from "../components/ui";
import { CATEGORIES, getCat } from "../utils/helpers";
import { getLocationWithAddress } from "../utils/geocode";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function PostRequest() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [sp] = useSearchParams();
  const defaultCat = sp.get("cat") || "";

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: defaultCat,
    reward: "",
    isUrgent: false,
    location: {
      coordinates: [79.0882, 21.1458],
      address: "",
      city: "Nagpur",
      state: "Maharashtra",
    },
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(true);
  const [posted, setPosted] = useState(false);

  const detectLocation = async () => {
    setLocating(true);
    try {
      const loc = await getLocationWithAddress();
      setForm((f) => ({
        ...f,
        location: {
          coordinates: [loc.lng, loc.lat],
          address: loc.address,
          city: loc.city,
          state: loc.state,
        },
      }));
    } catch (err) {
      toast.error("Could not detect location. Please check permissions.");
      setForm((f) => ({
        ...f,
        location: {
          ...f.location,
          address: "Koregaon Park, Pune",
          city: "Pune",
          state: "Maharashtra",
        },
      }));
    } finally {
      setLocating(false);
    }
  };

  useEffect(() => {
    detectLocation();
  }, []);

  const set = (k) => (e) => {
    const v = e.target ? e.target.value : e;
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((er) => ({ ...er, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.category) e.category = "Please select a category";
    if (form.reward && isNaN(Number(form.reward)))
      e.reward = "Must be a number";
    if (Number(form.reward) < 0) e.reward = "Cannot be negative";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await api.post("/requests", {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        location: form.location,
        reward: Number(form.reward) || 0,
        isUrgent: form.isUrgent,
      });
      qc.invalidateQueries({ queryKey: ["requests"] });
      setPosted(true);
      toast.success("Request posted! 🎉");
      setTimeout(
        () => navigate(`/request/${data.request._id}`, { replace: true }),
        1000,
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post request");
    } finally {
      setLoading(false);
    }
  };

  if (posted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
        </motion.div>
        <h2 className="font-display font-bold text-2xl text-gray-900">
          Request Posted!
        </h2>
        <p className="text-gray-500">Redirecting to your request…</p>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 pb-4 bg-white border-b border-gray-100 pt-6 sticky top-0 z-30">
          <BackButton onClick={() => navigate(-1)} />
          <div>
            <h1 className="font-display font-bold text-lg">Post a Request</h1>
            <p className="text-xs text-gray-400">Takes less than 30 seconds</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="px-4 py-5 flex flex-col gap-5 lg:px-6">
            {/* Title */}
            <Input
              label="Request Title *"
              placeholder="e.g. Need help shifting furniture this Saturday"
              value={form.title}
              onChange={set("title")}
              error={errors.title}
              maxLength={200}
            />

            {/* Description */}
            <Textarea
              label="Description *"
              placeholder="Describe what you need, when, where, and any important details that will help people assist you…"
              value={form.description}
              onChange={set("description")}
              error={errors.description}
              rows={5}
              maxLength={2000}
            />

            {/* Category */}
            <div>
              <label className="label">Category *</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {CATEGORIES.map((cat) => {
                  const m = getCat(cat);
                  return (
                    <motion.button
                      whileTap={{ scale: 0.93 }}
                      type="button"
                      key={cat}
                      onClick={() => {
                        setForm((f) => ({ ...f, category: cat }));
                        setErrors((er) => ({ ...er, category: "" }));
                      }}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-semibold transition-all
                        ${
                          form.category === cat
                            ? "border-brand-600 bg-brand-50 text-brand-700"
                            : "border-gray-200 bg-white text-gray-600 hover:border-brand-300 hover:bg-brand-50/40"
                        }`}
                    >
                      <span className="text-2xl">{m.icon}</span>
                      <span className="leading-tight text-center">{cat}</span>
                    </motion.button>
                  );
                })}
              </div>
              {errors.category && (
                <p className="text-red-500 text-xs mt-1.5 font-medium">
                  {errors.category}
                </p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="label">Location</label>
              <div
                className={`flex items-center gap-3 rounded-xl px-4 py-3 border transition-colors
                ${locating ? "bg-gray-50 border-gray-200" : "bg-brand-50 border-brand-200"}`}
              >
                <MapPin
                  className={`w-5 h-5 flex-shrink-0 ${locating ? "text-gray-400" : "text-brand-600"}`}
                />
                <span
                  className={`text-sm font-semibold flex-1 ${locating ? "text-gray-400" : "text-brand-700"}`}
                >
                  {locating
                    ? "Detecting your location…"
                    : form.location.address || "Location detected"}
                </span>
                {locating ? (
                  <Spinner size="sm" color="gray" />
                ) : (
                  <button
                    type="button"
                    onClick={detectLocation}
                    className="p-1 rounded-lg hover:bg-brand-100 transition-colors"
                    title="Refresh location"
                  >
                    <RefreshCw className="w-4 h-4 text-brand-500" />
                  </button>
                )}
              </div>
              {form.location.city && !locating && (
                <p className="text-xs text-gray-400 mt-1 ml-1">
                  {form.location.city}
                  {form.location.state ? `, ${form.location.state}` : ""}
                </p>
              )}
            </div>

            {/* Reward */}
            <Input
              label="Reward (Optional)"
              type="number"
              placeholder="₹0 — leave blank for no reward"
              value={form.reward}
              onChange={set("reward")}
              error={errors.reward}
              icon={IndianRupee}
              min="0"
              max="99999"
            />

            {/* Urgent */}
            <Toggle
              checked={form.isUrgent}
              onChange={() => setForm((f) => ({ ...f, isUrgent: !f.isUrgent }))}
              label="Mark as Urgent 🚨"
              sub="Need help within the next hour — highlighted to nearby helpers"
            />

            <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3.5">
              <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 leading-relaxed">
                Your request will be visible to people within 15km. It expires
                automatically after 7 days if not completed.
              </p>
            </div>
          </div>

          {/* Sticky submit */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-4 lg:px-6">
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading || locating}
              className="btn btn-primary btn-xl w-full"
            >
              {loading ? (
                <>
                  <Spinner size="sm" color="white" /> Posting…
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" /> Post Request
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </PageTransition>
  );
}
