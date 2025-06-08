
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Enhanced error logging utility without sensitive data exposure
export function logError(error: any, message: string = "Ein Fehler ist aufgetreten") {
  // Only log error details in development, not in production
  if (import.meta.env.DEV) {
    console.error(`${message}:`, error);
  } else {
    // In production, only log generic error information
    console.error(message);
  }
  
  return {
    title: "Fehler",
    description: typeof error === 'string' ? error : (error.message || message)
  };
}

// Sanitize data for logging (remove sensitive information)
export function sanitizeForLogging(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth', 'credential'];
  const sanitized = { ...data };

  for (const key in sanitized) {
    if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeForLogging(sanitized[key]);
    }
  }

  return sanitized;
}
