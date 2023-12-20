const fs = require('fs')
const path = require('path')

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

class Summit {
  constructor(type, x, y, graph) {
    this.x = x
    this.y = y
    this.type = type
    this.graph = graph
    this.distance = null
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
    this.dimensions = [this.rows[0].length, this.rows.length]
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
    return x < this.dimensions[0] && y < this.dimensions[1] && x >= 0 && y >= 0
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


    return lastLayer
  }

  print() {
    this.rows.forEach(row => {
      process.stdout.write(row.map(s => s.distance === null ? s.type : '■').join('') + '\n')
    })
  }
}

class BigGraph extends Graph {
  constructor(rows) {
    super(rows)
  }

  buildGraph(rows) {
    this.rows = super.buildGraph(rows)

  }
}

const getAnswer = () => {
  fs.readFile(
    path.resolve(__dirname, './input.txt'),
    (err, data) => {
      const rows = data.toString().split('\n')
      const graph = new Graph(rows)

      graph.connect()
      const { distance } = graph.explore(graph.entry, 0)
      console.log('Answer to part 1 :', distance)
    }
  )
}

exports.getAnswer = getAnswer