import type { GameCardProps } from './GameCard.types';

export function CollapsedGameCard({
  card,
  isMandatory,
  isResolved = false,
  onSelect,
}: GameCardProps) {
  return (
    <div className="card-slot">
      <div
        style={{
          pointerEvents: isResolved ? 'none' : 'auto',
          rotate: `${(Math.random() * 10 - 5).toFixed(2)}deg`,
        }}
        className={`game-card ${isMandatory ? 'mandatoryCard' : 'optionalCard'} ${
          isResolved ? 'is-resolved' : ''
        }`}
        onClick={() => {
          if (!isResolved) onSelect(card.id);
        }}
      />
    </div>
  );
}
