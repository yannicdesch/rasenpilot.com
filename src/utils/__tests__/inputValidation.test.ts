import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  sanitizeHtml,
  validateEmail,
  validateText,
  validateBlogContent,
  validateSlug,
  createRateLimiter,
} from '../inputValidation';

describe('sanitizeHtml', () => {
  it('removes script tags', () => {
    expect(sanitizeHtml('<script>alert("xss")</script>hello')).toBe('hello');
  });

  it('removes javascript: protocol', () => {
    const result = sanitizeHtml('href="javascript:alert(1)"');
    expect(result).not.toContain('javascript:');
  });

  it('removes inline event handlers', () => {
    const result = sanitizeHtml('<div onclick="evil()">test</div>');
    expect(result).not.toContain('onclick');
  });

  it('removes iframe tags', () => {
    expect(sanitizeHtml('<iframe src="evil.com"></iframe>')).toBe('');
  });

  it('removes object tags', () => {
    expect(sanitizeHtml('<object data="evil.swf"></object>')).toBe('');
  });

  it('removes embed tags that have a closing tag', () => {
    const result = sanitizeHtml('<embed src="evil.swf"></embed>normal');
    expect(result).toBe('normal');
  });

  it('returns empty string for empty input', () => {
    expect(sanitizeHtml('')).toBe('');
  });

  it('passes through safe html content', () => {
    expect(sanitizeHtml('Hello <b>world</b>')).toBe('Hello <b>world</b>');
  });

  it('removes nested script tags', () => {
    const result = sanitizeHtml('<div><script>alert(1)</script></div>');
    expect(result).not.toContain('<script');
    expect(result).not.toContain('alert');
  });
});

describe('validateEmail', () => {
  it('accepts a valid email', () => {
    const result = validateEmail('user@example.com');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.sanitizedValue).toBe('user@example.com');
  });

  it('trims whitespace and lowercases the email', () => {
    const result = validateEmail('  USER@EXAMPLE.COM  ');
    expect(result.isValid).toBe(true);
    expect(result.sanitizedValue).toBe('user@example.com');
  });

  it('rejects an empty email', () => {
    const result = validateEmail('');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('E-Mail-Adresse ist erforderlich');
  });

  it('rejects an email without @', () => {
    const result = validateEmail('notanemail');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Ungültige E-Mail-Adresse');
  });

  it('rejects an email without a domain', () => {
    const result = validateEmail('user@');
    expect(result.isValid).toBe(false);
  });

  it('rejects an email without a TLD', () => {
    const result = validateEmail('user@example');
    expect(result.isValid).toBe(false);
  });

  it('rejects an email with spaces in the middle', () => {
    const result = validateEmail('user @example.com');
    expect(result.isValid).toBe(false);
  });
});

describe('validateText', () => {
  it('accepts valid text within default bounds', () => {
    const result = validateText('Hello World');
    expect(result.isValid).toBe(true);
  });

  it('rejects empty text when minLength > 0', () => {
    const result = validateText('');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Dieses Feld ist erforderlich');
  });

  it('rejects text shorter than minLength', () => {
    const result = validateText('ab', 5);
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('5 Zeichen');
  });

  it('rejects text longer than maxLength', () => {
    const result = validateText('a'.repeat(10), 1, 5);
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('5 Zeichen');
  });

  it('trims whitespace from the text', () => {
    const result = validateText('  hello  ');
    expect(result.sanitizedValue).toBe('hello');
  });

  it('strips XSS payloads from text', () => {
    const result = validateText('<script>alert(1)</script>safe');
    expect(result.sanitizedValue).toBe('safe');
    expect(result.sanitizedValue).not.toContain('<script>');
  });

  it('accepts text exactly at minLength', () => {
    const result = validateText('abc', 3);
    expect(result.isValid).toBe(true);
  });

  it('accepts text exactly at maxLength', () => {
    const result = validateText('a'.repeat(5), 1, 5);
    expect(result.isValid).toBe(true);
  });
});

describe('validateBlogContent', () => {
  it('accepts content with exactly 50 characters', () => {
    const result = validateBlogContent('a'.repeat(50));
    expect(result.isValid).toBe(true);
  });

  it('accepts content well above the minimum', () => {
    const result = validateBlogContent('a'.repeat(200));
    expect(result.isValid).toBe(true);
  });

  it('rejects empty content', () => {
    const result = validateBlogContent('');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Inhalt ist erforderlich');
  });

  it('rejects content shorter than 50 characters', () => {
    const result = validateBlogContent('too short');
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('50 Zeichen');
  });

  it('rejects content longer than 50000 characters', () => {
    const result = validateBlogContent('a'.repeat(50001));
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('50.000');
  });

  it('sanitizes XSS from content before validating length', () => {
    const result = validateBlogContent('<script>x</script>');
    expect(result.isValid).toBe(false);
    expect(result.sanitizedValue).not.toContain('<script>');
  });
});

describe('validateSlug', () => {
  it('accepts a valid slug', () => {
    const result = validateSlug('my-valid-slug');
    expect(result.isValid).toBe(true);
    expect(result.sanitizedValue).toBe('my-valid-slug');
  });

  it('converts uppercase to lowercase', () => {
    const result = validateSlug('My-SLUG');
    expect(result.sanitizedValue).toBe('my-slug');
  });

  it('replaces spaces and special characters with dashes', () => {
    const result = validateSlug('hello world!');
    expect(result.isValid).toBe(true);
    expect(result.sanitizedValue).toBe('hello-world');
  });

  it('collapses multiple consecutive dashes', () => {
    const result = validateSlug('hello---world');
    expect(result.sanitizedValue).toBe('hello-world');
  });

  it('strips leading and trailing dashes', () => {
    const result = validateSlug('-hello-world-');
    expect(result.sanitizedValue).toBe('hello-world');
  });

  it('rejects an empty slug', () => {
    const result = validateSlug('');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('URL-Slug ist erforderlich');
  });

  it('rejects a slug shorter than 3 characters after sanitization', () => {
    const result = validateSlug('ab');
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('3 Zeichen');
  });

  it('rejects a slug longer than 100 characters', () => {
    const result = validateSlug('a'.repeat(101));
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('100 Zeichen');
  });

  it('accepts a slug exactly 3 characters long', () => {
    const result = validateSlug('abc');
    expect(result.isValid).toBe(true);
  });

  it('accepts a slug exactly 100 characters long', () => {
    const result = validateSlug('a'.repeat(100));
    expect(result.isValid).toBe(true);
  });
});

describe('createRateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows requests under the limit', () => {
    const limiter = createRateLimiter(3, 60000);
    expect(limiter('user1')).toBe(true);
    expect(limiter('user1')).toBe(true);
    expect(limiter('user1')).toBe(true);
  });

  it('blocks requests that exceed the limit', () => {
    const limiter = createRateLimiter(2, 60000);
    expect(limiter('user1')).toBe(true);
    expect(limiter('user1')).toBe(true);
    expect(limiter('user1')).toBe(false);
  });

  it('tracks different identifiers independently', () => {
    const limiter = createRateLimiter(1, 60000);
    expect(limiter('user1')).toBe(true);
    expect(limiter('user2')).toBe(true);
    expect(limiter('user1')).toBe(false);
    expect(limiter('user2')).toBe(false);
  });

  it('allows requests again after the time window expires', () => {
    const limiter = createRateLimiter(1, 60000);
    expect(limiter('user1')).toBe(true);
    expect(limiter('user1')).toBe(false);

    vi.advanceTimersByTime(61000);
    expect(limiter('user1')).toBe(true);
  });

  it('only counts attempts within the current window', () => {
    const limiter = createRateLimiter(2, 60000);
    expect(limiter('user1')).toBe(true);
    vi.advanceTimersByTime(61000); // first attempt expires
    expect(limiter('user1')).toBe(true); // second attempt, window reset
    expect(limiter('user1')).toBe(true); // still within limit of 2
    expect(limiter('user1')).toBe(false); // now blocked
  });
});
