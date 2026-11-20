import { useRef } from 'react';
import { IRefPhaserGame, PhaserGame } from './PhaserGame';
import BottomButtons from './game/interface/bottomButtons';
import 'bulma/css/bulma.min.css';
import './App.css';
import { TopHud } from './game/interface/topHud/topHud';

function App()
{
    const phaserRef = useRef<IRefPhaserGame | null>(null);

    return (
        <div id="app">
            <PhaserGame ref={phaserRef}/>
            <BottomButtons phaserRef={phaserRef}/>
            <TopHud />
        </div>
    )
}

export default App
