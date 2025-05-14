
import { useToast as useToastOriginal } from "@/components/ui/toast"

// Re-export the hooks from the UI component
export const useToast = useToastOriginal

// Create a toast function for compatibility
export const toast = {
  // Create method proxies to the useToast().toast methods
  error: (message: string, options?: any) => {
    // This will be called at runtime when toast is used
    const { toast } = useToastOriginal()
    toast({ variant: "destructive", title: message, ...options })
  },
  success: (message: string, options?: any) => {
    const { toast } = useToastOriginal()
    toast({ title: message, ...options })
  },
  info: (message: string, options?: any) => {
    const { toast } = useToastOriginal()
    toast({ title: message, ...options })
  },
  warning: (message: string, options?: any) => {
    const { toast } = useToastOriginal()
    toast({ variant: "destructive", title: message, ...options })
  }
}
