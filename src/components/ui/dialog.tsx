"use client";

import { Modal } from "./modal";
import { Button } from "./button";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "default";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm", 
  cancelText = "Cancel",
  variant = "default",
  isLoading = false,
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="max-w-md">
      <div className="space-y-4">
        <p className="text-sm text-zinc-600">{message}</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={handleConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  variant?: "info" | "error" | "success";
}

export function AlertDialog({
  isOpen,
  onClose,
  title,
  message,
  variant = "info",
}: AlertDialogProps) {
  const config = {
    info: { icon: Info, bg: "bg-blue-50", text: "text-blue-600" },
    error: { icon: XCircle, bg: "bg-red-50", text: "text-red-600" },
    success: { icon: CheckCircle2, bg: "bg-emerald-50", text: "text-emerald-600" },
  };

  const currentConfig = config[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="max-w-md">
      <div className="space-y-4">
        <div className={cn("flex items-start gap-3 p-3 rounded-lg", currentConfig.bg)}>
          <currentConfig.icon className={cn("w-5 h-5 flex-shrink-0 mt-0.5", currentConfig.text)} />
          <p className="text-sm text-zinc-700">{message}</p>
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose}>OK</Button>
        </div>
      </div>
    </Modal>
  );
}
