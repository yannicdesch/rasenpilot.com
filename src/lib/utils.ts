
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Add debugging utility
export function logError(error: any, message: string = "Ein Fehler ist aufgetreten") {
  console.error(`${message}:`, error);
  return {
    title: "Fehler",
    description: typeof error === 'string' ? error : (error.message || message)
  };
}
