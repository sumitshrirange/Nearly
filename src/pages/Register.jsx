import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Input, Spinner } from "../components/ui";
import toast from "react-hot-toast";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email && !form.phone) e.email = "Email or phone is required";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email))
      e.email = "Invalid email format";
    if (form.phone && !/^\+\d{1,3}\d{7,14}$/.test(form.phone)) {
      e.phone = "Country code is required (e.g. +91XXXXXXXXXX)";
    }
    if (form.password.length < 6)
      e.password = "Password must be at least 6 characters";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { name: form.name, password: form.password };
      if (form.email) payload.email = form.email;
      if (form.phone) payload.phone = form.phone;
      await register(payload);
      toast.success("Welcome to Nearly! 🎉");
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8"
        >
          <div className="text-center mb-8">
            <div
              className="flex items-center justify-center cursor-pointer"
              onClick={() => navigate("/onboarding")}
            >
              <img src="/Nearly_Logo.png" className="size-9" alt="" />
              <span className="font-display font-bold text-3xl text-brand-600">
                Nearly.
              </span>
            </div>
            <h1 className="font-display font-bold text-2xl text-gray-900 mt-4">
              Create account
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Join your local community today
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Full Name *"
              type="text"
              placeholder="John Doe"
              value={form.name}
              onChange={set("name")}
              error={errors.name}
              autoComplete="name"
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set("email")}
              error={errors.email}
              autoComplete="email"
            />
            <Input
              label="Phone (optional)"
              type="tel"
              placeholder="+919876543210"
              value={form.phone}
              onChange={set("phone")}
              error={errors.phone}
            />
            <div className="relative">
              <Input
                label="Password *"
                type={showPw ? "text" : "password"}
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={set("password")}
                error={errors.password}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 p-0.5"
              >
                {showPw ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-xl w-full mt-2"
            >
              {loading ? (
                <Spinner size="sm" color="white" />
              ) : (
                "Create Account →"
              )}
            </motion.button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-brand-600 font-semibold hover:text-brand-700"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
