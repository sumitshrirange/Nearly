import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MapPin,
  Clock,
  Eye,
  MessageCircle,
  CheckCircle,
  Trash2,
  Users,
  IndianRupee,
  Star,
  X,
  UserCheck,
  ChevronRight,
  MapPinCheck,
} from "lucide-react";
import {
  Avatar,
  StarRating,
  VerifiedBadge,
  BackButton,
  PageLoader,
  PageTransition,
  Spinner,
} from "../components/ui";
import { getCat, timeAgo, formatDist, formatRupees } from "../utils/helpers";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";

/* ─── Review Modal ─────────────────────────────────────────────────────── */
function ReviewModal({ reviewee, requestId, onClose, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const LABELS = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

  const handleSubmit = async () => {
    if (!rating) {
      toast.error("Please select a rating");
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/users/${reviewee._id}/review`, {
        rating,
        comment,
        requestId,
      });
      toast.success("Review submitted! ⭐ Thank you.");
      onSubmitted();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-display font-bold text-lg">Leave a Review</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="px-5 py-5 flex flex-col gap-5">
          {/* Reviewee info */}
          <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl">
            <Avatar user={reviewee} size="md" />
            <div>
              <p className="font-bold text-gray-900">{reviewee.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                You're reviewing their help
              </p>
            </div>
          </div>

          {/* Star rating */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3 text-center">
              How was your experience?
            </p>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  whileTap={{ scale: 0.85 }}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(star)}
                  className="p-1 focus:outline-none"
                >
                  <Star
                    className={`w-10 h-10 transition-all duration-100 ${
                      star <= (hovered || rating)
                        ? "fill-amber-400 text-amber-400 scale-110"
                        : "fill-gray-200 text-gray-200"
                    }`}
                  />
                </motion.button>
              ))}
            </div>
            {(hovered || rating) > 0 && (
              <motion.p
                key={hovered || rating}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-sm font-bold text-amber-500 mt-2"
              >
                {LABELS[hovered || rating]}
              </motion.p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Comment{" "}
              <span className="text-gray-300 normal-case font-normal">
                (optional)
              </span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience — was the helper punctual, professional, helpful?"
              rows={3}
              maxLength={500}
              className="input resize-none"
            />
            <p className="text-right text-xs text-gray-400 mt-1">
              {comment.length}/500
            </p>
          </div>

          {/* Submit */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={submitting || !rating}
            className={`btn btn-xl w-full ${rating ? "btn-primary" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
          >
            {submitting ? (
              <Spinner size="sm" color="white" />
            ) : (
              <>
                <Star className="w-5 h-5 fill-current" /> Submit Review
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Accept Helper Modal ──────────────────────────────────────────────── */
function AcceptHelperModal({ helpers, onAccept, onClose }) {
  const [accepting, setAccepting] = useState(null);

  const handleAccept = async (helper) => {
    setAccepting(helper.user._id);
    await onAccept(helper.user._id);
    setAccepting(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-display font-bold text-lg">Choose a Helper</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {helpers.length} offer{helpers.length !== 1 ? "s" : ""} received
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="px-4 py-3 max-h-96 overflow-y-auto flex flex-col gap-2">
          {helpers
            .filter((h) => h.status !== "rejected")
            .map((h) => (
              <div
                key={h._id}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 hover:border-brand-200 hover:bg-brand-50/30 transition-colors"
              >
                <Avatar user={h.user} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm">
                    {h.user?.name}
                  </p>
                  <StarRating
                    rating={h.user?.rating}
                    total={h.user?.totalRatings}
                    size="xs"
                  />
                  {h.message && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                      "{h.message}"
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">
                    {timeAgo(h.offeredAt)}
                  </p>
                </div>
                {h.status === "accepted" ? (
                  <span className="badge badge-green flex-shrink-0">
                    Accepted ✓
                  </span>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.93 }}
                    onClick={() => handleAccept(h)}
                    disabled={!!accepting}
                    className="btn btn-primary btn-sm flex-shrink-0"
                  >
                    {accepting === h.user._id ? (
                      <Spinner size="sm" color="white" />
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        Accept
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Page ────────────────────────────────────────────────────────── */
export default function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();

  const [offering, setOffering] = useState(false);
  const [offered, setOffered] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showAccept, setShowAccept] = useState(false);
  const [reviewed, setReviewed] = useState(false);

  // Fetch request data
  const { data, isLoading } = useQuery({
    queryKey: ["request", id],
    queryFn: async () => {
      const { data } = await api.get(`/requests/${id}`);
      return data.request;
    },
  });

  // Fetch review status (can user review / did they already?)
  const { data: reviewStatus } = useQuery({
    queryKey: ["review-status", id],
    queryFn: async () => {
      const { data } = await api.get(`/requests/${id}/review-status`);
      return data;
    },
    enabled: !!data && data.status === "completed",
  });

  const isOwner = user?._id === data?.poster?._id?.toString();
  const alreadyOffered = data?.helpers?.some(
    (h) => h.user?._id === user?._id || h.user === user?._id,
  );
  const cat = getCat(data?.category);
  const acceptedHelper = data?.acceptedHelper;
  const pendingHelpers =
    data?.helpers?.filter((h) => h.status === "pending") || [];
  const canReview =
    reviewStatus?.canReview && !reviewStatus?.alreadyReviewed && !reviewed;
  const revieweeId = reviewStatus?.revieweeId;

  // Build reviewee object from available data
  const revieweeObj = revieweeId
    ? isOwner
      ? data?.acceptedHelper
      : data?.poster
    : null;

  /* handlers */
  const handleOffer = async () => {
    setOffering(true);
    try {
      await api.post(`/requests/${id}/offer`);
      setOffered(true);
      qc.invalidateQueries({ queryKey: ["request", id] });
      toast.success("Help offered! The poster has been notified.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not offer help");
    } finally {
      setOffering(false);
    }
  };

  const handleChat = async () => {
    try {
      const { data: cd } = await api.post("/chats", {
        recipientId: data.poster._id,
        requestId: id,
      });
      navigate(`/chat/${cd.chat._id}`);
    } catch {
      toast.error("Could not open chat");
    }
  };

  const handleComplete = async () => {
    if (!window.confirm("Mark this request as completed?")) return;
    setCompleting(true);
    try {
      await api.put(`/requests/${id}`, { status: "completed" });
      await qc.invalidateQueries({ queryKey: ["request", id] });
      await qc.invalidateQueries({ queryKey: ["requests"] });
      await qc.invalidateQueries({ queryKey: ["review-status", id] });
      toast.success("Request marked complete! 🎉");
      // Auto-open review modal after a short delay
      if (data?.acceptedHelper) {
        setTimeout(() => setShowReview(true), 600);
      }
    } catch {
      toast.error("Failed to complete");
    } finally {
      setCompleting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this request? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await api.delete(`/requests/${id}`);
      qc.invalidateQueries({ queryKey: ["requests"] });
      navigate("/", { replace: true });
      toast.success("Request deleted");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const handleAcceptHelper = async (helperId) => {
    try {
      await api.post(`/requests/${id}/accept-helper`, { helperId });
      await qc.invalidateQueries({ queryKey: ["request", id] });
      setShowAccept(false);
      toast.success("Helper accepted! Request is now in progress.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to accept helper");
    }
  };

  if (isLoading) return <PageLoader />;
  if (!data) return null;

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-4 bg-white border-b border-gray-100 pt-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <BackButton onClick={() => navigate(-1)} />
            <h1 className="font-display font-bold text-base">Request Detail</h1>
          </div>
          {isOwner && data.status !== "completed" && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="btn btn-sm bg-red-50 text-red-500 hover:bg-red-100 border border-red-100"
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? "Deleting…" : "Delete"}
            </button>
          )}
        </div>

        <div className="pb-32">
          {/* Map preview */}
          <iframe
            width="100%"
            height="200"
            loading="lazy"
            src={`https://www.google.com/maps?q=${data.location?.coordinates[1]},${data.location?.coordinates[0]}&z=15&t=k&output=embed`}
          ></iframe>

          <div className="px-4 py-5 lg:px-6 flex flex-col gap-5">
            {/* Status badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${data.location?.coordinates[1]},${data.location?.coordinates[0]}`,
                    "_blank",
                  )
                }
                className={`badge-red border border-red-200`}
              >
                <MapPin className="w-4 h-4" />
                Open Google Map
              </button>
              <span className={`badge ${cat.color} border ${cat.border}`}>
                {cat.icon} {data.category}
              </span>
              {data.isUrgent && (
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="badge badge-amber"
                >
                  🔴 Urgent
                </motion.span>
              )}
              <span
                className={`badge ml-auto
                ${
                  data.status === "open"
                    ? "badge-green"
                    : data.status === "in_progress"
                      ? "badge-amber"
                      : data.status === "completed"
                        ? "badge-indigo"
                        : "badge-gray"
                }`}
              >
                {data.status === "open"
                  ? "● Open"
                  : data.status === "in_progress"
                    ? "⚡ In Progress"
                    : data.status === "completed"
                      ? "✓ Completed"
                      : data.status}
              </span>
            </div>

            {/* Title + description */}
            <h2 className="font-display font-bold text-2xl text-gray-900 leading-tight">
              {data.title}
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              {data.description}
            </p>

            {/* Meta */}
            <div className="flex flex-wrap gap-4">
              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                <MapPin className="w-4 h-4 text-brand-400" />
                {formatDist(data.distanceKm) ||
                  data.location?.address ||
                  data.location?.city}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                <Clock className="w-4 h-4 text-brand-400" />
                {timeAgo(data.createdAt)}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                <Eye className="w-4 h-4 text-brand-400" />
                {data.views} views
              </span>
              {data.reward > 0 && (
                <span className="flex items-center gap-1 text-sm font-bold text-green-600">
                  <IndianRupee className="w-4 h-4" />
                  {formatRupees(data.reward)}
                </span>
              )}
            </div>

            <hr className="border-gray-100" />

            {/* Poster */}
            <div>
              <p className="label mb-3">Posted by</p>
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => navigate(`/user/${data.poster._id}`)}
              >
                <Avatar user={data.poster} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-900">
                      {data.poster.name}
                    </p>
                    {data.poster.isVerified && <VerifiedBadge />}
                  </div>
                  <StarRating
                    rating={data.poster.rating}
                    total={data.poster.totalRatings}
                  />
                  <p className="text-xs text-gray-400 mt-0.5">
                    {data.poster.helpsGiven} helps ·{" "}
                    {data.poster.requestsPosted} requests
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
              </div>
              {data.poster.bio && (
                <p className="text-sm text-gray-500 mt-2 italic leading-relaxed">
                  "{data.poster.bio}"
                </p>
              )}
            </div>

            {/* Accepted helper */}
            {acceptedHelper && (
              <div>
                <p className="label mb-3 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-green-500" />
                  Accepted Helper
                </p>
                <div
                  className="flex items-center gap-3 p-3.5 bg-green-50 border border-green-100 rounded-xl cursor-pointer"
                  onClick={() => navigate(`/user/${acceptedHelper._id}`)}
                >
                  <Avatar user={acceptedHelper} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900">
                        {acceptedHelper.name}
                      </p>
                      {acceptedHelper.isVerified && <VerifiedBadge />}
                    </div>
                    <StarRating
                      rating={acceptedHelper.rating}
                      total={acceptedHelper.totalRatings}
                    />
                  </div>
                  <span className="badge badge-green flex-shrink-0">
                    Helping ✓
                  </span>
                </div>
              </div>
            )}

            {/* All helpers list (owner can choose) */}
            {data.helpers?.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="label flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {data.helpers.length} Helper
                    {data.helpers.length !== 1 ? "s" : ""} Offered
                  </p>
                  {isOwner &&
                    data.status === "open" &&
                    pendingHelpers.length > 0 && (
                      <button
                        onClick={() => setShowAccept(true)}
                        className="btn btn-sm btn-primary"
                      >
                        <UserCheck className="w-4 h-4" /> Choose Helper
                      </button>
                    )}
                </div>
                <div className="flex flex-col gap-2">
                  {data.helpers.map((h) => (
                    <div
                      key={h._id}
                      className="flex items-center gap-2.5 bg-gray-50 rounded-xl p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() =>
                        h.user?._id != null
                          ? navigate(`/user/${h.user?._id}`)
                          : toast("⚠️ Helper is no longer Available")
                      }
                    >
                      <Avatar user={h.user} size="xs" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-700 truncate">
                          {h.user?.name}
                        </p>
                        <StarRating
                          rating={h.user?.rating}
                          total={h.user?.totalRatings}
                          size="xs"
                        />
                      </div>
                      <span
                        className={`badge flex-shrink-0
                        ${
                          h.status === "accepted"
                            ? "badge-green"
                            : h.status === "rejected"
                              ? "badge-red"
                              : "badge-gray"
                        }`}
                      >
                        {h.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Review prompt — for completed requests */}
            {data.status === "completed" && canReview && revieweeObj && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">
                      How was the experience?
                    </p>
                    <p className="text-xs text-gray-500">
                      Rate {revieweeObj.name} for this request
                    </p>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowReview(true)}
                  className="btn btn-lg w-full"
                  style={{
                    background: "linear-gradient(135deg, #F59E0B, #EF4444)",
                    color: "#fff",
                  }}
                >
                  <Star className="w-5 h-5 fill-current" />
                  Leave a Review for {revieweeObj.name}
                </motion.button>
              </motion.div>
            )}

            {data.status === "completed" && reviewStatus?.alreadyReviewed && (
              <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-100 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p className="text-sm text-green-700 font-medium">
                  You've already submitted a review for this request.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom CTA ───────────────────────────────────── */}
        <div className="fixed lg:bottom-0 bottom-12 left-0 right-0 lg:left-64 bg-white border-t border-gray-100 px-4 py-4 z-30">
          {isOwner ? (
            <div className="flex gap-3">
              {data.status === "open" && (
                <>
                  {pendingHelpers.length > 0 && (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setShowAccept(true)}
                      className="btn btn-secondary flex-1 py-3.5 text-sm"
                    >
                      <UserCheck className="w-4 h-4" />
                      Choose Helper ({pendingHelpers.length})
                    </motion.button>
                  )}
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleComplete}
                    disabled={completing}
                    className="btn btn-primary flex-1 py-3.5 text-sm"
                  >
                    {completing ? (
                      <Spinner size="sm" color="white" />
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Mark Complete
                      </>
                    )}
                  </motion.button>
                </>
              )}
              {data.status === "in_progress" && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleComplete}
                  disabled={completing}
                  className="btn btn-primary w-full py-3.5 text-sm"
                >
                  {completing ? (
                    <Spinner size="sm" color="white" />
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Mark as Completed
                    </>
                  )}
                </motion.button>
              )}
              {data.status === "completed" && canReview && revieweeObj && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowReview(true)}
                  className="btn w-full py-3.5 text-sm text-white"
                  style={{
                    background: "linear-gradient(135deg, #F59E0B, #EF4444)",
                  }}
                >
                  <Star className="w-5 h-5 fill-current" />
                  Review {revieweeObj?.name}
                </motion.button>
              )}
              {data.status === "completed" && !canReview && (
                <button
                  onClick={() => navigate(-1)}
                  className="btn btn-secondary w-full py-3.5 text-sm"
                >
                  ← Go Back
                </button>
              )}
            </div>
          ) : (
            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleChat}
                className="btn btn-secondary flex-1 py-3.5 text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Chat
              </motion.button>

              {data.status === "open" ? (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleOffer}
                  disabled={offering || offered || alreadyOffered}
                  className={`flex-[2] py-3.5 text-sm btn
                    ${
                      offered || alreadyOffered
                        ? "bg-green-50 text-green-600 border border-green-200"
                        : "btn-primary"
                    }`}
                >
                  {offering ? (
                    <Spinner size="sm" color="white" />
                  ) : offered || alreadyOffered ? (
                    "✓ Offered"
                  ) : (
                    "🙋 Offer Help"
                  )}
                </motion.button>
              ) : data.status === "completed" && canReview && revieweeObj ? (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowReview(true)}
                  className="flex-[2] py-3.5 text-sm btn text-white"
                  style={{
                    background: "linear-gradient(135deg, #F59E0B, #EF4444)",
                  }}
                >
                  <Star className="w-4 h-4 fill-current" />
                  Review {revieweeObj?.name}
                </motion.button>
              ) : (
                <div
                  className={`flex-[2] py-3.5 text-sm btn bg-gray-100 text-gray-400 cursor-not-allowed`}
                >
                  {data.status === "in_progress"
                    ? "⚡ In Progress"
                    : "✓ Completed"}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showReview && revieweeObj && (
          <ReviewModal
            reviewee={revieweeObj}
            requestId={id}
            onClose={() => setShowReview(false)}
            onSubmitted={() => {
              setReviewed(true);
              qc.invalidateQueries({ queryKey: ["review-status", id] });
              qc.invalidateQueries({ queryKey: ["my-reviews"] });
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAccept && (
          <AcceptHelperModal
            helpers={data.helpers || []}
            onAccept={handleAcceptHelper}
            onClose={() => setShowAccept(false)}
          />
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
