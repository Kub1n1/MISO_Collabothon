import { useEffect, useState } from 'react';
import type { GameResult } from '../../types';
import { saveGameResult } from '../gameResultsStorage';
import { formatPLN } from './topHud/formatPLN';

interface GameSummaryProps {
  result: GameResult;
}

export function GameSummary({ result }: GameSummaryProps) {
  const [results, setResults] = useState<GameResult[]>([]);

  useEffect(() => {
    setResults(saveGameResult(result));
  }, [result]);

  return (
    <div
      className="card-backdrop"
      style={{
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.8)',
        pointerEvents: 'auto',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-summary-title"
    >
      <section
        className="box glass-box has-text-light p-5"
        style={{
          width: 'min(600px, calc(100vw - 32px))',
          maxHeight: 'calc(100vh - 40px)',
          overflowY: 'auto',
        }}
      >
        <h1 id="game-summary-title" className="title is-3 has-text-success">
          Retirement summary
        </h1>

        <div className="is-flex is-justify-content-space-between mb-2">
          <span className="has-text-grey-light">Savings total</span>
          <strong>{formatPLN(result.savingsTotal)}</strong>
        </div>
        <div className="is-flex is-justify-content-space-between mb-2">
          <span className="has-text-grey-light">Psyche</span>
          <strong>{result.psyche} / 100</strong>
        </div>
        <div className="is-flex is-justify-content-space-between mb-2">
          <span className="has-text-grey-light">Psyche bonus</span>
          <strong className="has-text-success">
            +{(result.psyche / 10).toFixed(1)}%
          </strong>
        </div>
        <div className="is-flex is-justify-content-space-between mb-2">
          <span className="has-text-grey-light">Final score</span>
          <strong className="title is-4 has-text-white">
            {formatPLN(result.score)}
          </strong>
        </div>
        <p className="has-text-grey-light mb-5">
          Psyche adds up to a 10% bonus to your savings score.
        </p>

        <h2 className="title is-5 has-text-white">Previous runs</h2>
        {results.length === 0 ? (
          <p className="has-text-grey-light">Saving this result...</p>
        ) : (
          <ol>
            {results.map((savedResult) => (
              <li
                key={savedResult.completedAt}
                className="is-flex is-justify-content-space-between mb-2"
              >
                <span className="has-text-grey-light">
                  {new Date(savedResult.completedAt).toLocaleDateString()}
                </span>
                <div className="has-text-right">
                  <strong>{formatPLN(savedResult.score)}</strong>
                  <div className="is-size-7 has-text-grey-light">
                    Psyche {savedResult.psyche} / 100
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}

        <button
          className="button is-primary is-fullwidth mt-5"
          onClick={() => window.location.reload()}
        >
          Start a new game
        </button>
      </section>
    </div>
  );
}