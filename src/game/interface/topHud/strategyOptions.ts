import { SavingsStrategy } from "../../../store/types";

export const strategyOptions: {
  key: keyof SavingsStrategy;
  label: string;
  hint: string;
  description: string;
  colorClass: string;
  accentColor: string;
}[] = [
  {
    key: 'sock',
    label: 'Cash at home',
    hint: '0% return • Always accessible',
    description: 'Cash at home is immediately available, but it does not earn interest.',
    colorClass: 'is-warning',
    accentColor: '#ffdd57',
  },
  {
    key: 'account',
    label: 'Savings account',
    hint: '~4% annual return • Low risk',
    description: 'A savings account keeps money accessible while earning a modest return.',
    colorClass: 'is-info',
    accentColor: '#3e8ed0',
  },
  {
    key: 'stocks',
    label: 'Stocks & bonds',
    hint: '~8% annual return • Market fluctuations',
    description: 'Investments may grow over time, but their value can rise or fall.',
    colorClass: 'is-success',
    accentColor: '#48c78e',
  },
];