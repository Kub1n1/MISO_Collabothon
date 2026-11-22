import { RoomProps } from "../../store/types";

export const ASSET_LEVELS: Record<keyof RoomProps, number> = {
    wall: 2,
    floor: 1,
    tv: -1,
    window: -1,
    car: -1,
    couch: -1,
    player: 0,
};

export const PLAYER_AGE_START = 25;
export const PLAYER_AGE_STEP = 5;
export const PLAYER_AGE_TEXTURE_COUNT = 10;
export const CHILD_AGE_TEXTURE_COUNT = 6;
export const PLAYER_SCALE = 0.55;
export const PARTNER_SCALE = 0.5;
export const PLAYER_POSITION_Y = 120;