import { createPortal } from 'react-dom';
import type { GameEvent } from '../../../store';

interface GameCardProps {
  card: GameEvent;
  isMandatory: boolean;
  isResolved?: boolean;
  isExpanded: boolean;
  onSelect: (id: number) => void;
  onClose: () => void;
  onPlay: (card: GameEvent) => void;
}

export function GameCard({
  card,
  isMandatory,
  isResolved = false,
  isExpanded,
  onSelect,
  onClose,
  onPlay,
}: GameCardProps) {

  return (
    <>
      {/* SLOT W DŁONI */}
      <div className="card-slot">
        {!isExpanded && (
          <div
            className={`game-card is-facedown ${isMandatory ? 'is-mandatory' : ''} ${isResolved ? 'is-resolved' : ''}`}
            aria-disabled={isResolved}
            onClick={() => {
              if (!isResolved) onSelect(card.id);
            }}
          >
            <div className="card-symbol">
              {isResolved ? '✓' : isMandatory ? '!' : '?'}
            </div>
            <span className={`tag ${isMandatory ? 'is-danger' : 'is-info'} is-light`}>
              {isResolved ? 'Completed' : isMandatory ? 'Mandatory' : 'Chance'}
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
                  <span className={`tag ${isMandatory ? 'is-danger' : 'is-info'} is-light`}>
                    {isMandatory ? 'Mandatory event' : 'Optional event'}
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
                <p className="is-size-6 has-text-grey-lighter">{card.description}</p>
              </div>

              <div className="buttons is-centered mt-4">
                <button
                  className={`button ${isMandatory ? 'is-danger' : 'is-primary'} is-fullwidth`}
                  onClick={() => onPlay(card)}
                >
                  {isMandatory ? 'Accept this event' : 'Play card'}
                </button>

                {!isMandatory && (
                  <button
                    className="button is-dark is-small is-fullwidth"
                    onClick={onClose}
                  >
                    Put back
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