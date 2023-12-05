const isTruthy = (val) => !!val
const flatten = (acc, current) => {
  return [...acc, ...current]
}
const sum = (array) => array.reduce((acc, current) => current + acc, 0)

exports.sum = sum
exports.flatten = flatten
exports.isTruthy = isTruthy