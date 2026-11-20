import eventLive from './eventLive.json';

const getEventForTurn = (age: number) => {
    return eventLive.find(event => event.age === age);
};

export default { getEventForTurn };