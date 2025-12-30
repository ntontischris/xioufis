import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Greek accent mapping for normalization
 */
const GREEK_ACCENT_MAP: Record<string, string> = {
  'ά': 'α', 'έ': 'ε', 'ή': 'η', 'ί': 'ι', 'ό': 'ο', 'ύ': 'υ', 'ώ': 'ω',
  'Ά': 'Α', 'Έ': 'Ε', 'Ή': 'Η', 'Ί': 'Ι', 'Ό': 'Ο', 'Ύ': 'Υ', 'Ώ': 'Ω',
  'ϊ': 'ι', 'ϋ': 'υ', 'ΐ': 'ι', 'ΰ': 'υ',
  'Ϊ': 'Ι', 'Ϋ': 'Υ',
}

/**
 * Remove Greek accents from text
 * "Κώστας" -> "Κωστας"
 */
export function removeGreekAccents(text: string): string {
  if (!text) return text
  return text.split('').map(char => GREEK_ACCENT_MAP[char] || char).join('')
}

/**
 * Normalize text for search (lowercase + remove accents)
 * "Κώστας" -> "κωστας"
 */
export function normalizeForSearch(text: string): string {
  if (!text) return text
  return removeGreekAccents(text.toLowerCase())
}

/**
 * Check if text matches search query (accent & case insensitive)
 */
export function matchesSearch(text: string | null | undefined, query: string): boolean {
  if (!text || !query) return false
  return normalizeForSearch(text).includes(normalizeForSearch(query))
}
