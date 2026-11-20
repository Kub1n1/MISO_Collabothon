import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import EventManager from './game/events/eventManager';

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

export interface Event{
  age: number;
  title: string;
  description: string;
  effect: {
    roomPropsChange: RoomProps;
    savingChange: SavingsBuckets;
  };
}

export interface TurnEvents {
  mandatory: Event; 
  optional: Event[];
}

export interface GameState {
  age: number;
  retirementAge: number;
  monthlyIncome: number;
  spouseMonthlyIncome: number;
  monthlyInvestment: number;
  savings: SavingsBuckets;
  strategy: SavingsStrategy;
  roomProps: RoomProps;
  incrementProp: (propName: keyof RoomProps, amount?: number) => void;
  updateMonthlyInvestment: (amount: number) => void;
  updateStrategy: (bucket: keyof SavingsStrategy, percent: number) => void;
  advanceTurn: () => void; 
  isNextTurnAvailable: () => boolean;
  getEventForTurn: (age: number) => TurnEvents;
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

const STEP = 5;


export const useGameStore = create<GameState>()(
  subscribeWithSelector(
    immer((set) => ({
      age: 25,
      retirementAge: 65,
      monthlyIncome: 3000,
      spouseMonthlyIncome: 3000,
      monthlyInvestment: 3000,
      savings: {
        sock: 0,
        account: 0,
        stocks: 0,
      },
      strategy: {
        sock: 10,
        account: 15,
        stocks: 5,
      },
      roomProps: {
        wall: 0,
        floor: 0,
        tv: 0,
        window: 0,
        car: 0,
        couch: 0,
        player: 0,
      },
      incrementProp: (propName, amount = 1) =>
        set((state) => {
          state.roomProps[propName] += amount;
        }),
      updateMonthlyInvestment: (amount) =>
        set((state) => {
          const householdIncome = state.monthlyIncome + state.spouseMonthlyIncome;
          state.monthlyInvestment = Math.max(0, Math.min(householdIncome, amount));
        }),
      updateStrategy: (bucket, percent) =>
        set((state) => ({
          strategy: {
            ...state.strategy,
            [bucket]: Math.max(0, Math.min(100, percent)),
          },
        })),
      isNextTurnAvailable: () => {
        const state = useGameStore.getState() as GameState;
        return state.age < state.retirementAge;
      },
      advanceTurn: () =>
        set((state) => {
          // Przykład naliczenia za 1 rok (12 miesięcy)
          const yearlyIncome = state.monthlyInvestment * 12 * STEP;
          const addedSock = yearlyIncome * (state.strategy.sock / 100);
          const addedAccount = yearlyIncome * (state.strategy.account / 100);
          const addedStocks = yearlyIncome * (state.strategy.stocks / 100);

          return {
            age: Math.min(state.retirementAge, state.age + STEP),
            savings: {
              sock: Math.round(state.savings.sock + addedSock),
              account: Math.round((state.savings.account + addedAccount) * 1.04), // +4% odsetek
              stocks: Math.round((state.savings.stocks + addedStocks) * 1.08),   // +8% zwrotu
            },
          };
        }),
      getEventForTurn: (age: number) => {
        return { 
          mandatory: EventManager.getEventForTurn(age), 
          optional: [] 
        } as TurnEvents;
      }
    })),
    
      transferSavings: (from, to, amount): SavingsTransferResult => {
        if (from === to) return 'same-bucket';
        if (!Number.isInteger(amount) || amount <= 0) return 'invalid-amount';

        let result: SavingsTransferResult = 'success';

        set((state) => {
          if (state.savings[from] < amount) {
            result = 'insufficient-funds';
            return;
          }

          state.savings[from] -= amount;
          state.savings[to] += amount;
        });

        return result;
      },
    }))
  )
);

