import { Room } from './scenes/Room';
import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { Game as MainGame } from './scenes/Game';
import { MainMenu } from './scenes/MainMenu';
import { AUTO, Game, Scale } from 'phaser';
import { Preloader } from './scenes/Preloader';

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 1024,
    height: 576,
    parent: 'game-container',
    backgroundColor: '#ffffff',
    scale: {
        mode: Scale.RESIZE,
        autoCenter: Scale.CENTER_BOTH, // Centruje obraz w pionie i poziomie
    },
    scene: [
        Boot,
        Preloader,
        Room,
        MainMenu,
        MainGame,
        GameOver
    ]
};

const StartGame = (parent: string) => {

    return new Game({ ...config, parent });

}

export default StartGame;
