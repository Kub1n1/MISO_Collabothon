import { useState } from 'react';
import { useGameStore } from '../../../store';
import { GameCard } from './GameCard';
import { CardData } from '../../../types';
import './cards.css';

// Przykładowe dane do testów (docelowo mogą przychodzić ze store'a jako currentHand)
const MOCK_ROUND_CARDS: CardData[] = [
  {
    id: 'mand-1',
    tag: 'Life event',
    tagColor: 'is-danger',
    title: 'The old Rubin TV has broken down!',
    fullDesc:
      "The picture tube gave out just before Sunday movie night. There's no choice - you need to get a new TV.",
    targetProp: 'tv',
    isMandatory: true,
  },
  {
    id: 'opt-1',
    tag: 'Renovation',
    tagColor: 'is-warning',
    title: 'Goodbye, wood paneling!',
    fullDesc:
      "Enough of the dark 90s wood paneling. It's time for smooth plaster and a trendy paint color from the catalog.",
    targetProp: 'wall',
  },
  {
    id: 'opt-2',
    tag: 'Comfort',
    tagColor: 'is-success',
    title: 'A comfier sofa',
    fullDesc:
      'The old pull-out sofa, a relic from the 1980s, is making way for a comfortable new sectional.',
    targetProp: 'couch',
  },
];

interface CardHandProps {
  cards?: CardData[];
}

export function CardHand({ cards = MOCK_ROUND_CARDS }: CardHandProps) {
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const incrementProp = useGameStore((s) => s.incrementProp);

  const mandatoryCard = useGameStore((c) => c.turnEvents.mandatory);
  const optionalCards = useGameStore((c) => c.turnEvents.optional);

  const handlePlayCard = (card: CardData) => {
    incrementProp(card.targetProp);
    setSelectedCardId(null);
  };

  return (
    <div
      className="is-flex is-justify-content-center is-align-items-end"
      style={{ gap: '1.25rem', pointerEvents: 'auto' }}
    >
      {/* 1. Lewa strona: opcjonalna karta obowiązkowa */}
      {mandatoryCard && (
        <>
          <GameCard
            key={mandatoryCard.id}
            card={mandatoryCard}
            isMandatory={true}
            isExpanded={selectedCardId === mandatoryCard.id}
            onSelect={setSelectedCardId}
            onClose={() => setSelectedCardId(null)}
            onPlay={handlePlayCard}
          />
          {optionalCards.length > 0 && <div className="mandatory-divider" />}
        </>
      )}

      {/* 2. Prawa strona: zmienna liczba kart do wyboru w danej rundzie */}
      {optionalCards.map((card) => (
        <GameCard
          key={card.id}
          card={card}
          isExpanded={selectedCardId === card.id}
          onSelect={setSelectedCardId}
          onClose={() => setSelectedCardId(null)}
          onPlay={handlePlayCard}
        />
      ))}
    </div>
  );
}