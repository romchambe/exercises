const fs = require('fs')
const path = require('path')
const { sum, multiply } = require('../utils')

const limits = {
  red: 12,
  green: 13,
  blue: 14
}

const parseRow = (row) => {
  const [game, rest] = row.split(': ')
  const id = Number.parseInt(game.split(' ')[1], 10)

  const maxOfSets = { green: 0, red: 0, blue: 0 }

  rest.split('; ').forEach((set) => {
    set.split(', ').forEach(result => {
      const [rawCount, color] = result.split(' ')
      const count = Number.parseInt(rawCount, 10)
      if (maxOfSets[color] < count) {
        maxOfSets[color] = count
      }
    })
  })

  return { id, maxOfSets }
}


const isGamePossible = (row) => {
  const { id, maxOfSets } = parseRow(row)

  for (const [color, limit] of Object.entries(limits)) {
    if (maxOfSets[color] > limit) {
      return 0
    }
  }

  return id
}


const getAnswer = () => {
  fs.readFile(
    path.resolve(__dirname, './input.txt'),
    (err, data) => {
      const arrayOfInputs = data.toString().split('\n')

      const possibleGames = arrayOfInputs.map(
        isGamePossible
      )

      const minimumGamesPower = arrayOfInputs.map(parseRow).map(({ maxOfSets }) => {
        return multiply(Object.values(maxOfSets))
      })

      console.log('Answer to day 2 - part 1:', sum(possibleGames))
      console.log('Answer to day 2 - part 2:', sum(minimumGamesPower))
    })
}

exports.getAnswer = getAnswer