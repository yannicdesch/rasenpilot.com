
// This file re-exports the toast functionality from our components/ui
import { useToast as useShadcnToast, toast as shadcnToast } from "@/components/ui/use-toast";

const useToast = useShadcnToast;
const toast = shadcnToast;

export { useToast, toast };
