// This file re-exports the toast functionality from our components/ui
import { toast as sonnerToast } from "sonner";
import { useToast as useToastFromUI } from "@/components/ui/use-toast";

// Re-export the toast functions
export const useToast = useToastFromUI;

// Export a modified version of the sonner toast that accepts both the original API
// and our custom format for better TypeScript compatibility
export const toast = (props: any) => {
  // If it's a string or has no description property, use as is
  if (typeof props === 'string' || !('description' in props)) {
    return sonnerToast(props);
  }
  
  // Otherwise, adapt to sonner's expected format
  const { title, description, ...rest } = props;
  return sonnerToast(description, {
    ...rest,
    ...(title ? { title } : {})
  });
};
