import { useState } from 'react';
import { useGameStore } from '../../../../store';
import { formatPLN } from '../formatPLN';

export function SalaryDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const monthlyIncome = useGameStore((s) => s.monthlyIncome);
  const spouseMonthlyIncome = useGameStore((s) => s.spouseMonthlyIncome);
  const monthlyInvestment = useGameStore((s) => s.monthlyInvestment);
  const updateMonthlyInvestment = useGameStore((s) => s.updateMonthlyInvestment);
  const totalHouseholdIncome = monthlyIncome + spouseMonthlyIncome;

  return (
    <div className="level-item">
      <div className={`dropdown is-right ${isOpen ? 'is-active' : ''}`}>
        <div className="dropdown-trigger">
          <button
            className="button is-light is-small"
            aria-haspopup="true"
            aria-controls="salary-menu"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((prev) => !prev)}
            style={{ height: '2rem' }}
          >
            <span className="has-text-weight-semibold mr-2">Income</span>
            <span>{formatPLN(monthlyIncome)} / month</span>
            <span className="ml-2">{isOpen ? '▴' : '▾'}</span>
          </button>
        </div>

        <div
          className="dropdown-menu"
          id="salary-menu"
          role="menu"
          style={{ width: '320px' }}
        >
          <div
            className="dropdown-content p-4 has-background-dark has-text-light"
            style={{
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 16px 40px rgba(0,0,0,0.75)',
            }}
          >
            <div className="is-flex is-justify-content-space-between is-align-items-center mb-3">
              <span className="has-text-weight-bold is-size-6 has-text-white">
                How much do you want to invest?
              </span>
              <button
                className="delete is-small"
                aria-label="Close"
                onClick={() => setIsOpen(false)}
              />
            </div>

            <div className="is-size-7 mb-3">
              <div className="is-flex is-justify-content-space-between">
                <span className="has-text-grey-light">Your monthly income</span>
                <span>{formatPLN(monthlyIncome)} / month</span>
              </div>
              <div className="is-flex is-justify-content-space-between">
                <span className="has-text-grey-light">Wife's monthly income</span>
                <span>{formatPLN(spouseMonthlyIncome)} / month</span>
              </div>
            </div>
            <p className="is-size-7 has-text-grey-light mb-2">
              Monthly investment amount (max. {formatPLN(totalHouseholdIncome)})
            </p>
            <input
              type="range"
              min={0}
              max={totalHouseholdIncome}
              step={50}
              value={monthlyInvestment}
              aria-label="Monthly investment amount"
              onChange={(event) => updateMonthlyInvestment(Number(event.target.value))}
              style={{ width: '100%', cursor: 'pointer' }}
            />
            <div className="has-text-right has-text-weight-bold has-text-primary">
              {formatPLN(monthlyInvestment)} / month
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
