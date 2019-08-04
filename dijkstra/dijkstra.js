document.title = 'Dijkstra';

const WIDTH = 1500;
const HEIGHT = 750;

const FRAMES = 2;

const SAMPLES = 50;

const RAD = 30;
const DIAM = RAD * 2;

let animations = [];
let animId = 0;

let strGraph;
let btn;
let ldg;

let graph = {};
let coords = {};
let bestPath = {};

let currentNode = null;
let currentPath = null;

let initialNode = null;
let finalNode = null;

function generatePoint() {
  return new Complex( random(100, WIDTH - 100), random(100, HEIGHT - 100) );
}

function drawNode(node, col, stw) {
  if ( graph.hasOwnProperty(node) ) {
    let coord = coords[ node ];
    textSize(25);
    fill(255);
    stroke(255);
    strokeWeight(2);
    text(node, coord.re, coord.im);
    noFill();
    stroke(col || 255);
    strokeWeight(stw || 2);
    ellipse(coord.re, coord.im, DIAM);
  }
}

function drawPath(nodeA, nodeB, len, col, stw) {
  let coord = coords[ nodeA ];
  let vec = coords[ nodeB ].sub(coord);
  let vecAbs = vec.abs();
  let ctob = coord.add(new Complex(vec).div( vecAbs ).mul(RAD));
  let btob = ctob.add(vec.div( vecAbs ).mul( vecAbs - DIAM ));
  let mid = ctob.add( btob ).div(2);

  stroke(col || 255);
  strokeWeight(stw || 2);
  line(ctob.re, ctob.im, btob.re, btob.im);
  stroke(255);
  fill(255);
  textSize(20);
  strokeWeight(2);
  text(len, mid.re, mid.im);

}

function isCurrentPath(nodeA, nodeB) {
  return currentPath && currentPath.indexOf(nodeA) > -1 && currentPath.indexOf(nodeB) > -1;
}

function showGraph() {

  beginShape();

  textAlign(CENTER, CENTER);
  strokeWeight(2);
  stroke(255);

  for (let nodeA in graph) {
    drawNode(nodeA);

    for (let nodeB in graph[ nodeA ]) {
      drawPath( nodeA, nodeB, graph[ nodeA][ nodeB ] );
    }
  }

  endShape();

}

function distance(pt1, pt2) {
  return pt1.sub(pt2).abs();
}

function haveIntersections(key) {

  let nodes = Object.keys(graph);

  let pt1 = coords[ key ];

  for (let i = 0, maxi = nodes.length; i < maxi; i += 1) {
    if ( key === nodes[i] ) {
      continue;
    }
    if ( distance(pt1, coords[ nodes[i] ]) <= DIAM ) {
      return true;
    }
  }

  return false;

}

function createGraph(str) {
  let lines = str.replace(/[\r]/g, '').split('\n').map(e => e.trim().split(' '));

  let ini = -1, fin = -1;

  bestPath = {};

  for (let i = 0, maxi = lines.length; i < maxi; i += 1) {
    if ( lines[i].length >= 3 ) {
      let a = lines[i][0];
      let b = lines[i][1];
      let c = +lines[i][2];

      if ( !graph[a] ) {
        graph[a] = {};
        do {
          coords[a] = generatePoint();
        } while( haveIntersections( a ) );
      }

      if ( !graph[b] ) {
        graph[b] = {};
        do {
          coords[b] = generatePoint();
        } while( haveIntersections( b ) );
      }

      graph[a][b] = c;
      graph[b][a] = c;

    } else if ( lines[i].length === 2 ) {
      ini = lines[i][0];
      fin = lines[i][1];
    } else if ( lines[i].length === 1 && lines[i][0] != '' ) {
      let a = lines[i][0];
      if ( !graph[a] ) {
        graph[a] = {};
        do {
          coords[a] = generatePoint();
        } while( haveIntersections( a ) );
      }
    }
  }

  if ( ini === -1 || !graph[ini] || !graph[fin] ) {
    animations.push([ 'error', 'Nodo inicial o final incorrectos' ]);
    return null;
  }

  return [ini, fin];
}

function dijkstra(ini, fin) {

  initialNode = ini;
  finalNode = fin;

  let pq = [];
  let D = {};
  let finished = {};

  Object.keys(graph).forEach((e) => {
    D[e] = Infinity;
    finished[e] = false;
  });

  D[ini] = 0;

  pq.push([ ini, 0 ]);

  bestPath[ ini ] = ini;

  while( pq.length > 0 ) {
    let par = pq.shift();
    let node = par[0];
    let currentDist = par[1];

    animations.push([ 'currentNode', node ]);

    for (let nextNode in graph[node]) {
      let nextDist = currentDist + graph[node][nextNode];
      if ( !finished[ nextNode ] ) {
        animations.push([ 'path', node, nextNode ]);
        if (D[ nextNode ] > nextDist ) {
          D[ nextNode ] = nextDist;
          pq.push( [nextNode, nextDist] );
          bestPath[ nextNode ] = node;
        }
      }
    }

    finished[node] = true;

    pq.sort((a, b) => a[1] - b[1]);

  }

  animations.push(['done']);

  // console.log(D);

}

let bigGraph = [];

function preload() {

  loadStrings('graph.txt', function(res) {
    bigGraph = res.join('\n');
  });
}

function setup() {

  createCanvas(WIDTH, HEIGHT);
  frameRate(FRAMES);

  btn = createButton('Run');
  ldg = createButton('Load Graph');
  strGraph = createElement('textarea');

  strGraph.elt.setAttribute('cols', 60);
  strGraph.elt.setAttribute('rows', 20);
  strGraph.elt.focus();

  btn.mouseClicked(() => {
    animations.length = 0;
    animId = 0;
    bestPath = {};
    graph = {};
    currentNode = null;
    currentPath = null;
    initialNode = null;
    finalNode = null;
    let nodes = createGraph(strGraph.value());
    if ( nodes ) {
      dijkstra(nodes[0], nodes[1]);
    }
  });

  ldg.mouseClicked(() => {
    strGraph.value( bigGraph );
  });

}

function draw() {
  background(0);

  // showGraph();

  if ( animId < animations.length ) {

    let anim = animations[ animId++ ];

    switch(anim[0]) {
      case 'error': {
        stroke(255);
        fill(255);
        textSize(30);
        textAlign(CENTER, CENTER);
        text(anim[1], 0, 0, WIDTH, HEIGHT);
        animId -= 1;
        return;
      }
      case 'currentNode': {
        currentNode = anim[1];
        currentPath = null;
        break;
      }
      case 'path': {
        currentPath = [ anim[1], anim[2] ];
        break;
      }
      case 'done': {
        currentPath = null;
        currentNode = null;
        break;
      }
      default: {
        throw new TypeError('Unknown command ' + anim[0]);
      }
    }

  }

  showGraph();

  if ( currentNode ) {
    drawNode(currentNode, color(255, 45, 45), 4);
  }

  if ( currentPath ) {
    let a = currentPath[0];
    let b = currentPath[1];
    // console.log('currentPath', a, b);
    drawPath(a, b, graph[a][b], color(45, 255, 45), 4);
  }

  if ( animId >= animations.length && finalNode && typeof bestPath[ finalNode ] != 'undefined' ) {
    let node = finalNode;

    while( true ) {
      drawNode(node, color(45, 45, 255), 4);
      let nextNode = bestPath[ node ];
      // console.log(node, nextNode);
      if ( node === nextNode ) {
        break;
      }
      drawPath(node, nextNode, graph[node][nextNode], color(45, 45, 255), 4);
      node = nextNode;
    }
  }

  // if ( animId >= animations.length ) {
  //   noLoop();
  // }

}