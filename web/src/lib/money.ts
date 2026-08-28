export function formatPence(pence: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(pence / 100);
}

/**
 * Turns what someone typed into whole pence.
 * Returns null when the input is not a valid amount.
 */
export function parsePoundsToPence(value: string): number | null {
  const trimmed = value.trim();

  if (trimmed === "") return 0;
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;

  // Number('6.75') * 100 is 674.99999999999989, so round.
  return Math.round(Number(trimmed) * 100);
}
