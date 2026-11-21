import { useGameStore } from '../../../../store';
import { formatPLN } from '../formatPLN';

export function FinancialSnapshot() {
  const savingsTotal = useGameStore(
    (state) => state.savings.sock + state.savings.account + state.savings.stocks
  );
  const projectedAnnualGrowth = useGameStore(
    (state) => Math.round(state.savings.account * 0.04 + state.savings.stocks * 0.08)
  );
  const monthlyFixedExpenses = useGameStore((state) => state.monthlyFixedExpenses);
  const monthlyLoanRepayment = useGameStore((state) => state.monthlyLoanRepayment);
  const netWorth = savingsTotal;
  const fixedCostRunway =
    monthlyFixedExpenses + monthlyLoanRepayment > 0
      ? netWorth / (monthlyFixedExpenses + monthlyLoanRepayment)
      : 0;
  return (
    <div
      className="box glass-box p-3 has-text-light"
      style={{ width: '280px', margin: 0 }}
    >
      <div className="has-text-weight-bold is-size-7 mb-2">Financial snapshot</div>
      <div className="is-flex is-justify-content-space-between is-size-7 mb-1">
        <span className="has-text-grey-light">Net worth</span>
        <span className="has-text-white has-text-weight-semibold">
          {formatPLN(netWorth)}
        </span>
      </div>
      <div className="is-flex is-justify-content-space-between is-size-7 mb-1">
        <span className="has-text-grey-light">Projected annual growth</span>
        <span className="has-text-success has-text-weight-semibold">
          +{formatPLN(projectedAnnualGrowth)}
        </span>
      </div>
      <div className="is-flex is-justify-content-space-between is-size-7">
        <span className="has-text-grey-light">Survival without income</span>
        <span className="has-text-info has-text-weight-semibold">
          {fixedCostRunway.toFixed(1)} months
        </span>
      </div>
    </div>
  );
}
