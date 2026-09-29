import { Gameboard } from '../src/Gameboard.js'
import { Ship } from '../src/Ship.js'

describe('Gameboard', () => {
  test('places a ship across its requested coordinates', () => {
    const board = new Gameboard()
    const ship = new Ship(3)

    board.placeShip(ship, [2, 4], 'horizontal')

    expect(board.getCellState([2, 4]).hasShip).toBe(true)
    expect(board.getCellState([2, 6]).hasShip).toBe(true)
    expect(board.getCellState([3, 4]).hasShip).toBe(false)
  })

  test('rejects placements outside the board or overlapping another ship', () => {
    const board = new Gameboard()
    board.placeShip(new Ship(3), [0, 0], 'horizontal')

    expect(() => board.placeShip(new Ship(2), [0, 2], 'horizontal')).toThrow()
    expect(() => board.placeShip(new Ship(2), [9, 9], 'vertical')).toThrow()
  })

  test('records misses and hits, and prevents repeat attacks', () => {
    const board = new Gameboard()
    board.placeShip(new Ship(2), [1, 1], 'vertical')

    expect(board.receiveAttack([1, 1])).toBe('hit')
    expect(board.receiveAttack([1, 1])).toBe('already-attacked')
    expect(board.receiveAttack([5, 5])).toBe('miss')
    expect(board.missedAttacks).toEqual([[5, 5]])
    expect(board.getCellState([1, 1]).isHit).toBe(true)
    expect(board.getCellState([5, 5]).isMiss).toBe(true)
  })

  test('reports when every placed ship is sunk', () => {
    const board = new Gameboard()
    board.placeShip(new Ship(1), [0, 0])

    expect(board.allShipsSunk()).toBe(false)
    board.receiveAttack([0, 0])
    expect(board.allShipsSunk()).toBe(true)
  })
})