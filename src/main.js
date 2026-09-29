import { GameController } from './GameController.js'
import { Player } from './Player.js'
import { Ship } from './Ship.js'
import { boardMarkup, fleetMarkup } from './dom.js'
import { BOARD_SIZE, FLEET } from './fleet.js'

const app = document.querySelector('#app')
app.innerHTML = `
  <div class="app-shell">
    <header class="topbar">
      <a class="brand" href="#top" aria-label="Fleet Command home"><span class="brand-mark">FC</span><span>FLEET<span class="brand-light">COMMAND</span></span></a>
      <div class="topbar-right"><span class="signal-dot"></span><span>ATLANTIC OPERATIONS</span><span class="topbar-divider"></span><span>SECTOR 08</span></div>
    </header>
    <main id="top">
      <section class="mission-bar" aria-labelledby="page-title">
        <div><p class="eyebrow">TACTICAL SIMULATION <span>·</span> 01 / 01</p><h1 id="page-title">Fleet command</h1></div>
        <button class="reset-button" id="new-game" type="button" title="Start a new game"><span aria-hidden="true">↻</span> New game</button>
      </section>
      <section class="status-strip" aria-label="Match status">
        <div class="status-label"><span class="status-led" id="status-led"></span><span id="phase-label">PREPARATION</span></div>
        <p id="notice" role="status" aria-live="polite">Deploy your fleet to begin the operation.</p>
        <div class="turn-indicator"><span>YOUR TURN</span><b id="turn-state">STANDBY</b></div>
      </section>
      <section class="battle-layout" aria-label="Game boards">
        <article class="board-panel own-panel">
          <div id="own-board" class="board-mount"></div>
          <div class="placement-tools" id="placement-tools">
            <div class="orientation-control" role="group" aria-label="Ship orientation">
              <button type="button" class="orientation-button is-active" data-orientation="horizontal" aria-pressed="true">Horizontal</button>
              <button type="button" class="orientation-button" data-orientation="vertical" aria-pressed="false">Vertical</button>
            </div>
            <button type="button" class="random-button" id="randomize-fleet">Randomize fleet</button>
          </div>
          <div class="fleet-section">
            <div class="section-heading"><span>YOUR FLEET</span><span id="fleet-count">0 / 5 DEPLOYED</span></div>
            <div class="fleet-list" id="fleet-list"></div>
          </div>
        </article>
        <article class="board-panel enemy-panel">
          <div id="enemy-board" class="board-mount"></div>
          <div class="enemy-footer">
            <div class="section-heading"><span>OPPOSITION</span><span class="enemy-callsign">CPU-01</span></div>
            <p id="enemy-note">Enemy fleet signatures are unconfirmed.</p>
            <button class="start-button" id="start-game" type="button" disabled><span>Begin operation</span><span aria-hidden="true">→</span></button>
          </div>
        </article>
      </section>
      <footer class="legend-bar">
        <span><i class="legend-swatch ship-swatch"></i> Your vessel</span>
        <span><i class="legend-swatch hit-swatch"></i> Direct hit</span>
        <span><i class="legend-swatch miss-swatch"></i> Missed shot</span>
        <span class="keyboard-note">GRID COORDINATES · A–J / 1–10</span>
      </footer>
    </main>
    <div class="bottomline"><span>FLEET COMMAND // BATTLESHIP</span><span>EST. 1942&nbsp;&nbsp; · &nbsp;&nbsp;OPERATIONAL</span></div>
  </div>
`

const ownBoardElement = document.querySelector('#own-board')
const enemyBoardElement = document.querySelector('#enemy-board')
const fleetElement = document.querySelector('#fleet-list')
const noticeElement = document.querySelector('#notice')
const phaseElement = document.querySelector('#phase-label')
const turnElement = document.querySelector('#turn-state')
const ledElement = document.querySelector('#status-led')
const fleetCountElement = document.querySelector('#fleet-count')
const startButton = document.querySelector('#start-game')
const enemyNoteElement = document.querySelector('#enemy-note')
const placementTools = document.querySelector('#placement-tools')

let human
let computer
let controller
let placements
let selectedIndex
let orientation
let computerBusy = false
let phase = 'deployment'

function resetGame() {
  human = new Player('You', 'human', BOARD_SIZE)
  computer = new Player('Computer', 'computer', BOARD_SIZE)
  controller = null
  placements = FLEET.map(() => false)
  selectedIndex = 0
  orientation = 'horizontal'
  computerBusy = false
  phase = 'deployment'
  placementTools.hidden = false
  placementTools.querySelectorAll('[data-orientation]').forEach((button) => {
    const active = button.dataset.orientation === orientation
    button.classList.toggle('is-active', active)
    button.setAttribute('aria-pressed', String(active))
  })
  render('Deploy your fleet to begin the operation.')
}

function render(message) {
  const deployedCount = placements.filter(Boolean).length
  const isDeploying = phase === 'deployment'
  const isHumanTurn = phase === 'playing' && controller?.currentPlayer === human && !computerBusy && !controller.isOver
  const sunkCount = human.gameboard.ships.filter((ship) => ship.isSunk()).length
  const missedCount = human.gameboard.missedAttacks.length
  const enemyMisses = computer.gameboard.missedAttacks.length
  const enemyHits = computer.gameboard.ships.reduce((sum, ship) => sum + ship.hits, 0)

  ownBoardElement.innerHTML = boardMarkup(human.gameboard, {
    id: 'own-grid',
    title: 'Friendly waters',
    detail: isDeploying ? 'DEPLOYMENT ZONE' : 'USS CONSTELLATION',
    showShips: true,
    interactive: isDeploying,
  })
  enemyBoardElement.innerHTML = boardMarkup(computer.gameboard, {
    id: 'enemy-grid',
    title: 'Enemy waters',
    detail: isDeploying ? 'AWAITING CONTACT' : 'HOSTILE TERRITORY',
    showShips: false,
    interactive: isHumanTurn,
  })
  fleetElement.innerHTML = fleetMarkup(FLEET, placements, isDeploying ? selectedIndex : -1, human.gameboard.ships)
  fleetCountElement.textContent = `${deployedCount} / ${FLEET.length} DEPLOYED`
  startButton.disabled = !isDeploying || deployedCount !== FLEET.length
  startButton.querySelector('span:first-child').textContent = isDeploying
    ? 'Begin operation'
    : phase === 'complete' ? 'Operation complete' : 'Operation underway'
  phaseElement.textContent = isDeploying ? 'PREPARATION' : phase === 'complete' ? 'MISSION COMPLETE' : 'ENGAGEMENT'
  turnElement.textContent = isDeploying ? 'STANDBY' : phase === 'complete' ? 'COMPLETE' : isHumanTurn ? 'ACTIVE' : 'WAIT'
  ledElement.classList.toggle('is-active', !isDeploying && phase !== 'complete')
  enemyNoteElement.textContent = isDeploying
    ? 'Enemy fleet signatures are unconfirmed.'
    : `${enemyHits} direct hit${enemyHits === 1 ? '' : 's'} · ${enemyMisses} missed shot${enemyMisses === 1 ? '' : 's'}`
  document.querySelector('.own-panel .board-heading .board-size').textContent = `${sunkCount} SUNK · ${missedCount} MISSED`
  if (message) noticeElement.textContent = message
}

function placeSelectedShip(coordinates) {
  const shipInfo = FLEET[selectedIndex]
  if (!shipInfo || placements[selectedIndex]) return
  try {
    human.gameboard.placeShip(new Ship(shipInfo.length), coordinates, orientation)
    placements[selectedIndex] = true
    selectedIndex = placements.findIndex((isPlaced) => !isPlaced)
    render(`${shipInfo.name} deployed. ${placements.filter(Boolean).length} of ${FLEET.length} vessels ready.`)
  } catch (error) {
    render(error.message === 'Ships cannot overlap' ? 'That berth overlaps another vessel.' : 'That vessel will not fit in the selected coordinates.')
  }
}

function beginOperation() {
  if (placements.some((isPlaced) => !isPlaced)) return
  computer.gameboard.randomizeFleet(FLEET.map((ship) => ship.length))
  controller = new GameController(human, computer)
  phase = 'playing'
  placementTools.hidden = true
  render('Operation underway. Select a coordinate in enemy waters to fire.')
}

function resolveAttack(coordinates) {
  const result = controller.attack(coordinates)
  const [row, column] = coordinates
  const coordinateLabel = `${'ABCDEFGHIJ'[row]}${column + 1}`
  if (result.result === 'already-attacked') {
    render(`${coordinateLabel} has already been targeted. Choose a fresh coordinate.`)
    return
  }
  if (result.result === 'game-over') return

  const hitShip = result.defender.gameboard.getCellState(coordinates)
  const outcome = result.result === 'hit'
    ? hitShip.isSunk ? `Direct hit at ${coordinateLabel}. Enemy vessel sunk.` : `Direct hit at ${coordinateLabel}.`
    : `Shot at ${coordinateLabel} missed.`
  if (controller.isOver) {
    phase = 'complete'
    render(`${outcome} ${result.winner.name === human.name ? 'Victory' : 'Defeat'}: operation complete.`)
    return
  }

  if (controller.currentPlayer === computer) {
    computerBusy = true
    render(outcome)
    window.setTimeout(() => {
      const response = controller.playComputerTurn()
      computerBusy = false
      if (!response) return render('Computer has no legal shots remaining.')
      const [targetRow, targetColumn] = response.coordinates
      const target = `${'ABCDEFGHIJ'[targetRow]}${targetColumn + 1}`
      const computerOutcome = response.result === 'hit'
        ? response.defender.gameboard.getCellState(response.coordinates).isSunk
          ? `Enemy fired at ${target}. Your vessel was sunk.`
          : `Enemy fired at ${target}. Your vessel was hit.`
        : `Enemy fired at ${target}. No damage.`
      if (controller.isOver) {
        phase = 'complete'
        render(`${computerOutcome} Defeat: operation complete.`)
      } else {
        render(computerOutcome)
      }
    }, 650)
  } else {
    render(outcome)
  }
}

ownBoardElement.addEventListener('click', (event) => {
  const cell = event.target.closest('[data-coordinates]')
  if (cell && phase === 'deployment') {
    placeSelectedShip(cell.dataset.coordinates.split(',').map(Number))
  }
})

enemyBoardElement.addEventListener('click', (event) => {
  const cell = event.target.closest('[data-coordinates]')
  if (cell && phase === 'playing' && controller.currentPlayer === human && !computerBusy) {
    resolveAttack(cell.dataset.coordinates.split(',').map(Number))
  }
})

fleetElement.addEventListener('click', (event) => {
  const row = event.target.closest('[data-ship-index]')
  if (!row || phase !== 'deployment') return
  selectedIndex = Number(row.dataset.shipIndex)
  render(`${FLEET[selectedIndex].name} selected. Choose a starting coordinate on your board.`)
})

startButton.addEventListener('click', beginOperation)
document.querySelector('#new-game').addEventListener('click', resetGame)

placementTools.addEventListener('click', (event) => {
  const orientationButton = event.target.closest('[data-orientation]')
  if (orientationButton && phase === 'deployment') {
    orientation = orientationButton.dataset.orientation
    placementTools.querySelectorAll('[data-orientation]').forEach((button) => {
      const active = button === orientationButton
      button.classList.toggle('is-active', active)
      button.setAttribute('aria-pressed', String(active))
    })
  }
  if (event.target.closest('#randomize-fleet') && phase === 'deployment') {
    human.gameboard.randomizeFleet(FLEET.map((ship) => ship.length))
    placements = FLEET.map(() => true)
    selectedIndex = -1
    render('Fleet deployed to randomized coordinates. Begin when ready.')
  }
})

resetGame()
