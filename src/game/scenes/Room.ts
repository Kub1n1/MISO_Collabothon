import { GameObjects, Scene, Scenes } from 'phaser';
import { EventBus } from '../EventBus';
import { useGameStore } from '../../store';
import type { RoomProps } from '../../store';
import { SCENE_BACKGROUND_ASSETS, type SceneBackground } from '../../types';

const ASSET_LEVELS: Record<keyof RoomProps, number> = {
    wall: 2,
    floor: 1,
    tv: -1,
    window: -1,
    car: -1,
    couch: 1,
    player: 0,
};

const PLAYER_AGE_START = 25;
const PLAYER_AGE_STEP = 5;
const PLAYER_AGE_TEXTURE_COUNT = 10;
const PLAYER_SCALE = 0.55;

export class Room extends Scene
{
    private elements: Partial<Record<keyof RoomProps, GameObjects.Image>> = {}; 
    private eventBackground: GameObjects.Image;
    private player:GameObjects.Image;
    private unsubscribers: (() => void)[] = [];

    constructor(){
        super('Room');
    }

    preload(){
        SCENE_BACKGROUND_ASSETS.forEach((asset) => {
            this.load.image(`event-background-${asset}`, `assets/backgrounds/${asset}`);
        });

        (Object.keys(ASSET_LEVELS) as (keyof RoomProps)[]).forEach((key) => {
            const count = ASSET_LEVELS[key];
            for (let level = 0; level < count; level++) {
            const textureKey = `${key}_${level}`;
            this.load.image(textureKey, `assets/${textureKey}.png`);
            }
        });

        for (let ageStage = 0; ageStage < PLAYER_AGE_TEXTURE_COUNT; ageStage++) {
            this.load.image(
                `player_age_${ageStage}`,
                `assets/player_age/player_${ageStage}.png`
            );
        }
    }

    create(){
        const initialProps = useGameStore.getState().roomProps;
        const initialAge = useGameStore.getState().age;
        const initialBackground = useGameStore.getState().activeBackground;

        this.eventBackground = this.add.image(
            this.scale.width / 2,
            this.scale.height / 2,
            this.getEventBackgroundTexture(initialBackground)
        );
        this.updateEventBackground(initialBackground);
        this.unsubscribers.push(
            useGameStore.subscribe(
                (state) => state.activeBackground,
                (background) => {
                    this.updateEventBackground(background);
                    this.updateCouchVisibility(background);
                }
            )
        );

        const propKeys = ([
            'wall', 'floor', 'couch', 'tv', 'window', 'car'
        ] as const satisfies readonly (keyof RoomProps)[]).filter(
            (key) => ASSET_LEVELS[key] >= 0
        );

        propKeys.forEach((key) => {
            const initialTexture = `${key}_${initialProps[key]}`;
            const depth = key === 'wall' || key === 'floor' ? -2 : 0;
            const img = this.add
                .image(this.scale.width / 2, this.scale.height / 2, initialTexture)
                .setDepth(depth);
            this.elements[key] = img;

            const unsub = useGameStore.subscribe(
                (state) => state.roomProps[key],
                (newLevel, oldLevel) => {
                console.log(`Element ${key} zmienił poziom z ${oldLevel} na ${newLevel}`);
                    this.updateRoomElement(key, newLevel);
                }
            );

            this.unsubscribers.push(unsub);
        });
        this.updateCouchVisibility(initialBackground);

        const player = this.add
            .image(
                this.scale.width / 2,
                this.scale.height / 2,
                this.getPlayerAgeTexture(initialAge)
            )
            .setScale(PLAYER_SCALE);
        this.player = player;
        this.unsubscribers.push(
            useGameStore.subscribe(
                (state) => state.age,
                (age) => this.updatePlayerAge(age)
            )
        );
        this.scale.on('resize', this.handleResize, this);

        this.events.once(Scenes.Events.SHUTDOWN, () => {
            this.scale.off('resize', this.handleResize, this);
            this.unsubscribers.forEach((unsub) => unsub());
            this.unsubscribers = [];
        });

        EventBus.emit('current-scene-ready', this);
    }

    private getPlayerAgeTexture(age: number) {
        const ageStage = Math.min(
            PLAYER_AGE_TEXTURE_COUNT - 1,
            Math.max(0, Math.floor((age - PLAYER_AGE_START) / PLAYER_AGE_STEP))
        );

        return `player_age_${ageStage}`;
    }

    private getEventBackgroundTexture(background: SceneBackground) {
        return `event-background-${background}`;
    }

    private updateEventBackground(background: SceneBackground) {
        const textureKey = this.getEventBackgroundTexture(background);
        if (!this.eventBackground || !this.textures.exists(textureKey)) {
            console.warn(`Brak tekstury tła: ${textureKey}`);
            return;
        }

        this.eventBackground
            .setTexture(textureKey)
            .setPosition(this.scale.width / 2, this.scale.height / 2)
            .setDisplaySize(this.scale.width, this.scale.height)
            .setDepth(-1);
    }

    private updateCouchVisibility(background: SceneBackground) {
        this.elements.couch?.setVisible(
            background !== 'university.jpg' && background !== 'work.jpg'
        );
    }

    private handleResize() {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        Object.values(this.elements).forEach((element) => {
            element?.setPosition(centerX, centerY);
        });
        this.player?.setPosition(centerX, centerY);
        this.updateEventBackground(useGameStore.getState().activeBackground);
    }

    private updatePlayerAge(age: number) {
        const sprite = this.player;
        const textureKey = this.getPlayerAgeTexture(age);

        if (!sprite) return;
        if (!this.textures.exists(textureKey)) {
            console.warn(`Brak tekstury: ${textureKey}`);
            return;
        }

        this.updateSpriteTexture(sprite, textureKey);
    }
    
    private updateRoomElement(key: keyof RoomProps, newLevel: number) {
        const sprite = this.elements[key];
        const newTextureKey = `${key}_${newLevel}`;

        // Zabezpieczenie: sprawdzamy, czy obiekt istnieje i czy tekstura została załadowana
        if (!sprite) return;
        if (!this.textures.exists(newTextureKey)) {
        console.warn(`Brak tekstury: ${newTextureKey} (osiągnięto maksymalny poziom?)`);
        return;
        }

        this.updateSpriteTexture(sprite, newTextureKey);
    }

    private updateSpriteTexture(sprite: GameObjects.Image, textureKey: string) {
        // Krótka animacja mrugnięcia przy podmianie tekstury
        this.tweens.add({
        targets: sprite,
        alpha: 0.2,
        duration: 120,
        onComplete: () => {
            sprite.setTexture(textureKey);
            this.tweens.add({
            targets: sprite,
            alpha: 1,
            duration: 180,
            });
        },
        });
    }
}
