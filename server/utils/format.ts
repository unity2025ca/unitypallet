/**
 * Format a number as currency with 2 decimal places
 */
export function formatCurrency(amount: number): string {
  return amount.toFixed(2);
}

/**
 * Format a date in a readable format
 */
export function formatDate(date: Date | string | number): string {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}