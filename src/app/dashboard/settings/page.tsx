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
import { Sparkles, Trash2 } from "lucide-react";

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
      <div className="relative overflow-hidden mb-8 rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-[1px]">
      <div className={`bg-white rounded-3xl p-6`}>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">Settings</h1>
        <p className="text-[13px] text-zinc-500 mt-0.5">
          Manage your account and preferences.
        </p>
      </div>

      <div className="max-w-xl space-y-6">
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
              className="bg-white text-Black border-violet-200 focus:border-violet-800 hover:border-violet-500 focus:ring-violet-100/50"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              id="email"
              className="bg-white text-Black border-violet-200 focus:border-violet-800 hover:border-violet-500 focus:ring-violet-100/50"
              label="Email"
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
