import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import eventLive from './game/events/eventLive.json';
import eventExtra from './game/events/eventExtra.json';
import {
  SavingsTransferResult,
  STOCK_SYMBOLS,
  type GameEvent,
  type GameEventEffect,
  type GameState,
  type MandatoryEventSettlement,
  type SavingsBuckets,
  type SavingsStrategy,
  type StockMarketState,
  type StockTradeResult,
} from './types';

export type { RoomProps, SavingsBuckets, SavingsStrategy } from './types';

const STEP = 5;
const START_AGE = 20;
const INITIAL_MONTHLY_INCOME = 1000;
const INITIAL_SPOUSE_MONTHLY_INCOME = 3000;
const LOAN_TERM_MONTHS = 60;
const ENTERTAINMENT_PSYCHE_BONUS = 10;
const OPTIONAL_EVENTS_PER_TURN = 3;

export function getAvailableStockFunds(savings: SavingsBuckets) {
  return Math.max(0, savings.sock) + Math.max(0, savings.account) + Math.max(0, savings.stocks);
}

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

function createInitialStockMarket(): StockMarketState {
  return {
    prices: {
      TESLA: 900,
      MICROSOFT: 1500,
      NVIDIA: 800,
    },
    history: {
      TESLA: [520, 670, 610, 780, 720, 930, 820, 1050, 900],
      MICROSOFT: [1180, 1250, 1230, 1320, 1370, 1450, 1420, 1520, 1500],
      NVIDIA: [150, 210, 190, 300, 410, 360, 540, 690, 800],
    },
    lastChangePercent: {
      TESLA: 0,
      MICROSOFT: 0,
      NVIDIA: 0,
    },
    holdings: {
      TESLA: 0,
      MICROSOFT: 0,
      NVIDIA: 0,
    },
    costBasis: {
      TESLA: 0,
      MICROSOFT: 0,
      NVIDIA: 0,
    },
    realizedProfit: 0,
    tradeUsedThisMove: false,
    moveCount: 0,
  };
}

function randomMonthlyFixedExpenses(householdIncome: number) {
  const percentage = 20 + Math.floor(Math.random() * 26);
  return Math.round(householdIncome * (percentage / 100));
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

function getRandomMandatoryEvent(events: GameEvent[], age: number) {
  const eligibleEvents = events.filter((event) => event.age === age);
  const randomIndex = Math.floor(Math.random() * eligibleEvents.length);
  return eligibleEvents[randomIndex] ?? null;
}

function getRandomOptionalEvents(events: GameEvent[], age: number) {
  const eligibleEvents = events.filter((event) => event.age === age);
  for (let index = 0; index < Math.min(OPTIONAL_EVENTS_PER_TURN, eligibleEvents.length); index++) {
    const randomIndex =
      index + Math.floor(Math.random() * (eligibleEvents.length - index));
    [eligibleEvents[index], eligibleEvents[randomIndex]] = [
      eligibleEvents[randomIndex],
      eligibleEvents[index],
    ];
  }
  return eligibleEvents.slice(0, OPTIONAL_EVENTS_PER_TURN);
}


export const useGameStore = create<GameState>()(
  subscribeWithSelector(
    immer((set) => {
      const allEvents: GameEvent[] = eventLive.map((event, id) => ({ ...event, id }));
      const eventsMandatory = allEvents.filter((event) => event.isMandatory);
      const eventsOptional: GameEvent[] = eventExtra.map((event, id) => ({
        ...event,
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

          const roomChanges = effect.roomPropsChange;
          for (const prop of ['wall', 'floor', 'tv', 'window', 'car', 'couch'] as const) {
            const change = roomChanges[prop] ?? 0;
            state.roomProps[prop] = Math.max(0, state.roomProps[prop] + change);
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
      age: 20,
      retirementAge: 65,
      psyche: 70,
      monthlyIncome: INITIAL_MONTHLY_INCOME,
      spouseMonthlyIncome: 0,
      monthlyFixedExpenses: initialMonthlyFixedExpenses,
      monthlyLoanRepayment: 0,
      monthlyInvestment: Math.max(0, INITIAL_MONTHLY_INCOME - initialMonthlyFixedExpenses),
      savings: {
        sock: 5000,
        account: 0,
        stocks: 0,
      },
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
      stockMarket: createInitialStockMarket(),
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
      turnEvents: {
        mandatory: initialMandatoryEvent,
        optional: getRandomOptionalEvents(eventsOptional, START_AGE),
        resolvedOptionalEventIds: [],
      },
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
      tradeStock: (symbol, action, quantity) => {
        let result: StockTradeResult = 'success';

        set((state) => {
          const market = state.stockMarket;
          if (market.tradeUsedThisMove) {
            result = 'already-traded';
            return;
          }
          if (!Number.isInteger(quantity) || quantity <= 0) {
            result = 'invalid-quantity';
            return;
          }

          const price = market.prices[symbol];
          const sharesOwned = market.holdings[symbol];

          if (action === 'buy') {
            const cost = price * quantity;
            if (getAvailableStockFunds(state.savings) < cost) {
              result = 'insufficient-funds';
              return;
            }

            let remainingCost = cost;
            for (const bucket of ['sock', 'account', 'stocks'] as const) {
              const withdrawn = Math.min(Math.max(0, state.savings[bucket]), remainingCost);
              state.savings[bucket] -= withdrawn;
              remainingCost -= withdrawn;
              if (remainingCost === 0) break;
            }
            market.holdings[symbol] += quantity;
            market.costBasis[symbol] += cost;
          } else {
            if (sharesOwned < quantity) {
              result = 'insufficient-shares';
              return;
            }

            const saleValue = price * quantity;
            const costBasisSold = (market.costBasis[symbol] / sharesOwned) * quantity;
            market.holdings[symbol] -= quantity;
            market.costBasis[symbol] = Math.max(0, market.costBasis[symbol] - costBasisSold);
            market.realizedProfit += saleValue - costBasisSold;
            state.savings.sock += saleValue;
          }

          market.tradeUsedThisMove = true;
        });

        return result;
      },
      isNextTurnAvailable: () => {
        const state = useGameStore.getState() as GameState;
        return state.age < state.retirementAge &&
          state.isMandatoryEventResolved &&
          !state.isGameOver;
      },
      advanceTurn: () =>
        set((state) => {
          if (
            state.age >= state.retirementAge ||
            !state.isMandatoryEventResolved ||
            state.isGameOver
          ) return;

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
          const stockMarket: StockMarketState = {
            ...state.stockMarket,
            prices: { ...state.stockMarket.prices },
            history: { ...state.stockMarket.history },
            lastChangePercent: { ...state.stockMarket.lastChangePercent },
            holdings: { ...state.stockMarket.holdings },
            costBasis: { ...state.stockMarket.costBasis },
            tradeUsedThisMove: false,
            moveCount: state.stockMarket.moveCount + 1,
          };

          for (const symbol of STOCK_SYMBOLS) {
            const previousPrice = state.stockMarket.prices[symbol];
            const changePercent = Math.round((Math.random() * 60 - 30) * 10) / 10;
            const newPrice = Math.max(
              1,
              Math.round(previousPrice * (1 + changePercent / 100))
            );

            stockMarket.prices[symbol] = newPrice;
            stockMarket.lastChangePercent[symbol] = changePercent;
            stockMarket.history[symbol] = [
              ...state.stockMarket.history[symbol],
              newPrice,
            ].slice(-12);
          }

          return {
            age,
            monthlyFixedExpenses,
            monthlyLoanRepayment: 0,
            monthlyInvestment: Math.min(state.monthlyInvestment, availableAfterFixedExpenses),
            savings: {
              sock: Math.round(state.savings.sock + addedSock),
              account: Math.round((state.savings.account + addedAccount) * 1.04), // +4% odsetek
              stocks: Math.round((state.savings.stocks + addedStocks) * 1.08),   // +8% zwrotu
            },
            stockMarket,
            isMandatoryEventResolved: mandatoryEvent === null,
            turnEvents: {
              mandatory: mandatoryEvent,
              optional: getRandomOptionalEvents(state.eventsOptional, age),
              resolvedOptionalEventIds: [],
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
      canAdvanceTurn: () => {
        const state = useGameStore.getState() as GameState;
        return state.age < state.retirementAge &&
          state.isMandatoryEventResolved &&
          !state.isGameOver;
      }
    }})
  )
);

