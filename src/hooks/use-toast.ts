
// This file re-exports the toast from @/components/ui/use-toast
// This is just a workaround to fix any toast-related imports in components

import { useToast as useShadcnToast } from "@/components/ui/use-toast";
import { toast as shadcnToast } from "@/components/ui/use-toast";

export const useToast = useShadcnToast;
export const toast = shadcnToast;
