import type { MandatoryEventSettlement } from '../../../store/types';

interface Props {
  onSubmit: (settlement: MandatoryEventSettlement) => void;
}

export function CloseEventSettlement({ onSubmit }: Props) {
  return (
    <div className="buttons is-centered mt-4">
      <button
        className="button is-primary is-fullwidth"
        onClick={() => onSubmit({ kind: 'no-payment' })}
      >
        Close event
      </button>
    </div>
  );
}
