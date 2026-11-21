
export const STOCK_SYMBOLS = ['TESLA', 'MICROSOFT', 'NVIDIA'] as const;
export type StockSymbol = (typeof STOCK_SYMBOLS)[number];
export type StockTradeAction = 'buy' | 'sell';
export type StockTradeResult =
  | 'success'
  | 'already-traded'
  | 'invalid-quantity'
  | 'insufficient-funds'
  | 'insufficient-shares';



export interface StockMarketState {
  prices: Record<StockSymbol, number>;
  history: Record<StockSymbol, number[]>;
  lastChangePercent: Record<StockSymbol, number>;
  holdings: Record<StockSymbol, number>;
  costBasis: Record<StockSymbol, number>;
  realizedProfit: number;
  tradeUsedThisMove: boolean;
  moveCount: number;
}

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

export type EventBackground = 1 | 2;

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
  background?: EventBackground;
  effect?: GameEventEffect;
  options?: GameEventOption[];
}

export interface TurnEvents {
  mandatory: GameEvent | null;
  optional: GameEvent[];
  resolvedOptionalEventIds: number[];
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
  activeBackground: EventBackground;
  savings: SavingsBuckets;
  strategy: SavingsStrategy;
  family: FamilyState;
  stockMarket: StockMarketState;
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
  tradeStock: (
    symbol: StockSymbol,
    action: StockTradeAction,
    quantity: number
  ) => StockTradeResult;
  advanceTurn: () => void; 
  isNextTurnAvailable: () => boolean;
  canAdvanceTurn: () => boolean;
  transferSavings: (
    from: keyof SavingsBuckets,
    to: keyof SavingsBuckets,
    amount: number
  ) => SavingsTransferResult;
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
