import type { MandatoryEventSettlement } from '../../../types';
import { formatPLN } from '../topHud/formatPLN';

interface Props {
  eventAmount: number;
  onSubmit: (settlement: MandatoryEventSettlement) => void;
}

export function IncomeSettlement({ eventAmount, onSubmit }: Props) {
  return (
    <div className="mt-4">
      <p className="has-text-weight-semibold mb-3">
        You receive {formatPLN(eventAmount)}. Choose what to do with it:
      </p>
      <div className="buttons">
        <button
          className="button is-success is-fullwidth"
          onClick={() => onSubmit({ kind: 'save-to-sock' })}
        >
          Add to sock
        </button>
        <button
          className="button is-info is-fullwidth"
          onClick={() => onSubmit({ kind: 'entertainment' })}
        >
          Spend on entertainment (+10 psyche)
        </button>
      </div>
    </div>
  );
}
