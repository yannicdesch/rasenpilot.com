
// Input validation and sanitization utilities

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue?: string;
}

// XSS protection - sanitize HTML content
export const sanitizeHtml = (input: string): string => {
  if (!input) return '';
  
  // Remove script tags and dangerous attributes
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');
};

// Validate email format
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  const sanitizedEmail = email.trim().toLowerCase();
  
  if (!sanitizedEmail) {
    errors.push('E-Mail-Adresse ist erforderlich');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
    errors.push('Ungültige E-Mail-Adresse');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: sanitizedEmail
  };
};

// Validate text input (names, titles, etc.)
export const validateText = (text: string, minLength = 1, maxLength = 255): ValidationResult => {
  const errors: string[] = [];
  const sanitizedText = sanitizeHtml(text.trim());
  
  if (!sanitizedText && minLength > 0) {
    errors.push('Dieses Feld ist erforderlich');
  } else if (sanitizedText.length < minLength) {
    errors.push(`Mindestens ${minLength} Zeichen erforderlich`);
  } else if (sanitizedText.length > maxLength) {
    errors.push(`Maximal ${maxLength} Zeichen erlaubt`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: sanitizedText
  };
};

// Validate blog content
export const validateBlogContent = (content: string): ValidationResult => {
  const errors: string[] = [];
  const sanitizedContent = sanitizeHtml(content);
  
  if (!sanitizedContent.trim()) {
    errors.push('Inhalt ist erforderlich');
  } else if (sanitizedContent.length < 50) {
    errors.push('Inhalt muss mindestens 50 Zeichen lang sein');
  } else if (sanitizedContent.length > 50000) {
    errors.push('Inhalt ist zu lang (max. 50.000 Zeichen)');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: sanitizedContent
  };
};

// Validate URL/slug
export const validateSlug = (slug: string): ValidationResult => {
  const errors: string[] = [];
  const sanitizedSlug = slug.trim().toLowerCase()
    .replace(/[^a-z0-9\-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  if (!sanitizedSlug) {
    errors.push('URL-Slug ist erforderlich');
  } else if (sanitizedSlug.length < 3) {
    errors.push('URL-Slug muss mindestens 3 Zeichen lang sein');
  } else if (sanitizedSlug.length > 100) {
    errors.push('URL-Slug ist zu lang (max. 100 Zeichen)');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: sanitizedSlug
  };
};

// Rate limiting helper
export const createRateLimiter = (maxAttempts: number, windowMs: number) => {
  const attempts = new Map<string, number[]>();
  
  return (identifier: string): boolean => {
    const now = Date.now();
    const userAttempts = attempts.get(identifier) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = userAttempts.filter(time => now - time < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      return false; // Rate limit exceeded
    }
    
    recentAttempts.push(now);
    attempts.set(identifier, recentAttempts);
    return true;
  };
};
