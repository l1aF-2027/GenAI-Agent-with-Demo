"use client";

import { toast as sonnerToast } from "sonner";

export function useToast() {
  return {
    toast: (props: {
      title?: string;
      description?: string;
      variant?: "default" | "destructive";
    }) => {
      if (props.variant === "destructive") {
        sonnerToast.error(props.title || props.description || "Error");
      } else {
        sonnerToast.success(props.title || props.description || "Success");
      }
    },
  };
}

export const toast = {
  success: (message: string) => sonnerToast.success(message),
  error: (message: string) => sonnerToast.error(message),
};
