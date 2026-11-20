import { useGameStore } from '../../../store';
import { formatPLN } from './formatPLN';
import { RetirementProgress } from './components/RetirementProgress';
import { SavingsDropdown } from './components/SavingsDropdown';

export function TopHud() {
  const age = useGameStore((s) => s.age);
  const retirementAge = useGameStore((s) => s.retirementAge);
  const monthlyIncome = useGameStore((s) => s.monthlyIncome);

  return (
    <div style={{ pointerEvents: 'auto', width: '100%', position: 'absolute', top: 0, left: 0, padding: '10px 20px' }}>
      {/* POZIOM 1: Cienki pasek postępu do emerytury na samej górze */}
      <RetirementProgress age={age} retirementAge={retirementAge} />

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
          <SavingsDropdown />

        </div>
      </div>
    </div>
  );
}