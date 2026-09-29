import { Gameboard } from './Gameboard.js'

export class Player {
  constructor(name, type = 'human', boardSize = 10) {
    if (!['human', 'computer'].includes(type)) {
      throw new RangeError('Player type must be human or computer')
    }

    this.name = name
    this.type = type
    this.gameboard = new Gameboard(boardSize)
  }

  chooseAttack(opponentBoard, rng = Math.random) {
    const available = []
    for (let row = 0; row < opponentBoard.size; row += 1) {
      for (let column = 0; column < opponentBoard.size; column += 1) {
        if (!opponentBoard.getCellState([row, column]).isAttacked) {
          available.push([row, column])
        }
      }
    }
    if (available.length === 0) return null
    const index = Math.min(available.length - 1, Math.floor(rng() * available.length))
    return available[index]
  }
}