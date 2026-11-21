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

        <p className="has-text-grey-light mb-1">Final savings score</p>
        <p className="title is-2 has-text-white">{formatPLN(result.score)}</p>
        <p className="has-text-grey-light mb-5">
          Score is the total of your three savings buckets.
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
                <strong>{formatPLN(savedResult.score)}</strong>
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