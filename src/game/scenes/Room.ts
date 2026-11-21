import { GameObjects, Scene, Scenes } from 'phaser';
import { EventBus } from '../EventBus';
import { RoomProps, useGameStore } from '../../store';
import { ASSET_LEVELS, PARTNER_SCALE, PLAYER_AGE_START, PLAYER_AGE_STEP, PLAYER_AGE_TEXTURE_COUNT, PLAYER_SCALE } from './const';
import { SceneBackground } from '../../types';

export class Room extends Scene
{
    private elements: Partial<Record<keyof RoomProps, GameObjects.Image>> = {}; 
    private eventBackground: GameObjects.Image;
    private player:GameObjects.Image;
    private partner:GameObjects.Image;
    private child:GameObjects.Image;
    private unsubscribers: (() => void)[] = [];

    constructor(){
        super('Room');
    }

    preload(){
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

        const partner = this.add
            .image(
                this.scale.width / 2-150,
                this.scale.height / 2,
                this.getPartnerAgeTexture(initialAge)
            )
            .setScale(PARTNER_SCALE)
        this.partner = partner;
        this.partner.visible = false; 
        this.unsubscribers.push(
            useGameStore.subscribe(
                (state) => state.age,
                (age) => this.updatePartnerAge(age)
            )
        );

        const child = this.add
            .image(
                this.scale.width / 2+150,
                this.scale.height / 2,
                this.getChildAgeTexture(initialAge)
            )
            .setScale(PARTNER_SCALE)
        this.child = child;
        this.child.visible = false; 
        this.unsubscribers.push(
            useGameStore.subscribe(
                (state) => state.age,
                (age) => this.updateChildAge(age)
            )
        );

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

    private getPartnerAgeTexture(age: number) {
        const ageStage = Math.min(
            PLAYER_AGE_TEXTURE_COUNT - 1,
            Math.max(0, Math.floor((age - PLAYER_AGE_START) / PLAYER_AGE_STEP))
        );

        return `player_age_woman_${ageStage}`;
    }

    private getChildAgeTexture(age: number) {
        const ageStage = Math.min(
            PLAYER_AGE_TEXTURE_COUNT - 1,
            Math.max(0, Math.floor((age - PLAYER_AGE_START) / PLAYER_AGE_STEP))
        );

        return `player_age_child_${ageStage}`;
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

    private updatePartnerAge(age: number) {
        const sprite = this.partner;
        const textureKey = this.getPartnerAgeTexture(age);

        if (!sprite) return;
        if (!this.textures.exists(textureKey)) {
            console.warn(`Brak tekstury: ${textureKey}`);
            return;
        }
        if(age >= 25){
            this.partner.visible = true;
        } else {
            this.partner.visible = false;
        }

        this.updateSpriteTexture(sprite, textureKey);
    }

    private updateChildAge(age: number) {
        let ageRecalculated = age - 10;
        if(ageRecalculated < 0) ageRecalculated = 0;
        if(ageRecalculated > 55) ageRecalculated = 55;
        if(age >= 35 && age <= 55){
            this.child.visible = true;
        } else {
            this.child.visible = false;
        }

        const sprite = this.child;
        const textureKey = this.getChildAgeTexture(ageRecalculated);

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
