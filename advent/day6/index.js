const { multiply } = require("../utils")

const racesRound1 = [[61, 643], [70, 1184], [90, 1362], [66, 1041]]
const racesRound2 = [61709066, 643118413621041]

// We look for the integer x such as 
// x * (availableTime - x) > distance
// -x^2 + x*availableTime - distance > 0

// deriv = -2x + availableTime
// the function grows if x < availableTime / 2, decreases afterwards

// D = availableTime^2 -4 * distance
// If D > 0, this polynom is positive between its two roots and the number of integers between the 2 roots
// Else, it is not possible to beat the record

const numberOfWays = ([availableTime, distance]) => {
  const determinant = availableTime ** 2 - 4 * distance
  const roots = [(-availableTime - Math.sqrt(determinant)) / (-2), (-availableTime + Math.sqrt(determinant)) / (-2)]

  return Math.ceil(roots[0]) - Math.floor(roots[1]) - 1
}

const getAnswer = () => {
  // Round 1
  console.log(multiply(racesRound1.map(numberOfWays)))

  // Round 2
  console.log(numberOfWays(racesRound2))
}

exports.numberOfWays = numberOfWays
exports.getAnswer = getAnswer

