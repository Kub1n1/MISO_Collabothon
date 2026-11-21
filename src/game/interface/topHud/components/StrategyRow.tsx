import { formatPLN } from '../formatPLN';
import styles from './strategyRow.module.css';

interface StrategyRowProps {
  label: string;
  hint: string;
  colorClass: string;
  accentColor: string;
  currentBalance: number;
  percent: number;
  monthlyInvestment: number;
  onPercentChange: (percent: number) => void;
  description: string;
}

export function StrategyRow({
  label,
  hint,
  colorClass,
  accentColor,
  currentBalance,
  percent,
  monthlyInvestment,
  onPercentChange,
  description,
}: StrategyRowProps) {
  const monthlyContribution = Math.round(monthlyInvestment * (percent / 100));

  return (
    <div className="mb-3 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="is-flex is-justify-content-space-between is-align-items-baseline">
        <div className="is-flex is-align-items-center" style={{ gap: '0.35rem' }}>
          <span className="has-text-weight-semibold is-size-7 has-text-white">
            {label}
          </span>
          <button
            type="button"
            className="button is-small is-rounded"
            title={description}
            aria-label={`${label}: ${description}`}
            style={{ width: '1.25rem', height: '1.25rem', padding: 0 }}
          >
            ?
          </button>
        </div>
        <span className={`has-text-weight-bold is-size-7 ${currentBalance < 0 ? 'has-text-danger' : 'has-text-success'}`}>
          {formatPLN(currentBalance)}
        </span>
      </div>

      <p className="is-size-7 has-text-grey mb-1">{hint}</p>

      <div className="is-flex is-align-items-center" style={{ gap: '0.6rem' }}>
        <input
          aria-label={`${label} allocation`}
          aria-valuetext={`${percent}% of monthly investment`}
          type="range"
          min={0}
          max={100}
          step={1}
          value={percent}
          onChange={(e) => onPercentChange(Number(e.target.value))}
          className={styles.strategySlider}
          style={{
            flexGrow: 1,
            background: `linear-gradient(to right, ${accentColor} ${percent}%, rgba(255,255,255,0.16) ${percent}%) center / 100% 6px no-repeat`,
          }}
        />
        <span className={`tag ${colorClass} is-light`} style={{ minWidth: '48px' }}>
          {percent}%
        </span>
      </div>

      <div className="has-text-right is-size-7 has-text-grey-light">
        Saving: +{formatPLN(monthlyContribution)} / month
      </div>
    </div>
  );
}