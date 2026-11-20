import { useState } from 'react';
import { useGameStore } from '../../../store';
import { GameCard } from './GameCard';
import type { GameEvent } from '../../../store';
import './cards.css';

export function CardHand() {
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const mandatoryCard = useGameStore((c) => c.turnEvents.mandatory);
  const optionalCards = useGameStore((c) => c.turnEvents.optional);
  const isMandatoryEventResolved = useGameStore((s) => s.isMandatoryEventResolved);
  const resolveMandatoryEvent = useGameStore((s) => s.resolveMandatoryEvent);

  const handlePlayCard = (card: GameEvent) => {
    if (card.isMandatory) resolveMandatoryEvent(card.id);
    setSelectedCardId(null);
  };

  return (
    <div
      className="is-flex is-justify-content-center is-align-items-end"
      style={{ gap: '1.25rem', pointerEvents: 'auto' }}
    >
      {/* Mandatory event */}
      {mandatoryCard && (
        <>
          <GameCard
            key={mandatoryCard.id}
            card={mandatoryCard}
            isMandatory={true}
            isResolved={isMandatoryEventResolved}
            isExpanded={selectedCardId === mandatoryCard.id}
            onSelect={setSelectedCardId}
            onClose={() => setSelectedCardId(null)}
            onPlay={handlePlayCard}
          />
          {optionalCards.length > 0 && <div className="mandatory-divider" />}
        </>
      )}

      {/* Optional events are displayed but not resolved yet. */}
      {optionalCards.map((card) => (
        <GameCard
          key={card.id}
          card={card}
          isMandatory={false}
          isExpanded={selectedCardId === card.id}
          onSelect={setSelectedCardId}
          onClose={() => setSelectedCardId(null)}
          onPlay={handlePlayCard}
        />
      ))}
    </div>
  );
}