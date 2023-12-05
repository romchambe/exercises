const { getNumbersFromString, parseInput } = require('.')

// Day 1 
test('Parse strings to get two-digits numbers', () => {
  expect(getNumbersFromString('jnzrojjvnb')).toEqual(0)
  expect(getNumbersFromString('jnz1ojjvnb')).toEqual(11)
  expect(getNumbersFromString('jnz1ojj8nb')).toEqual(18)
  expect(getNumbersFromString('jnz4 58nb')).toEqual(48)
})

test('Parse strings to find numbers in plain text', () => {
  expect(getNumbersFromString('jnzrojjvnb')).toEqual(0)
  expect(getNumbersFromString('jnzfourfourojjvnb')).toEqual(44)
  expect(getNumbersFromString('jnz1ojjfivenb')).toEqual(15)
  expect(getNumbersFromString('jnz4two58threenb')).toEqual(43)
  expect(getNumbersFromString('two1nine')).toEqual(29)
  expect(getNumbersFromString('eightwothree')).toEqual(83)
  expect(getNumbersFromString('abcone2threexyz')).toEqual(13)
  expect(getNumbersFromString('xtwone3four')).toEqual(24)
  expect(getNumbersFromString('4nineeightseven2')).toEqual(42)
  expect(getNumbersFromString('zoneight234')).toEqual(14)
  expect(getNumbersFromString('7pqrstsixteen')).toEqual(76)
  expect(getNumbersFromString('7pqrstsix8sixteen')).toEqual(76)
})


