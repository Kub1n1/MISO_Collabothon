import { Scene } from 'phaser';
import { RoomProps, SCENE_BACKGROUND_ASSETS } from '../../types';
import { PLAYER_AGE_TEXTURE_COUNT } from './const';
import { useGameStore } from '../../store';

const ASSET_LEVELS: Record<keyof RoomProps, number> = {
    wall: 2,
    floor: 1,
    tv: -1,
    window: -1,
    car: -1,
    couch: -1,
    player: 0,
};


export class Preloader extends Scene
{
    private progressBar?: Phaser.GameObjects.Rectangle;
    private progressBarTrack?: Phaser.GameObjects.Rectangle;

    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;
        this.cameras.main.setBackgroundColor('#f7f7f7');
        this.add.image(centerX, centerY, 'background');

        this.progressBarTrack = this.add.rectangle(centerX, centerY + 420, 468, 32)
            .setStrokeStyle(1, 0x000000);

        this.progressBar = this.add.rectangle(
            centerX - 230,
            centerY + 420,
            4,
            28,
            0x000000
        ).setOrigin(0, 0.5);

        this.load.on('progress', (progress: number) => {
            if (this.progressBar) {
                this.progressBar.width = 4 + (460 * progress);
            }
        });
    }

    preload ()
    {
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

    create ()
    {
        this.progressBar?.destroy();
        this.progressBarTrack?.destroy();

        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        const startButton = this.add.text(centerX, centerY + 420, 'START', {
            fontFamily: 'Arial Black',
            fontSize: 38,
            color: '#ffffff',
            backgroundColor: '#000000',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center',
            padding: {
                x: 32,
                y: 12,
            },
        })
            .setOrigin(0.5)
            .setDepth(100)
            .setInteractive({ useHandCursor: true });

        startButton.on('pointerover', () => startButton.setColor('#ffd700'));
        startButton.on('pointerout', () => startButton.setColor('#ffffff'));
        startButton.once('pointerup', () => {
            useGameStore.getState().endLoading();
            this.scene.start('Room');
        });
        //FIXME: zeby sie nie jebac z ekranem ladujacym
        useGameStore.getState().endLoading();
        this.scene.start('Room');
    }
}
