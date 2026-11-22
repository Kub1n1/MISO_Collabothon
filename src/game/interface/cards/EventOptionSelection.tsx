import type { GameEvent } from '../../../store/types';

interface Props {
  card: GameEvent;
  onSelectOption: (index: number) => void;
}

export function EventOptionSelection({ card, onSelectOption }: Props) {
  return (
    <div className="mt-4">
      <p className="has-text-weight-semibold mb-2">Choose an option first:</p>
      <div className="buttons">
        {card.options?.map((option, index) => (
          <button
            key={`${option.name}-${index}`}
            className="button is-dark is-fullwidth"
            onClick={() => onSelectOption(index)}
          >
            {option.name}
          </button>
        ))}
      </div>
    </div>
  );
}
