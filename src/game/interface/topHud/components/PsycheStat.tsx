import { useGameStore } from '../../../../store/store';

export function PsycheStat() {
  const psyche = useGameStore((state) => state.psyche);
  const colorClass = psyche > 65 ? 'is-success' : psyche > 35 ? 'is-warning' : 'is-danger';

  return (
    <div className="is-flex is-align-items-center" style={{ gap: '0.5rem' }}>
      <span className="tag is-dark">Psyche</span>
      <progress
        className={`progress ${colorClass} is-small mb-0`}
        value={psyche}
        max={100}
        aria-label="Psyche"
        style={{ width: '120px', height: '0.5rem' }}
      />
      <span className={`tag ${colorClass} is-light`}>
        {psyche} / 100
      </span>
    </div>
  );
}
