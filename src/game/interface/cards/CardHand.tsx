import { useState } from 'react';
import { useGameStore } from '../../../store';
import { GameCard } from './GameCard';
import { CardData } from '../../../types';
import './cards.css';

// Przykładowe dane do testów (docelowo mogą przychodzić ze store'a jako currentHand)
const MOCK_ROUND_CARDS: CardData[] = [
  {
    id: 'mand-1',
    tag: 'Wydarzenie',
    tagColor: 'is-danger',
    title: 'Awaria starego Rubina!',
    fullDesc:
      'Kineskop odmówił posłuszeństwa tuż przed niedzielnym filmem. Nie ma wyjścia – trzeba zorganizować nowy odbiornik.',
    targetProp: 'tv',
    isMandatory: true,
  },
  {
    id: 'opt-1',
    tag: 'Remont',
    tagColor: 'is-warning',
    title: 'Boazeria precz!',
    fullDesc:
      'Koniec z ciemną boazerią z lat 90. Wjeżdża gładź gipsowa i modny kolor farby z katalogu.',
    targetProp: 'wall',
  },
  {
    id: 'opt-2',
    tag: 'Wygoda',
    tagColor: 'is-success',
    title: 'Nowy wypoczynek',
    fullDesc:
      'Stara wersalka pamiętająca jeszcze stan wojenny ustępuje miejsca wygodnemu narożnikowi.',
    targetProp: 'couch',
  },
];

interface CardHandProps {
  cards?: CardData[];
}

export function CardHand({ cards = MOCK_ROUND_CARDS }: CardHandProps) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const incrementProp = useGameStore((s) => s.incrementProp);

  // Rozdzielamy kartę obowiązkową (jeśli jest w tej rundzie) od reszty ręki
  const mandatoryCard = cards.find((c) => c.isMandatory);
  const optionalCards = cards.filter((c) => !c.isMandatory);

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