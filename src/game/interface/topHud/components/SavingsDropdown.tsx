import { useGameStore } from '../../../../store/store';
import { formatPLN } from '../formatPLN';
import { strategyOptions } from '../strategyOptions';
import { StrategyRow } from './StrategyRow';
import { SavingsTransferForm } from './SavingsTransferForm';

interface SavingsDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export function SavingsDropdown({ isOpen, onToggle, onClose }: SavingsDropdownProps) {

  const monthlyIncome = useGameStore((s) => s.monthlyIncome);
  const spouseMonthlyIncome = useGameStore((s) => s.spouseMonthlyIncome);
  const monthlyFixedExpenses = useGameStore((s) => s.monthlyFixedExpenses);
  const monthlyLoanRepayment = useGameStore((s) => s.monthlyLoanRepayment);
  const monthlyInvestment = useGameStore((s) => s.monthlyInvestment);
  const savings = useGameStore((s) => s.savings);
  const strategy = useGameStore((s) => s.strategy);
  const updateStrategy = useGameStore((s) => s.updateStrategy);

  const totalSavings = savings.sock + savings.account + savings.stocks;
  const totalHouseholdIncome = monthlyIncome + spouseMonthlyIncome;
  const availableAfterFixedExpenses =
    totalHouseholdIncome - monthlyFixedExpenses - monthlyLoanRepayment;
  const totalSavedPercent = strategy.sock + strategy.account + strategy.stocks;
  const totalMonthlyContribution = monthlyInvestment * (totalSavedPercent / 100);
  const isOverBudget = totalMonthlyContribution > availableAfterFixedExpenses;

  return (
    <div className="level-item">
      <div className={`dropdown is-right ${isOpen ? 'is-active' : ''}`}>
        <div className="dropdown-trigger">
          <button
            className="button is-dark is-small"
            aria-haspopup="true"
            aria-controls="savings-menu"
            aria-expanded={isOpen}
            onClick={onToggle}
            style={{
              border: '1px solid rgba(255, 255, 255, 0.2)',
              height: '2rem',
            }}
          >
            <span className="has-text-grey-light mr-2">Savings:</span>
            <span className={`${
              totalSavings < 0 ? 'has-text-danger' : 'has-text-success'
            } has-text-weight-bold mr-2`}>
              {formatPLN(totalSavings)}
            </span>
            <span className="tag is-success is-light is-rounded mr-1">
              {totalSavedPercent}% of investment budget
            </span>
            <span>{isOpen ? '▴' : '▾'}</span>
          </button>
        </div>

        <div
          className="dropdown-menu"
          id="savings-menu"
          role="menu"
          style={{
            width: 'min(360px, calc(100vw - 24px))',
            maxHeight: 'calc(100vh - 130px)',
            overflowY: 'auto',
          }}
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
                aria-label="Close"
                onClick={onClose}
              />
            </div>

            <div className="mb-4">
              <div
                role="img"
                aria-label={`Monthly investment allocation: ${strategy.sock}% cash at home, ${strategy.account}% savings account, ${strategy.stocks}% stocks and bonds`}
                style={{
                  display: 'flex',
                  height: '8px',
                  overflow: 'hidden',
                  borderRadius: '999px',
                  background: 'rgba(255,255,255,0.12)',
                }}
              >
                {strategyOptions.map((row) => (
                  <div
                    key={row.key}
                    style={{
                      width: `${strategy[row.key]}%`,
                      backgroundColor: row.accentColor,
                      transition: 'width 160ms ease-out',
                    }}
                  />
                ))}
              </div>
              <div className="is-flex is-justify-content-space-between is-size-7 mt-1">
                <span className="has-text-grey-light">Monthly investment allocation</span>
                <span className="has-text-white has-text-weight-semibold">
                  {totalSavedPercent}% / 100%
                </span>
              </div>
            </div>

            {strategyOptions.map((row) => (
              <StrategyRow
                key={row.key}
                label={row.label}
                hint={row.hint}
                colorClass={row.colorClass}
                accentColor={row.accentColor}
                currentBalance={savings[row.key]}
                percent={strategy[row.key]}
                monthlyInvestment={monthlyInvestment}
                onPercentChange={(percent) => updateStrategy(row.key, percent)}
                description={row.description}
              />
            ))}
            <SavingsTransferForm />

            {isOverBudget ? (
              <div className="notification is-danger is-light is-size-7 p-2 mb-0">
                Monthly investments ({formatPLN(totalMonthlyContribution)}) exceed the available budget after fixed expenses. Reduce a savings goal.
              </div>
            ) : (
              <div className="is-flex is-justify-content-space-between is-size-7 pt-1">
                <span className="has-text-grey-light">Left for living expenses:</span>
                <span className="has-text-white has-text-weight-bold">
                  {formatPLN(availableAfterFixedExpenses - totalMonthlyContribution)} / month
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}