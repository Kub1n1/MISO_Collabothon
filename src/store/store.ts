import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
  SavingsTransferResult,
  type GameState,
} from './types';
import { canAdvanceTurn, createAdvanceTurn, isNextTurnAvailable } from './turnStore';
import { INITIAL_MONTHLY_INCOME, START_AGE } from "./const";
import { createResolveEvent, eventsMandatory, eventsOptional, getRandomOptionalEvents, initialMandatoryEvent, initialMonthlyFixedExpenses } from './eventStore';
import { rebalanceStrategy } from './financialStore';

export const useGameStore = create<GameState>()(
  subscribeWithSelector(
    immer((set) => {
      const resolveEvent = createResolveEvent(set);

      return{
      bootscreen: true,
      age: 20,
      retirementAge: 65,
      psyche: 70,
      monthlyIncome: INITIAL_MONTHLY_INCOME,
      spouseMonthlyIncome: 0,
      monthlyFixedExpenses: initialMonthlyFixedExpenses,
      monthlyLoanRepayment: 0,
      monthlyInvestment: 0,
      activeBackground: 'background_1.jpg',
      mandatoryBackground: 1,
      homeLevel: 0,
      savings: {
        sock: 5000,
        account: 0,
        stocks: 0,
      },
      loans: [],
      strategy: {
        sock: 33,
        account: 50,
        stocks: 17,
      },
      family: {
        wife: false,
        kid: false,
        spy: false,
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
      eventsMandatory: eventsMandatory,
      eventsOptional: eventsOptional,
      isMandatoryEventResolved: initialMandatoryEvent === null,
      isGameOver: false,
      gameOverReason: null,
      isGameFinished: false,
      gameResult: null,
      turnEvents: {
        mandatory: initialMandatoryEvent,
        optional: getRandomOptionalEvents(eventsOptional, START_AGE, 0, 0),
        resolvedOptionalEventIds: [],
      },
      endLoading: () =>
        set((state) => {
          state.bootscreen = false;
        }),
      incrementProp: (propName, amount = 1) =>
        set((state) => {
          state.roomProps[propName] += amount;
        }),
      resolveMandatoryEvent: (eventId, optionIndex, settlement) =>
        resolveEvent(eventId, optionIndex, settlement, true),
      resolveOptionalEvent: (eventId, optionIndex, settlement) =>
        resolveEvent(eventId, optionIndex, settlement, false),
      dismissOptionalEvent: (eventId) =>
        set((state) => {
          state.turnEvents.optional = state.turnEvents.optional.filter(
            (event) => event.id !== eventId
          );
        }),
      updatePsyche: (value) =>
        set((state) => {
          state.psyche = Math.max(0, Math.min(100, value));
        }),
      updateMonthlyInvestment: (amount) =>
        set((state) => {
          const availableAfterFixedExpenses =
            state.monthlyIncome + state.spouseMonthlyIncome -
            state.monthlyFixedExpenses - state.monthlyLoanRepayment;
          state.monthlyInvestment = Math.max(0, Math.min(availableAfterFixedExpenses, amount));
        }),
      updateStrategy: (bucket, percent) =>
        set((state) => {
          state.strategy = rebalanceStrategy(state.strategy, bucket, percent);
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
      isNextTurnAvailable,
      canAdvanceTurn,
      advanceTurn: createAdvanceTurn(set)
    }})
  )
);

