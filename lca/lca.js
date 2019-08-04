document.title = 'Lowest Common Ancestor';

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
let root = null;
let graphDimensions = [];
let queries = [];

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

  let cols = colors || {};

  for (let nodeA in graph) {
    drawNode(nodeA, cols[nodeA]);

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

  root = null;
  queries.length = 0;

  for (let i = 0, maxi = lines.length; i < maxi; i += 1) {
    if ( lines[i].length >= 2 ) {
      let a = lines[i][0];
      let b = lines[i][1];
      let c = ( lines[i][2] ) ? +lines[i][2] : '';

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

      if ( root ) {
        queries.push([ a, b ]);
      } else {
        graph[a][b] = c;
        graph[b][a] = c;
      }

    } else if ( lines[i].length === 1 && lines[i][0] != '' ) {
      root = lines[i][0];
    }
  }

  if ( !root || !graph[root] ) {
    alert('Root node not defined');
    graph = {};
    return;
  }

}

function createGraphFromMST(mst) {
  graph = {};

  for (let i = 0, maxi = mst.length; i < maxi; i += 1) {
    let a = mst[i][0];
    let b = mst[i][1];
    let c = mst[i][2];

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
    coords[a] = new Complex(-1000, -1000);
    coords[b] = new Complex(-1000, -1000);
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

  let parent = (x) => {
    if ( P[x] != x ) {
      return P[x] = parent( P[x] );
    }
    return x;
  };

  let join_sets = (setA, setB) => {
    if ( R[ setA ] > R[ setB ] ) {
      P[ setB ] = setA;
      R[ setA ] += R[ setB ];
    } else {
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

    if ( setA != setB ) {
      join_sets(setA, setB);
      mst.push( path );
    }

  }

  return mst;

}

function calcDimensions(node, level) {

  graphDimensions.length = 0;

  let Q = [ [node, '', level] ];

  while( Q.length > 0 ) {

    let tr = Q.shift();
    let n = tr[0];
    let p = tr[1];
    let lv = tr[2];

    graphDimensions[lv] = graphDimensions[lv] + 1 || 1;

    for (let newNode in graph[ n ]) {
      if ( newNode != p ) {
        Q.push([ newNode, n, lv + 1 ]);
      }
    }

  }

  let width = graphDimensions.length;

  if ( width === 0 ) {
    return;
  }

  Q.push([node, '', 0]);

  let dims = [].concat(graphDimensions);

  while( Q.length > 0 ) {

    let par = Q.shift();
    let n = par[0];
    let p = par[1];
    let lv = par[2];

    let x = 100 + ( WIDTH - 200 ) * lv / Math.max(1, width);
    let y = 100 + ( HEIGHT - 200 ) * ( --dims[lv] ) / Math.max(1, graphDimensions[ lv ] - 1);

    if ( graphDimensions[ lv ] === 1 ) {
      y = 100 + ( HEIGHT - 200 ) >> 1;
    }

    coords[ n ] = new Complex(x, y);

    for (let newNode in graph[ n ]) {
      if ( newNode != p ) {
        Q.push([ newNode, n, lv + 1 ]);
      }
    }

  }

}

function fast_log2(n) {
  let pot = 0;
  while (n) {
    pot = n & -n;
    n &= (~pot);
  }
  let res = -1;
  while (pot) {
    pot >>= 1;
    res += 1;
  }
  return res;
}

function lca() {

  let Q = [ [root, null, 0] ];
  let level = {};
  let LCA = {};

  animations.length = 0;

  while ( Q.length > 0 ) {
    let tr = Q.shift();
    let n = tr[0];
    let p = tr[1];
    let lv = tr[2];

    level[ n ] = lv;
    LCA[ n ] = [ p ];

    animations.push([ 'select', [n] ]);

    for (let i = 2, j = 1; i <= lv; i <<= 1, j += 1) {
      LCA[ n ][j] = LCA[ LCA[ n ][j - 1] ][j - 1];
      animations.push([ 'parent', LCA[ n ][j - 1], LCA[ n ][j] ]);
    }

    for (let newNode in graph[ n ]) {
      if ( newNode != p ) {
        Q.push([ newNode, n, lv + 1 ]);
      }
    }
  }

  while ( queries.length > 0 ) {
    let par = queries.shift();
    let a = par[0];
    let b = par[1];
    let a_orig = a;
    let b_orig = b;

    animations.push([ 'select', [a, b] ]);

    if ( level[a] > level[b] ) {
      let temp = a;
      a = b;
      b = temp;
    }

    let diff = level[b] - level[a];

    // console.log('LEVELS ', a, b, level[a], level[b]);

    for (let i = 0; (1 << i) <= diff; i += 1) {
      if ( diff & (1 << i) ) {
        b = LCA[ b ][i];
        animations.push([ 'select', [a, b] ]);
      }
    }

    // console.log('SAME LEVEL: ', a, b, fast_log2(level[a]));

    if ( a != b ) {
      for (let i = fast_log2(level[a]); i >= 0; i -= 1 ) {
        if ( LCA[ a ][i] != LCA[ b ][i] ) {
          a = LCA[ a ][i];
          b = LCA[ b ][i];
          animations.push([ 'select', [a, b] ]);
        }
      }
      a = LCA[a][0];
    }

    animations.push([ 'select', [a] ]);

    // console.log('LCA: ', a);

    animations.push([ 'select', [a, a_orig, b_orig] ]);

  }

}

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
    currentPath = null;
    createGraph(strGraph.value());
    createGraphFromMST(kruscal());
    calcDimensions(root, 0);
    lca();
  });

  ldg.mouseClicked(() => {
    strGraph.value( bigGraph );
  });

}

let selected = [];

function draw() {
  background(0);

  let parent = [];

  if ( animId < animations.length ) {

    let anim = animations[ animId++ ];

    switch(anim[0]) {
      case 'select': {
        selected = anim[1];
        break;
      }
      case 'parent': {
        parent = [ anim[1], anim[2] ];
        break;
      }
      default: {
        throw new TypeError('Unknown command ' + anim[0]);
      }
    }

  }

  showGraph();

  for (let i = 0, maxi = selected.length; i < maxi; i += 1) {
    drawNode(selected[i], color(45, 45, 255), 4);
  }

  for (let i = 0, maxi = parent.length; i < maxi; i += 1) {
    drawNode(parent[i], color(45, 255, 45), 4);
  }

}