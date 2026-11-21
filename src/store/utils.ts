import { EventBackground, GameEvent, HomeLevel, SceneBackground } from "../types";
import {OPTIONAL_EVENTS_PER_TURN, OPTIONAL_EVENTS_PER_TURN} from "./const";

export function randomMonthlyFixedExpenses(householdIncome: number) {
  const percentage = 20 + Math.floor(Math.random() * 26);
  return Math.round(householdIncome * (percentage / 100));
}

export function getRandomMandatoryEvent(events: GameEvent[], age: number):GameEvent | null {
  const eligibleEvents = events.filter((event) => event.age === age);
  const randomIndex = Math.floor(Math.random() * eligibleEvents.length);
  return eligibleEvents[randomIndex] ?? null;
}

export function isOptionalEventEligible(
  event: GameEvent,
  homeLevel: HomeLevel,
  carLevel: number
) {
  const requirements = event.requires;
  return !requirements ||
    (requirements.home === undefined || requirements.home === homeLevel) &&
    (requirements.car === undefined || requirements.car <= carLevel) &&
    (requirements.maxCar === undefined || requirements.maxCar >= carLevel);
}

export function getHomeBackground(
  mandatoryBackground: EventBackground,
  homeLevel: HomeLevel,
  carLevel: number
): SceneBackground {
  if (homeLevel === 2) {
    return carLevel > 0 ? 'home_modern_v2_car.jpg' : 'home_modern_v2.jpg';
  }
  if (homeLevel === 1) {
    return carLevel > 0 ? 'home_modern_v1_car.jpg' : 'home_modern_v1.jpg';
  }
  if (carLevel > 0 && mandatoryBackground === 2) return 'home_car.jpg';
  return mandatoryBackground === 1 ? 'background_1.jpg' : 'background_2.jpg';
}

export function getRandomOptionalEvents(
  events: GameEvent[],
  age: number,
  homeLevel: HomeLevel,
  carLevel: number
) {
  const eligibleEvents = events.filter(
    (event) =>
      event.age === age && isOptionalEventEligible(event, homeLevel, carLevel)
  );
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