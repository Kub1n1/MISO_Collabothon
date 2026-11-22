import { useState } from 'react';
import { useGameStore } from '../../../store/store';
import { GameCard } from './GameCard';
import type { GameEvent, MandatoryEventSettlement } from '../../../store/types';
import './cards.css';

export function CardHand() {
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const mandatoryCard = useGameStore((c) => c.turnEvents.mandatory);
  const optionalCards = useGameStore((c) => c.turnEvents.optional);
  const isMandatoryEventResolved = useGameStore((s) => s.isMandatoryEventResolved);
  const resolveMandatoryEvent = useGameStore((s) => s.resolveMandatoryEvent);
  const resolveOptionalEvent = useGameStore((s) => s.resolveOptionalEvent);
  const resolvedOptionalEventIds = useGameStore(
    (s) => s.turnEvents.resolvedOptionalEventIds
  );

  const handlePlayCard = (
    card: GameEvent,
    optionIndex: number | null,
    settlement: MandatoryEventSettlement
  ) => {
    const resolved = card.isMandatory
      ? resolveMandatoryEvent(card.id, optionIndex, settlement)
      : resolveOptionalEvent(card.id, optionIndex, settlement);
    if (resolved) setSelectedCardId(null);
    return resolved;
  };
  return (
    <div
      className="is-flex is-justify-content-center is-align-items-end"
      style={{
        pointerEvents: 'auto',
        justifyContent: 'flex-start',
        overflowX: 'auto',
        marginTop: '130px',
        marginLeft: '-50px',
        marginRight: '-20px',
        paddingTop: '20px',
        paddingLeft: '20px',
        paddingRight: '20px',
        paddingBottom: '20px',
        overflow: 'hidden',
        scale: '0.7',
      }}
    >
      {!isMandatoryEventResolved && mandatoryCard && (
        <>
          <GameCard
            key={mandatoryCard.id}
            card={mandatoryCard}
            isMandatory={true}
            isResolved={isMandatoryEventResolved}
            isExpanded={selectedCardId === mandatoryCard.id}
            onSelect={setSelectedCardId}
            onPlay={handlePlayCard}
          />
        </>
      )}

      {!resolvedOptionalEventIds.length && optionalCards.map((card) => (
        <GameCard
          key={card.id}
          card={card}
          isMandatory={false}
          isResolved={resolvedOptionalEventIds.includes(card.id)}
          isExpanded={selectedCardId === card.id}
          onSelect={setSelectedCardId}
          onPlay={handlePlayCard}
        />
      ))}
    </div>
  );
}