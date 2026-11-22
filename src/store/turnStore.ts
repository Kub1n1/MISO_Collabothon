import { Draft } from "immer";
import { GameState } from "./types";
import { 
    getHomeBackground, 
} from "./backgroundStore";
import { STEP } from "./const";
import { useGameStore } from "./store";
import { getRandomMandatoryEvent, getRandomOptionalEvents } from "./eventStore";
import { randomMonthlyFixedExpenses } from "./financialStore";


export const canAdvanceTurn = () => {
const state = useGameStore.getState() as GameState;
return state.age <= state.retirementAge &&
    state.isMandatoryEventResolved &&
    !state.isGameOver &&
    !state.isGameFinished;
};


export const isNextTurnAvailable = () => {
    const state = useGameStore.getState() as GameState;
    return state.age <= state.retirementAge &&
        state.isMandatoryEventResolved &&
        !state.isGameOver &&
        !state.isGameFinished;
};

export const createAdvanceTurn = (
  set: (fn: (state: Draft<GameState>) => void) => void
) => () => {
set((state: GameState) => {
    if (
    !state.isMandatoryEventResolved ||
    state.isGameOver ||
    state.isGameFinished
    ) return;

    if (state.age >= state.retirementAge) {
    if (state.age === state.retirementAge) {
        state.isGameFinished = true;
        const savingsTotal =
        state.savings.sock + state.savings.account + state.savings.stocks;
        const psyche = state.psyche;

        state.gameResult = {
        completedAt: new Date().toISOString(),
        savingsTotal,
        psyche,
        score: Math.round(savingsTotal * (1 + psyche / 1000)),
        };
    }
    return;
    }

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
    const eventBackground = mandatoryEvent?.background;
    const mandatoryBackground =
    eventBackground === 1 || eventBackground === 2
        ? eventBackground
        : state.mandatoryBackground;
    const loans = state.loans
    .map((loan) => {
        const remainingMonths = loan.remainingMonths - (12*STEP);
        return { ...loan, remainingMonths };
    })
    .filter((loan) => loan.remainingMonths > 0);

    return {
    age,
    mandatoryBackground,
    activeBackground: getHomeBackground(
        mandatoryBackground,
        state.homeLevel,
        state.roomProps.car
    ),
    monthlyFixedExpenses,
    monthlyLoanRepayment: 0,
    monthlyInvestment: Math.min(state.monthlyInvestment, availableAfterFixedExpenses),
    savings: {
        sock: Math.round(state.savings.sock + addedSock),
        account: Math.round((state.savings.account + addedAccount) * 1.04), // +4% odsetek
        stocks: Math.round((state.savings.stocks + addedStocks) * 1.08),   // +8% zwrotu
    },
    loans,
    isMandatoryEventResolved: mandatoryEvent === null,
    turnEvents: {
        mandatory: mandatoryEvent,
        optional: getRandomOptionalEvents(
            state.eventsOptional,
            age,
            state.homeLevel,
            state.roomProps.car
        ),
        resolvedOptionalEventIds: [],
    },
    };
})};