"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog, AlertDialog } from "@/components/ui/dialog";
import { useConfirm, useAlert } from "@/hooks/use-dialog";
import { useAuthStore } from "@/store/auth";
import { getPlanInfo } from "@/lib/api";
import { getFirebaseAuth } from "@/lib/firebase";
import { updateProfile } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [name, setName] = useState(user?.name || "");
  const [email] = useState(user?.email || "");
  const [planName, setPlanName] = useState("Free");
  const [isSaving, setIsSaving] = useState(false);

  const confirmDialog = useConfirm();
  const alertDialog = useAlert();

  const [notifications, setNotifications] = useState({
    email: true,
    digest: true,
    predictions: true,
  });

  useEffect(() => {
    getPlanInfo()
      .then((info) => setPlanName(info.plan))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user]);

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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">Settings</h1>
        <p className="text-[13px] text-zinc-500 mt-0.5">
          Manage your account and preferences.
        </p>
      </div>

      <div className="max-w-xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              id="name"
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              id="email"
              label="Email"
              value={email}
              disabled
            />
            <div className="flex items-center justify-between">
              <Badge variant="info" className="capitalize">
                {planName}
              </Badge>
              <Button onClick={handleSaveProfile} isLoading={isSaving} size="sm">
                Save
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                key: "email" as const,
                label: "Email updates",
                desc: "Dataset and analytics notifications",
              },
              {
                key: "digest" as const,
                label: "Weekly digest",
                desc: "Weekly summary of insights",
              },
              {
                key: "predictions" as const,
                label: "Prediction alerts",
                desc: "ML model completion alerts",
              },
            ].map((n) => (
              <label
                key={n.key}
                className="flex items-center justify-between py-2 cursor-pointer group"
              >
                <div>
                  <p className="text-[13px] font-medium text-zinc-900 group-hover:text-violet-600 transition-colors">
                    {n.label}
                  </p>
                  <p className="text-[11px] text-zinc-400">{n.desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications[n.key]}
                  onChange={(e) =>
                    setNotifications((prev) => ({
                      ...prev,
                      [n.key]: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-violet-600 rounded border-zinc-200 focus:ring-violet-500/20 cursor-pointer"
                />
              </label>
            ))}
          </CardContent>
        </Card>

        <Card className="border-red-100">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-medium text-zinc-900">Delete account</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Permanently delete your account and all data
                </p>
              </div>
              <Button variant="danger" size="sm" onClick={handleDeleteAccount}>
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={confirmDialog.handleCancel}
        onConfirm={confirmDialog.handleConfirm}
        title={confirmDialog.options.title}
        message={confirmDialog.options.message}
        confirmText={confirmDialog.options.confirmText}
        variant={confirmDialog.options.variant}
      />

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
