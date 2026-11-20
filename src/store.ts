import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import eventLive from './game/events/eventLive.json';

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
}

export type SavingsTransferResult =
  | 'success'
  | 'same-bucket'
  | 'invalid-amount'
  | 'insufficient-funds';

const STEP = 5;
const START_AGE = 20;
const INITIAL_MONTHLY_INCOME = 3000;
const INITIAL_SPOUSE_MONTHLY_INCOME = 3000;
const SAVING_EVENT_AMOUNT = 1000;

function randomMonthlyFixedExpenses(householdIncome: number) {
  const percentage = 20 + Math.floor(Math.random() * 26);
  return Math.round(householdIncome * (percentage / 100));
}

function getRandomMandatoryEvent(events: GameEvent[], age: number) {
  const eligibleEvents = events.filter((event) => event.age === age);
  const randomIndex = Math.floor(Math.random() * eligibleEvents.length);
  return eligibleEvents[randomIndex] ?? null;
}


export const useGameStore = create<GameState>()(
  subscribeWithSelector(
    immer((set) => {
      const allEvents: GameEvent[] = eventLive.map((event, id) => ({ ...event, id }));
      const eventsMandatory = allEvents.filter((event) => event.isMandatory);
      const eventsOptional = allEvents.filter((event) => !event.isMandatory);
      const initialMandatoryEvent = getRandomMandatoryEvent(eventsMandatory, START_AGE);

      return{
      age: 20,
      retirementAge: 65,
      psyche: 100,
      monthlyIncome: INITIAL_MONTHLY_INCOME,
      spouseMonthlyIncome: INITIAL_SPOUSE_MONTHLY_INCOME,
      monthlyFixedExpenses: randomMonthlyFixedExpenses(
        INITIAL_MONTHLY_INCOME + INITIAL_SPOUSE_MONTHLY_INCOME
      ),
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
      },
      eventsMandatory: eventsMandatory,
      eventsOptional: eventsOptional,
      isMandatoryEventResolved: initialMandatoryEvent === null,
      turnEvents: {
        mandatory: initialMandatoryEvent,
        optional: eventsOptional.filter((event) => event.age === START_AGE),
      },
      incrementProp: (propName, amount = 1) =>
        set((state) => {
          state.roomProps[propName] += amount;
        }),
      resolveMandatoryEvent: (eventId) => {
        let resolved = false;

        set((state) => {
          const event = state.turnEvents.mandatory;
          if (!event || event.id !== eventId || state.isMandatoryEventResolved) return;

          for (const prop of Object.keys(event.effect.roomPropsChange) as (keyof RoomProps)[]) {
            state.roomProps[prop] = Math.max(
              0,
              state.roomProps[prop] + (event.effect.roomPropsChange[prop] ?? 0)
            );
          }

          for (const bucket of Object.keys(event.effect.savingChange) as (keyof SavingsBuckets)[]) {
            const change = Math.round(
              (event.effect.savingChange[bucket] ?? 0) * SAVING_EVENT_AMOUNT
            );
            state.savings[bucket] += change;
          }

          state.isMandatoryEventResolved = true;
          resolved = true;
        });

        return resolved;
      },
      updatePsyche: (value) =>
        set((state) => {
          state.psyche = Math.max(0, Math.min(100, value));
        }),
      updateMonthlyInvestment: (amount) =>
        set((state) => {
          const availableAfterFixedExpenses =
            state.monthlyIncome + state.spouseMonthlyIncome - state.monthlyFixedExpenses;
          state.monthlyInvestment = Math.max(0, Math.min(availableAfterFixedExpenses, amount));
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
        return state.age < state.retirementAge && state.isMandatoryEventResolved;
      },
      advanceTurn: () =>
        set((state) => {
          if (state.age >= state.retirementAge || !state.isMandatoryEventResolved) return;

          // Przykład naliczenia za 1 rok (12 miesięcy)
          const yearlyIncome = state.monthlyInvestment * 12 * STEP;
          const addedSock = yearlyIncome * (state.strategy.sock / 100);
          const addedAccount = yearlyIncome * (state.strategy.account / 100);
          const addedStocks = yearlyIncome * (state.strategy.stocks / 100);
          const householdIncome = state.monthlyIncome + state.spouseMonthlyIncome;
          const monthlyFixedExpenses = randomMonthlyFixedExpenses(householdIncome);
          const availableAfterFixedExpenses = householdIncome - monthlyFixedExpenses;
          const age = Math.min(state.retirementAge, state.age + STEP)
          const mandatoryEvent = getRandomMandatoryEvent(state.eventsMandatory, age);

          return {
            age,
            monthlyFixedExpenses,
            monthlyInvestment: Math.min(state.monthlyInvestment, availableAfterFixedExpenses),
            savings: {
              sock: Math.round(state.savings.sock + addedSock),
              account: Math.round((state.savings.account + addedAccount) * 1.04), // +4% odsetek
              stocks: Math.round((state.savings.stocks + addedStocks) * 1.08),   // +8% zwrotu
            },
            isMandatoryEventResolved: mandatoryEvent === null,
            turnEvents: {
              mandatory: mandatoryEvent,
              optional: state.eventsOptional.filter((event) => event.age === age),
            },
          };
        }),
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
    }})
  )
);

