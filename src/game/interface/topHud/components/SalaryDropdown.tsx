import { useGameStore } from '../../../../store';
import { formatPLN } from '../formatPLN';
import styles from './salaryDropdown.module.css';

interface SalaryDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export function SalaryDropdown({ isOpen, onToggle, onClose }: SalaryDropdownProps) {
  const monthlyIncome = useGameStore((s) => s.monthlyIncome);
  const spouseMonthlyIncome = useGameStore((s) => s.spouseMonthlyIncome);
  const monthlyFixedExpenses = useGameStore((s) => s.monthlyFixedExpenses);
  const monthlyLoanRepayment = useGameStore((s) => s.monthlyLoanRepayment);
  const monthlyInvestment = useGameStore((s) => s.monthlyInvestment);
  const updateMonthlyInvestment = useGameStore((s) => s.updateMonthlyInvestment);
  const totalHouseholdIncome = monthlyIncome + spouseMonthlyIncome;
  const availableAfterFixedExpenses =
    totalHouseholdIncome - monthlyFixedExpenses - monthlyLoanRepayment;
  const personalAndHobbyExpenses = availableAfterFixedExpenses - monthlyInvestment;
  const investmentPercentage =
    availableAfterFixedExpenses > 0
      ? (monthlyInvestment / availableAfterFixedExpenses) * 100
      : 0;

  return (
    <div className="level-item">
      <div className={`dropdown is-right ${isOpen ? 'is-active' : ''}`}>
        <div className="dropdown-trigger">
          <button
            className="button is-light is-small"
            aria-haspopup="true"
            aria-controls="salary-menu"
            aria-expanded={isOpen}
            onClick={onToggle}
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
          style={{
            width: 'min(320px, calc(100vw - 24px))',
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
                How much do you want to invest?
              </span>
              <button
                className="delete is-small"
                aria-label="Close"
                onClick={onClose}
              />
            </div>

            <div className="is-size-7 mb-3">
              <div className="is-flex is-justify-content-space-between">
                <span className="has-text-grey-light">Your monthly income</span>
                <span>{formatPLN(monthlyIncome)} / month</span>
              </div>
              {spouseMonthlyIncome > 0 && (
                <div className="is-flex is-justify-content-space-between">
                  <span className="has-text-grey-light">Wife's monthly income</span>
                  <span>{formatPLN(spouseMonthlyIncome)} / month</span>
                </div>
              )}
              <div className="is-flex is-justify-content-space-between mt-2">
                <span className="has-text-grey-light">Fixed monthly expenses</span>
                <span>{formatPLN(monthlyFixedExpenses)} / month</span>
              </div>
              {monthlyLoanRepayment > 0 && (
                <div className="is-flex is-justify-content-space-between">
                  <span className="has-text-grey-light">Loan repayment (5 years)</span>
                  <span>{formatPLN(monthlyLoanRepayment)} / month</span>
                </div>
              )}
            </div>
            <p className="is-size-7 has-text-grey-light mb-2">
              Monthly investment amount (max. {formatPLN(availableAfterFixedExpenses)})
            </p>
            <input
              type="range"
              min={0}
              max={availableAfterFixedExpenses}
              step={1}
              value={monthlyInvestment}
              aria-label="Monthly investment amount"
              onChange={(event) => updateMonthlyInvestment(Number(event.target.value))}
              className={styles.investmentBudgetSlider}
              style={{
                width: '100%',
                cursor: 'pointer',
                background: `linear-gradient(to right, #3273dc ${investmentPercentage}%, #48c78e ${investmentPercentage}%)`,
              }}
            />
            <div className="is-flex is-justify-content-space-between is-size-7 mt-2">
              <div>
                <span className="has-text-info">Monthly investment amount</span>
                <div className="has-text-weight-bold has-text-info">
                  {formatPLN(monthlyInvestment)} / month
                </div>
              </div>
              <div className="has-text-right">
                <span className="has-text-success">Monthly personal and hobby expenses</span>
                <div className="has-text-weight-bold has-text-success">
                  {formatPLN(personalAndHobbyExpenses)} / month
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
