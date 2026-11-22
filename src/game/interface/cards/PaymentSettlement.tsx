import type { MandatoryEventSettlement, SavingsBuckets } from '../../../types';
import { formatPLN } from '../topHud/formatPLN';

const SAVINGS_BUCKET_LABELS: Record<keyof SavingsBuckets, string> = {
  sock: 'Sock',
  account: 'Savings account',
  stocks: 'Stocks',
};

interface Props {
  cardId: number;
  requiredPayment: number;
  savings: SavingsBuckets;
  savingsPayment: SavingsBuckets;
  loanAmount: number;
  maxLoan: number;
  paymentIsValid: boolean;
  totalSavingsPayment: number;
  onUpdateSavings: (bucket: keyof SavingsBuckets, value: number) => void;
  onSetSavings: (payment: SavingsBuckets) => void;
  onUpdateLoan: (value: number) => void;
  onSetError: (error: string | null) => void;
  onSubmit: (settlement: MandatoryEventSettlement) => void;
}

export function PaymentSettlement({
  cardId,
  requiredPayment,
  savings,
  savingsPayment,
  loanAmount,
  maxLoan,
  paymentIsValid,
  totalSavingsPayment,
  onUpdateSavings,
  onSetSavings,
  onUpdateLoan,
  onSetError,
  onSubmit,
}: Props) {
  const loanHelpText = `Maximum loan: ${formatPLN(maxLoan)}. It is based on income left after fixed expenses and existing loan repayments. A new loan is repaid over 5 years and reduces your available monthly budget.`;

  return (
    <div className="mt-4">
      <p className="has-text-weight-semibold mb-2">
        Pay {formatPLN(requiredPayment)}
      </p>
      <p className="is-size-7 has-text-grey-light mb-3">
        Choose the savings to use. Any remainder is borrowed interest-free over 5 years.
      </p>

      {(Object.keys(SAVINGS_BUCKET_LABELS) as (keyof SavingsBuckets)[]).map(
        (bucket) => (
          <div
            key={bucket}
            className="field is-flex is-justify-content-space-between is-align-items-center"
          >
            <label
              className="label has-text-white is-size-7 mb-0"
              htmlFor={`${cardId}-${bucket}`}
            >
              {SAVINGS_BUCKET_LABELS[bucket]} ({formatPLN(savings[bucket])})
            </label>
            <input
              id={`${cardId}-${bucket}`}
              className="input is-small"
              style={{ width: '130px' }}
              type="number"
              min={0}
              max={Math.max(0, savings[bucket])}
              step={1}
              value={savingsPayment[bucket]}
              onChange={(event) =>
                onUpdateSavings(bucket, Number(event.target.value))
              }
            />
          </div>
        )
      )}

      <div className="field is-flex is-justify-content-space-between is-align-items-center">
        <div className="is-flex is-align-items-center" style={{ gap: '0.35rem' }}>
          <label className="label has-text-white is-size-7 mb-0" htmlFor={`${cardId}-loan`}>
            Loan
          </label>
          <button
            type="button"
            className="button is-small is-rounded"
            title={loanHelpText}
            aria-label={loanHelpText}
            style={{ width: '1.25rem', height: '1.25rem', padding: 0 }}
          >
            ?
          </button>
        </div>
        <input
          id={`${cardId}-loan`}
          className="input is-small"
          style={{ width: '130px' }}
          type="number"
          min={0}
          max={maxLoan}
          step={1}
          value={loanAmount}
          onChange={(event) => {
            onUpdateLoan(Math.max(0, Math.floor(Number(event.target.value) || 0)));
            onSetError(null);
          }}
        />
      </div>

      <div className="is-flex is-justify-content-space-between is-size-7 mb-3">
        <span className="has-text-grey-light">Selected total</span>
        <span className={paymentIsValid ? 'has-text-success' : 'has-text-warning'}>
          {formatPLN(totalSavingsPayment + loanAmount)} / {formatPLN(requiredPayment)}
        </span>
      </div>

      <div className="buttons">
        <button
          className="button is-danger is-fullwidth"
          disabled={!paymentIsValid}
          onClick={() =>
            onSubmit({ kind: 'pay', savings: savingsPayment, loanAmount })
          }
        >
          Pay event
        </button>
        <button
          className="button is-dark is-small is-fullwidth"
          onClick={() => {
            onSetError(null);
            onSetSavings({ sock: 0, account: 0, stocks: 0 });
            onUpdateLoan(requiredPayment);
          }}
        >
          Pay with loan
        </button>
        <button
          className="button is-dark is-small is-fullwidth"
          onClick={() => {
            let remaining = requiredPayment;
            const payment: SavingsBuckets = { sock: 0, account: 0, stocks: 0 };
            for (const bucket of ['sock', 'account', 'stocks'] as const) {
              const bucketPayment = Math.min(Math.max(0, savings[bucket]), remaining);
              payment[bucket] = bucketPayment;
              remaining -= bucketPayment;
            }
            onSetSavings(payment);
            onUpdateLoan(remaining);
            onSetError(null);
          }}
        >
          Use savings first
        </button>
      </div>
    </div>
  );
}
