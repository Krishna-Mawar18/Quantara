"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog, AlertDialog } from "@/components/ui/dialog";
import { useConfirm, useAlert } from "@/hooks/use-dialog";
import { useAuthStore } from "@/store/auth";
import { getPlanInfo, getPlans, getSubscription, createCheckout } from "@/lib/api";
import { getFirebaseAuth } from "@/lib/firebase";
import { updateProfile } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Sparkles, Trash2, Check, Zap, CreditCard } from "lucide-react";
import { useDatasetStore } from "@/store/dataset";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  subscription_id: string;
  name: string;
  description: string;
  handler: (response: { razorpay_payment_id: string; razorpay_subscription_id: string; razorpay_signature: string }) => void;
  prefill?: { email?: string; name?: string };
  theme?: { color: string };
}

interface RazorpayInstance {
  open: () => void;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  limits: Record<string, number>;
  popular?: boolean;
}

function AnimatedPrice({ value, isYearly }: { value: number; isYearly: boolean }) {
  const displayValue = isYearly && value > 0 ? Math.round(value * 12 * 0.7) : value;
  return <>₹{displayValue}</>;
}

export default function SettingsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { datasets } = useDatasetStore();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [planName, setPlanName] = useState("Free");
  const [isSaving, setIsSaving] = useState(false);

  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState("free");
  const [subscriptionStatus, setSubscriptionStatus] = useState("active");
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [subscribingPlan, setSubscribingPlan] = useState<string | null>(null);
  const [isYearly, setIsYearly] = useState(false);

  const confirmDialog = useConfirm();
  const alertDialog = useAlert();

  useEffect(() => {
    getPlanInfo()
      .then((info) => setPlanName(info.plan))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.email) setEmail(user.email);
  }, [user]);

  const loadData = useCallback(async () => {
    setIsLoadingPlans(true);
    try {
      const [plansData, subData] = await Promise.all([
        getPlans(),
        getSubscription(),
      ]);
      setPlans(plansData);
      setCurrentPlan(subData.plan);
      setSubscriptionStatus(subData.status);
    } catch {
      // Use defaults on error
    } finally {
      setIsLoadingPlans(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async (planId: string) => {
    if (planId === "free") {
      try {
        setSubscribingPlan(planId);
        await createCheckout(planId);
        setCurrentPlan("free");
        setSubscriptionStatus("active");
        alertDialog.alert({
          title: "Plan Updated",
          message: "Switched to the Free plan.",
          variant: "success",
        });
      } catch (err: unknown) {
        alertDialog.alert({
          title: "Error",
          message: err instanceof Error ? err.message : "Failed to switch plan",
          variant: "error",
        });
      } finally {
        setSubscribingPlan(null);
      }
      return;
    }

    setSubscribingPlan(planId);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        alertDialog.alert({
          title: "Error",
          message: "Failed to load payment gateway.",
          variant: "error",
        });
        return;
      }

      const checkout = await createCheckout(planId);

      const razorpay = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        subscription_id: checkout.subscription_id || "",
        name: "Quantara",
        description: `${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan`,
        handler: async () => {
          setCurrentPlan(planId);
          setSubscriptionStatus("active");
          await loadData();
          alertDialog.alert({
            title: "Subscribed",
            message: `You're now on the ${planId.replace("_", " ")} plan.`,
            variant: "success",
          });
        },
        theme: { color: "#7c3aed" },
      });

      razorpay.open();
    } catch (err: unknown) {
      alertDialog.alert({
        title: "Error",
        message: err instanceof Error ? err.message : "Checkout failed",
        variant: "error",
      });
    } finally {
      setSubscribingPlan(null);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const auth = getFirebaseAuth();
      if (auth?.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name });
      }
      alertDialog.alert({
        title: "Saved",
        message: "Profile updated successfully.",
        variant: "success",
      });
    } catch {
      alertDialog.alert({
        title: "Error",
        message: "Failed to update profile.",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = await confirmDialog.confirm({
      title: "Delete Account",
      message: "This will permanently delete your account, datasets, and subscription. This cannot be undone.",
      confirmText: "Delete Account",
      variant: "danger",
    });
    if (!confirmed) return;

    try {
      const auth = getFirebaseAuth();
      if (auth?.currentUser) {
        await auth.currentUser.delete();
      }
      await logout();
      router.push("/");
    } catch {
      alertDialog.alert({
        title: "Error",
        message: "Failed to delete account. You may need to re-authenticate.",
        variant: "error",
      });
    }
  };

  const currentPlanData = plans.find((p) => p.id === currentPlan);

  const planData = {
    pro: {
      price: 999,
      dollar: "$12",
      save: "Save 30%",
    },
    proPlus: {
      price: 2499,
      dollar: "$30",
      save: "Save 30%",
    },
  };

  return (
    <div>
      <div className="relative overflow-hidden mb-8 rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-[1px]">
        <div className="bg-white rounded-3xl p-6">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">Settings</h1>
            <p className="text-[13px] text-zinc-500 mt-0.5">
              Manage your account and subscription.
            </p>
          </div>

          <div className="space-y-6">
            <Card className="border-violet-300">
              <CardHeader className="pb-4 border-violet-300">
                <div className="flex items-center justify-between">
                  <CardTitle>Profile</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <Badge variant="info" className="capitalize px-3 py-2">
                      {planName}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  id="name"
                  label="Name"
                  className="bg-white text-zinc-900 border-zinc-200"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  id="email"
                  label="Email"
                  className="bg-zinc-50 text-zinc-900 border-zinc-200"
                  value={email}
                  disabled
                />
                <div className="flex justify-end pt-2">
                  <Button onClick={handleSaveProfile} isLoading={isSaving}>
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-violet-300">
              <div className="px-6 py-4 border-b border-violet-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-[15px] font-semibold text-zinc-900">Subscription</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-white" />
                    </div>
                    <Badge variant={subscriptionStatus === "active" ? "success" : "warning"}>
                      {subscriptionStatus}
                    </Badge>
                  </div>
                </div>
              </div>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 rounded-xl bg-violet-50 border border-violet-200">
                    <p className="text-2xl font-bold text-zinc-900">{datasets.length}</p>
                    <p className="text-xs text-zinc-500">Datasets Used</p>
                  </div>
                  <div className="p-3 rounded-xl bg-violet-50 border border-violet-200">
                    <p className="text-2xl font-bold text-zinc-900">
                      {currentPlanData?.limits?.datasets === -1 ? "∞" : currentPlanData?.limits?.datasets ?? 5}
                    </p>
                    <p className="text-xs text-zinc-500">Max Datasets</p>
                  </div>
                  <div className="p-3 rounded-xl bg-violet-50 border border-violet-200">
                    <p className="text-2xl font-bold text-zinc-900">
                      {currentPlanData?.limits?.predictions_per_month === -1 ? "∞" : currentPlanData?.limits?.predictions_per_month ?? 100}
                    </p>
                    <p className="text-xs text-zinc-500">Predictions/Month</p>
                  </div>
                </div>

                <div className="flex justify-center pt-4">
                  <div className="inline-flex bg-zinc-100 rounded-full p-1.5 relative">
                    <div
                      className={`absolute top-1.5 h-[calc(100%-10px)] rounded-full bg-gradient-to-r from-violet-600 to-purple-600 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                        isYearly ? "left-[calc(50%+2px)]" : "left-1.5"
                      }`}
                      style={{ width: "calc(50% - 4px)" }}
                    />
                    <button
                      onClick={() => setIsYearly(false)}
                      className={`relative z-10 px-8 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                        !isYearly ? "text-white" : "text-zinc-600 hover:text-zinc-900"
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setIsYearly(true)}
                      className={`relative z-10 px-8 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                        isYearly ? "text-white" : "text-zinc-600 hover:text-zinc-900"
                      }`}
                    >
                      Yearly
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className="p-4 rounded-xl border border-violet-200 bg-white hover:border-violet-400 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-violet-100 text-violet-700 text-sm font-semibold rounded-full">
                        <Zap className="w-3.5 h-3.5" />
                        Pro
                      </span>
                      {isYearly && (
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          {planData.pro.save}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-3xl font-bold text-zinc-900">
                        <AnimatedPrice value={planData.pro.price} isYearly={isYearly} />
                      </span>
                      <span className="text-zinc-500 text-sm">/month</span>
                    </div>
                    <div className="space-y-2 mb-4">
                      {["5 datasets", "Advanced analytics", "Unlimited charts (3 types)", "Basic insights", "Email support", "API access"].map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-zinc-600">
                          <Check className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>
                    <Button
                      className="w-full"
                      variant={currentPlan === "pro" ? "outline" : "primary"}
                      disabled={currentPlan === "pro" || subscribingPlan !== null}
                      isLoading={subscribingPlan === "pro"}
                      onClick={() => handleSubscribe("pro")}
                    >
                      {currentPlan === "pro" ? "Current Plan" : "Subscribe"}
                    </Button>
                  </div>

                  <div className="p-4 rounded-xl border-2 border-violet-500 bg-white relative">
                    <div className="absolute -top-3 right-4">
                      <span className="bg-violet-500 text-white text-xs font-bold px-3 py-1 rounded-full">POPULAR</span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500 text-white text-sm font-semibold rounded-full">
                        <Sparkles className="w-3.5 h-3.5" />
                        Pro Plus
                      </span>
                      {isYearly && (
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          {planData.proPlus.save}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-3xl font-bold text-zinc-900">
                        <AnimatedPrice value={planData.proPlus.price} isYearly={isYearly} />
                      </span>
                      <span className="text-zinc-500 text-sm">/month</span>
                    </div>
                    <div className="space-y-2 mb-4">
                      {["20 datasets", "Advanced analytics", "Unlimited charts (all types)", "Advanced insights & predictions", "ML models (customizable)", "Priority support", "Strategy calls"].map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-zinc-600">
                          <Check className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>
                    <Button
                      className="w-full"
                      variant={currentPlan === "pro_plus" ? "outline" : "primary"}
                      disabled={currentPlan === "pro_plus" || subscribingPlan !== null}
                      isLoading={subscribingPlan === "pro_plus"}
                      onClick={() => handleSubscribe("pro_plus")}
                    >
                      {currentPlan === "pro_plus" ? "Current Plan" : "Subscribe"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-300">
              <CardHeader className="pb-4 border-red-300">
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">Delete account</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button variant="danger" onClick={handleDeleteAccount}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onCloseAction={confirmDialog.handleCancel}
        onConfirmAction={confirmDialog.handleConfirm}
        title={confirmDialog.options.title}
        message={confirmDialog.options.message}
        confirmText={confirmDialog.options.confirmText}
        variant={confirmDialog.options.variant}
      />

      <AlertDialog
        isOpen={alertDialog.isOpen}
        onCloseAction={alertDialog.handleClose}
        title={alertDialog.options.title}
        message={alertDialog.options.message}
        variant={alertDialog.options.variant}
      />
    </div>
  );
}
