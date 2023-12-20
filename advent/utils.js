const isTruthy = (val) => !!val
const flatten = (acc, current) => {
  return [...acc, ...current]
}
const sum = (array) => array.reduce((acc, current) => current + acc, 0)
const multiply = (array) => array.reduce((acc, current) => current * acc, 1)

exports.sum = sum
exports.multiply = multiply
exports.flatten = flatten
exports.isTruthy = isTruthy