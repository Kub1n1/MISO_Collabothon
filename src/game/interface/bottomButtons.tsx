import React from 'react';
import { useGameStore } from '../../store';
import type { IRefPhaserGame } from '../../PhaserGame';
import styles from './bottomButtons.module.css';
import { CardHand } from './cards/CardHand';

interface Props {
    phaserRef: React.RefObject<IRefPhaserGame | null>;
}

const BottomButtons: React.FC<Props> = ({ phaserRef: _phaserRef }) => {
    const advanceTurn = useGameStore((state) => state.advanceTurn);
    const canAdvance = useGameStore(
        (state) =>
            state.age <= state.retirementAge &&
            state.isMandatoryEventResolved &&
            !state.isGameOver &&
            !state.isGameFinished
    );
    const nextStep = () => {
        advanceTurn();
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
                            disabled={!canAdvance}
                            >Next move</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BottomButtons;