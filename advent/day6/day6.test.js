const { numberOfWays } = require('.')

// Day 1 
test('Get number of ways to win a race', () => {
  expect(numberOfWays([7, 9])).toEqual(4)
  expect(numberOfWays([15, 40])).toEqual(8)
  expect(numberOfWays([30, 200])).toEqual(9)

})
