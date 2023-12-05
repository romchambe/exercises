const fs = require('fs')
const path = require('path')

const letters = [
  { regex: /one/, value: '1', },
  { regex: /two/, value: '2', },
  { regex: /three/, value: '3', },
  { regex: /four/, value: '4', },
  { regex: /five/, value: '5', },
  { regex: /six/, value: '6', },
  { regex: /seven/, value: '7', },
  { regex: /eight/, value: '8', },
  { regex: /nine/, value: '9', },
]

const isTruthy = (val) => !!val
const flatten = (acc, current) => {
  return [...acc, ...current]
}
const sum = (array) => array.reduce((acc, current) => current + acc, 0)

const regexParser = (input) => {
  return letters.map(({ regex, value }) => {
    if (input.match(regex)) {
      // We need to match all regex : if we match just the first or the last, we might miss an important piece of info
      return [...input.matchAll(new RegExp(regex, 'g'))].map(({ index }) => ({ value, index }))
    }
  }).filter(isTruthy).reduce(flatten, [])
}

const numberParser = (input) => {
  const chars = input.split('')

  return chars.map((char, index) => {
    return Number.isInteger(Number.parseInt(char, 10)) ? { value: char, index } : null
  }).filter(isTruthy)
}

const parseInput = (input) => {
  const plainLetters = regexParser(input)
  const digits = numberParser(input)

  return [...plainLetters, ...digits].sort((a, b) => a.index - b.index).map(({ value }) => value)
}

const getNumbersFromString = (input) => {
  const numberStrings = parseInput(input)

  if (numberStrings.length === 0) {
    return 0
  }

  const firstNumber = numberStrings.slice(0)[0]
  const lastNumber = numberStrings.slice(-1)[0]

  return Number.parseInt(firstNumber + lastNumber, 10)
}

const getAnswer = () => {
  fs.readFile(
    path.resolve(__dirname, './input.txt'),
    (err, data) => {
      const arrayOfNumbers = data.toString().split('\n').map(
        getNumbersFromString
      )

      console.log('Answer to day 1 :', sum(arrayOfNumbers))
    })
}

exports.getAnswer = getAnswer
exports.getNumbersFromString = getNumbersFromString