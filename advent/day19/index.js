const { parser, sum, multiply, deepCopy } = require("../utils")
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

const isActionWorkflow = (action) => action !== 'A' && action !== 'R'

const part1 = (workflows, parts) => {
  const indexedWokflows = indexWorkflows(workflows)

  const filterPart = (part) => {
    let next = 'in'

    while (isActionWorkflow(next)) {
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

  console.log("Part 1:", sum(partValues))
}

const getPossibilitiesBasedOnCondition = (condition, possibilities) => {
  const possibilitiesForCurrent = deepCopy(possibilities)
  const possibilitiesForNext = deepCopy(possibilities)

  if (condition === null) {
    return [possibilitiesForCurrent, possibilitiesForNext]
  }

  const splitChar = condition.includes('<') ? '<' : '>'
  const [char, v] = condition.split(splitChar)
  const val = Number.parseInt(v)

  if (condition.includes('<')) {
    possibilitiesForCurrent[char].max = val - 1
    possibilitiesForNext[char].min = val
  }

  if (condition.includes('>')) {
    possibilitiesForCurrent[char].min = val + 1
    possibilitiesForNext[char].max = val
  }

  return [possibilitiesForCurrent, possibilitiesForNext]
}

const part2 = (workflows) => {
  const indexedWokflows = indexWorkflows(workflows)

  let combinations = 0
  let layer = [{
    id: 'in', possibilities: {
      x: { min: 1, max: 4000 },
      m: { min: 1, max: 4000 },
      a: { min: 1, max: 4000 },
      s: { min: 1, max: 4000 }
    }
  }]

  while (layer.length > 0) {
    const nextLayer = []

    layer.forEach((node) => {
      let possibilities = node.possibilities
      const instructions = indexedWokflows[node.id]

      instructions.forEach(([condition, action]) => {
        const [possibilitiesForCurrent, possibilitiesForNext] = getPossibilitiesBasedOnCondition(
          condition, possibilities
        )


        possibilities = possibilitiesForNext

        if (isActionWorkflow(action)) {
          nextLayer.push({ id: action, possibilities: possibilitiesForCurrent })
        } else {
          if (action === 'R') {
            return
          }

          if (action === 'A') {
            console.log(possibilitiesForCurrent)
            combinations += multiply(Object.values(possibilitiesForCurrent).map(({ min, max }) => Math.max(max - min + 1, 0)))
          }
        }
      })
    })

    layer = nextLayer
  }

  console.log("Part 2", combinations)
}


const getAnswer = async () => {
  const rows = await parser(path.join(__dirname, 'input.txt'))

  const [workflows, parts] = splitInput(rows)

  part1(workflows, parts)
  part2(workflows)
}

exports.getAnswer = getAnswer