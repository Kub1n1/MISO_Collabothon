import { useRef } from 'react';
import { IRefPhaserGame, PhaserGame } from './PhaserGame';
import BottomButtons from './game/interface/bottomButtons';
import 'bulma/css/bulma.min.css';
import './App.css';
import { TopHud } from './game/interface/topHud/topHud';
import { formatPLN } from './game/interface/topHud/formatPLN';
import { useGameStore } from './store';
import { GameSummary } from './game/interface/GameSummary';

function App()
{
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const isGameOver = useGameStore((state) => state.isGameOver);
    const gameOverReason = useGameStore((state) => state.gameOverReason);
    const isGameFinished = useGameStore((state) => state.isGameFinished);
    const gameResult = useGameStore((state) => state.gameResult);
    const age = useGameStore((state) => state.age);
    const totalSavings = useGameStore(
        (state) => state.savings.sock + state.savings.account + state.savings.stocks
    );
    const householdIncome = useGameStore(
        (state) => state.monthlyIncome + state.spouseMonthlyIncome
    );
    const monthlyExpenses = useGameStore(
        (state) => state.monthlyFixedExpenses + state.monthlyLoanRepayment
    );

    return (
        <div id="app">
            <PhaserGame ref={phaserRef}/>
            <BottomButtons phaserRef={phaserRef}/>
            <TopHud />
            {isGameOver && (
                <div
                    className="card-backdrop"
                    style={{
                        zIndex: 200,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0, 0, 0, 0.8)',
                        pointerEvents: 'auto',
                    }}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="game-over-title"
                >
                    <section className="box glass-box has-text-light p-5" style={{ maxWidth: 480 }}>
                        <h1 id="game-over-title" className="title is-3 has-text-danger">
                            Game Over
                        </h1>
                        <p className="mb-4">{gameOverReason}</p>
                        <div className="is-flex is-justify-content-space-between mb-2">
                            <span className="has-text-grey-light">Age reached</span>
                            <strong>{age}</strong>
                        </div>
                        <div className="is-flex is-justify-content-space-between mb-2">
                            <span className="has-text-grey-light">Savings left</span>
                            <strong>{formatPLN(totalSavings)}</strong>
                        </div>
                        <div className="is-flex is-justify-content-space-between mb-2">
                            <span className="has-text-grey-light">Monthly household income</span>
                            <strong>{formatPLN(householdIncome)}</strong>
                        </div>
                        <div className="is-flex is-justify-content-space-between mb-4">
                            <span className="has-text-grey-light">Monthly expenses</span>
                            <strong>{formatPLN(monthlyExpenses)}</strong>
                        </div>
                        <button
                            className="button is-primary is-fullwidth"
                            onClick={() => window.location.reload()}
                        >
                            Start a new game
                        </button>
                    </section>
                </div>
            )}
            {isGameFinished && gameResult && <GameSummary result={gameResult} />}
        </div>
    )
}

export default App
