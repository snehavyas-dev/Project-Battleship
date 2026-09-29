import { Ship } from './Ship.js'

export class Gameboard {
  constructor(size = 10) {
    if (!Number.isInteger(size) || size < 1) {
      throw new RangeError('Board size must be a positive integer')
    }

    this.size = size
    this.grid = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => ({ ship: null, isHit: false, isMiss: false })),
    )
    this.ships = []
    this.missedAttacks = []
  }

  placeShip(ship, coordinates, orientation = 'horizontal') {
    if (!(ship instanceof Ship)) throw new TypeError('A Ship instance is required')
    if (!['horizontal', 'vertical'].includes(orientation)) {
      throw new RangeError('Orientation must be horizontal or vertical')
    }

    const positions = this.#shipPositions(ship, coordinates, orientation)
    if (positions.some(([row, column]) => this.grid[row][column].ship)) {
      throw new RangeError('Ships cannot overlap')
    }

    positions.forEach(([row, column]) => {
      this.grid[row][column].ship = ship
    })
    this.ships.push(ship)
    return ship
  }

  receiveAttack(coordinates) {
    const [row, column] = this.#validateCoordinates(coordinates)
    const cell = this.grid[row][column]
    if (cell.isHit || cell.isMiss) return 'already-attacked'

    if (!cell.ship) {
      cell.isMiss = true
      this.missedAttacks.push([row, column])
      return 'miss'
    }

    cell.isHit = true
    cell.ship.hit()
    return 'hit'
  }

  getCellState(coordinates) {
    const [row, column] = this.#validateCoordinates(coordinates)
    const cell = this.grid[row][column]
    return {
      hasShip: Boolean(cell.ship),
      isHit: cell.isHit,
      isMiss: cell.isMiss,
      isAttacked: cell.isHit || cell.isMiss,
      isSunk: Boolean(cell.ship?.isSunk()),
    }
  }

  allShipsSunk() {
    return this.ships.length > 0 && this.ships.every((ship) => ship.isSunk())
  }

  randomizeFleet(lengths = [5, 4, 3, 3, 2], rng = Math.random) {
    this.#reset()

    lengths.forEach((length) => {
      let placed = false
      for (let attempt = 0; attempt < 1000 && !placed; attempt += 1) {
        const orientation = rng() < 0.5 ? 'horizontal' : 'vertical'
        const row = Math.floor(rng() * this.size)
        const column = Math.floor(rng() * this.size)
        try {
          this.placeShip(new Ship(length), [row, column], orientation)
          placed = true
        } catch {
          continue
        }
      }
      if (!placed) throw new Error('Unable to place the full fleet')
    })
  }

  #shipPositions(ship, coordinates, orientation) {
    const [startRow, startColumn] = this.#validateCoordinates(coordinates)
    const positions = Array.from({ length: ship.length }, (_, offset) => [
      startRow + (orientation === 'vertical' ? offset : 0),
      startColumn + (orientation === 'horizontal' ? offset : 0),
    ])
    if (positions.some(([row, column]) => row >= this.size || column >= this.size)) {
      throw new RangeError('Ship placement is outside the board')
    }
    return positions
  }

  #validateCoordinates(coordinates) {
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
      throw new TypeError('Coordinates must be a [row, column] pair')
    }
    const [row, column] = coordinates
    if (
      !Number.isInteger(row) ||
      !Number.isInteger(column) ||
      row < 0 ||
      column < 0 ||
      row >= this.size ||
      column >= this.size
    ) {
      throw new RangeError('Coordinates are outside the board')
    }
    return [row, column]
  }

  #reset() {
    this.grid.forEach((row) => {
      row.forEach((cell) => {
        cell.ship = null
        cell.isHit = false
        cell.isMiss = false
      })
    })
    this.ships = []
    this.missedAttacks = []
  }
}