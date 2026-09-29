const LETTERS = 'ABCDEFGHIJ'

export function boardMarkup(board, { id, title, detail, showShips, interactive }) {
  const columnLabels = Array.from({ length: board.size }, (_, column) =>
    `<span class="axis-label" aria-hidden="true">${column + 1}</span>`,
  ).join('')
  const rows = Array.from({ length: board.size }, (_, row) => {
    const cells = Array.from({ length: board.size }, (_, column) => {
      const state = board.getCellState([row, column])
      const classes = ['cell']
      if (showShips && state.hasShip) classes.push('is-ship')
      if (state.isMiss) classes.push('is-miss')
      if (state.isHit) classes.push('is-hit')
      if (state.isSunk && state.isHit) classes.push('is-sunk')
      const description = state.isHit
        ? 'hit'
        : state.isMiss
          ? 'miss'
          : showShips && state.hasShip
            ? 'ship'
            : 'unknown'
      const disabled = !interactive || state.isAttacked ? 'disabled' : ''
      return `<button class="${classes.join(' ')}" type="button" data-coordinates="${row},${column}" aria-label="${LETTERS[row]}${column + 1}, ${description}" ${disabled}></button>`
    }).join('')
    return `<span class="axis-label" aria-hidden="true">${LETTERS[row]}</span>${cells}`
  }).join('')

  return `
    <div class="board-heading">
      <div><span class="board-label">${title}</span><span class="board-detail">${detail}</span></div>
      <span class="board-size">${board.size} × ${board.size}</span>
    </div>
    <div class="board-grid" id="${id}" style="--board-size: ${board.size}" role="group" aria-label="${title}">
      <span class="axis-corner" aria-hidden="true"></span>${columnLabels}${rows}
    </div>
  `
}

export function fleetMarkup(fleet, placed, selectedIndex, ships = []) {
  return fleet.map((ship, index) => {
    const isPlaced = placed[index]
    const matchingShips = ships.filter((item) => item.length === ship.length)
    const occurrence = fleet.slice(0, index + 1).filter((item) => item.length === ship.length).length - 1
    const actualShip = matchingShips[occurrence]
    const isSunk = actualShip?.isSunk() ?? false
    const state = isSunk ? 'Sunk' : isPlaced ? 'Deployed' : 'Ready'
    const squares = Array.from({ length: ship.length }, () => '<i></i>').join('')
    const disabled = isPlaced ? 'disabled' : ''
    const selected = selectedIndex === index ? 'is-selected' : ''
    return `
      <button class="fleet-row ${selected} ${isPlaced ? 'is-placed' : ''} ${isSunk ? 'is-sunk' : ''}" type="button" data-ship-index="${index}" ${disabled}>
        <span class="fleet-shape" aria-hidden="true">${squares}</span>
        <span class="fleet-name">${ship.name}<small>${ship.length} ${ship.length === 1 ? 'cell' : 'cells'}</small></span>
        <span class="fleet-state">${state}</span>
      </button>
    `
  }).join('')
}