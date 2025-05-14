
// This file should just re-export from the hooks
import { useToast } from "@/hooks/use-toast";
// We're now using sonner toast throughout the app
import { toast } from "@/components/ui/sonner";

// Export both with compatible interfaces
export { useToast, toast };
