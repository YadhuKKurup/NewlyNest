/**
 * Formats a numeric amount into Indian Rupee format (en-IN).
 * Example: 150000 => "₹1,50,000"
 */
export function formatINR(amount: number): string {
  const rounded = Math.round(amount);
  return '₹' + rounded.toLocaleString('en-IN');
}
