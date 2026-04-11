import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Loader, AlertTriangle, Shield } from "lucide-react";
import { PageTransition } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";

const SectionHeader = ({
  icon: Icon,
  title,
  color = "text-gray-500",
  bg = "bg-gray-100",
}) => (
  <div className="px-4 py-3 bg-gray-50 border-y border-gray-100 flex items-center gap-2">
    <div
      className={`w-6 h-6 ${bg} rounded-lg flex items-center justify-center`}
    >
      <Icon className={`w-3.5 h-3.5 ${color}`} />
    </div>
    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
      {title}
    </p>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between px-4 py-3.5 bg-white">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-sm font-medium text-gray-700">{value || "—"}</span>
  </div>
);

const Sep = () => <div className="border-t border-gray-50 mx-4" />;

// DeleteAccount confirmation modal
function DeleteAccountModal({ onConfirm, onCancel, loading }) {
  const [confirmText, setConfirmText] = useState("");
  const ready = confirmText === "DELETE";

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-5"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="font-display font-bold text-gray-900">
              Delete Account
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              This cannot be undone
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          Deleting your account will permanently remove your profile, all
          requests, reviews, messages, and notifications.{" "}
          <strong>This action is irreversible.</strong>
        </p>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            Type <strong>DELETE</strong> to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            className="input border-red-200 focus:border-red-400 focus:ring-red-200"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="btn btn-ghost flex-1 py-3 border border-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!ready || loading}
            className={`flex-1 py-3 btn text-sm font-bold
              ${ready ? "bg-red-500 hover:bg-red-600 text-white" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
          >
            {loading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              "Delete Forever"
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Delete account
  const { mutate: deleteAccount, isPending: deletingAccount } = useMutation({
    mutationFn: () => api.delete("/users/account"),
    onSuccess: () => {
      toast.success("Account deleted");
      logout();
      navigate("/onboarding", { replace: true });
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Deletion failed"),
  });

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto w-full">
        {/* Sticky header */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 pb-4 pt-6 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="font-display font-bold text-xl">Settings</h1>
        </div>

        {/* Account info */}
        <SectionHeader
          icon={Shield}
          title="Account"
          color="text-gray-600"
          bg="bg-gray-100"
        />
        <InfoRow label="Email" value={user?.email} />
        <Sep />
        <InfoRow label="Phone" value={user?.phone} />
        <Sep />
        <InfoRow
          label="Verified"
          value={user?.isVerified ? "Verified" : "Not verified"}
        />
        <Sep />
        <InfoRow
          label="Member since"
          value={
            user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "—"
          }
        />

        {/* Danger zone */}
        <SectionHeader
          icon={AlertTriangle}
          title="Danger Zone"
          color="text-red-500"
          bg="bg-red-50"
        />
        <div className="bg-white px-4 py-5">
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">
            Permanently delete your account and all associated data — requests,
            reviews, messages. This action <strong>cannot be undone</strong>.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full py-3 text-sm font-bold text-red-500 border-2 border-red-200 rounded-xl hover:bg-red-50 active:bg-red-100 transition-colors flex items-center justify-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            Delete My Account
          </button>
        </div>
      </div>

      {/* Delete account modal */}
      {showDeleteModal && (
        <DeleteAccountModal
          loading={deletingAccount}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={() => deleteAccount()}
        />
      )}
    </PageTransition>
  );
}
