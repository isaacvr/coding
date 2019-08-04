document.title = 'Kruscal';

const WIDTH = 1500;
const HEIGHT = 750;

const FRAMES = 1;

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
    if ( distance(pt1, coords[ nodes[i] ]) <= DIAM ) {
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

function kruscal() {

  let paths = [];
  let mst = [];
  let P = {};
  let R = {};
  let C = {};

  let taken = {};

  let take = (a, b) => {
    taken[a] = taken[a] || {};
    taken[a][b] = true;
  };

  for (let a in graph) {
    for (let b in graph[a]) {
      if ( !(taken[a] && taken[a][b]) ) {
        paths.push([ a, b, graph[a][b] ]);
        take(a, b);
        take(b, a);
      }
    }
    P[a] = a;
    R[a] = 1;
    C[a] = color( ~~random(255), ~~random(255), ~~random(255) );
  }

  animations.push([ 'init', C ]);

  let parent = (x) => {
    if ( P[x] != x ) {
      return P[x] = parent( P[x] );
    }
    return x;
  };

  let join_sets = (setA, setB) => {
    if ( R[ setA ] > R[ setB ] ) {
      animations.push([ 'join', setB, setA ]);
      P[ setB ] = setA;
      R[ setA ] += R[ setB ];
    } else {
      animations.push([ 'join', setA, setB ]);
      P[ setA ] = setB;
      R[ setB ] += R[ setA ];
    }
  };

  paths.sort((a, b) => a[2] - b[2]);

  while( paths.length > 0 ) {

    let path = paths.shift();

    let a = path[0];
    let b = path[1];

    let setA = parent(a);
    let setB = parent(b);

    animations.push([ 'path', a, b, path[2] ]);

    if ( setA != setB ) {
      join_sets(setA, setB);
      mst.push( path );
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
    animColors = {};
    animSets = {};
    currentPath = null;
    createGraph(strGraph.value());
    MST = kruscal();
  });

  ldg.mouseClicked(() => {
    strGraph.value( bigGraph );
  });

}

let animColors = {};
let animSets = {};

function draw() {
  background(0);

  let showMst = false;
  let path = null;

  if ( animId < animations.length ) {

    let anim = animations[ animId++ ];

    switch(anim[0]) {
      case 'init': {
        animColors = anim[1];
        for (let node in animColors) {
          animSets[ node ] = node;
        }
        break;
      }
      case 'path': {
        path = anim.slice(1, anim.length);
        break;
      }
      case 'join': {
        let nodeA = anim[1];
        let nodeB = anim[2];
        for (let node in animSets) {
          if ( animSets[ node ] === nodeA ) {
            animColors[ node ] = animColors[ nodeB ];
            animSets[ node ] = nodeB;
          }
        }
        break;
      }
      default: {
        throw new TypeError('Unknown command ' + anim[0]);
      }
    }

  } else {
    showMst = true;
  }

  showGraph(animColors);

  if ( path ) {
    drawPath(path[0], path[1], path[2], color(255, 45, 45), 4);
  }

  if ( showMst ) {
    for (let i = 0, maxi = MST.length; i < maxi; i += 1) {
      drawNode(MST[i][0], color(45, 45, 255), 4);
      drawNode(MST[i][1], color(45, 45, 255), 4);
      drawPath(MST[i][0], MST[i][1], MST[i][2], color(45, 45, 255), 4);
    }
  }

}