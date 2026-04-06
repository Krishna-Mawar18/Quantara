import { useState, useCallback } from "react";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "default";
}

interface AlertOptions {
  title: string;
  message: string;
  variant?: "info" | "error" | "success";
}

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({
    title: "",
    message: "",
  });
  const [resolveRef, setResolveRef] = useState<{
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(opts);
      setResolveRef({ resolve });
      setIsOpen(true);
    });
  }, []);

  const handleConfirm = async () => {
    setIsLoading(true);
    resolveRef?.resolve(true);
    setIsLoading(false);
    setIsOpen(false);
    setResolveRef(null);
  };

  const handleCancel = () => {
    resolveRef?.resolve(false);
    setIsOpen(false);
    setResolveRef(null);
  };

  return {
    confirm,
    isOpen,
    isLoading,
    options,
    handleConfirm,
    handleCancel,
  };
}

export function useAlert() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<AlertOptions>({
    title: "",
    message: "",
  });

  const alert = useCallback((opts: AlertOptions) => {
    setOptions(opts);
    setIsOpen(true);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  return {
    alert,
    isOpen,
    options,
    handleClose,
  };
}
