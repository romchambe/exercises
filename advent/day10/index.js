const fs = require('fs')
const path = require('path')

const moves = [[-1, 0], [1, 0], [0, -1], [0, 1]]
const getCandidates = (type, x, y) => {
  switch (type) {
    case '.':
      []
    case '|':
      return [[x, y - 1], [x, y + 1]]
    case '-':
      return [[x - 1, y], [x + 1, y]]
    case 'F':
      return [[x + 1, y], [x, y + 1]]
    case '7':
      return [[x - 1, y], [x, y + 1]]
    case 'J':
      return [[x - 1, y], [x, y - 1]]
    case 'L':
      return [[x + 1, y], [x, y - 1]]
    case 'S':
      return [[x + 1, y], [x, y + 1], [x, y - 1], [x - 1, y]]
  }
}

const getGapValue = (direction, [type1, type2]) => {
  const valid = {
    north: ['-', 'J', 'L', '0', 'I'],
    south: ['-', 'F', '7', '0', 'I'],
    east: ['|', 'F', 'L', '0', 'I'],
    west: ['|', 'J', '7', '0', 'I'],
  }

  switch (direction) {
    case 'WE':
      return valid.north.includes(type1) && valid.south.includes(type2) ? 'o' : 'X'
    case 'NS':
      return valid.west.includes(type1) && valid.east.includes(type2) ? 'o' : 'X'

  }
}

class Summit {
  constructor(type, x, y, graph) {
    this.x = x
    this.y = y
    this.type = type
    this.graph = graph
    this.distance = null
    this.reachable = false
  }

  buildConnected() {
    const candidatesPosisitons = getCandidates(this.type, this.x, this.y)

    // we get the candidate summits that are in the grid
    const candidatesInGrid = candidatesPosisitons
      .map(
        ([x, y]) => this.graph.getByPosition(x, y)
      )
      .filter(val => !!val)

    // for each candidate, we look for the ones that have a connection with the current pipe
    this.connected = candidatesInGrid.filter(({ type, x: candidateX, y: candidateY }) => {
      const candidatesOfCandidate = getCandidates(type, candidateX, candidateY)

      return !!candidatesOfCandidate.find(([x, y]) => this.isCurrent(x, y))
    })
  }

  isCurrent(x, y) {
    return x === this.x && y === this.y
  }

  setDistance(dist) {
    this.distance = dist
  }
}

class Graph {
  constructor(rows) {
    this.buildGraph(rows)
    this.connect()
    this.explore(this.entry, 0)
  }

  buildGraph(rows) {
    this.rows = rows.map(
      (row, y) => row.split('').map(
        (type, x) => {
          const summit = new Summit(type, x, y, this)

          if (type === 'S') {
            this.entry = summit
          }

          return summit
        }
      )
    )
  }

  isInGraph(x, y) {
    return x < this.rows[0].length && y < this.rows.length && x >= 0 && y >= 0
  }

  neighbourIsOut(x, y) {
    return x === 0 || y === 0 || x === this.rows[0].length - 1 || y === this.rows.length - 1
  }

  getByPosition(x, y) {
    return this.isInGraph(x, y) ? this.rows[y][x] : null
  }

  connect() {
    this.rows.forEach((row) => row.forEach(summit => summit.buildConnected()))
  }

  explore(fromSummit, distance) {
    const lastLayer = {
      summits: [fromSummit],
      distance
    }

    while (lastLayer.summits.find(s => s.connected.length > 0)) {
      // We set the distance of the summit : it has been visited
      lastLayer.summits.forEach(s => s.distance = lastLayer.distance)

      // We check which summit are connected to the current layer and have not been visited yet
      lastLayer.summits = lastLayer.summits
        .map(
          currentLayerSummit => currentLayerSummit.connected
            .filter(
              nextLayerSummit => nextLayerSummit.distance === null
            )
        )
        .reduce(
          (nextLayer, connectedList) => ([...nextLayer, ...connectedList]), []
        )

      lastLayer.distance += 1
    }


    this.maxDistance = lastLayer.distance
  }

  print() {
    this.rows.forEach(row => {
      process.stdout.write(row.map(s => s.type).join('') + '\n')
    })
  }
}

class BigGraph {
  constructor(baseGraph) {
    this.rows = baseGraph.rows.map(
      (row, y) => row.map(
        (summit, x) => {
          if (summit.distance === null) {
            return baseGraph.neighbourIsOut(x, y) ? '0' : 'I'
          }

          return summit.type
        }
      )
    )

    this.base = baseGraph

    this.expand()
  }

  expand() {
    const dimensionY = this.rows.length
    this.rows.forEach(row => {
      const dimensionX = row.length
      for (let x = 0; x < dimensionX; x++) {
        row.splice(x * 2 + 1, 0, '?')
      }
    })
    for (let y = 0; y < dimensionY; y++) {
      this.rows.splice(y * 2 + 1, 0, Array(this.rows[0].length).fill('?'))
    }
  }

  buildGaps() {
    this.rows = this.rows.map((row, y) => {
      if (y % 2 === 0) {
        return row.map((cell, x) => {
          if (cell === '?') {
            const baseX = Math.floor(x / 2)
            const baseY = Math.floor(y / 2)
            const west = this.base.getByPosition(baseX, baseY)
            const east = this.base.getByPosition(baseX + 1, baseY)

            return !east || !west || east.distance === null || west.distance === null
              ? 'o'
              : getGapValue('NS', [west.type, east.type])
          }
          return cell
        })
      }

      if (y % 2 === 1) {
        return row.map((_, x) => {
          const baseX = Math.floor(x / 2)
          const baseY = Math.floor(y / 2)
          const north = this.base.getByPosition(baseX, baseY)
          const south = this.base.getByPosition(baseX, baseY + 1)
          if (!north || !south || north.distance === null || south.distance === null) return 'o'
          return x % 2 === 0 ? getGapValue('WE', [north.type, south.type]) : 'o'
        })
      }
    })
  }

  explore() {
    const dimension = this.rows.length
    const edges = [0, this.rows.length - 1]

    for (let x of edges) {
      for (let y = 0; y < dimension; y++) {
        if (this.rows[y][x] === '0') {
          this.conquer(x, y)
        }
      }
    }

    for (let y of edges) {
      for (let x = 0; x < dimension; x++) {
        if (this.rows[y][x] === '0') {
          this.conquer(x, y)
        }
      }
    }
  }

  conquer(x, y) {
    this.rows[y][x] = '0'
    console.log(x, y)
    moves.forEach(([moveX, moveY]) => {
      if (this.isInGraph(x + moveX, y + moveY) && this.conquerable(x + moveX, y + moveY)) {
        this.conquer(x + moveX, y + moveY)
      }
    })
  }

  conquerable(x, y) {
    return this.rows[y][x] === 'o' || this.rows[y][x] === 'I'
  }

  isInGraph(x, y) {
    return x < this.rows[0].length && y < this.rows.length && x >= 0 && y >= 0
  }

  count() {
    return this.rows.reduce(
      (sum, row) => sum + row.reduce(
        (rowSum, summit) => summit === 'I' ? rowSum + 1 : rowSum, 0)
      , 0
    )
  }

  print() {
    this.rows.forEach(row => {
      process.stdout.write(row.join('') + '\n')
    })
  }
}

const getAnswer = () => {
  fs.readFile(
    path.resolve(__dirname, './input.txt'),
    (err, data) => {
      const rows = data.toString().split('\n')
      const graph = new Graph(rows)
      console.log('Answer to part 1 :', graph.maxDistance,)

      const bigGraph = new BigGraph(graph)
      bigGraph.buildGaps()
      bigGraph.print()
      bigGraph.explore()

      console.log('Answer to part 2 :', bigGraph.count(),)
    }
  )
}

exports.getAnswer = getAnswer
