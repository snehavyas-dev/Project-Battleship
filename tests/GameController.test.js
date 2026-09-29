import { GameController } from '../src/GameController.js'
import { Player } from '../src/Player.js'
import { Ship } from '../src/Ship.js'

describe('GameController', () => {
  function createGame() {
    const human = new Player('You')
    const computer = new Player('Computer', 'computer')
    human.gameboard.placeShip(new Ship(1), [0, 1])
    computer.gameboard.placeShip(new Ship(1), [1, 1])
    return new GameController(human, computer, () => 0)
  }

  test('alternates turns after a legal attack', () => {
    const game = createGame()

    game.attack([9, 9])

    expect(game.currentPlayer).toBe(game.players[1])
  })

  test('does not advance the turn after a repeated attack', () => {
    const game = createGame()
    game.attack([9, 9])
    game.attack([0, 0])

    const repeatedShot = game.attack([9, 9])

    expect(repeatedShot.result).toBe('already-attacked')
    expect(game.currentPlayer).toBe(game.players[0])
  })

  test('ends the game and names the winner when the enemy fleet sinks', () => {
    const game = createGame()

    const result = game.attack([1, 1])

    expect(result.winner).toBe(game.players[0])
    expect(game.isOver).toBe(true)
    expect(game.attack([2, 2]).result).toBe('game-over')
  })
})