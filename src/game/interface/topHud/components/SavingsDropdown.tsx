import { useState } from 'react';
import { useGameStore } from '../../../../store';
import { formatPLN } from '../formatPLN';
import { strategyOptions } from '../strategyOptions';
import { StrategyRow } from './StrategyRow';

export function SavingsDropdown() {
  const [isWalletOpen, setIsWalletOpen] = useState(false);

  const monthlyIncome = useGameStore((s) => s.monthlyIncome);
  const savings = useGameStore((s) => s.savings);
  const strategy = useGameStore((s) => s.strategy);
  const updateStrategy = useGameStore((s) => s.updateStrategy);

  const totalSavings = savings.sock + savings.account + savings.stocks;
  const totalSavedPercent = strategy.sock + strategy.account + strategy.stocks;
  const isOverBudget = totalSavedPercent > 100;

  return (
    <div className="level-item">
      <div className={`dropdown is-right ${isWalletOpen ? 'is-active' : ''}`}>
        <div className="dropdown-trigger">
          <button
            className="button is-dark is-small"
            aria-haspopup="true"
            aria-controls="savings-menu"
            onClick={() => setIsWalletOpen((prev) => !prev)}
            style={{
              border: '1px solid rgba(255, 255, 255, 0.2)',
              height: '2rem',
            }}
          >
            <span className="has-text-grey-light mr-2">Savings:</span>
            <span className="has-text-success has-text-weight-bold mr-2">
              {formatPLN(totalSavings)}
            </span>
            <span className="tag is-success is-light is-rounded mr-1">
              {totalSavedPercent}% of income
            </span>
            <span>{isWalletOpen ? '▴' : '▾'}</span>
          </button>
        </div>

        <div
          className="dropdown-menu"
          id="savings-menu"
          role="menu"
          style={{ width: '360px' }}
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
               Savings portfolio & strategy
              </span>
              <button
                className="delete is-small"
                onClick={() => setIsWalletOpen(false)}
              />
            </div>

            {strategyOptions.map((row) => (
              <StrategyRow
                key={row.key}
                label={row.label}
                hint={row.hint}
                colorClass={row.colorClass}
                currentBalance={savings[row.key]}
                percent={strategy[row.key]}
                monthlyIncome={monthlyIncome}
                onPercentChange={(percent) => updateStrategy(row.key, percent)}
              />
            ))}

            {isOverBudget ? (
              <div className="notification is-danger is-light is-size-7 p-2 mb-0">
                Over 100% of income allocated ({totalSavedPercent}%)! Reduce a savings goal to leave money for living expenses.
              </div>
            ) : (
              <div className="is-flex is-justify-content-space-between is-size-7 pt-1">
                <span className="has-text-grey-light">Left for living expenses:</span>
                <span className="has-text-white has-text-weight-bold">
                  {100 - totalSavedPercent}% ({formatPLN(monthlyIncome * ((100 - totalSavedPercent) / 100))})
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}