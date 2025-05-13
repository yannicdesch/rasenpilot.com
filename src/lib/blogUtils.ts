
// Format date to a readable string
export const formatDate = (dateString: string | null, locale: string = 'de-DE'): string => {
  if (!dateString) return 'Nicht verfügbar';
  
  try {
    return new Date(dateString).toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (e) {
    console.error('Error formatting date:', e);
    return 'Ungültiges Datum';
  }
};

// Format date with time
export const formatDateTime = (dateString: string | null, locale: string = 'de-DE'): string => {
  if (!dateString) return 'Nicht verfügbar';
  
  try {
    return new Date(dateString).toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    console.error('Error formatting date and time:', e);
    return 'Ungültiges Datum';
  }
};

// Generate a slug from a title
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[äöüß]/g, match => {
      if (match === 'ä') return 'ae';
      if (match === 'ö') return 'oe';
      if (match === 'ü') return 'ue';
      if (match === 'ß') return 'ss';
      return match;
    })
    .replace(/[^\w\s]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/-+/g, '-'); // Replace multiple - with single -
};

// Truncate text to a specific length and add ellipsis
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  
  // Try to cut at the last space to avoid cutting words
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.8) { // Only use lastSpace if it's not too far back
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
};

// Estimate reading time in minutes
export const estimateReadingTime = (content: string): number => {
  // Average reading speed: ~200 words per minute
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  
  // Return at least 1 minute
  return Math.max(1, readingTime);
};
