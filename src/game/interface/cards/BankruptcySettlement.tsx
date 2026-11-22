import type { MandatoryEventSettlement } from '../../../store/types';

interface Props {
  onSubmit: (settlement: MandatoryEventSettlement) => void;
  savings: { sock: number; account: number; stocks: number };
}

export function BankruptcySettlement({ onSubmit, savings }: Props) {
  return (
    <div className="mt-4">
      <div className="notification is-danger is-light is-size-7 p-3">
        You did your best, but this required expense exceeds your available savings and affordable credit.
      </div>
      <button
        className="button is-danger is-fullwidth"
        onClick={() => onSubmit({ kind: 'pay', savings, loanAmount: 0 })}
      >
        Declare bankruptcy
      </button>
    </div>
  );
}
