import { createPortal } from 'react-dom';
import { CardData } from '../../../types';

interface GameCardProps {
  card: CardData;
  isExpanded: boolean;
  onSelect: (id: string) => void;
  onClose: () => void;
  onPlay: (card: CardData) => void;
}

export function GameCard({
  card,
  isExpanded,
  onSelect,
  onClose,
  onPlay,
}: GameCardProps) {
  const isMandatory = Boolean(card.isMandatory);

  return (
    <>
      {/* SLOT W DŁONI */}
      <div className="card-slot">
        {!isExpanded && (
          <div
            className={`game-card is-facedown ${isMandatory ? 'is-mandatory' : ''}`}
            onClick={() => onSelect(card.id)}
          >
            <div className="card-symbol">{isMandatory ? '!' : '?'}</div>
            <span className={`tag ${isMandatory ? 'is-danger' : 'is-info'} is-light`}>
              {isMandatory ? 'Obowiązkowa' : 'Szansa'}
            </span>
          </div>
        )}
      </div>

      {/* ODKRYTA KARTA NA ŚRODKU EKRANU (PORTAL) */}
      {isExpanded &&
        createPortal(
          <>
            <div
              className="card-backdrop"
              style={{ pointerEvents: 'auto' }}
              // Karta obowiązkowa nie pozwala zamknąć się kliknięciem w tło
              onClick={() => {
                if (!isMandatory) onClose();
              }}
            />

            <div
              className="game-card is-expanded"
              style={{ pointerEvents: 'auto' }}
            >
              <div>
                <div className="is-flex is-justify-content-space-between is-align-items-center mb-3">
                  <span className={`tag ${card.tagColor} is-light`}>
                    {card.tag}
                  </span>

                  {/* Krzyżyk tylko dla kart nieobowiązkowych */}
                  {!isMandatory && (
                    <button
                      className="delete"
                      aria-label="close"
                      onClick={onClose}
                    />
                  )}
                </div>

                <h3 className="title is-4 has-text-white mb-3">{card.title}</h3>
                <p className="is-size-6 has-text-grey-lighter">{card.fullDesc}</p>
              </div>

              <div className="buttons is-centered mt-4">
                <button
                  className={`button ${isMandatory ? 'is-danger' : 'is-primary'} is-fullwidth`}
                  onClick={() => onPlay(card)}
                >
                  {isMandatory ? 'Przyjmij na klatę' : 'Zagraj kartę'}
                </button>

                {!isMandatory && (
                  <button
                    className="button is-dark is-small is-fullwidth"
                    onClick={onClose}
                  >
                    Odłóż z powrotem
                  </button>
                )}
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
}