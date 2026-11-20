import type { SavingsStrategy } from '../../../store';

export const strategyOptions: {
  key: keyof SavingsStrategy;
  label: string;
  hint: string;
  colorClass: string;
}[] = [
  {
    key: 'sock',
    label: 'Skarpeta',
    hint: '0% zysku • Zawsze pod ręką',
    colorClass: 'is-warning',
  },
  {
    key: 'account',
    label: 'Konto oszczędnościowe',
    hint: '~4% rocznie • Bezpieczne',
    colorClass: 'is-info',
  },
  {
    key: 'stocks',
    label: 'Akcje i obligacje',
    hint: '~8% rocznie • Wahania rynku',
    colorClass: 'is-success',
  },
];