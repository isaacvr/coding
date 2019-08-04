document.title = 'Prim';

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
let MST = [];

let currentPath = null;

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
    strokeWeight(stw || 3);
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

function showGraph(colors) {

  beginShape();

  textAlign(CENTER, CENTER);
  strokeWeight(2);
  stroke(255);

  for (let nodeA in graph) {
    drawNode(nodeA, colors[nodeA]);

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
    if ( distance(pt1, coords[ nodes[i] ]) <= DIAM + RAD ) {
      return true;
    }
  }

  return false;

}

function createGraph(str) {
  let lines = str.replace(/[\r]/g, '').split('\n').map(e => e.trim().split(' '));

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
}

function prim() {

  let mst = [];

  let ini;

  for (let node in graph) {
    ini = node;
    break;
  }

  let mark = {};

  let Q = [ ini ];
  let pq = [];

  while( Q.length > 0 ) {

    let nodeA = Q.shift();

    animations.push([ 'node', nodeA ]);

    for (let nodeB in graph[ nodeA ]) {
      if ( !mark[ nodeB ] ) {
        animations.push([ 'path', nodeA, nodeB, graph[ nodeA ][ nodeB ] ]);
        pq.push( [ nodeA, nodeB, graph[ nodeA ][ nodeB ] ] );
      }
    }

    mark[ nodeA ] = true;

    animations.push([ 'mark', nodeA ]);

    pq.sort((a, b) => a[2] - b[2]);

    while( pq.length > 0 ) {
      let next = pq.shift();
      if ( !mark[ next[1] ] ) {
        Q.push( next[1] );
        mst.push( next );
        break;
      }
    }

  }

  return mst;

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
    graph = {};
    animMark = {};
    currentPath = null;
    createGraph(strGraph.value());
    MST = prim();
  });

  ldg.mouseClicked(() => {
    strGraph.value( bigGraph );
  });

}

let animMark = {};
let currentNode = null;

function draw() {
  background(0);

  let showMst = false;
  let path = null;

  if ( animId < animations.length ) {

    let anim = animations[ animId++ ];

    switch(anim[0]) {
      case 'node': {
        currentNode = anim[1];
        break;
      }
      case 'mark': {
        animMark[ anim[1] ] = color(45, 45, 255);
        break;
      }
      case 'path': {
        path = anim.slice(1, anim.length);
        break;
      }
      default: {
        throw new TypeError('Unknown command ' + anim[0]);
      }
    }

  } else {
    showMst = true;
    currentNode = null;
  }

  showGraph(animMark);

  if ( path ) {
    drawPath(path[0], path[1], path[2], color(255, 45, 45), 4);
  }

  if ( currentNode ) {
    drawNode(currentNode, color(255, 45, 45), 4);
  }

  if ( showMst ) {
    for (let i = 0, maxi = MST.length; i < maxi; i += 1) {
      drawNode(MST[i][0], color(45, 45, 255), 4);
      drawNode(MST[i][1], color(45, 45, 255), 4);
      drawPath(MST[i][0], MST[i][1], MST[i][2], color(45, 45, 255), 4);
    }
  }

}