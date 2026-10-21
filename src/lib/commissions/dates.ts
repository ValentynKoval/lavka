/** Earliest deadline a buyer may ask for: three days from now (YYYY-MM-DD). */
export function minCommissionDeadline(now: number = Date.now()): string {
  return new Date(now + 3 * 86_400_000).toISOString().slice(0, 10);
}
