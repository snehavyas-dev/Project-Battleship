export class GameController {
  constructor(playerOne, playerTwo, rng = Math.random) {
    this.players = [playerOne, playerTwo]
    this.currentPlayer = playerOne
    this.rng = rng
    this.isOver = false
    this.winner = null
  }

  attack(coordinates) {
    if (this.isOver) {
      return { result: 'game-over', attacker: this.currentPlayer, defender: null, winner: this.winner }
    }

    const attacker = this.currentPlayer
    const defender = this.players.find((player) => player !== attacker)
    const result = defender.gameboard.receiveAttack(coordinates)
    if (result === 'already-attacked') {
      return { result, attacker, defender, winner: null }
    }

    if (defender.gameboard.allShipsSunk()) {
      this.isOver = true
      this.winner = attacker
    } else {
      this.currentPlayer = defender
    }

    return { result, attacker, defender, winner: this.winner }
  }

  playComputerTurn() {
    if (this.isOver || this.currentPlayer.type !== 'computer') return null
    const defender = this.players.find((player) => player !== this.currentPlayer)
    const coordinates = this.currentPlayer.chooseAttack(defender.gameboard, this.rng)
    if (!coordinates) return null
    return { coordinates, ...this.attack(coordinates) }
  }
}