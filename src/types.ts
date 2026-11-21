export interface RoomProps {
    wall: number;
    floor: number;
    tv: number;
    window: number;
    car: number;
    couch: number;
    player: number;
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

export interface FamilyState {
  wife: boolean;
  kid: boolean;
  spy: boolean;
}

export interface EventRoomPropsChange {
  wall?: number;
  floor?: number;
  tv?: number;
  window?: number;
  car?: number;
  couch?: number;
  wife?: number;
  kid?: number;
  spy?: number;
}

export interface GameEventEffect {
  roomPropsChange: EventRoomPropsChange;
  eventAmount: number;
}

export interface GameEventOption {
  name: string;
  description: string;
  psyche?: number;
  effect: GameEventEffect;
}

export interface GameEvent {
  id: number;
  eventId: string;
  age: number;
  income?: number;
  isMandatory: boolean;
  title: string;
  description: string;
  psyche?: number;
  effect?: GameEventEffect;
  options?: GameEventOption[];
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
  monthlyLoanRepayment: number;
  monthlyInvestment: number;
  savings: SavingsBuckets;
  strategy: SavingsStrategy;
  family: FamilyState;
  roomProps: RoomProps;
  eventsMandatory: GameEvent[];
  eventsOptional: GameEvent[];
  turnEvents: TurnEvents;
  isMandatoryEventResolved: boolean;
  isGameOver: boolean;
  gameOverReason: string | null;
  incrementProp: (propName: keyof RoomProps, amount?: number) => void;
  resolveMandatoryEvent: (
    eventId: number,
    optionIndex: number | null,
    settlement: MandatoryEventSettlement
  ) => boolean;
  resolveOptionalEvent: (
    eventId: number,
    optionIndex: number | null,
    settlement: MandatoryEventSettlement
  ) => boolean;
  dismissOptionalEvent: (eventId: number) => void;
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

export type MandatoryEventSettlement =
  | { kind: 'no-payment' }
  | {
      kind: 'pay';
      savings: Partial<SavingsBuckets>;
      loanAmount: number;
    }
  | { kind: 'save-to-sock' }
  | { kind: 'entertainment' };
