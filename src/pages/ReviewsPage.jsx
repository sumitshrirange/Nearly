import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Star } from "lucide-react";
import {
  PageTransition,
  EmptyState,
  PageLoader,
  Avatar,
} from "../components/ui";
import { timeAgo } from "../utils/helpers";
import api from "../utils/api";

export default function ReviewsPage() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["my-reviews"],
    queryFn: async () => {
      const { data } = await api.get("/users/reviews/mine");
      return data;
    },
  });

  if (isLoading) return <PageLoader />;
  const reviews = data?.reviews || [];
  const avg = data?.avg || "0.0";
  const total = data?.total || 0;

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto w-full">
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 pb-4 pt-6 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="font-display font-bold text-xl">My Reviews</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {total} review{total !== 1 ? "s" : ""} · {avg} avg rating
            </p>
          </div>
        </div>

        {/* Summary card */}
        {total > 0 && (
          <div className="mx-4 mt-4 p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="font-display font-bold text-4xl text-amber-600">
                  {avg}
                </div>
                <div className="flex justify-center mt-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i <= Math.round(parseFloat(avg)) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-800 text-base">
                  Community Rating
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Based on {total} review{total !== 1 ? "s" : ""}
                </p>
                {/* Rating bars */}
                <div className="flex flex-col gap-1 mt-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.filter(
                      (r) => r.rating === star,
                    ).length;
                    const pct = total > 0 ? (count / total) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-4">
                          {star}
                        </span>
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />
                        <div className="flex-1 h-1.5 bg-amber-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{
                              duration: 0.5,
                              delay: (5 - star) * 0.07,
                            }}
                            className="h-full bg-amber-400 rounded-full"
                          />
                        </div>
                        <span className="text-xs text-gray-400 w-4 text-right">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Review list */}
        <div className="px-4 py-4 flex flex-col gap-3">
          {reviews.length === 0 ? (
            <EmptyState
              icon="⭐"
              title="No reviews yet"
              subtitle="Complete help requests and build your community reputation."
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
            reviews.map((review, i) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card p-4"
              >
                <div className="flex items-start gap-3 mb-3">
                  <Avatar user={review.reviewer} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-gray-900 text-sm">
                        {review.reviewer?.name}
                      </p>
                      <div className="flex flex-shrink-0">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i <= review.rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {timeAgo(review.createdAt)}
                    </p>
                  </div>
                </div>

                {review.comment && (
                  <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-3">
                    "{review.comment}"
                  </p>
                )}

                {review.request && (
                  <button
                    onClick={() => navigate(`/request/${review.request._id}`)}
                    className="mt-2 text-xs text-brand-600 font-semibold hover:underline"
                  >
                    Re: {review.request.title}
                  </button>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </PageTransition>
  );
}
