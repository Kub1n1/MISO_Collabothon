import eventLive from './eventLive.json';

export type TurnEvents = (typeof eventLive)[number];

const getEventForTurn = (age: number): TurnEvents | undefined => {
  return eventLive.find((event) => event.mandatory.age === age);
};

export default { getEventForTurn };