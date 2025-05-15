
// This file re-exports the toast functionality from our components/ui
import { toast as sonnerToast } from "sonner";
import { useToast as useToastFromUI } from "@/components/ui/use-toast";

// Re-export the toast functions
export const useToast = useToastFromUI;
export const toast = sonnerToast;
