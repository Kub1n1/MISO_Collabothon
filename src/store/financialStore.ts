import { SavingsStrategy } from "../types";
import { LOAN_TERM_MONTHS } from "./const";

export function rebalanceStrategy(
  strategy: SavingsStrategy,
  bucket: keyof SavingsStrategy,
  requestedPercent: number
): SavingsStrategy {
  const requestedValue = Number.isFinite(requestedPercent)
    ? requestedPercent
    : strategy[bucket];
  const percent = Math.round(Math.max(0, Math.min(100, requestedValue)));
  const remainingPercent = 100 - percent;
  const otherBuckets = (
    Object.keys(strategy) as (keyof SavingsStrategy)[]
  ).filter((key) => key !== bucket);
  const otherTotal = otherBuckets.reduce(
    (total, key) => total + Math.max(0, strategy[key]),
    0
  );
  const nextStrategy: SavingsStrategy = { ...strategy, [bucket]: percent };

  if (otherTotal === 0) {
    const evenShare = Math.floor(remainingPercent / otherBuckets.length);
    otherBuckets.forEach((key, index) => {
      nextStrategy[key] =
        evenShare + (index < remainingPercent % otherBuckets.length ? 1 : 0);
    });
    return nextStrategy;
  }

  const allocations = otherBuckets.map((key, index) => {
    const exactShare = (remainingPercent * Math.max(0, strategy[key])) / otherTotal;
    return { key, index, value: Math.floor(exactShare), remainder: exactShare % 1 };
  });
  let unallocated = remainingPercent - allocations.reduce(
    (total, allocation) => total + allocation.value,
    0
  );

  allocations
    .slice()
    .sort((left, right) => right.remainder - left.remainder || left.index - right.index)
    .forEach((allocation) => {
      if (unallocated > 0) {
        allocation.value += 1;
        unallocated -= 1;
      }
    });

  allocations.forEach(({ key, value }) => {
    nextStrategy[key] = value;
  });
  return nextStrategy;
}

export function getMaximumAffordableLoan(
  householdIncome: number,
  monthlyFixedExpenses: number,
  monthlyLoanRepayment: number
) {
  const monthlyCapacity = Math.max(
    0,
    householdIncome - monthlyFixedExpenses - monthlyLoanRepayment
  );
  return Math.floor(monthlyCapacity * LOAN_TERM_MONTHS);
}

export function randomMonthlyFixedExpenses(householdIncome: number) {
  const percentage = 20 + Math.floor(Math.random() * 26);
  return Math.round(householdIncome * (percentage / 100));
}