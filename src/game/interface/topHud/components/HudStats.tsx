import { SalaryDropdown } from './SalaryDropdown';
import { SavingsDropdown } from './SavingsDropdown';

interface HudStatsProps {
  age: number;
  retirementAge: number;
}

export function HudStats({
  age,
  retirementAge,
}: HudStatsProps) {
  return (
    <div className="level is-mobile">
      <div className="level-left">
        <div className="level-item">
          <div className="tags has-addons are-medium">
            <span className="tag is-dark">Age</span>
            <span className="tag is-primary has-text-weight-bold">
              {age} / {retirementAge} years
            </span>
          </div>
        </div>
      </div>

      <div className="level-right" style={{ gap: '0.75rem' }}>
        <div className="level-item">
          <div className="tags has-addons are-medium">
            <span className="tag is-dark">Monthly income</span>
            <span className="tag is-light has-text-weight-semibold">
              {formatPLN(monthlyIncome)} / month
            </span>
          </div>
        </div>

        <SavingsDropdown />
      </div>
    </div>
  );
}