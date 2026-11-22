import { EventBackground, GameEventBackground, GameState, HomeLevel, SceneBackground } from "./types";

export function validateEventBackground(
  background: GameEventBackground | undefined,
  eventId: string,
  isMandatory: boolean
): EventBackground | undefined {
  if (background === 1 || background === 2) return background;
  if (!isMandatory && background === undefined) return undefined;
  throw new Error(`Mandatory event ${eventId} must define background as 1 or 2`);
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

export function applyEventBackground(
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

function getHomeLevelFromBackground(background: SceneBackground): HomeLevel | null {
  if (background.startsWith('home_modern_v2')) return 2;
  if (background.startsWith('home_modern_v1')) return 1;
  if (background === 'home_car.jpg') return 0;
  return null;
}