import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Clock, Users, IndianRupee } from "lucide-react";
import { Avatar, StarRating } from "../ui";
import { timeAgo, formatDist, formatRupees, getCat } from "../../utils/helpers";
import api from "../../utils/api";
import toast from "react-hot-toast";

export default function RequestCard({ request, index = 0, compact = false }) {
  const navigate = useNavigate();
  const [offered, setOffered] = useState(false);
  const [loading, setLoading] = useState(false);
  const cat = getCat(request.category);

  const handleOffer = async (e) => {
    e.stopPropagation();
    if (offered || loading) return;
    setLoading(true);
    try {
      await api.post(`/requests/${request._id}/offer`);
      setOffered(true);
      toast.success("Help offered! The poster has been notified.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not offer help");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.055,
        duration: 0.28,
        ease: [0.16, 1, 0.3, 1],
      }}
      onClick={() => navigate(`/request/${request._id}`)}
      className="card card-hover p-4 cursor-pointer"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex flex-wrap gap-1.5">
          <span className={`badge ${cat.color} border ${cat.border}`}>
            {cat.icon} {request.category}
          </span>
          {request.isUrgent && (
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="badge badge-amber"
            >
              🔴 Urgent
            </motion.span>
          )}
        </div>
        {request.reward > 0 && (
          <span className="badge badge-green whitespace-nowrap flex-shrink-0">
            <IndianRupee className="w-3 h-3" />
            {formatRupees(request.reward)}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-display font-bold text-gray-900 text-[15px] leading-snug mb-1.5 line-clamp-2">
        {request.title}
      </h3>

      {/* Description */}
      {!compact && (
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-3">
          {request.description}
        </p>
      )}

      {/* Meta */}
      <div className="flex items-center flex-wrap gap-3 mb-3">
        {request.distanceKm != null && (
          <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            {formatDist(request.distanceKm)} away
          </span>
        )}
        <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
          {timeAgo(request.createdAt)}
        </span>
        {request.helpers?.length > 0 && (
          <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
            <Users className="w-3.5 h-3.5 flex-shrink-0" />
            {request.helpers.length} offer
            {request.helpers.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar user={request.poster} size="xs" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-700 truncate">
              {request.poster?.name}
            </p>
            <StarRating
              rating={request.poster?.rating}
              total={request.poster?.totalRatings}
              size="xs"
            />
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={handleOffer}
          disabled={loading || offered}
          className={`btn btn-sm flex-shrink-0 ${
            offered
              ? "bg-green-50 text-green-600 border border-green-200 cursor-default"
              : "btn-primary"
          }`}
        >
          {loading ? "..." : offered ? "✓ Offered" : "Help →"}
        </motion.button>
      </div>
    </motion.article>
  );
}
