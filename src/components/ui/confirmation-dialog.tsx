"use client";

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { AlertCircle, HelpCircle } from "lucide-react";

export interface ConfirmationOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
}

interface ConfirmationDialogProps extends ConfirmationOptions {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationDialog({
  isOpen,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "primary",
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  return (
    <AlertDialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" 
        />
        <AlertDialogPrimitive.Content 
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-6 border border-neutral-200 bg-white p-8 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-3xl dark:border-neutral-800 dark:bg-neutral-950",
          )}
        >
          <div className="flex flex-col gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3 mb-2">
              <div className={cn(
                "p-3 rounded-2xl",
                variant === "danger" ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" : "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
              )}>
                {variant === "danger" ? <AlertCircle className="size-6" /> : <HelpCircle className="size-6" />}
              </div>
              <AlertDialogPrimitive.Title className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                {title}
              </AlertDialogPrimitive.Title>
            </div>
            <AlertDialogPrimitive.Description className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              {description}
            </AlertDialogPrimitive.Description>
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <AlertDialogPrimitive.Cancel asChild>
              <Button variant="secondary" onClick={onCancel} className="rounded-xl">
                {cancelText}
              </Button>
            </AlertDialogPrimitive.Cancel>
            <AlertDialogPrimitive.Action asChild>
              <Button 
                variant={variant === "danger" ? "danger" : "primary"} 
                onClick={onConfirm}
                className="rounded-xl"
              >
                {confirmText}
              </Button>
            </AlertDialogPrimitive.Action>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}
