// Utility functions for formatting various data types

/**
 * Format a phone number to ensure it's in international format
 * @param phone The phone number to format
 * @returns The formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const digits = phone.replace(/\D/g, '');
  
  // If the number doesn't start with +, add appropriate prefix
  if (!phone.startsWith('+')) {
    // If it starts with 1, assume US/Canada and add +1
    if (digits.startsWith('1') && digits.length >= 10) {
      return `+${digits}`;
    }
    
    // Without country code, assume it's a North American number
    if (digits.length === 10) {
      return `+1${digits}`;
    }
    
    // If other format, just add + at the beginning
    return `+${digits}`;
  }
  
  return phone;
}

/**
 * Convert a string to a URL-friendly slug
 * @param str The string to convert to a slug
 * @returns The slug
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove all non-word chars
    .replace(/[\s_-]+/g, '-')  // Replace spaces, underscores and hyphens with a single dash
    .replace(/^-+|-+$/g, '');  // Remove leading/trailing dashes
}

/**
 * Format a date to a human-readable string
 * @param date The date to format
 * @returns The formatted date string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format a price from cents to dollars with currency symbol
 * @param cents The price in cents
 * @param currencySymbol The currency symbol to use
 * @returns The formatted price string
 */
export function formatPrice(cents: number, currencySymbol: string = 'C$'): string {
  const dollars = cents / 100;
  return `${currencySymbol}${dollars.toFixed(2)}`;
}

/**
 * Format a currency value to a string with 2 decimal places
 * @param amount The amount to format (already in main currency units, not cents)
 * @returns The formatted currency value as a string with 2 decimal places
 */
export function formatCurrency(amount: number): string {
  return amount.toFixed(2);
}

/**
 * Truncate a string to a certain length and add ellipsis if needed
 * @param str The string to truncate
 * @param length The maximum length
 * @returns The truncated string
 */
export function truncate(str: string, length: number = 100): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}
