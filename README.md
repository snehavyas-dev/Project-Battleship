# Fleet Command: Battleship

A browser-based Battleship game against a computer opponent. Built with vanilla JavaScript modules, Vite, Jest, and Babel.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Getting started

```sh
npm install
npm run dev
```

Open the local URL printed by Vite to play.

## How to play

1. Deploy each ship by selecting it from the fleet list and choosing a starting cell on your board. Choose horizontal or vertical orientation first.
2. Use **Randomize fleet** to place all ships automatically.
3. Select **Begin operation**, then click a cell in enemy waters to fire.
4. Players alternate attacks. The computer chooses a random cell it has not attacked before. Sink the opposing fleet to win.
5. Select **New game** to reset the match.

## Tests and production build

```sh
npm test -- --runInBand
npm run build
npm run preview
```

The Jest tests cover the public game logic; the DOM is intentionally not tested.

## Project structure

- `src/Ship.js`: ship hit and sunk state
- `src/Gameboard.js`: ship placement, attacks, misses, and fleet state
- `src/Player.js`: player types and legal computer attacks
- `src/GameController.js`: turns, computer turns, and win conditions
- `src/dom.js`: board and fleet rendering
- `src/main.js`: interface events and game flow
- `tests/`: unit tests for game logic

For GitHub Pages deployment under a repository subpath, set Vite's `base` option to that subpath before building.
