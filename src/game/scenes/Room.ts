import { GameObjects, Scene, Scenes } from 'phaser';
import { EventBus } from '../EventBus';
import { RoomProps, useGameStore } from '../../store';

const ASSET_LEVELS: Record<keyof RoomProps, number> = {
    wall: 2,
    floor: 1,
    tv: -1,
    window: -1,
    car: -1,
    couch: 1,
    player: 1,
};

export class Room extends Scene
{
    private elements: Partial<Record<keyof RoomProps, GameObjects.Image>> = {}; 
    private unsubscribers: (() => void)[] = [];

    constructor(){
        super('Room');
    }

    preload(){
        (Object.keys(ASSET_LEVELS) as (keyof RoomProps)[]).forEach((key) => {
            const count = ASSET_LEVELS[key];
            for (let level = 0; level < count; level++) {
            const textureKey = `${key}_${level}`;
            this.load.image(textureKey, `assets/${textureKey}.png`);
            }
        });
    }

    create(){
        const initialProps = useGameStore.getState().roomProps;
        // this.wall = this.add.image(512, 384, 'wall');
        // this.floor = this.add.image(512, 384, 'floor');

        const propKeys: (keyof RoomProps)[] = ['wall', 'floor', 'couch', 'player'
            // , 'tv', 'window', 'car'
        ];

        propKeys.forEach((key) => {
            const initialTexture = `${key}_${initialProps[key]}`;
            console.log(initialTexture);
            const img = this.add.image(512, 384, initialTexture);
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

        this.events.once(Scenes.Events.SHUTDOWN, () => {
            this.unsubscribers.forEach((unsub) => unsub());
            this.unsubscribers = [];
        });

        EventBus.emit('current-scene-ready', this);
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

        // Krótka animacja mrugnięcia przy podmianie tekstury
        this.tweens.add({
        targets: sprite,
        alpha: 0.2,
        duration: 120,
        onComplete: () => {
            sprite.setTexture(newTextureKey);
            this.tweens.add({
            targets: sprite,
            alpha: 1,
            duration: 180,
            });
        },
        });
    }
}
