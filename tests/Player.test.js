import { Gameboard } from '../src/Gameboard.js'
import { Player } from '../src/Player.js'

describe('Player', () => {
  test('owns a gameboard and identifies its type', () => {
    const player = new Player('Admiral', 'computer')

    expect(player.gameboard).toBeInstanceOf(Gameboard)
    expect(player.type).toBe('computer')
  })

  test('chooses an unplayed coordinate on the opponent board', () => {
    const player = new Player('Computer', 'computer')
    const board = new Gameboard(2)
    board.receiveAttack([0, 0])

    expect(player.chooseAttack(board, () => 0)).toEqual([0, 1])
  })

  test('returns null when no legal attacks remain', () => {
    const player = new Player('Computer', 'computer')
    const board = new Gameboard(1)
    board.receiveAttack([0, 0])

    expect(player.chooseAttack(board)).toBeNull()
  })
})