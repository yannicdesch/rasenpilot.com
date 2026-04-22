import React from 'react';
import { amazonProducts, getAmazonUrl } from '@/lib/amazonProducts';

/**
 * Replaces any Amazon-product name (or close variant) found inside a piece of
 * text with an affiliate link, so every product mentioned in step text becomes
 * clickable. Falls back to plain text when no match is found.
 */
export const linkifyProducts = (text: string | undefined | null): React.ReactNode => {
  if (!text) return null;

  // Build a list of {pattern, asin} entries. Use the full product name and a
  // shortened "core" variant (first 3 words) for fuzzy matching.
  const entries = Object.values(amazonProducts).flatMap((p) => {
    const name = p.name;
    const core = name.split(' ').slice(0, 3).join(' ');
    return [
      { phrase: name, asin: p.asin },
      ...(core !== name ? [{ phrase: core, asin: p.asin }] : []),
    ];
  });

  // Sort by length desc so longer phrases match first
  entries.sort((a, b) => b.phrase.length - a.phrase.length);

  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(${entries.map((e) => escape(e.phrase)).join('|')})`, 'gi');

  const parts = text.split(pattern);
  if (parts.length === 1) return text;

  return parts.map((part, i) => {
    if (!part) return null;
    const match = entries.find((e) => e.phrase.toLowerCase() === part.toLowerCase());
    if (!match) return <React.Fragment key={i}>{part}</React.Fragment>;
    return (
      <a
        key={i}
        href={getAmazonUrl(match.asin)}
        target="_blank"
        rel="noopener noreferrer nofollow sponsored"
        className="text-green-700 underline decoration-green-400 underline-offset-2 hover:text-green-800"
      >
        {part}
      </a>
    );
  });
};
