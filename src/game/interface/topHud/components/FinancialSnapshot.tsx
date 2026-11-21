import { useGameStore } from '../../../../store';
import { STOCK_SYMBOLS } from '../../../../types';
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
  const stockMarket = useGameStore((state) => state.stockMarket);
  const stockValue = STOCK_SYMBOLS.reduce(
    (total, symbol) => total + stockMarket.prices[symbol] * stockMarket.holdings[symbol],
    0
  );
  const stockCostBasis = STOCK_SYMBOLS.reduce(
    (total, symbol) => total + stockMarket.costBasis[symbol],
    0
  );
  const stockProfit = stockValue - stockCostBasis + stockMarket.realizedProfit;
  const netWorth = savingsTotal + stockValue;
  const fixedCostRunway =
    monthlyFixedExpenses + monthlyLoanRepayment > 0
      ? netWorth / (monthlyFixedExpenses + monthlyLoanRepayment)
      : 0;
  const holdingsSummary = `TSLA ${stockMarket.holdings.TESLA} · MSFT ${stockMarket.holdings.MICROSOFT} · NVDA ${stockMarket.holdings.NVIDIA}`;

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
        <span className="has-text-grey-light">Fixed-cost runway</span>
        <span className="has-text-info has-text-weight-semibold">
          {fixedCostRunway.toFixed(1)} months
        </span>
      </div>
      <div className="is-flex is-justify-content-space-between is-size-7 mt-1">
        <span className="has-text-grey-light">Stock portfolio</span>
        <span className="has-text-white has-text-weight-semibold">
          {formatPLN(stockValue)}
        </span>
      </div>
      <div className="is-size-7 has-text-grey-light">{holdingsSummary}</div>
      <div className="is-flex is-justify-content-space-between is-size-7">
        <span className="has-text-grey-light">Stock P/L</span>
        <span className={`has-text-weight-semibold ${stockProfit >= 0 ? 'has-text-success' : 'has-text-danger'}`}>
          {stockProfit > 0 ? '+' : ''}{formatPLN(stockProfit)}
        </span>
      </div>
    </div>
  );
}
