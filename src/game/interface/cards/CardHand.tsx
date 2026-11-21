import { useState } from 'react';
import { useGameStore } from '../../../store';
import { GameCard } from './GameCard';
import type { GameEvent, MandatoryEventSettlement } from '../../../types';
import './cards.css';

export function CardHand() {
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const mandatoryCard = useGameStore((c) => c.turnEvents.mandatory);
  const optionalCards = useGameStore((c) => c.turnEvents.optional);
  const isMandatoryEventResolved = useGameStore((s) => s.isMandatoryEventResolved);
  const resolveMandatoryEvent = useGameStore((s) => s.resolveMandatoryEvent);
  const resolveOptionalEvent = useGameStore((s) => s.resolveOptionalEvent);
  const dismissOptionalEvent = useGameStore((s) => s.dismissOptionalEvent);

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
        gap: '1.25rem',
        pointerEvents: 'auto',
        justifyContent: 'flex-start',
        maxWidth: 'calc(100vw - 180px)',
        overflowX: 'auto',
        paddingTop: '20px',
        paddingLeft: '24px',
        paddingRight: '24px',
      }}
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

      {/* Optional events do not block advancing to the next age. */}
      {optionalCards.map((card) => (
        <GameCard
          key={card.id}
          card={card}
          isMandatory={false}
          isExpanded={selectedCardId === card.id}
          onSelect={setSelectedCardId}
          onClose={() => setSelectedCardId(null)}
          onPlay={handlePlayCard}
          onSkip={() => {
            dismissOptionalEvent(card.id);
            setSelectedCardId(null);
          }}
        />
      ))}
    </div>
  );
}