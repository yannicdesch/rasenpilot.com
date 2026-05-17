import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  validateImageFile,
  sanitizeFileName,
  generateSecureFileName,
} from '../fileValidation';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const createFileMock = (name: string, size: number, type: string): File => {
  const file = new File([''], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('validateImageFile', () => {
  it('accepts a valid JPEG file', () => {
    const file = createFileMock('photo.jpg', 1024, 'image/jpeg');
    const result = validateImageFile(file);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('accepts a valid PNG file', () => {
    const file = createFileMock('photo.png', 1024, 'image/png');
    expect(validateImageFile(file).isValid).toBe(true);
  });

  it('accepts a valid WebP file', () => {
    const file = createFileMock('photo.webp', 1024, 'image/webp');
    expect(validateImageFile(file).isValid).toBe(true);
  });

  it('rejects a GIF file', () => {
    const file = createFileMock('anim.gif', 1024, 'image/gif');
    const result = validateImageFile(file);
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('Ungültiger Dateityp');
  });

  it('rejects an SVG file', () => {
    const file = createFileMock('icon.svg', 1024, 'image/svg+xml');
    const result = validateImageFile(file);
    expect(result.isValid).toBe(false);
  });

  it('rejects a file disguised as JPEG with wrong extension', () => {
    const file = createFileMock('script.php', 1024, 'application/x-php');
    const result = validateImageFile(file);
    expect(result.isValid).toBe(false);
  });

  it('rejects a file exceeding the 10 MB size limit', () => {
    const file = createFileMock('huge.jpg', MAX_FILE_SIZE + 1, 'image/jpeg');
    const result = validateImageFile(file);
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('10MB');
  });

  it('accepts a file exactly at the 10 MB size limit', () => {
    const file = createFileMock('exact.jpg', MAX_FILE_SIZE, 'image/jpeg');
    expect(validateImageFile(file).isValid).toBe(true);
  });

  it('rejects a file name with path traversal ".."', () => {
    const file = createFileMock('../secret.jpg', 1024, 'image/jpeg');
    const result = validateImageFile(file);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Ungültiger Dateiname');
  });

  it('rejects a file name containing a forward slash', () => {
    const file = createFileMock('path/to/file.jpg', 1024, 'image/jpeg');
    const result = validateImageFile(file);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Ungültiger Dateiname');
  });

  it('rejects a file name containing a backslash', () => {
    const file = createFileMock('path\\file.jpg', 1024, 'image/jpeg');
    const result = validateImageFile(file);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Ungültiger Dateiname');
  });

  it('accumulates multiple errors', () => {
    const file = createFileMock('../evil.gif', MAX_FILE_SIZE + 1, 'image/gif');
    const result = validateImageFile(file);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });
});

describe('sanitizeFileName', () => {
  it('lowercases the file name', () => {
    expect(sanitizeFileName('MyPhoto.JPG')).toBe('myphoto.jpg');
  });

  it('replaces spaces with underscores', () => {
    expect(sanitizeFileName('my photo.jpg')).toBe('my_photo.jpg');
  });

  it('replaces special characters with underscores', () => {
    expect(sanitizeFileName('file@name#1.jpg')).toBe('file_name_1.jpg');
  });

  it('collapses consecutive underscores', () => {
    expect(sanitizeFileName('hello   world.jpg')).toBe('hello_world.jpg');
  });

  it('preserves dots and hyphens', () => {
    expect(sanitizeFileName('my-file.name.jpg')).toBe('my-file.name.jpg');
  });

  it('handles an already clean file name', () => {
    expect(sanitizeFileName('clean-file.jpg')).toBe('clean-file.jpg');
  });
});

describe('generateSecureFileName', () => {
  beforeEach(() => {
    vi.spyOn(Date, 'now').mockReturnValue(1700000000000);
    vi.spyOn(Math, 'random').mockReturnValue(0.123456789);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('generates a file name with the original extension', () => {
    const result = generateSecureFileName('photo.jpg');
    expect(result).toMatch(/\.jpg$/);
  });

  it('includes a timestamp and random segment', () => {
    const result = generateSecureFileName('photo.jpg');
    expect(result).toMatch(/^\d+_[a-z0-9]+\.jpg$/);
  });

  it('produces deterministic output with mocked Date.now and Math.random', () => {
    const a = generateSecureFileName('photo.jpg');
    const b = generateSecureFileName('photo.jpg');
    expect(a).toBe(b);
  });

  it('preserves the extension from multi-dot file names', () => {
    const result = generateSecureFileName('my.lawn.photo.png');
    expect(result).toMatch(/\.png$/);
  });

  it('handles a file name with no extension gracefully', () => {
    // split('.').pop() returns the whole name when there is no dot
    const result = generateSecureFileName('noextension');
    expect(result).toMatch(/^\d+_[a-z0-9]+\.\w+$/);
  });
});
