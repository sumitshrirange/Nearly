import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Clock } from "lucide-react";
import {
  Avatar,
  StarRating,
  VerifiedBadge,
  BackButton,
  PageLoader,
  PageTransition,
} from "../components/ui";
import { getCat, timeAgo } from "../utils/helpers";
import api from "../utils/api";

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["user-profile", id],
    queryFn: async () => {
      const { data } = await api.get(`/users/${id}`);
      return data;
    },
  });

  if (isLoading) return <PageLoader />;
  if (!data) return null;
  const { user, requests = [], reviews = [] } = data;
  const avg = user.rating.toFixed(1);

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 pb-4 bg-white border-b border-gray-100 pt-6 sticky top-0 z-30">
          <BackButton onClick={() => navigate(-1)} />
          <h1 className="font-display font-bold text-base">Profile</h1>
        </div>

        <div className="px-4 py-5 lg:px-6 flex flex-col gap-5">
          {/* User card */}
          <div className="card p-5">
            <div className="flex items-start gap-4 mb-4">
              <Avatar user={user} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h2 className="font-display font-bold text-xl">
                    {user.name}
                  </h2>
                  {user.isVerified && <VerifiedBadge />}
                </div>
                {user.bio && (
                  <p className="text-sm text-gray-500 mb-2 leading-relaxed">
                    {user.bio}
                  </p>
                )}
                <StarRating rating={user.rating} total={user.totalRatings} />
              </div>
            </div>

            <div className="flex bg-gray-50 rounded-xl overflow-hidden divide-x divide-gray-100">
              {[
                {
                  n: user.helpsGiven || 0,
                  l: "Helps Given",
                  c: "text-green-500",
                },
                {
                  n: user.requestsPosted || 0,
                  l: "Requests",
                  c: "text-brand-600",
                },
                { n: avg, l: "Rating", c: "text-amber-500" },
              ].map((s) => (
                <div key={s.l} className="flex-1 py-3 text-center">
                  <div className={`font-display font-bold text-lg ${s.c}`}>
                    {s.n}
                  </div>
                  <div className="text-xs text-gray-400 font-medium mt-0.5">
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active requests */}
          {requests.length > 0 && (
            <div>
              <h3 className="font-display font-bold text-base text-gray-800 mb-3">
                Active Requests
              </h3>
              <div className="flex flex-col gap-2">
                {requests.map((r) => {
                  const cat = getCat(r.category);
                  return (
                    <div
                      key={r._id}
                      onClick={() => navigate(`/request/${r._id}`)}
                      className="card card-hover p-3.5 flex items-center gap-3 cursor-pointer"
                    >
                      <span className="text-xl flex-shrink-0">{cat.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-800 truncate">
                          {r.title}
                        </p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {timeAgo(r.createdAt)}
                        </p>
                      </div>
                      <span className="badge badge-green flex-shrink-0">
                        Open
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <div>
              <h3 className="font-display font-bold text-base text-gray-800 mb-3">
                Reviews ({reviews.length})
              </h3>
              <div className="flex flex-col gap-3">
                {reviews.map((r) => (
                  <div key={r._id} className="card p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar user={r.reviewer} size="xs" />
                      <span className="text-sm font-semibold text-gray-800">
                        {r.reviewer?.name}
                      </span>
                      <div className="flex ml-auto">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <span
                            key={i}
                            className={`text-sm ${i <= r.rating ? "text-amber-400" : "text-gray-200"}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    {r.comment && (
                      <p className="text-sm text-gray-600 leading-relaxed">
                        "{r.comment}"
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {timeAgo(r.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
