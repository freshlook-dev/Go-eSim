export const DEFAULT_MARKUP_PERCENT = 40;
export const MIN_PROFIT_EUR = 1;

export function toPriceNumber(price: string | number) {
  const parsed = typeof price === 'number' ? price : Number(price);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function calculateSellPrice(costPrice: string | number) {
  const cost = toPriceNumber(costPrice);
  const percentageProfit = cost * (DEFAULT_MARKUP_PERCENT / 100);
  const profit = Math.max(percentageProfit, MIN_PROFIT_EUR);

  return Number((cost + profit).toFixed(2));
}

export function formatEuroPrice(price: string | number) {
  return `${toPriceNumber(price).toFixed(2)} \u20ac`;
}
