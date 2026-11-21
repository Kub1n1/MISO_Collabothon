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

export type EventRoomPropsSet = Partial<
  Pick<RoomProps, 'wall' | 'floor' | 'tv' | 'window' | 'car' | 'couch'>
>;

export interface GameEventEffect {
  roomPropsChange: EventRoomPropsChange;
  roomPropsSet?: EventRoomPropsSet;
  eventAmount: number;
  loan?: Loan | null;
}

export type EventBackground = 1 | 2;
export const SCENE_BACKGROUND_ASSETS = [
  'background_1.jpg',
  'background_2.jpg',
  'university.jpg',
  'work.jpg',
  'home_car.jpg',
  'home_modern_v1.jpg',
  'home_modern_v1_car.jpg',
  'home_modern_v2.jpg',
  'home_modern_v2_car.jpg',
  'bankrupt_man.jpg',
] as const;
export type SceneBackground = (typeof SCENE_BACKGROUND_ASSETS)[number];
export type GameEventBackground = number | SceneBackground;
export type HomeLevel = 0 | 1 | 2;

export interface GameEventRequirements {
  car?: number;
  maxCar?: number;
  home?: number;
}

export interface GameEventOption {
  name: string;
  description: string;
  psyche?: number;
  background?: GameEventBackground;
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
  background?: GameEventBackground;
  requires?: GameEventRequirements;
  effect?: GameEventEffect;
  options?: GameEventOption[];
}

export interface TurnEvents {
  mandatory: GameEvent | null;
  optional: GameEvent[];
  resolvedOptionalEventIds: number[];
}

export interface Loan {
  title: string;
  amount: number;
  monthlyRepayment: number;
  remainingMonths: number;
  monthlyRate: number;
}

export interface GameState {
  bootscreen: boolean;
  age: number;
  retirementAge: number;
  psyche: number;
  monthlyIncome: number;
  spouseMonthlyIncome: number;
  monthlyFixedExpenses: number;
  monthlyLoanRepayment: number;
  monthlyInvestment: number;
  activeBackground: SceneBackground;
  mandatoryBackground: EventBackground;
  homeLevel: HomeLevel;
  savings: SavingsBuckets;
  loans: Loan[];
  strategy: SavingsStrategy;
  family: FamilyState;
  roomProps: RoomProps;
  eventsMandatory: GameEvent[];
  eventsOptional: GameEvent[];
  turnEvents: TurnEvents;
  isMandatoryEventResolved: boolean;
  isGameOver: boolean;
  gameOverReason: string | null;
  isGameFinished: boolean;
  gameResult: GameResult | null;
  endLoading: () => void;
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
  canAdvanceTurn: () => boolean;
  transferSavings: (
    from: keyof SavingsBuckets,
    to: keyof SavingsBuckets,
    amount: number
  ) => SavingsTransferResult;
}

export interface GameResult {
  completedAt: string;
  savingsTotal: number;
  psyche: number;
  score: number;
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
