export function totalCents(unitCents: number, quantity: number): number {
  if (quantity < 0) throw new Error('quantity must be nonnegative');
  return unitCents * quantity;
}
