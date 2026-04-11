import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  Avatar,
  Input,
  Textarea,
  Spinner,
  PageTransition,
} from "../components/ui";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    avatar: user?.avatar || "",
  });
  const [preview, setPreview] = useState(user?.avatar || "");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (form.name.trim().length > 100) e.name = "Max 100 characters";
    if (form.bio.length > 300) e.bio = "Max 300 characters";
    setErrors(e);
    return !Object.keys(e).length;
  };

  // Convert image file to base64 string
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      setPreview(base64);
      setForm((f) => ({ ...f, avatar: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await api.put("/users/profile", {
        name: form.name.trim(),
        bio: form.bio.trim(),
        avatar: form.avatar,
      });
      updateUser(data.user);
      toast.success("Profile updated!");
      navigate("/profile");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="max-w-lg mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 pb-4 bg-white border-b border-gray-100 pt-6 sticky top-0 z-30">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="font-display font-bold text-lg">Edit Profile</h1>
        </div>

        <form onSubmit={handleSave} className="flex flex-col">
          <div className="px-4 py-6 flex flex-col gap-5 lg:px-6">
            {/* Avatar upload */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                {preview ? (
                  <img
                    src={preview}
                    alt="Avatar preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-100"
                  />
                ) : (
                  <Avatar user={user} size="xl" />
                )}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-brand-600 hover:bg-brand-700 rounded-full flex items-center justify-center border-2 border-white shadow-md transition-colors"
                >
                  <Camera className="w-4 h-4 text-white" />
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              <p className="text-xs text-gray-400">
                Tap camera to change photo (max 2MB)
              </p>
            </div>

            {/* Read-only account info */}
            {(user?.email || user?.phone) && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                  Account Info
                </p>
                {user.email && (
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-sm text-gray-500">Email</span>
                    <span className="text-sm font-medium text-gray-700">
                      {user.email}
                    </span>
                  </div>
                )}
                {user.phone && (
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-sm text-gray-500">Phone</span>
                    <span className="text-sm font-medium text-gray-700">
                      {user.phone}
                    </span>
                  </div>
                )}
              </div>
            )}

            <Input
              label="Full Name *"
              value={form.name}
              onChange={set("name")}
              error={errors.name}
              maxLength={100}
              placeholder="Your full name"
              autoComplete="name"
            />

            <div>
              <Textarea
                label="Bio (optional)"
                value={form.bio}
                onChange={set("bio")}
                error={errors.bio}
                rows={4}
                maxLength={300}
                placeholder="Tell the community a bit about yourself — what you're good at, how you like to help…"
              />
              <p className="text-right text-xs text-gray-400 mt-1">
                {form.bio.length}/300
              </p>
            </div>

            <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3.5">
              <span className="text-blue-500 text-lg flex-shrink-0">💡</span>
              <p className="text-xs text-blue-700 leading-relaxed">
                A complete profile with a photo and bio gets{" "}
                <strong>3x more help offers</strong> from the community.
              </p>
            </div>
          </div>

          <div className="px-4 py-4 bg-white border-t border-gray-100 lg:px-6">
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-xl w-full"
            >
              {loading ? (
                <Spinner size="sm" color="white" />
              ) : (
                <>
                  <Check className="w-5 h-5" /> Save Changes
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </PageTransition>
  );
}
