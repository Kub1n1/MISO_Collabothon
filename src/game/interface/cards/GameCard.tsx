import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { getMaximumAffordableLoan, useGameStore } from '../../../store';
import type { GameEvent, MandatoryEventSettlement, SavingsBuckets } from '../../../types';
import { formatPLN } from '../topHud/formatPLN';

interface GameCardProps {
  card: GameEvent;
  isMandatory: boolean;
  isResolved?: boolean;
  isExpanded: boolean;
  onSelect: (id: number) => void;
  onPlay: (
    card: GameEvent,
    optionIndex: number | null,
    settlement: MandatoryEventSettlement
  ) => boolean;
}

const EMPTY_SAVINGS_PAYMENT: SavingsBuckets = {
  sock: 0,
  account: 0,
  stocks: 0,
};

const SAVINGS_BUCKET_LABELS: Record<keyof SavingsBuckets, string> = {
  sock: 'Sock',
  account: 'Savings account',
  stocks: 'Stocks',
};

export function GameCard({
  card,
  isMandatory,
  isResolved = false,
  isExpanded,
  onSelect,
  onPlay,
}: GameCardProps) {
  const savings = useGameStore((state) => state.savings);
  const monthlyIncome = useGameStore((state) => state.monthlyIncome);
  const spouseMonthlyIncome = useGameStore((state) => state.spouseMonthlyIncome);
  const monthlyFixedExpenses = useGameStore((state) => state.monthlyFixedExpenses);
  const monthlyLoanRepayment = useGameStore((state) => state.monthlyLoanRepayment);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [savingsPayment, setSavingsPayment] = useState<SavingsBuckets>(
    EMPTY_SAVINGS_PAYMENT
  );
  const [loanAmount, setLoanAmount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const imagePath = `/assets/eventy/${card.eventId}.png`;

  const selectedOption =
    selectedOptionIndex === null ? undefined : card.options?.[selectedOptionIndex];
  const effect = selectedOption?.effect ?? card.effect;
  const eventAmount = effect?.eventAmount ?? 0;
  const requiredPayment = Math.abs(eventAmount);
  const maxLoan = getMaximumAffordableLoan(
    monthlyIncome + spouseMonthlyIncome,
    monthlyFixedExpenses,
    monthlyLoanRepayment
  );
  const maxSavings = (Object.keys(savings) as (keyof SavingsBuckets)[]).reduce(
    (total, bucket) => total + Math.max(0, savings[bucket]),
    0
  );
  const maxAvailable = maxSavings + maxLoan;
  const totalSavingsPayment = (
    Object.keys(savingsPayment) as (keyof SavingsBuckets)[]
  ).reduce((total, bucket) => total + savingsPayment[bucket], 0);
  const paymentIsValid =
    Number.isInteger(loanAmount) &&
    loanAmount >= 0 &&
    loanAmount <= maxLoan &&
    (Object.keys(savingsPayment) as (keyof SavingsBuckets)[]).every(
      (bucket) =>
        Number.isInteger(savingsPayment[bucket]) &&
        savingsPayment[bucket] >= 0 &&
        savingsPayment[bucket] <= Math.max(0, savings[bucket])
    ) &&
    totalSavingsPayment + loanAmount === requiredPayment;

  useEffect(() => {
    setSelectedOptionIndex(null);
    setSavingsPayment(EMPTY_SAVINGS_PAYMENT);
    setLoanAmount(0);
    setError(null);
  }, [card.id]);

  useEffect(() => {
    setError(null);
    if (eventAmount >= 0) {
      setSavingsPayment(EMPTY_SAVINGS_PAYMENT);
      setLoanAmount(0);
      return;
    }

    let remainingSavings = Math.max(0, requiredPayment - maxLoan);
    const defaultPayment = { ...EMPTY_SAVINGS_PAYMENT };
    for (const bucket of ['sock', 'account', 'stocks'] as const) {
      const payment = Math.min(Math.max(0, savings[bucket]), remainingSavings);
      defaultPayment[bucket] = payment;
      remainingSavings -= payment;
    }

    setSavingsPayment(defaultPayment);
    setLoanAmount(requiredPayment - (
      defaultPayment.sock + defaultPayment.account + defaultPayment.stocks
    ));
  }, [card.id, eventAmount, maxLoan, requiredPayment, savings, selectedOptionIndex]);

  const submit = (settlement: MandatoryEventSettlement) => {
    const succeeded = onPlay(card, selectedOptionIndex, settlement);
    if (succeeded) {
      setError(null);
    } else {
      setError('This selection could not be applied. Check the amounts and try again.');
    }
  };

  const updateSavingsPayment = (bucket: keyof SavingsBuckets, value: number) => {
    const nextPayment = {
      ...savingsPayment,
      [bucket]: Math.max(0, Math.min(Math.floor(value || 0), Math.max(0, savings[bucket]))),
    };
    setSavingsPayment(nextPayment);
    const nextTotal = nextPayment.sock + nextPayment.account + nextPayment.stocks;
    setLoanAmount(Math.max(0, requiredPayment - nextTotal));
    setError(null);
  };

  const selectOption = (index: number) => {
    setSelectedOptionIndex(index);
    setError(null);
  };

  const resetOption = () => {
    setSelectedOptionIndex(null);
    setError(null);
  };

  const renderSettlement = () => {
    if (card.options?.length && selectedOptionIndex === null) {
      return (
        <div className="mt-4">
          <p className="has-text-weight-semibold mb-2">Choose an option first:</p>
          <div className="buttons">
            {card.options.map((option, index) => (
              <button
                key={`${option.name}-${index}`}
                className="button is-dark is-fullwidth"
                onClick={() => selectOption(index)}
              >
                {option.name}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (!effect) {
      return <p className="has-text-danger mt-4">This event has no effect to resolve.</p>;
    }

    if (eventAmount < 0) {
      if (maxAvailable < requiredPayment) {
        if (!isMandatory) {
          return (
            <div className="mt-4">
              <div className="notification is-warning is-light is-size-7 p-3">
                You cannot afford this optional event with your current savings and
                affordable credit.
              </div>
            </div>
          );
        }

        return (
          <div className="mt-4">
            <div className="notification is-danger is-light is-size-7 p-3">
              You need {formatPLN(requiredPayment)}, but can access only{' '}
              {formatPLN(maxAvailable)} from savings and affordable credit. The game
              cannot continue.
            </div>
            <button
              className="button is-danger is-fullwidth"
              onClick={() =>
                submit({ kind: 'pay', savings: EMPTY_SAVINGS_PAYMENT, loanAmount: 0 })
              }
            >
              End game
            </button>
          </div>
        );
      }

      return (
        <div className="mt-4">
          <p className="has-text-weight-semibold mb-2">
            Pay {formatPLN(requiredPayment)}
          </p>
          <p className="is-size-7 has-text-grey-light mb-3">
            Choose the savings to use. Any remainder is borrowed interest-free over
            5 years. Maximum affordable loan: {formatPLN(maxLoan)}.
          </p>

          {(Object.keys(SAVINGS_BUCKET_LABELS) as (keyof SavingsBuckets)[]).map(
            (bucket) => (
              <div
                key={bucket}
                className="field is-flex is-justify-content-space-between is-align-items-center"
              >
                <label className="label has-text-white is-size-7 mb-0" htmlFor={`${card.id}-${bucket}`}>
                  {SAVINGS_BUCKET_LABELS[bucket]} ({formatPLN(savings[bucket])})
                </label>
                <input
                  id={`${card.id}-${bucket}`}
                  className="input is-small"
                  style={{ width: '130px' }}
                  type="number"
                  min={0}
                  max={Math.max(0, savings[bucket])}
                  step={1}
                  value={savingsPayment[bucket]}
                  onChange={(event) =>
                    updateSavingsPayment(bucket, Number(event.target.value))
                  }
                />
              </div>
            )
          )}

          <div className="field is-flex is-justify-content-space-between is-align-items-center">
            <label className="label has-text-white is-size-7 mb-0" htmlFor={`${card.id}-loan`}>
              Loan (max {formatPLN(maxLoan)})
            </label>
            <input
              id={`${card.id}-loan`}
              className="input is-small"
              style={{ width: '130px' }}
              type="number"
              min={0}
              max={maxLoan}
              step={1}
              value={loanAmount}
              onChange={(event) => {
                setLoanAmount(Math.max(0, Math.floor(Number(event.target.value) || 0)));
                setError(null);
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
                submit({
                  kind: 'pay',
                  savings: savingsPayment,
                  loanAmount,
                })
              }
            >
              Pay event
            </button>
            <button
              className="button is-dark is-small is-fullwidth"
              onClick={() => {
                setSavingsPayment(EMPTY_SAVINGS_PAYMENT);
                setLoanAmount(requiredPayment);
                setError(null);
              }}
            >
              Use full credit
            </button>
            <button
              className="button is-dark is-small is-fullwidth"
              onClick={() => {
                const payment = { ...EMPTY_SAVINGS_PAYMENT };
                let remaining = requiredPayment;
                for (const bucket of ['sock', 'account', 'stocks'] as const) {
                  payment[bucket] = Math.min(Math.max(0, savings[bucket]), remaining);
                  remaining -= payment[bucket];
                }
                setSavingsPayment(payment);
                setLoanAmount(remaining);
                setError(null);
              }}
            >
              Use savings first
            </button>
          </div>
        </div>
      );
    }

    if (eventAmount > 0) {
      return (
        <div className="mt-4">
          <p className="has-text-weight-semibold mb-3">
            You receive {formatPLN(eventAmount)}. Choose what to do with it:
          </p>
          <div className="buttons">
            <button
              className="button is-success is-fullwidth"
              onClick={() => submit({ kind: 'save-to-sock' })}
            >
              Add to sock
            </button>
            <button
              className="button is-info is-fullwidth"
              onClick={() => submit({ kind: 'entertainment' })}
            >
              Spend on entertainment (+10 psyche)
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="buttons is-centered mt-4">
        <button
          className="button is-primary is-fullwidth"
          onClick={() => submit({ kind: 'no-payment' })}
        >
          Close event
        </button>
      </div>
    );
  };

  return (
    <>
      <div className="card-slot">
        {!isExpanded && (
          <div
            className={`game-card is-facedown ${isMandatory ? 'is-mandatory' : ''} ${isResolved ? 'is-resolved' : ''}`}
            aria-disabled={isResolved}
            onClick={() => {
              if (!isResolved) onSelect(card.id);
            }}
          >
            <div className="card-symbol">
              {isResolved ? '✓' : isMandatory ? '!' : '?'}
            </div>
            <span className={`tag ${isMandatory ? 'is-danger' : 'is-info'} is-light`}>
              {isResolved ? 'Completed' : isMandatory ? 'Mandatory' : 'Chance'}
            </span>
          </div>
        )}
      </div>

      {isExpanded &&
        createPortal(
          <>
            <div
              className="card-backdrop"
              style={{ pointerEvents: 'auto' }}
            />

            <div
              className={`event-modal-layout${imageFailed ? '' : ' has-event-image'}`}
              style={{ pointerEvents: 'auto' }}
            >
              {!imageFailed && (
                <div className="event-image-window">
                  <img
                    src={imagePath}
                    alt={card.title}
                    onError={() => setImageFailed(true)}
                  />
                </div>
              )}

              <div className="event-details-window">
                <div>
                  <div className="is-flex is-justify-content-space-between is-align-items-center mb-3">
                    <span className={`tag ${isMandatory ? 'is-danger' : 'is-info'} is-light`}>
                      {isMandatory ? 'Mandatory event' : 'Optional event'}
                    </span>
                  </div>

                  <h3 className="title is-4 has-text-white mb-3">{card.title}</h3>
                  <p className="is-size-6 has-text-grey-lighter">
                    {selectedOption?.description ?? card.description}
                  </p>
                  {selectedOption && (
                    <button
                      className="button is-text is-small has-text-grey-light mt-2"
                      onClick={resetOption}
                    >
                      Choose a different option
                    </button>
                  )}
                </div>

                {renderSettlement()}

                {error && (
                  <p className="has-text-danger is-size-7 mt-2" role="alert">
                    {error}
                  </p>
                )}
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
}
