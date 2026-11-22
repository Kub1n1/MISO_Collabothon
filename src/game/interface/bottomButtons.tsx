import React from 'react';
import { useGameStore } from '../../store';
import type { IRefPhaserGame } from '../../PhaserGame';
import styles from './bottomButtons.module.css';
import { CardHand } from './cards/CardHand';
import { NextTurnButton } from './NextTurnButton';

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
        <div className={`${styles.BottomButtons} ${styles.BottomButtonsCards}`}>
            <CardHand />
            {canAdvance && (
                <NextTurnButton
                    className={styles.NextMoveButton}
                    label="NEXT MOVE"
                    onClick={nextStep}
                />
            )}
        </div>
    )
}

export default BottomButtons;