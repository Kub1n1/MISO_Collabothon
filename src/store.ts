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


export type { RoomProps, SavingsBuckets, SavingsStrategy } from './types';

export function getMaximumAffordableLoan(
  householdIncome: number,
  monthlyFixedExpenses: number,
  monthlyLoanRepayment: number
) {
  const monthlyCapacity = Math.max(
    0,
    householdIncome - monthlyFixedExpenses - monthlyLoanRepayment
  );
  return Math.floor(monthlyCapacity * LOAN_TERM_MONTHS);
}

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

function getHomeLevelFromBackground(background: SceneBackground): HomeLevel | null {
  if (background.startsWith('home_modern_v2')) return 2;
  if (background.startsWith('home_modern_v1')) return 1;
  if (background === 'home_car.jpg') return 0;
  return null;
}

function applyEventBackground(
  state: GameState,
  background: GameEventBackground
) {
  if (background === 1 || background === 2) {
    state.activeBackground = getHomeBackground(
      background,
      state.homeLevel,
      state.roomProps.car
    );
    return;
  }
  if (typeof background === 'number') {
    throw new Error(`Unsupported event background: ${background}`);
  }



// function increaseHomeLevel(current: HomeLevel, requested: HomeLevel): HomeLevel {
//   if (requested <= current) return current;
//   return requested;
// }

  const backgroundHomeLevel = getHomeLevelFromBackground(background);
  if (backgroundHomeLevel !== null) {
    state.homeLevel = backgroundHomeLevel <= state.homeLevel ? state.homeLevel : backgroundHomeLevel
    // state.homeLevel = increaseHomeLevel(state.homeLevel, backgroundHomeLevel);
    if (background.endsWith('_car.jpg') || background === 'home_car.jpg') {
      state.roomProps.car = Math.max(1, state.roomProps.car);
    }
    state.activeBackground = getHomeBackground(
      state.mandatoryBackground,
      state.homeLevel,
      state.roomProps.car
    );
    return;
  }

  state.activeBackground = background;
}

export const useGameStore = create<GameState>()(
  subscribeWithSelector(
    immer((set) => {
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

      const resolveEvent = (
        eventId: number,
        optionIndex: number | null,
        settlement: MandatoryEventSettlement,
        mandatory: boolean
      ) => {
        let resolved = false;

        set((state) => {
          const event = mandatory
            ? state.turnEvents.mandatory
            : state.turnEvents.optional.find((candidate) => candidate.id === eventId);
          if (
            !event ||
            event.id !== eventId ||
            (mandatory && state.isMandatoryEventResolved) ||
            state.isGameOver
          ) return;
          if (
            !mandatory &&
            !isOptionalEventEligible(event, state.homeLevel, state.roomProps.car)
          ) return;

          const option = optionIndex === null ? undefined : event.options?.[optionIndex];
          if (event.options?.length && !option) return;
          if (!event.options?.length && optionIndex !== null) return;

          const effect: GameEventEffect | undefined = option?.effect ?? event.effect;
          if (!effect || !Number.isFinite(effect.eventAmount)) return;

          const amount = effect.eventAmount;
          const requiredPayment = Math.abs(amount);
          const householdIncome = state.monthlyIncome + state.spouseMonthlyIncome;
          const maxLoan = getMaximumAffordableLoan(
            householdIncome,
            state.monthlyFixedExpenses,
            state.monthlyLoanRepayment
          );
          const totalAvailableSavings = (
            Object.keys(state.savings) as (keyof SavingsBuckets)[]
          ).reduce((total, bucket) => total + Math.max(0, state.savings[bucket]), 0);

          if (amount < 0 && totalAvailableSavings + maxLoan < requiredPayment) {
            if (mandatory) {
              state.isGameOver = true;
              state.gameOverReason =
                `${event.title}: the cost of ${requiredPayment} PLN exceeds your ` +
                'available savings and affordable credit.';
            }
            return;
          }

          if (amount < 0) {
            if (settlement.kind !== 'pay') return;

            const payments = settlement.savings;
            let savingsPayment = 0;
            for (const bucket of Object.keys(state.savings) as (keyof SavingsBuckets)[]) {
              const payment = payments[bucket] ?? 0;
              if (
                !Number.isInteger(payment) ||
                payment < 0 ||
                payment > Math.max(0, state.savings[bucket])
              ) return;
              savingsPayment += payment;
            }

            if (
              !Number.isInteger(settlement.loanAmount) ||
              settlement.loanAmount < 0 ||
              settlement.loanAmount > maxLoan ||
              savingsPayment + settlement.loanAmount !== requiredPayment
            ) return;

            for (const bucket of Object.keys(state.savings) as (keyof SavingsBuckets)[]) {
              state.savings[bucket] -= payments[bucket] ?? 0;
            }
            state.monthlyLoanRepayment += settlement.loanAmount / LOAN_TERM_MONTHS;
          } else if (amount > 0) {
            if (settlement.kind === 'save-to-sock') {
              state.savings.sock += amount;
            } else if (settlement.kind !== 'entertainment') {
              return;
            }
          } else if (settlement.kind !== 'no-payment') {
            return;
          }

          if(option?.effect?.loan) {
            state.loans = [
              ...state.loans,
              option?.effect?.loan
            ]
          }else if(event?.effect?.loan) {
            state.loans = [
              ...state.loans,
              event?.effect?.loan
            ]
          }

          const roomChanges = effect.roomPropsChange;
          for (const prop of ['wall', 'floor', 'tv', 'window', 'car', 'couch'] as const) {
            const change = roomChanges[prop] ?? 0;
            const maxLevel = prop === 'car' ? MAX_CAR_LEVEL : Number.POSITIVE_INFINITY;
            state.roomProps[prop] = Math.min(
              maxLevel,
              Math.max(0, state.roomProps[prop] + change)
            );
          }

          const roomPropsSet = effect.roomPropsSet ?? {};
          for (const prop of ['wall', 'floor', 'tv', 'window', 'car', 'couch'] as const) {
            const value = roomPropsSet[prop];
            if (value !== undefined) {
              const maxLevel = prop === 'car' ? MAX_CAR_LEVEL : Number.POSITIVE_INFINITY;
              state.roomProps[prop] = Math.min(maxLevel, Math.max(0, value));
            }
          }

          for (const member of ['wife', 'kid', 'spy'] as const) {
            const change = roomChanges[member];
            if (change !== undefined) {
              state.family[member] = change > 0;
              if (member === 'wife') {
                state.spouseMonthlyIncome = change > 0 ? INITIAL_SPOUSE_MONTHLY_INCOME : 0;
              }
            }
          }

          if (mandatory) {
            if (roomChanges.car !== undefined || roomPropsSet.car !== undefined) {
              state.activeBackground = getHomeBackground(
                state.mandatoryBackground,
                state.homeLevel,
                state.roomProps.car
              );
            }
          } else {
            const background = option?.background ?? event.background;
            if (background !== undefined) {
              applyEventBackground(state, background);
            } else if (
              roomChanges.car !== undefined ||
              roomPropsSet.car !== undefined
            ) {
              state.activeBackground = getHomeBackground(
                state.mandatoryBackground,
                state.homeLevel,
                state.roomProps.car
              );
            }
          }

          if (event.income !== undefined) {
            state.monthlyIncome += event.income;
          }

          const updatedHouseholdIncome =
            state.monthlyIncome + state.spouseMonthlyIncome;

          if (updatedHouseholdIncome !== householdIncome) {
            state.monthlyFixedExpenses =
              randomMonthlyFixedExpenses(updatedHouseholdIncome);
          }

          const psycheChange =
            (event.psyche ?? 0) + (option?.psyche ?? 0) +
            (settlement.kind === 'entertainment' ? ENTERTAINMENT_PSYCHE_BONUS : 0);
          state.psyche = Math.max(0, Math.min(100, state.psyche + psycheChange));

          const availableAfterExpenses =
            state.monthlyIncome + state.spouseMonthlyIncome -
            state.monthlyFixedExpenses - state.monthlyLoanRepayment;
          state.monthlyInvestment = Math.max(
            0,
            Math.min(state.monthlyInvestment, availableAfterExpenses)
          );

          if (mandatory) {
            state.isMandatoryEventResolved = true;
          } else {
            state.turnEvents.optional = state.turnEvents.optional.filter(
              (candidate) => candidate.id === eventId
            );
            state.turnEvents.resolvedOptionalEventIds = [eventId];
          }
          resolved = true;
        });

        return resolved;
      };

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

