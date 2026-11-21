import { Draft } from "immer";
import { GameEventEffect, GameState, MandatoryEventSettlement, SavingsBuckets } from "../types";
import { applyEventBackground, getHomeBackground, getMaximumAffordableLoan, isOptionalEventEligible, randomMonthlyFixedExpenses } from "./utils";
import { ENTERTAINMENT_PSYCHE_BONUS, INITIAL_SPOUSE_MONTHLY_INCOME, LOAN_TERM_MONTHS, MAX_CAR_LEVEL } from "./const";

export const createResolveEvent = (
    set: (fn: (state: Draft<GameState>) => void) => void,
) => (
    eventId: number,
    optionIndex: number | null,
    settlement: MandatoryEventSettlement,
    mandatory: boolean
):boolean => {
    let resolved = false;
    set((state: GameState) => {
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