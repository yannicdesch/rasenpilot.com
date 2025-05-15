
// This file re-exports the toast functionality from our components/ui
import { useToast as useShadcnToast } from "@/components/ui/toast";
import { toast as sonnerToast } from "@/components/ui/sonner";

// Re-export the toast functions
export const useToast = useShadcnToast;
export const toast = sonnerToast;
