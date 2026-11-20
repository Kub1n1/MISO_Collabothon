export interface RoomProps {
    wall: number;
    floor: number;
    tv: number;
    window: number;
    car: number;
    couch: number;
}

export interface SavingsBuckets {
  sock: number;    
  account: number; 
  stocks: number;  
}

export interface SavingsStrategy {
  sock: number;    // np. 10 (%)
  account: number; // np. 15 (%)
  stocks: number;  // np. 5 (%)
}

export interface GameEvent {
  id: number;
  isMandatory: boolean;
  age: number;
  title: string;
  description: string;
  effect: {
    roomPropsChange: Partial<RoomProps>;
    savingChange: Partial<SavingsBuckets>;
  };
}

export interface TurnEvents {
  mandatory: GameEvent | null;
  optional: GameEvent[];
}

export interface GameState {
  age: number;
  retirementAge: number;
  psyche: number;
  monthlyIncome: number;
  spouseMonthlyIncome: number;
  monthlyFixedExpenses: number;
  monthlyInvestment: number;
  savings: SavingsBuckets;
  strategy: SavingsStrategy;
  roomProps: RoomProps;
  eventsMandatory: GameEvent[];
  eventsOptional: GameEvent[];
  turnEvents: TurnEvents;
  isMandatoryEventResolved: boolean;
  incrementProp: (propName: keyof RoomProps, amount?: number) => void;
  resolveMandatoryEvent: (eventId: number) => boolean;
  updatePsyche: (value: number) => void;
  updateMonthlyInvestment: (amount: number) => void;
  updateStrategy: (bucket: keyof SavingsStrategy, percent: number) => void;
  advanceTurn: () => void; 
  isNextTurnAvailable: () => boolean;
  transferSavings: (
    from: keyof SavingsBuckets,
    to: keyof SavingsBuckets,
    amount: number
  ) => SavingsTransferResult;
  canAdvanceTurn: () => boolean;
}

export type SavingsTransferResult =
  | 'success'
  | 'same-bucket'
  | 'invalid-amount'
  | 'insufficient-funds';
