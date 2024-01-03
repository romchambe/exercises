const { parser, sum } = require("../utils")
const path = require('path')

const splitInput = (rows) => {
  const splitIndex = rows.findIndex((row) => row === '')

  return [rows.slice(0, splitIndex), rows.slice(splitIndex + 1, rows.length)]
}

const parsePart = (part) => {
  const parsedPart = {}

  part.replaceAll('{', '').replaceAll('}', '').split(',').forEach(characteristic => {
    const [id, val] = characteristic.split('=')
    parsedPart[id] = Number.parseInt(val)
  })

  return parsedPart
}

const parseInstruction = (inst) => {
  if (inst.includes(':')) {
    return inst.split(':')
  }

  return [null, inst]
}

const isConditionMet = (condition, part) => {
  if (condition === null) {
    return true
  }

  if (condition.includes('<')) {
    const [char, val] = condition.split('<')
    return part[char] < Number.parseInt(val)
  }

  if (condition.includes('>')) {
    const [char, val] = condition.split('>')
    return part[char] > Number.parseInt(val)
  }
}

const getWorkflowInstructions = (w) => {
  const instructions = w.match(/\{(.*?)\}/)[1]
  return instructions.split(',').map(parseInstruction)
}

const getWorkflowId = (w) => w.split('{')[0]


const indexWorkflows = (workflows) => {
  const indexedWokflows = {}

  workflows.forEach((w) => {
    const id = getWorkflowId(w)
    indexedWokflows[id] = getWorkflowInstructions(w)
  })

  return indexedWokflows
}

const part1 = (workflows, parts) => {
  const indexedWokflows = indexWorkflows(workflows)

  const filterPart = (part) => {
    let next = 'in'

    while (next !== 'A' && next !== 'R') {
      const instructions = indexedWokflows[next]
      const [_, action] = instructions.find(([condition]) => isConditionMet(condition, part))
      next = action
    }

    return next
  }

  const partValues = parts.map((p) => {
    const part = parsePart(p)
    if (filterPart(part) === 'A') {
      return sum(Object.values(part))
    }
    return 0
  })

  console.log(sum(partValues))
}

const part2 = (workflows) => {
  const indexedWokflows = indexWorkflows(workflows)



}

const getAnswer = async () => {
  const rows = await parser(path.join(__dirname, 'input.txt'))

  const [workflows, parts] = splitInput(rows)

  part1(workflows, parts)

  part2(workflows)
}

exports.getAnswer = getAnswer