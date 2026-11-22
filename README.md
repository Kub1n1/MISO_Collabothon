![Opis obrazka](public/assets/bg.png)

# MISO

## One-Line Summary

MISO is a life-finance simulation that helps users explore saving, investing, budgeting and major life decisions from age 20 to retirement.

## Technology Stack

React 19, TypeScript, Phaser 4, Vite 6, Zustand 5, Immer, Bulma 1, HTML5 Canvas and CSS.

# AI Technology
Nano Banana 2.1 (claude for business), Copilot,

# THE PROBLEM

Many people find personal finance difficult to understand because its consequences appear over years rather than immediately. Young adults and future workers must make decisions about spending, savings, debt, investments and unexpected life events without a safe place to experience their long-term effects.

MISO makes these decisions visible by turning an abstract financial plan into a sequence of understandable, interactive life events.

# YOUR SOLUTION

MISO is a browser-based financial life simulation in which users guide a character from age 20 to 65. Each five-year move combines income, expenses, savings, investments and mandatory or optional life events.

The core idea is to show that financial choices interact. Users can adjust their monthly investment budget, divide savings between cash, an account and investments, transfer funds, trade stocks and observe changes in the character, room and financial snapshot.

The game combines a visual Phaser world with React-based finance controls. This makes financial outcomes more concrete than a traditional calculator while keeping the experience interactive and accessible.

# THE WORKING PROTOTYPE

Users can currently:

- Progress through life in five-year moves, from age 20 to 65.
- Set a monthly investment amount based on household income and fixed expenses.
- Allocate investments between cash at home, a savings account and stocks.
- Transfer funds between savings categories.
- Open a stock market, view price history and buy or sell TESLA, MICROSOFT or NVIDIA shares.
- Review net worth, projected annual growth, fixed-cost runway and stock profit or loss.
- Resolve mandatory life-event cards and advance only after the required event is completed.
- View three optional cards per turn and inspect their descriptions.
- See the character and room assets react to selected state changes.

Each move applies income allocations, updates savings, changes stock prices and draws a new set of life events. The available game data includes more than 40 life events.

# BEHIND THE BUILD

The React application owns the interface and global game state. Zustand and Immer provide reactive state management, so salary changes, savings, cards, stock prices and room elements can update together.

Phaser renders the game scene and character. The Room scene subscribes to changes in the Zustand store and updates sprites and the character's age-specific texture. The React-to-Phaser bridge is implemented through PhaserGame.tsx and the shared EventBus.

Key components:

- store.ts: central financial model, turn progression, event resolution, transfers and stock trading.
- src/game/events/*.json: mandatory and optional life-event data.
- src/game/interface/: salary, savings, stock-market and event-card interfaces.
- src/game/scenes/Room.ts: visual character and room rendering.
- src/game/interface/topHud/: age, psyche, progress and financial overview.

The project extends the open-source Phaser React TypeScript template with React 19, Phaser 4 and Vite. Team-created work includes the financial state model, event system, stock market, HUD, savings strategy controls and room integrations.

# CHALLENGES AND DISCOVERIES

The main challenge was keeping two rendering systems synchronized: Phaser for the room and React for the interface. Zustand subscriptions and the EventBus provided a practical shared-state approach.

We also had to balance playable mechanics with a large event dataset. Event data is loaded directly from JSON, while central validation prevents invalid trades, transfers and turns.

The fixed-cost and monthly-investment calculations helped turn the prototype into a model rather than a purely visual game, but connecting every event field, mortgage option and psyche effect is still work in progress.

# RESULTS AND NEXT STEPS

## Achieved

- A working browser-based prototype from financial configuration to turn progression.
- Responsive React controls connected to a Phaser scene.
- Tested core interactions for savings allocation, transfers and stock trading.
- A reusable life-event and turn system with age-based data.
- A clear financial snapshot that summarizes the player's position.

## Current Limitations

- Optional cards are displayed but their effects are not yet fully applied.
- Not every mandatory event and mortgage option has a dedicated choice UI.
- The psyche indicator is currently visual; it is not connected to every life event.
- The game is browser-only and does not persist progress or use a backend.
- All stock prices, expenses and event outcomes are simulated locally.

## Next Steps

1. Connect every optional and mandatory event effect, including multiple-choice decisions.
2. Fully integrate psyche effects and a meaningful retirement score.
3. Add save/load, account simulation and backend-based player data.
4. Improve scenario balance and add validation with real financial examples.
5. Add automated tests and end-to-end browser tests.

## Running the Project

```bash
npm install
npm run dev
