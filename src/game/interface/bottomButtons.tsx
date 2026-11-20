import React from 'react';
import { GameState, useGameStore } from '../../store';
import { Room } from '../scenes/Room';
import { IRefPhaserGame } from '../../PhaserGame';
import styles from './bottomButtons.module.css';
import { CardHand } from './cards/CardHand';

const BottomButtons: React.FC<Props> = ({ phaserRef }) => {    
    const gameStore:GameState = useGameStore.getState()
    
    const rebuildRoom = () => {
        if(phaserRef.current)
        {     
            const scene = phaserRef.current.scene as Room;
            if (scene){
                gameStore.incrementProp('wall');
            }
        }

    }

    const nextStep = () => {
        gameStore.advanceTurn();
    }

    return(
        <div className={styles.BottomButtons}>
            <div className='box glass-box'>
                <div className='columns is-centered'>
                    <div className='column is-flex is-justify-content-center'>
                        <CardHand />
                    </div>
                    <div className='column is-narrow'>
                        <button 
                            className="button is-primary"
                            onClick={nextStep}
                            disabled={gameStore.isNextStepAvailable === false}
                            >Next move</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

interface Props {
    phaserRef: React.RefObject<IRefPhaserGame | null>;
}

export default BottomButtons;