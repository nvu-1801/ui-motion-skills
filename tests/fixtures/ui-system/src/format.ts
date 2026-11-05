import type { Product } from './models.js';
export function priceLabel(product: Product): string {
  return `${product.title}: ${(product.unitCents / 100).toFixed(2)} USD`;
}
