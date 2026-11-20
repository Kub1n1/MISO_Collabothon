import { useState } from 'react';
import { SavingsStrategy, useGameStore } from '../../../store';
import { formatPLN } from './formatPLN';


export function TopHud() {
  const [isWalletOpen, setIsWalletOpen] = useState(false);

  const age = useGameStore((s) => s.age);
  const retirementAge = useGameStore((s) => s.retirementAge);
  const monthlyIncome = useGameStore((s) => s.monthlyIncome);
  const savings = useGameStore((s) => s.savings);
  const strategy = useGameStore((s) => s.strategy);
  const updateStrategy = useGameStore((s) => s.updateStrategy);

  // Obliczenia pomocnicze
  const startAge = 20;
  const careerProgress = Math.max(0, age - startAge);
  const careerTotal = retirementAge - startAge;

  const totalSavings = savings.sock + savings.account + savings.stocks;
  const totalSavedPercent = strategy.sock + strategy.account + strategy.stocks;
  const isOverBudget = totalSavedPercent > 100;

  const strategyRows: {
    key: keyof SavingsStrategy;
    label: string;
    hint: string;
    colorClass: string;
  }[] = [
    {
      key: 'sock',
      label: 'Skarpeta',
      hint: '0% zysku • Zawsze pod ręką',
      colorClass: 'is-warning',
    },
    {
      key: 'account',
      label: 'Konto oszczędnościowe',
      hint: '~4% rocznie • Bezpieczne',
      colorClass: 'is-info',
    },
    {
      key: 'stocks',
      label: 'Akcje i obligacje',
      hint: '~8% rocznie • Wahania rynku',
      colorClass: 'is-success',
    },
  ];

  return (
    <div style={{ pointerEvents: 'auto', width: '100%', position: 'absolute', top: 0, left: 0, padding: '10px 20px' }}>
      {/* POZIOM 1: Cienki pasek postępu do emerytury na samej górze */}
      <progress
        className="progress is-primary is-small mb-2"
        value={careerProgress}
        max={careerTotal}
        style={{ height: '6px', borderRadius: '4px' }}
        title={`Droga do emerytury: ${age} / ${retirementAge} lat`}
      />

      {/* POZIOM 1: Pigułki z kluczowymi liczbami (Bulma Level) */}
      <div className="level is-mobile">
        {/* Lewa strona: Wiek i etap życia */}
        <div className="level-left">
          <div className="level-item">
            <div className="tags has-addons are-medium">
              <span className="tag is-dark">Wiek</span>
              <span className="tag is-primary has-text-weight-bold">
                {age} / {retirementAge} lat
              </span>
            </div>
          </div>
        </div>

        {/* Prawa strona: Wypłata + Klikalne Oszczędności */}
        <div className="level-right" style={{ gap: '0.75rem' }}>
          {/* Pigułka z miesięczną wypłatą */}
          <div className="level-item">
            <div className="tags has-addons are-medium">
              <span className="tag is-dark">Wypłata</span>
              <span className="tag is-light has-text-weight-semibold">
                {formatPLN(monthlyIncome)} / mies.
              </span>
            </div>
          </div>

          {/* Dropdown Bulmy dla Oszczędności i Strategii */}
          <div className="level-item">
            <div className={`dropdown is-right ${isWalletOpen ? 'is-active' : ''}`}>
              <div className="dropdown-trigger">
                <button
                  className="button is-dark is-small"
                  aria-haspopup="true"
                  aria-controls="savings-menu"
                  onClick={() => setIsWalletOpen((prev) => !prev)}
                  style={{
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    height: '2rem',
                  }}
                >
                  <span className="has-text-grey-light mr-2">Oszczędności:</span>
                  <span className="has-text-success has-text-weight-bold mr-2">
                    {formatPLN(totalSavings)}
                  </span>
                  <span className="tag is-success is-light is-rounded mr-1">
                    {totalSavedPercent}% dochodu
                  </span>
                  <span>{isWalletOpen ? '▴' : '▾'}</span>
                </button>
              </div>

              {/* POZIOM 2: Rozwijany portfel i suwaki strategii na kolejną turę */}
              <div
                className="dropdown-menu"
                id="savings-menu"
                role="menu"
                style={{ width: '360px' }}
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
                      Portfel i strategia oszczędzania
                    </span>
                    <button
                      className="delete is-small"
                      onClick={() => setIsWalletOpen(false)}
                    />
                  </div>

                  {/* Lista 3 form oszczędzania */}
                  {strategyRows.map((row) => {
                    const currentBalance = savings[row.key];
                    const percent = strategy[row.key];
                    const monthlyContribution = Math.round(
                      monthlyIncome * (percent / 100)
                    );

                    return (
                      <div key={row.key} className="mb-3 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="is-flex is-justify-content-space-between is-align-items-baseline">
                          <span className="has-text-weight-semibold is-size-7 has-text-white">
                            {row.label}
                          </span>
                          <span className="has-text-weight-bold is-size-7 has-text-success">
                            {formatPLN(currentBalance)}
                          </span>
                        </div>

                        <p className="is-size-7 has-text-grey mb-1">{row.hint}</p>

                        {/* Suwak alokacji procentowej */}
                        <div className="is-flex is-align-items-center" style={{ gap: '0.6rem' }}>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            step={5}
                            value={percent}
                            onChange={(e) =>
                              updateStrategy(row.key, Number(e.target.value))
                            }
                            style={{ flexGrow: 1, cursor: 'pointer' }}
                          />
                          <span className={`tag ${row.colorClass} is-light`} style={{ minWidth: '48px' }}>
                            {percent}%
                          </span>
                        </div>

                        <div className="has-text-right is-size-7 has-text-grey-light">
                          Odkładasz: +{formatPLN(monthlyContribution)} / mies.
                        </div>
                      </div>
                    );
                  })}

                  {/* Podsumowanie budżetu domowego */}
                  {isOverBudget ? (
                    <div className="notification is-danger is-light is-size-7 p-2 mb-0">
                      Przekroczono 100% wypłaty ({totalSavedPercent}%)! Zmniejsz któryś cel, żeby mieć za co żyć.
                    </div>
                  ) : (
                    <div className="is-flex is-justify-content-space-between is-size-7 pt-1">
                      <span className="has-text-grey-light">Na bieżące życie zostaje:</span>
                      <span className="has-text-white has-text-weight-bold">
                        {100 - totalSavedPercent}% ({formatPLN(monthlyIncome * ((100 - totalSavedPercent) / 100))})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}