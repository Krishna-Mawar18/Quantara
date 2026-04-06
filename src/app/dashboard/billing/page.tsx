"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog } from "@/components/ui/dialog";
import { useAlert } from "@/hooks/use-dialog";
import { Check, Sparkles, CreditCard, Zap, ArrowRight } from "lucide-react";
import { getPlans, getSubscription, createCheckout } from "@/lib/api";
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

export default function BillingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState("free");
  const [subscriptionStatus, setSubscriptionStatus] = useState("active");
  const [isLoading, setIsLoading] = useState(true);
  const [subscribingPlan, setSubscribingPlan] = useState<string | null>(null);
  const { datasets } = useDatasetStore();

  const [isYearly, setIsYearly] = useState(false);

  const alertDialog = useAlert();

  const loadData = useCallback(async () => {
    setIsLoading(true);
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
      setIsLoading(false);
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
      <div className={`bg-white rounded-3xl p-6`}>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">Billing</h1>
        <p className="text-[13px] text-zinc-500 mt-0.5">
          Manage your subscription
        </p>
      </div>

      <Card className="mb-6 border-2 border-zinc-200/70">
        <CardHeader className="pb-4 border-b border-zinc-200/70">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-amber-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-zinc-500">Current Plan</p>
                <p className="text-lg font-semibold text-zinc-900 capitalize">{currentPlan.replace("_", " ")}</p>
              </div>
            </div>
            <Badge variant={subscriptionStatus === "active" ? "success" : "warning"}>
              {subscriptionStatus}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 rounded-xl bg-violet-50 border border-violet-200">
              <p className="text-2xl font-bold text-zinc-900">{datasets.length}</p>
              <p className="text-xs text-zinc-500">Datasets Used</p>
            </div>
            <div className="p-3 rounded-xl bg-violet-50 border border-violet-200">
              <p className="text-2xl font-bold text-zinc-900">
                {currentPlanData?.limits.datasets === -1 ? "∞" : currentPlanData?.limits.datasets ?? 5}
              </p>
              <p className="text-xs text-zinc-500">Max Datasets</p>
            </div>
            <div className="p-3 rounded-xl bg-violet-50 border border-violet-200"> 
              <p className="text-2xl font-bold text-zinc-900">
                {currentPlanData?.limits.predictions_per_month === -1 ? "∞" : currentPlanData?.limits.predictions_per_month ?? 100}
              </p>
              <p className="text-xs text-zinc-500">Predictions/Month</p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
      </div>
      <div className="relative overflow-hidden mb-8 rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-[1px]">
      <div className={`bg-white rounded-3xl p-6`}>
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-zinc-100 rounded-full p-1.5 relative">
          <div
            className={`absolute top-1.5 h-[calc(100%-10px)] rounded-full bg-gradient-to-r from-violet-600 to-purple-600 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              isYearly ? "left-[calc(50%+2px)]" : "left-1.5"
            }`}
            style={{ width: "calc(50% - 4px)" }}
          />
          <button
            onClick={() => setIsYearly(false)}
            className={`relative z-10 px-10 py-2.5 rounded-full text-sm font-medium transition-colors duration-300 ${
              !isYearly ? "text-white" : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={`relative z-10 px-8 py-2.5 rounded-full text-sm font-medium transition-colors duration-300 ${
              isYearly ? "text-white" : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Yearly
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card className="overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-100 text-violet-700 text-sm font-semibold rounded-full">
                <Zap className="w-3.5 h-3.5" />
                Pro
              </span>
              {isYearly && (
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {planData.pro.save}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-zinc-600">Ideal for professionals seeking advanced analytics and insights for growing needs.</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-zinc-900">
                <AnimatedPrice value={planData.pro.price} isYearly={isYearly} />
              </span>
              <span className="text-zinc-500 text-sm">/month</span>
            </div>
            <div className="space-y-3 pt-2">
              {["5 datasets", "Advanced analytics", "Unlimited charts (3 types)", "Basic insights", "Email support", "API access"].map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-zinc-600">
                  <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-violet-700" />
                  </div>
                  {f}
                </div>
              ))}
            </div>
            <Button
              className="w-full mt-4"
              variant={currentPlan === "pro" ? "outline" : "primary"}
              disabled={currentPlan === "pro" || subscribingPlan !== null}
              isLoading={subscribingPlan === "pro"}
              onClick={() => handleSubscribe("pro")}
            >
              {currentPlan === "pro" ? "Current Plan" : "Subscribe"}
            </Button>
          </CardContent>
        </Card>

        <Card className="overflow-hidden relative">
          <div className="absolute top-0 right-0">
            <div className="bg-violet-500 text-white text-xs font-bold px-4 py-1 rounded-bl-xl">POPULAR</div>
          </div>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between pr-16">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-500 text-white text-sm font-semibold rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
                Pro Plus
              </span>
              {isYearly && (
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {planData.proPlus.save}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-zinc-600">Ideal if you want to build or scale fast, with the strategy calls included.</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-zinc-900">
                <AnimatedPrice value={planData.proPlus.price} isYearly={isYearly} />
              </span>
              <span className="text-zinc-500 text-sm">/month</span>
            </div>
            <div className="space-y-3 pt-2">
              {["20 datasets", "Advanced analytics", "Unlimited charts (all types)", "Advanced insights & predictions", "ML models (customizable)", "Priority support", "Strategy calls"].map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-zinc-600">
                  <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  {f}
                </div>
              ))}
            </div>
            <Button
              className="w-full mt-4"
              variant={currentPlan === "pro_plus" ? "outline" : "primary"}
              disabled={currentPlan === "pro_plus" || subscribingPlan !== null}
              isLoading={subscribingPlan === "pro_plus"}
              onClick={() => handleSubscribe("pro_plus")}
            >
              {currentPlan === "pro_plus" ? "Current Plan" : "Subscribe"}
            </Button>
          </CardContent>
        </Card>
      </div>
      </div>
      </div>

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
