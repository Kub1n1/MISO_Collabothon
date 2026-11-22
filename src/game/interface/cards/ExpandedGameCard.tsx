import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { MandatoryEventSettlement, SavingsBuckets } from '../../../store/types';
import type { GameCardProps } from './GameCard.types';
import { EventSettlement } from './EventSettlement';
import { useGameStore } from '../../../store/store';
import { getMaximumAffordableLoan } from '../../../store/financialStore';

const EMPTY_SAVINGS_PAYMENT: SavingsBuckets = {
  sock: 0,
  account: 0,
  stocks: 0,
};

export function ExpandedGameCard({
  card,
  isMandatory,
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
    setLoanAmount(
      requiredPayment -
        (defaultPayment.sock + defaultPayment.account + defaultPayment.stocks)
    );
  }, [card.id, eventAmount, maxLoan, requiredPayment, savings, selectedOptionIndex]);

  const submit = (settlement: MandatoryEventSettlement) => {
    const succeeded = onPlay(card, selectedOptionIndex, settlement);
    if (!succeeded) {
      setError('This selection could not be applied. Check the amounts and try again.');
    } else {
      setError(null);
    }
  };

  const updateSavingsPayment = (
    bucket: keyof SavingsBuckets,
    value: number
  ) => {
    const nextPayment = {
      ...savingsPayment,
      [bucket]: Math.max(
        0,
        Math.min(Math.floor(value || 0), Math.max(0, savings[bucket]))
      ),
    };
    setSavingsPayment(nextPayment);
    const nextTotal = nextPayment.sock + nextPayment.account + nextPayment.stocks;
    setLoanAmount(Math.max(0, requiredPayment - nextTotal));
    setError(null);
  };

  const resetOption = () => {
    setSelectedOptionIndex(null);
    setError(null);
  };

  return createPortal(
    <>
      <div className="card-backdrop" style={{ pointerEvents: 'auto' }} />
      <div
        className={`event-modal-layout${imageFailed ? '' : ' has-event-image'}`}
        style={{ pointerEvents: 'auto' }}
      >
        {!imageFailed && (
          <div className="event-image-window">
            <img
              src={`/assets/eventy/${card.eventId}.png`}
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

          <EventSettlement
            card={card}
            isMandatory={isMandatory}
            selectedOptionIndex={selectedOptionIndex}
            effect={effect}
            eventAmount={eventAmount}
            requiredPayment={requiredPayment}
            maxAvailable={maxAvailable}
            savings={savings}
            savingsPayment={savingsPayment}
            loanAmount={loanAmount}
            maxLoan={maxLoan}
            paymentIsValid={paymentIsValid}
            totalSavingsPayment={totalSavingsPayment}
            onSelectOption={(index) => {
              setSelectedOptionIndex(index);
              setError(null);
            }}
            onUpdateSavings={updateSavingsPayment}
            onSetSavings={(payment) => setSavingsPayment(payment)}
            onUpdateLoan={(amount) => {
              setLoanAmount(amount);
              setError(null);
            }}
            onSetError={setError}
            onSubmit={submit}
          />

          {error && (
            <p className="has-text-danger is-size-7 mt-2" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}
