import { useState } from 'react';
import { StockMarketModal } from './StockMarketModal';

export function StockMarketButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="level-item">
      <button
        className="button is-info is-small"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
      >
        Stock market
      </button>
      {isOpen && <StockMarketModal onClose={() => setIsOpen(false)} />}
    </div>
  );
}
