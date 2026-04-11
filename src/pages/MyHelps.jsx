import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { IndianRupee, ArrowLeft, Heart } from "lucide-react";
import {
  PageTransition,
  EmptyState,
  PageLoader,
  Avatar,
} from "../components/ui";
import { getCat, timeAgo, formatRupees } from "../utils/helpers";
import api from "../utils/api";

const STATUS_STYLE = {
  open: { cls: "badge-green", label: "Open" },
  in_progress: { cls: "badge-amber", label: "In Progress" },
  completed: { cls: "badge-indigo", label: "Completed" },
  cancelled: { cls: "badge-red", label: "Cancelled" },
};

export default function MyHelps() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["my-helps"],
    queryFn: async () => {
      const { data } = await api.get("/requests/helped");
      return data;
    },
  });

  if (isLoading) return <PageLoader />;
  const requests = data?.requests || [];

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 pb-4 pt-6 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="font-display font-bold text-xl">My Helps</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {requests.length} request{requests.length !== 1 ? "s" : ""}{" "}
              assisted
            </p>
          </div>
        </div>

        <div className="px-4 py-4 flex flex-col gap-3">
          {requests.length === 0 ? (
            <EmptyState
              icon="🤝"
              title="No helps yet"
              subtitle="Browse requests near you and offer to help. Your contributions will appear here."
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
            requests.map((req, i) => {
              const st = STATUS_STYLE[req.status] || STATUS_STYLE.open;
              const cat = getCat(req.category);
              const myOffer = req.helpers?.find((h) => h.status === "accepted");

              return (
                <motion.div
                  key={req._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/request/${req._id}`)}
                  className="card card-hover p-4 cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-xl">{cat.icon}</span>
                      <span className={`badge ${st.cls}`}>{st.label}</span>
                      {req.isUrgent && (
                        <span className="badge badge-amber">🔴 Urgent</span>
                      )}
                    </div>
                    {req.reward > 0 && (
                      <span className="badge badge-green flex-shrink-0">
                        <IndianRupee className="w-3 h-3" />
                        {formatRupees(req.reward)}
                      </span>
                    )}
                  </div>

                  <h3 className="font-display font-bold text-gray-900 text-base leading-snug mb-2">
                    {req.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                    {req.description}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                      <Avatar user={req.poster} size="xs" />
                      <span className="text-xs font-semibold text-gray-600">
                        {req.poster?.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                      <span className="text-xs text-gray-400">
                        {timeAgo(req.updatedAt)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </PageTransition>
  );
}
