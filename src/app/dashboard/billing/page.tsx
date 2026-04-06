"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog } from "@/components/ui/dialog";
import { useAlert } from "@/hooks/use-dialog";
import { Check, Sparkles, Loader2, CreditCard } from "lucide-react";
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

function formatPrice(price: number) {
  if (price === 0) return "Free";
  return `₹${(price / 100).toLocaleString()}`;
}

export default function BillingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState("free");
  const [subscriptionStatus, setSubscriptionStatus] = useState("active");
  const [isLoading, setIsLoading] = useState(true);
  const [subscribingPlan, setSubscribingPlan] = useState<string | null>(null);
  const { datasets } = useDatasetStore();

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/20">
          <CreditCard className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Billing</h1>
          <p className="text-sm text-zinc-500">Manage your subscription</p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-[1px]">
        <div className="bg-white rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/20">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-zinc-500">Current Plan</p>
                <p className="text-xl font-bold text-zinc-900 capitalize">{currentPlan.replace("_", " ")}</p>
              </div>
            </div>
            <Badge variant={subscriptionStatus === "active" ? "success" : "warning"} className="text-sm px-3 py-1">
              {subscriptionStatus}
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 rounded-xl bg-zinc-50">
              <p className="text-2xl font-bold text-zinc-900">{datasets.length}</p>
              <p className="text-xs text-zinc-500">Datasets Used</p>
            </div>
            <div className="p-3 rounded-xl bg-zinc-50">
              <p className="text-2xl font-bold text-zinc-900">
                {currentPlanData?.limits.datasets === -1 ? "∞" : currentPlanData?.limits.datasets ?? 5}
              </p>
              <p className="text-xs text-zinc-500">Max Datasets</p>
            </div>
            <div className="p-3 rounded-xl bg-zinc-50">
              <p className="text-2xl font-bold text-zinc-900">
                {currentPlanData?.limits.predictions_per_month === -1 ? "∞" : currentPlanData?.limits.predictions_per_month ?? 100}
              </p>
              <p className="text-xs text-zinc-500">Predictions/Month</p>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative overflow-hidden rounded-3xl transition-all ${
                plan.popular 
                  ? "bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-[1px]" 
                  : "bg-zinc-100 p-[1px]"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-0 right-4">
                  <Badge className="bg-amber-500 text-white px-3 py-1 rounded-b-xl rounded-tl-xl shadow-lg">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Popular
                  </Badge>
                </div>
              )}
              <div className={`bg-white rounded-3xl p-6 h-full ${plan.popular ? "" : ""}`}>
                <div className="mb-4">
                  <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">{plan.name}</p>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-bold text-zinc-900">{formatPrice(plan.price)}</span>
                    {plan.price > 0 && <span className="text-zinc-400">/month</span>}
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        plan.popular ? "bg-violet-100" : "bg-zinc-100"
                      }`}>
                        <Check className={`w-3 h-3 ${plan.popular ? "text-violet-600" : "text-zinc-500"}`} />
                      </div>
                      <span className="text-sm text-zinc-600">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full rounded-xl ${
                    currentPlan === plan.id
                      ? "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                      : plan.popular
                      ? "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/30"
                      : "bg-zinc-900 text-white hover:bg-zinc-800"
                  }`}
                  disabled={currentPlan === plan.id || subscribingPlan !== null}
                  isLoading={subscribingPlan === plan.id}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  {currentPlan === plan.id
                    ? "Current Plan"
                    : plan.price === 0
                    ? "Downgrade"
                    : "Subscribe"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog
        isOpen={alertDialog.isOpen}
        onClose={alertDialog.handleClose}
        title={alertDialog.options.title}
        message={alertDialog.options.message}
        variant={alertDialog.options.variant}
      />
    </div>
  );
}
