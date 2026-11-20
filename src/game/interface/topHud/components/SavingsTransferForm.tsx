import { useState } from 'react';
import { useGameStore } from '../../../../store';
import type {
  SavingsBuckets,
  SavingsTransferResult,
} from '../../../../store';
import { formatPLN } from '../formatPLN';
import { strategyOptions } from '../strategyOptions';

type SavingsBucket = keyof SavingsBuckets;

const transferMessages: Record<SavingsTransferResult, string> = {
  success: 'Funds transferred.',
  'same-bucket': 'Choose two different savings options.',
  'invalid-amount': 'Enter a whole amount greater than zero.',
  'insufficient-funds': 'Not enough funds in the selected source.',
};

export function SavingsTransferForm() {
  const [from, setFrom] = useState<SavingsBucket>('sock');
  const [to, setTo] = useState<SavingsBucket>('account');
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState<SavingsTransferResult | null>(null);

  const savings = useGameStore((state) => state.savings);
  const transferSavings = useGameStore((state) => state.transferSavings);
  const sourceBalance = savings[from];

  const handleTransfer = () => {
    const transferResult = transferSavings(from, to, Number(amount));
    setResult(transferResult);

    if (transferResult === 'success') {
      setAmount('');
    }
  };

  return (
    <div
      className="mt-4 pt-3"
      style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
    >
      <h4 className="has-text-weight-semibold is-size-7 has-text-white mb-2">
        Transfer funds
      </h4>

      <div className="columns is-mobile">
        <div className="column">
          <label className="label is-size-7 has-text-grey-lighter">From</label>
          <div className="select is-fullwidth">
            <select
              value={from}
              onChange={(event) => {
                const option = strategyOptions.find(
                  (item) => item.key === event.target.value
                );
                if (option) {
                  setFrom(option.key);
                  setResult(null);
                }
              }}
            >
              {strategyOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="column">
          <label className="label is-size-7 has-text-grey-lighter">To</label>
          <div className="select is-fullwidth">
            <select
              value={to}
              onChange={(event) => {
                const option = strategyOptions.find(
                  (item) => item.key === event.target.value
                );
                if (option) {
                  setTo(option.key);
                  setResult(null);
                }
              }}
            >
              {strategyOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <label className="label is-size-7 has-text-grey-lighter">
        Amount (PLN)
      </label>
      <input
        className="input"
        type="number"
        min={1}
        max={sourceBalance}
        step={1}
        value={amount}
        onChange={(event) => {
          setAmount(event.target.value);
          setResult(null);
        }}
      />
      <p className="help has-text-grey-light">
        Available: {formatPLN(sourceBalance)}
      </p>

      <button
        type="button"
        className="button is-primary is-small is-fullwidth mt-2"
        onClick={handleTransfer}
      >
        Transfer
      </button>

      {result && (
        <p
          className={`help ${result === 'success' ? 'is-success' : 'is-danger'}`}
          role={result === 'success' ? 'status' : 'alert'}
        >
          {transferMessages[result]}
        </p>
      )}
    </div>
  );
}