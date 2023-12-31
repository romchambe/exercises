const fs = require('fs')
const path = require('path')

const isTruthy = (val) => !!val
const flatten = (acc, current) => {
  return [...acc, ...current]
}

const sum = (array) => array.reduce((acc, current) => current + acc, 0)
const multiply = (array) => array.reduce((acc, current) => current * acc, 1)

const isObject = (val) => {
  if (val === null) { return false; }
  return ((typeof val === 'function') || (typeof val === 'object'));
}

const deepCopy = (obj) => {
  const copy = {}

  Object.entries(obj).forEach(([k, v]) => {
    copy[k] = isObject(v) ? deepCopy(v) : v
  })

  return copy
}



const parser = filePath => {
  return new Promise((res, rej) => {
    fs.readFile(
      path.resolve(filePath),
      (err, data) => {
        if (err) {
          rej(err)
        }

        const rows = data.toString().split('\n')

        res(rows)
      }
    )
  })
}

exports.deepCopy = deepCopy
exports.parser = parser
exports.sum = sum
exports.multiply = multiply
exports.flatten = flatten
exports.isTruthy = isTruthy