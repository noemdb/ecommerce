"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { ConfirmationDialog, type ConfirmationOptions } from "@/components/ui/confirmation-dialog";

interface ConfirmContextType {
  confirm: (options: ConfirmationOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmationOptions | null>(null);
  const [resolve, setResolve] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmationOptions) => {
    setOptions(opts);
    return new Promise<boolean>((res) => {
      setResolve(() => res);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (resolve) {
      resolve(true);
      setOptions(null);
      setResolve(null);
    }
  }, [resolve]);

  const handleCancel = useCallback(() => {
    if (resolve) {
      resolve(false);
      setOptions(null);
      setResolve(null);
    }
  }, [resolve]);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {options && (
        <ConfirmationDialog
          isOpen={!!options}
          title={options.title}
          description={options.description}
          confirmText={options.confirmText}
          cancelText={options.cancelText}
          variant={options.variant}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context.confirm;
}
