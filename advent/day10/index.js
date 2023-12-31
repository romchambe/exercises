const fs = require('fs')
const { connect } = require('http2')
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
    north: ['-', 'J', 'L', '0', 'I', 'o', 'X'],
    south: ['-', 'F', '7', '0', 'I', 'o', 'X'],
    east: ['|', 'F', 'L', '0', 'I', 'o', 'X'],
    west: ['|', 'J', '7', '0', 'I', 'o', 'X'],
  }

  switch (direction) {
    case 'WE':
      return valid.north.includes(type1) && valid.south.includes(type2) ? 'o' : 'X'
    case 'NS':
      return valid.west.includes(type1) && valid.east.includes(type2) ? 'o' : 'X'

  }
}

class Cell {
  constructor(type, x, y, graph) {
    this.x = x
    this.y = y
    this.type = type
    this.graph = graph
    this.distance = null
  }

  buildConnected() {
    const candidatesPosisitons = getCandidates(this.type, this.x, this.y)

    // we get the candidate cells that are in the grid
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
  }

  buildGraph(rows) {
    this.rows = rows.map(
      (row, y) => row.split('').map(
        (type, x) => {
          const cell = new Cell(type, x, y, this)
          if (type === 'S') {
            this.entry = cell
          }
          return cell
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
    this.rows.forEach((row) => row.forEach(cell => cell.buildConnected()))
  }

  explore() {
    const lastLayer = {
      cells: [this.entry],
      distance: 0
    }

    while (lastLayer.cells.find(c => c.connected.length > 0)) {
      // We set the distance of the cell : it has been visited
      lastLayer.cells.forEach(s => s.distance = lastLayer.distance)

      // We check which cells are connected to the current layer and have not been visited yet
      lastLayer.cells = lastLayer.cells
        .map(
          currentLayerCell => currentLayerCell.connected
            .filter(
              nextLayerCell => nextLayerCell.distance === null
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
  constructor(graph) {
    this.rows = []
    this.base = graph
    this.buildGraph()
    this.buildGaps()
  }

  buildGraph() {
    this.base.rows.forEach(
      (baseRow, y) => {
        const row = []

        baseRow.forEach(
          (cell, x) => {
            const getCellValue = () => {
              if (cell.distance === null) {
                // If the cell is not part of the loop and is on an edge, we initialize it with 0 else I
                return this.base.neighbourIsOut(x, y) ? '0' : 'I'
              }

              return cell.type
            }

            row.push(getCellValue())
            row.push('?')
          }
        )

        this.rows.push(row)
        this.rows.push(Array(this.rows[0].length).fill('?'))
      }
    )
  }

  buildGaps() {
    this.rows = this.rows.map((row, y) => {
      const isNorthSouthGap = y % 2 === 0

      return row.map((cell, x) => {
        // This is the case where a gap on a row that only contains gaps (y % 2 === 0) 
        // is surrounded by gaps north and south (x % 2 === 1)
        if (y % 2 === 1 && x % 2 === 1) {
          return 'o'
        }

        const baseX = Math.floor(x / 2)
        const baseY = Math.floor(y / 2)

        const neighbourPipes = [
          this.base.getByPosition(baseX, baseY),
          isNorthSouthGap
            ? this.base.getByPosition(baseX + 1, baseY)
            : this.base.getByPosition(baseX, baseY + 1)
        ]

        if (cell === '?') {
          return (
            // one of the neighbour pipes is out of the graph
            neighbourPipes.includes(null)
            // one of the neighbour pipes is not part of the main loop
            || neighbourPipes.find(cell => cell.distance === null)
          )
            ? 'o'
            : getGapValue(isNorthSouthGap ? 'NS' : 'WE', neighbourPipes.map(({ type }) => type))
        }

        return cell
      })
    })
  }

  explore() {
    const dimension = this.rows.length
    const edges = [0, this.rows.length - 2]

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

  conquer(initialX, initialY) {
    let cells = [[initialX, initialY]]

    while (cells.length > 0) {
      const [[x, y]] = cells.splice(0, 1)

      moves.forEach(([moveX, moveY]) => {
        if (this.isInGraph(x + moveX, y + moveY) && this.conquerable(x + moveX, y + moveY)) {
          cells.push([x + moveX, y + moveY])
          this.rows[y + moveY][x + moveX] = '0'
        }
      })

    }
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
        (rowSum, cell) => cell === 'I' ? rowSum + 1 : rowSum, 0)
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
      graph.explore()
      console.log('Answer to part 1 :', graph.maxDistance,)

      const bigGraph = new BigGraph(graph)
      bigGraph.explore()
      console.log('Answer to part 2 :', bigGraph.count(),)
    }
  )
}

exports.getAnswer = getAnswer
