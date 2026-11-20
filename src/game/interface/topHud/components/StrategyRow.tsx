import { formatPLN } from '../formatPLN';

interface StrategyRowProps {
  label: string;
  hint: string;
  colorClass: string;
  currentBalance: number;
  percent: number;
  monthlyInvestment: number;
  onPercentChange: (percent: number) => void;
}

export function StrategyRow({
  label,
  hint,
  colorClass,
  currentBalance,
  percent,
  monthlyInvestment,
  onPercentChange,
}: StrategyRowProps) {
  const monthlyContribution = Math.round(monthlyInvestment * (percent / 100));

  return (
    <div className="mb-3 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="is-flex is-justify-content-space-between is-align-items-baseline">
        <span className="has-text-weight-semibold is-size-7 has-text-white">
          {label}
        </span>
        <span className="has-text-weight-bold is-size-7 has-text-success">
          {formatPLN(currentBalance)}
        </span>
      </div>

      <p className="is-size-7 has-text-grey mb-1">{hint}</p>

      <div className="is-flex is-align-items-center" style={{ gap: '0.6rem' }}>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={percent}
          onChange={(e) => onPercentChange(Number(e.target.value))}
          style={{ flexGrow: 1, cursor: 'pointer' }}
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