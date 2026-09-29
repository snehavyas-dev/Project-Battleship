import { Ship } from '../src/Ship.js'

describe('Ship', () => {
  test('records hits and reports sunk at its length', () => {
    const ship = new Ship(2)

    expect(ship.isSunk()).toBe(false)
    ship.hit()
    expect(ship.hits).toBe(1)
    expect(ship.isSunk()).toBe(false)
    ship.hit()
    expect(ship.isSunk()).toBe(true)
  })

  test('requires a positive whole-number length', () => {
    expect(() => new Ship(0)).toThrow()
    expect(() => new Ship(2.5)).toThrow()
  })
})