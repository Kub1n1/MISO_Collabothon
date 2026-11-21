import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import eventLive from './game/events/eventLive.json';
import eventExtra from './game/events/eventExtra.json';
import {
  SCENE_BACKGROUND_ASSETS,
  SavingsTransferResult,
  type EventBackground,
  type GameEvent,
  type GameEventBackground,
  type GameEventEffect,
  type GameState,
  type HomeLevel,
  type MandatoryEventSettlement,
  type SavingsBuckets,
  type SavingsStrategy,
  type SceneBackground,
} from './types';
import { createAdvanceTurn } from './store/turnStore';
import { getHomeBackground, getRandomMandatoryEvent, getRandomOptionalEvents, isOptionalEventEligible, randomMonthlyFixedExpenses } from './store/utils';
import { ENTERTAINMENT_PSYCHE_BONUS, INITIAL_MONTHLY_INCOME, INITIAL_SPOUSE_MONTHLY_INCOME, LOAN_TERM_MONTHS, MAX_CAR_LEVEL, START_AGE } from "./store/const";
import { createResolveEvent } from './store/eventStore';


export type { RoomProps, SavingsBuckets, SavingsStrategy } from './types';
export { getMaximumAffordableLoan } from './store/utils';


function rebalanceStrategy(
  strategy: SavingsStrategy,
  bucket: keyof SavingsStrategy,
  requestedPercent: number
): SavingsStrategy {
  const requestedValue = Number.isFinite(requestedPercent)
    ? requestedPercent
    : strategy[bucket];
  const percent = Math.round(Math.max(0, Math.min(100, requestedValue)));
  const remainingPercent = 100 - percent;
  const otherBuckets = (
    Object.keys(strategy) as (keyof SavingsStrategy)[]
  ).filter((key) => key !== bucket);
  const otherTotal = otherBuckets.reduce(
    (total, key) => total + Math.max(0, strategy[key]),
    0
  );
  const nextStrategy: SavingsStrategy = { ...strategy, [bucket]: percent };

  if (otherTotal === 0) {
    const evenShare = Math.floor(remainingPercent / otherBuckets.length);
    otherBuckets.forEach((key, index) => {
      nextStrategy[key] =
        evenShare + (index < remainingPercent % otherBuckets.length ? 1 : 0);
    });
    return nextStrategy;
  }

  const allocations = otherBuckets.map((key, index) => {
    const exactShare = (remainingPercent * Math.max(0, strategy[key])) / otherTotal;
    return { key, index, value: Math.floor(exactShare), remainder: exactShare % 1 };
  });
  let unallocated = remainingPercent - allocations.reduce(
    (total, allocation) => total + allocation.value,
    0
  );

  allocations
    .slice()
    .sort((left, right) => right.remainder - left.remainder || left.index - right.index)
    .forEach((allocation) => {
      if (unallocated > 0) {
        allocation.value += 1;
        unallocated -= 1;
      }
    });

  allocations.forEach(({ key, value }) => {
    nextStrategy[key] = value;
  });
  return nextStrategy;
}

function validateEventBackground(
  background: GameEventBackground | undefined,
  eventId: string,
  isMandatory: boolean
): EventBackground | undefined {
  if (background === 1 || background === 2) return background;
  if (!isMandatory && background === undefined) return undefined;
  throw new Error(`Mandatory event ${eventId} must define background as 1 or 2`);
}

function isSceneBackground(background: string): background is SceneBackground {
  return SCENE_BACKGROUND_ASSETS.some((asset) => asset === background);
}

function validateOptionalEventBackground(
  background: number | string | undefined,
  eventId: string
): GameEventBackground | undefined {
  if (background === undefined) return undefined;
  if (background === 1 || background === 2) return background;
  if (typeof background === 'string' && isSceneBackground(background)) {
    return background;
  }
  throw new Error(`Optional event ${eventId} has an invalid background`);
}

export const useGameStore = create<GameState>()(
  subscribeWithSelector(
    immer((set) => {
      const resolveEvent = createResolveEvent(set);
      const allEvents: GameEvent[] = eventLive.map((event, id) => ({
        ...event,
        id,
        background: validateEventBackground(
          event.background,
          event.eventId,
          event.isMandatory
        ),
      }));
      const eventsMandatory = allEvents.filter((event) => event.isMandatory);
      const eventsOptional: GameEvent[] = eventExtra.map((event, id) => ({
        ...event,
        background: validateOptionalEventBackground(event.background, event.eventId),
        options: event.options?.map((option) => ({
          ...option,
          background: validateOptionalEventBackground(
            'background' in option ? option.background : undefined,
            event.eventId
          ),
        })),
        id: eventLive.length + id,
      }));
      const initialMandatoryEvent = getRandomMandatoryEvent(eventsMandatory, START_AGE);
      const initialMonthlyFixedExpenses = randomMonthlyFixedExpenses(INITIAL_MONTHLY_INCOME);

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
      isNextTurnAvailable: () => {
        const state = useGameStore.getState() as GameState;
        return state.age <= state.retirementAge &&
          state.isMandatoryEventResolved &&
          !state.isGameOver &&
          !state.isGameFinished;
      },
      advanceTurn: createAdvanceTurn(set),
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
      canAdvanceTurn: () => {
        const state = useGameStore.getState() as GameState;
        return state.age <= state.retirementAge &&
          state.isMandatoryEventResolved &&
          !state.isGameOver &&
          !state.isGameFinished;
      }
    }})
  )
);

