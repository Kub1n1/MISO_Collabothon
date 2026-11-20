import { useGameStore } from '../../../store';
import { RetirementProgress } from './components/RetirementProgress';
import { HudStats } from './components/HudStats';

export function TopHud() {
  const age = useGameStore((s) => s.age);
  const retirementAge = useGameStore((s) => s.retirementAge);
  const monthlyIncome = useGameStore((s) => s.monthlyIncome);

  return (
    <div style={{ pointerEvents: 'auto', width: '100%', position: 'absolute', top: 0, left: 0, padding: '10px 20px' }}>
      {/* POZIOM 1: Cienki pasek postępu do emerytury na samej górze */}
      <RetirementProgress age={age} retirementAge={retirementAge} />

      {/* POZIOM 1: Pigułki z kluczowymi liczbami (Bulma Level) */}
      <HudStats
        age={age}
        retirementAge={retirementAge}
        monthlyIncome={monthlyIncome}
      />

    </div>
  );
}