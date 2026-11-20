interface RetirementProgressProps {
  age: number;
  retirementAge: number;
}

export function RetirementProgress({
  age,
  retirementAge,
}: RetirementProgressProps) {
  const startAge = 20;
  const careerProgress = Math.max(0, age - startAge);
  const careerTotal = retirementAge - startAge;

  return (
    <progress
      className="progress is-primary is-small mb-2"
      value={careerProgress}
      max={careerTotal}
      style={{ height: '6px', borderRadius: '4px' }}
      title={`Droga do emerytury: ${age} / ${retirementAge} lat`}
    />
  );
}