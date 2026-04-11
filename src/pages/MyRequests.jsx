import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Clock, ArrowLeft, Trash2 } from "lucide-react";
import { PageTransition, EmptyState, PageLoader } from "../components/ui";
import { getCat, timeAgo, formatRupees } from "../utils/helpers";
import api from "../utils/api";
import toast from "react-hot-toast";

const STATUS_TABS = [
  { key: "", label: "All" },
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Done" },
];
const STATUS_STYLE = {
  open: { cls: "badge-green", label: "Open" },
  in_progress: { cls: "badge-amber", label: "In Progress" },
  completed: { cls: "badge-indigo", label: "Completed" },
  cancelled: { cls: "badge-red", label: "Cancelled" },
};

export default function MyRequests() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["my-requests", statusFilter],
    queryFn: async () => {
      const p = {};
      if (statusFilter) p.status = statusFilter;
      const { data } = await api.get("/requests/my", { params: p });
      return data;
    },
  });

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Delete this request?")) return;
    try {
      await api.delete(`/requests/${id}`);
      qc.invalidateQueries({ queryKey: ["my-requests"] });
      qc.invalidateQueries({ queryKey: ["requests"] });
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (isLoading) return <PageLoader />;
  const requests = data?.requests || [];

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto w-full">
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 pb-3 pt-6">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="font-display font-bold text-xl flex-1">
              My Requests
            </h1>
            <button
              onClick={() => navigate("/post")}
              className="btn btn-primary btn-sm"
            >
              <Plus className="w-4 h-4" />
              New
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {STATUS_TABS.map((t) => (
              <button
                key={t.label}
                onClick={() => setStatusFilter(t.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border flex-shrink-0 transition-all ${statusFilter === t.key ? "bg-brand-600 text-white border-brand-600" : "bg-white text-gray-600 border-gray-200"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="px-4 py-4 flex flex-col gap-3">
          {requests.length === 0 ? (
            <EmptyState
              icon="📋"
              title="No requests yet"
              subtitle="Post your first request and get help from people nearby."
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
            requests.map((req, i) => {
              const st = STATUS_STYLE[req.status] || STATUS_STYLE.open;
              const cat = getCat(req.category);
              return (
                <motion.div
                  key={req._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/request/${req._id}`)}
                  className="card card-hover p-4 cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-lg">{cat.icon}</span>
                      <span className={`badge ${st.cls}`}>{st.label}</span>
                      {req.isUrgent && (
                        <span className="badge badge-amber">🔴 Urgent</span>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleDelete(req._id, e)}
                      className="btn btn-sm bg-red-50 text-red-400 hover:bg-red-100 border border-red-100 flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h3 className="font-display font-bold text-gray-900 text-base leading-snug mb-2">
                    {req.title}
                  </h3>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {timeAgo(req.createdAt)}
                    </span>
                    {req.reward > 0 && (
                      <span className="badge badge-green">
                        {formatRupees(req.reward)}
                      </span>
                    )}
                    {req.acceptedHelper && (
                      <span className="text-xs text-brand-600 font-semibold">
                        Helper assigned ✓
                      </span>
                    )}
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
