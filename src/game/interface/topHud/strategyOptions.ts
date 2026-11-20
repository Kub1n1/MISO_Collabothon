import type { SavingsStrategy } from '../../../store';

export const strategyOptions: {
  key: keyof SavingsStrategy;
  label: string;
  hint: string;
  colorClass: string;
}[] = [
  {
    key: 'sock',
    label: 'Cash at home',
    hint: '0% return • Always accessible',
    colorClass: 'is-warning',
  },
  {
    key: 'account',
    label: 'Savings account',
    hint: '~4% annual return • Low risk',
    colorClass: 'is-info',
  },
  {
    key: 'stocks',
    label: 'Stocks & bonds',
    hint: '~8% annual return • Market fluctuations',
    colorClass: 'is-success',
  },
];