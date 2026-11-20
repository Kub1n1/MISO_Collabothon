import eventLive from './eventLive.json';

export type TurnEvent = (typeof eventLive)[number];

const getEventForTurn = (age: number): TurnEvent | undefined => {
  return eventLive.find((event) => event.age === age);
};

export default { getEventForTurn };