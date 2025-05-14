
// This is a helper file to maintain compatibility between different toast formats
// It adapts toast calls between sonner and shadcn/ui formats

import { toast as sonnerToast } from "@/components/ui/sonner";

/**
 * Use this for all components that need to migrate from shadcn/ui toast format to sonner toast
 * This helper function allows components to gradually migrate without breaking changes
 */
export const adaptToast = {
  // For components still using the shadcn/ui toast format with title property
  success: (content: string, options?: any) => {
    return sonnerToast(content, {
      ...options
    });
  },
  error: (content: string, options?: any) => {
    return sonnerToast(content, {
      ...options,
      variant: "destructive"
    });
  },
  warning: (content: string, options?: any) => {
    return sonnerToast(content, {
      ...options,
    });
  },
  info: (content: string, options?: any) => {
    return sonnerToast(content, {
      ...options,
    });
  },
};
