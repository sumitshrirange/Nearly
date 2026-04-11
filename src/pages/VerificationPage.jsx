import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ShieldCheck,
  Phone,
  Mail,
  Check,
  Loader,
} from "lucide-react";
import { PageTransition } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";

const STEPS = [
  {
    id: "phone",
    icon: Phone,
    label: "Phone Verification",
    desc: "Verify with your mobile number via OTP",
  },
  {
    id: "email",
    icon: Mail,
    label: "Email Verification",
    desc: "Confirm your email address",
  },
  {
    id: "id",
    icon: ShieldCheck,
    label: "Identity Check",
    desc: "Upload government ID for full verification",
  },
];

export default function VerificationPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [activeStep, setActiveStep] = useState(null);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200)); // Simulate API call
    setOtpSent(true);
    setLoading(false);
    toast.success("OTP sent to your phone!");
  };

  const verifyOtp = async () => {
    if (otp.length < 4) {
      toast.error("Enter the 4-digit OTP");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    // await api.post('/auth/verify-otp', { otp })
    updateUser({ isVerified: true });
    toast.success("Phone verified! ✅");
    setActiveStep(null);
    setLoading(false);
  };

  const completedSteps = user?.isVerified ? ["phone", "email"] : [];

  return (
    <PageTransition>
      <div className="max-w-lg mx-auto w-full">
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 pb-4 pt-6 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="font-display font-bold text-xl">Verification</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Build trust with your community
            </p>
          </div>
        </div>

        <div className="px-4 py-5 flex flex-col gap-4">
          {/* Status banner */}
          <div
            className={`p-4 rounded-2xl flex items-center gap-3 ${user?.isVerified ? "bg-green-50 border border-green-100" : "bg-amber-50 border border-amber-100"}`}
          >
            <ShieldCheck
              className={`w-8 h-8 flex-shrink-0 ${user?.isVerified ? "text-green-500" : "text-amber-500"}`}
            />
            <div>
              <p
                className={`font-bold text-sm ${user?.isVerified ? "text-green-700" : "text-amber-700"}`}
              >
                {user?.isVerified ? "Account Verified" : "Not Yet Verified"}
              </p>
              <p
                className={`text-xs mt-0.5 ${user?.isVerified ? "text-green-600" : "text-amber-600"}`}
              >
                {user?.isVerified
                  ? "You have a verified badge visible to everyone."
                  : "Complete verification to earn a trust badge."}
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="card p-4">
            <h3 className="font-display font-bold text-sm text-gray-700 mb-3">
              Why get verified?
            </h3>
            {[
              "✅ Green verified badge on your profile",
              "🤝 3x more help offers from the community",
              "⭐ Higher visibility in search results",
              "🔒 Access to trusted-only requests",
            ].map((b) => (
              <p key={b} className="text-sm text-gray-600 py-1">
                {b}
              </p>
            ))}
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-3">
            {STEPS.map((step) => {
              const done = completedSteps.includes(step.id);
              const isActive = activeStep === step.id;
              return (
                <div key={step.id}>
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      !done && setActiveStep(isActive ? null : step.id)
                    }
                    className={`card p-4 flex items-center gap-3 cursor-pointer transition-all
                      ${done ? "bg-green-50 border-green-100" : isActive ? "border-brand-300" : "hover:border-brand-200"}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                      ${done ? "bg-green-100" : isActive ? "bg-brand-50" : "bg-gray-100"}`}
                    >
                      {done ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <step.icon
                          className={`w-5 h-5 ${isActive ? "text-brand-600" : "text-gray-500"}`}
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`font-semibold text-sm ${done ? "text-green-700" : "text-gray-800"}`}
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {done ? "Completed ✓" : step.desc}
                      </p>
                    </div>
                    {!done && (
                      <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-full">
                        {isActive ? "Active" : "Start"}
                      </span>
                    )}
                  </motion.div>

                  {/* OTP flow for phone step */}
                  {isActive && step.id === "phone" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-gray-50 rounded-b-2xl p-4 border border-t-0 border-gray-200 flex flex-col gap-3">
                        <p className="text-sm text-gray-600">
                          We'll send a 4-digit OTP to{" "}
                          <strong>
                            {user?.phone || "your registered phone"}
                          </strong>
                        </p>
                        {!otpSent ? (
                          <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={sendOtp}
                            disabled={loading}
                            className="btn btn-primary btn-md w-full"
                          >
                            {loading ? (
                              <>
                                <Loader className="w-4 h-4 animate-spin" />{" "}
                                Sending…
                              </>
                            ) : (
                              "Send OTP"
                            )}
                          </motion.button>
                        ) : (
                          <div className="flex flex-col gap-3">
                            <input
                              type="number"
                              placeholder="Enter 4-digit OTP"
                              value={otp}
                              onChange={(e) =>
                                setOtp(e.target.value.slice(0, 4))
                              }
                              className="input text-center text-xl tracking-widest font-bold"
                              maxLength={4}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={sendOtp}
                                className="btn btn-ghost btn-md flex-1 border border-gray-200"
                              >
                                Resend
                              </button>
                              <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={verifyOtp}
                                disabled={loading}
                                className="btn btn-primary btn-md flex-1"
                              >
                                {loading ? (
                                  <Loader className="w-4 h-4 animate-spin" />
                                ) : (
                                  "Verify"
                                )}
                              </motion.button>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {isActive && step.id === "email" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-gray-50 rounded-b-2xl p-4 border border-t-0 border-gray-200">
                        <p className="text-sm text-gray-600 mb-3">
                          A verification link will be sent to{" "}
                          <strong>{user?.email || "your email"}</strong>
                        </p>
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={() => {
                            toast.success("Verification email sent!");
                            setActiveStep(null);
                          }}
                          className="btn btn-primary btn-md w-full"
                        >
                          Send Verification Email
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {isActive && step.id === "id" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-gray-50 rounded-b-2xl p-4 border border-t-0 border-gray-200">
                        <p className="text-sm text-gray-600 mb-3">
                          Upload a clear photo of your Aadhaar, PAN, or
                          Passport. Reviewed within 24 hours.
                        </p>
                        <button
                          onClick={() => toast("Coming Soon")}
                          className="btn btn-primary btn-md w-full"
                        >
                          Upload Document
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
