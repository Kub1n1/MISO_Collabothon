import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  getAvailableStockFunds,
  STOCK_SYMBOLS,
  useGameStore,
} from '../../../../store';
import type {
  StockSymbol,
  StockTradeAction,
  StockTradeResult,
} from '../../../../store';
import { formatPLN } from '../formatPLN';

const STOCK_INFO: Record<StockSymbol, { name: string; color: string }> = {
  TESLA: { name: 'Tesla', color: '#ff3860' },
  MICROSOFT: { name: 'Microsoft', color: '#48c78e' },
  NVIDIA: { name: 'NVIDIA', color: '#a78bfa' },
};

// Teraz giełda uwzględnia dostępne środki ze wszystkich trzech koszyków i pobiera je kolejno: skarpetka, konto, inwestycje. Kwota „Available funds” w modalu używa tej samej logiki. Przycisk nadal będzie nieaktywny, jeśli łączne dostępne saldo nie pokrywa ceny albo w tym ruchu wykonano już transakcję.

const TRADE_MESSAGES: Record<StockTradeResult, string> = {
  success: 'Trade completed.',
  'already-traded': 'You have already traded this move. Try again after Next move.',
  'invalid-quantity': 'Enter a whole number of shares greater than zero.',
  'insufficient-funds': 'Not enough available savings to complete this purchase.',
  'insufficient-shares': 'You do not own enough shares to complete this sale.',
};

function StockPriceChart({ prices, color }: { prices: number[]; color: string }) {
  const width = 720;
  const height = 220;
  const padding = 24;
  const minimum = Math.min(...prices);
  const maximum = Math.max(...prices);
  const range = Math.max(1, maximum - minimum);
  const points = prices
    .map((price, index) => {
      const x = padding + (index / Math.max(1, prices.length - 1)) * (width - padding * 2);
      const y = height - padding - ((price - minimum) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');
  const allPoints = points.split(' ');
  const lastPoint = allPoints[allPoints.length - 1]?.split(',') ?? ['0', '0'];

  return (
    <div className="p-3" style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Approximate stock price history"
        style={{ display: 'block', width: '100%', height: '220px' }}
      >
        {[0, 1, 2, 3].map((line) => {
          const y = padding + (line / 3) * (height - padding * 2);
          return (
            <line
              key={line}
              x1={padding}
              x2={width - padding}
              y1={y}
              y2={y}
              stroke="rgba(255,255,255,0.12)"
              strokeDasharray="4 6"
            />
          );
        })}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx={lastPoint[0]}
          cy={lastPoint[1]}
          r="6"
          fill={color}
          stroke="#fff"
          strokeWidth="2"
        />
      </svg>
      <div className="is-flex is-justify-content-space-between is-size-7 has-text-grey-light">
        <span>Earlier</span>
        <span>Current move</span>
      </div>
    </div>
  );
}

interface StockMarketModalProps {
  onClose: () => void;
}

export function StockMarketModal({ onClose }: StockMarketModalProps) {
  const [selectedStock, setSelectedStock] = useState<StockSymbol>('TESLA');
  const [quantityInput, setQuantityInput] = useState('1');
  const [tradeMessage, setTradeMessage] = useState<{
    type: 'success' | 'danger';
    text: string;
  } | null>(null);

  const stockMarket = useGameStore((state) => state.stockMarket);
  const availableFunds = useGameStore((state) => getAvailableStockFunds(state.savings));
  const age = useGameStore((state) => state.age);
  const tradeStock = useGameStore((state) => state.tradeStock);

  useEffect(() => {
    setTradeMessage(null);
  }, [age]);

  const stock = STOCK_INFO[selectedStock];
  const price = stockMarket.prices[selectedStock];
  const ownedShares = stockMarket.holdings[selectedStock];
  const quantity = Number(quantityInput);
  const isValidQuantity = Number.isInteger(quantity) && quantity > 0;
  const buyTotal = isValidQuantity ? price * quantity : 0;
  const sellTotal = isValidQuantity ? price * quantity : 0;
  const canBuy =
    !stockMarket.tradeUsedThisMove && isValidQuantity && availableFunds >= buyTotal;
  const canSell =
    !stockMarket.tradeUsedThisMove && isValidQuantity && ownedShares >= quantity;
  const changePercent = stockMarket.lastChangePercent[selectedStock];
  const changeText =
    stockMarket.moveCount === 0
      ? 'No move yet'
      : `${changePercent > 0 ? '+' : ''}${changePercent.toFixed(1)}% since last Next move`;

  const handleTrade = (action: StockTradeAction) => {
    const result = tradeStock(selectedStock, action, quantity);
    setTradeMessage({
      type: result === 'success' ? 'success' : 'danger',
      text: TRADE_MESSAGES[result],
    });
  };

  return createPortal(
    <div
      className="modal is-active"
      role="dialog"
      aria-modal="true"
      aria-label="Stock market"
      style={{ zIndex: 200 }}
    >
      <div className="modal-background" onClick={onClose} />
      <div
        className="modal-card"
        style={{
          width: 'min(900px, calc(100vw - 32px))',
          maxHeight: 'calc(100vh - 32px)',
          overflow: 'hidden',
        }}
      >
        <header className="modal-card-head has-background-dark">
          <p className="modal-card-title has-text-white">Stock market</p>
          <button className="delete" aria-label="Close" onClick={onClose} />
        </header>

        <section
          className="modal-card-body has-background-dark has-text-light"
          style={{ overflowY: 'auto' }}
        >
          <div className="buttons has-addons mb-4" role="tablist" aria-label="Stocks">
            {STOCK_SYMBOLS.map((symbol) => (
              <button
                key={symbol}
                className={`button ${selectedStock === symbol ? 'is-primary' : 'is-dark'}`}
                role="tab"
                aria-selected={selectedStock === symbol}
                onClick={() => {
                  setSelectedStock(symbol);
                  setTradeMessage(null);
                }}
              >
                {symbol}
              </button>
            ))}
          </div>

          <div className="is-flex is-justify-content-space-between is-align-items-center mb-3">
            <div>
              <p className="has-text-grey-light is-size-7">Current price</p>
              <p className="title is-4 has-text-white mb-0">{formatPLN(price)}</p>
            </div>
            <div className="has-text-right">
              <p className="has-text-grey-light is-size-7">Change since last Next move</p>
              <p
                className={`has-text-weight-bold ${changePercent >= 0 ? 'has-text-success' : 'has-text-danger'}`}
              >
                {changeText}
              </p>
            </div>
          </div>

          <StockPriceChart prices={stockMarket.history[selectedStock]} color={stock.color} />

          <div className="is-flex is-justify-content-space-between is-flex-wrap-wrap mt-3 mb-4 is-size-7">
            <span>
              Shares owned: <strong>{ownedShares}</strong>
            </span>
            <span>
              Position value: <strong>{formatPLN(price * ownedShares)}</strong>
            </span>
            <span>
              Available funds: <strong>{formatPLN(availableFunds)}</strong>
            </span>
          </div>

          <div className="columns is-vcentered mb-1">
            <div className="column is-narrow">
              <label className="label has-text-light mb-1" htmlFor="stock-quantity">
                Number of shares
              </label>
              <input
                id="stock-quantity"
                className="input"
                type="number"
                min={1}
                step={1}
                value={quantityInput}
                onChange={(event) => setQuantityInput(event.target.value)}
              />
            </div>
            <div className="column is-size-7 has-text-grey-light">
              Buy total: {formatPLN(buyTotal)} · Sell total: {formatPLN(sellTotal)}
            </div>
            <div className="column is-narrow">
              <div className="buttons mb-0">
                <button
                  className="button is-success"
                  disabled={!canBuy}
                  onClick={() => handleTrade('buy')}
                >
                  Buy
                </button>
                <button
                  className="button is-danger"
                  disabled={!canSell}
                  onClick={() => handleTrade('sell')}
                >
                  Sell
                </button>
              </div>
            </div>
          </div>

          {stockMarket.tradeUsedThisMove && (
            <div className="notification is-warning is-light is-size-7 p-2 mt-3 mb-2">
              One trade has already been made this move. Trading unlocks after Next move.
            </div>
          )}
          {tradeMessage && (
            <div className={`notification is-${tradeMessage.type} is-light is-size-7 p-2 mt-3 mb-0`}>
              {tradeMessage.text}
            </div>
          )}
        </section>
      </div>
    </div>,
    document.body
  );
}
