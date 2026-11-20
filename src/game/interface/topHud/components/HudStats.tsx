import { useState } from 'react';
import { SalaryDropdown } from './SalaryDropdown';
import { SavingsDropdown } from './SavingsDropdown';
import { FinancialSnapshot } from './FinancialSnapshot';
import { PsycheStat } from './PsycheStat';
import { StockMarketButton } from './StockMarketButton';

interface HudStatsProps {
  age: number;
  retirementAge: number;
}

export function HudStats({
  age,
  retirementAge,
}: HudStatsProps) {
  const [openDropdown, setOpenDropdown] = useState<'salary' | 'savings' | null>(null);

  const toggleDropdown = (dropdown: 'salary' | 'savings') => {
    setOpenDropdown((current) => (current === dropdown ? null : dropdown));
  };

  return (
    <div className="level is-mobile" style={{ alignItems: 'flex-start' }}>
      <div className="level-left" style={{ alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
          <div className="tags has-addons are-medium">
            <span className="tag is-dark">Age</span>
            <span className="tag is-primary has-text-weight-bold">
              {age} / {retirementAge} years
            </span>
          </div>
          <PsycheStat />
          <FinancialSnapshot />
        </div>
      </div>

      <div className="level-right" style={{ gap: '0.75rem' }}>
        <SalaryDropdown
          isOpen={openDropdown === 'salary'}
          onToggle={() => toggleDropdown('salary')}
          onClose={() => setOpenDropdown(null)}
        />
        <SavingsDropdown
          isOpen={openDropdown === 'savings'}
          onToggle={() => toggleDropdown('savings')}
          onClose={() => setOpenDropdown(null)}
        />
        <StockMarketButton />
      </div>
    </div>
  );
}