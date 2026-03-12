import BigNumberJs from 'bignumber.js';
import { formatUnits } from 'viem';

export function normalizeSymbol(symbol?: string | string[]) {
  if (Array.isArray(symbol)) return symbol[0] ?? '';
  return symbol ?? '';
}

export function formatAmount(raw: string | undefined, decimals: number) {
  if (!raw) return '0';
  try {
    const normalized = formatUnits(BigInt(raw), decimals);
    const amount = new BigNumberJs(normalized);
    if (!amount.isFinite()) return '0';
    if (amount.gt(0) && amount.lt(0.0001)) return '<0.0001';
    return amount.toFormat(4);
  } catch {
    return '0';
  }
}

export function formatOraclePrice(priceInEth?: string) {
  if (!priceInEth) return '0.00';
  try {
    const value = priceInEth.includes('.')
      ? new BigNumberJs(priceInEth)
      : new BigNumberJs(formatUnits(BigInt(priceInEth), 8));
    if (!value.isFinite()) return '0.00';
    if (value.gt(0) && value.lt(0.01)) return '0.00';
    return value.toFormat(2);
  } catch {
    return '0.00';
  }
}

export function formatPercentFromDecimal(value?: string) {
  if (!value) return '0.00%';
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return '0.00%';
  const percentage = parsed <= 1 ? parsed * 100 : parsed;
  return `${percentage.toFixed(2)}%`;
}

export function formatPercentFromBps(value?: string) {
  if (!value) return '0.00%';
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return '0.00%';
  return `${(parsed / 100).toFixed(2)}%`;
}

export function formatCompactNumber(raw: string | undefined, decimals: number) {
  const amount = Number(formatAmount(raw, decimals).replace(/,/g, ''));
  if (!Number.isFinite(amount)) return '0';
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(2)}B`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(2)}K`;
  return amount.toFixed(2);
}

export function formatCompactTokenAmount(amount: BigNumberJs) {
  if (!amount.isFinite()) return '0';
  if (amount.gte(1_000_000_000)) return `${amount.div(1_000_000_000).toFormat(2)}B`;
  if (amount.gte(1_000_000)) return `${amount.div(1_000_000).toFormat(2)}M`;
  if (amount.gte(1_000)) return `${amount.div(1_000).toFormat(2)}K`;
  return amount.toFormat(2);
}

export function formatCompactUsdValue(raw: string | undefined, decimals: number, priceInEth?: string) {
  if (!raw || !priceInEth) return '0.00';
  try {
    const tokenAmount = new BigNumberJs(formatUnits(BigInt(raw), decimals));
    const price = priceInEth.includes('.')
      ? new BigNumberJs(priceInEth)
      : new BigNumberJs(formatUnits(BigInt(priceInEth), 8));
    if (!tokenAmount.isFinite() || !price.isFinite()) return '0.00';
    const value = tokenAmount.times(price);
    if (!value.isFinite() || value.isNaN()) return '0.00';
    if (value.gt(0) && value.lt(0.01)) return '0.00';
    return value.toFormat(2);
  } catch {
    return '0.00';
  }
}

export function formatCompactUsdValueFromTokens(tokenAmount: BigNumberJs, priceInEth?: string) {
  if (!priceInEth) return '0.00';
  try {
    const price = priceInEth.includes('.')
      ? new BigNumberJs(priceInEth)
      : new BigNumberJs(formatUnits(BigInt(priceInEth), 8));
    if (!tokenAmount.isFinite() || !price.isFinite()) return '0.00';
    const value = tokenAmount.times(price);
    if (!value.isFinite() || value.isNaN()) return '0.00';
    if (value.gt(0) && value.lt(0.01)) return '0.00';
    return value.toFormat(2);
  } catch {
    return '0.00';
  }
}

export function formatBalanceValue(value: string | BigNumberJs) {
  const amount = typeof value === 'string' ? new BigNumberJs(value) : value;
  if (!amount.isFinite()) return '0.00';
  const fixed = amount.toFixed(6, BigNumberJs.ROUND_DOWN);
  const trimmed = fixed.replace(/\.?0+$/, '');
  if (!trimmed.includes('.')) return `${trimmed}.00`;
  return trimmed;
}

export function buildLinePoints({
  count,
  width,
  height,
  seed,
  base,
  swing,
}: {
  count: number;
  width: number;
  height: number;
  seed: number;
  base: number;
  swing: number;
}) {
  const points: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const x = (i / (count - 1)) * width;
    const noise = Math.sin((i + seed) * 1.37) * 0.45 + Math.cos((i + seed) * 0.72) * 0.2;
    const value = Math.max(0, Math.min(1, base + noise * swing));
    const y = (1 - value) * height;
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return points.join(' ');
}

export function buildLinePointsFromValues(values: number[], width: number, height: number) {
  if (values.length === 0) return '';
  if (values.length === 1) {
    const y = height / 2;
    return `0,${y.toFixed(2)} ${width.toFixed(2)},${y.toFixed(2)}`;
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points: string[] = [];
  values.forEach((value, index) => {
    const x = (index / (values.length - 1)) * width;
    const normalized = (value - min) / range;
    const y = height - normalized * height;
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  });
  return points.join(' ');
}

export const EXPLORER_BASE_BY_CHAIN: Record<number, string> = {
  56: 'https://bscscan.com',
  97: 'https://testnet.bscscan.com',
  688689: 'https://atlantic.pharosscan.xyz',
};

export function formatShortDate(timestamp?: number) {
  if (!timestamp) return '-';
  const date = new Date(timestamp * 1000);
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${month}/${day}`;
}
