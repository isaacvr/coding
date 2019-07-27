document.title = 'Voronoi Diagram';

const FRAMES = 10;

const WIDTH = 1500;
const HEIGHT = 700;

const CENTER_X = WIDTH >> 1;
const CENTER_Y = HEIGHT >> 1;

const UNIT = 20;

const SAMPLES = 40;

const EPS = 1e-4;

let points = [];
let regions = [];
let animations = [];
let hull = [];

function generatePoint() {
  return new Complex( random(-35, 35), random(-15, 15) );
}

function cross(v1, v2) {
  return v1.conjugate().mul(v2).im;
}

function toLeft(v1, v2) {
  return cross(v1, v2) > -EPS;
}

function toRight(v1, v2) {
  return cross(v1, v2) < EPS;
}

function notToLeft(v1, v2) {
  return cross(v1, v2) <= EPS;
}

function notToRight(v1, v2) {
  return cross(v1, v2) >= -EPS;
}

function convex_hull(pts) {

  pts.sort((a, b) => {
    if ( a.re != b.re ) {
      return a.re - b.re;
    }
    return a.im - b.im;
  });

  let top = 1;
  let last = -1;
  let hull = [];

  for (let i = 0; i < pts.length; i += 1) {
    while( last >= top && notToLeft( hull[last].sub(hull[last - 1]), pts[i].sub(hull[last]) ) ) {
      hull.pop();
      last -= 1;
    }
    hull.push(pts[i]);
    last += 1;
  }

  top = hull.length - 1;

  for (let i = pts.length - 1; i >= 0; i -= 1) {
    while( last > top && toRight( hull[last].sub(hull[last - 1]), pts[i].sub(hull[last]) ) ) {
      hull.pop();
      last -= 1;
    }
    hull.push(pts[i]);
    last += 1;
  }

  return hull;

}

function segmentIntersection(pt1, pt2, PT1, PT2) {
  let v1 = pt2.sub(pt1);
  let v2 = PT2.sub(PT1);

  let D = v2.re * v1.im - v1.re * v2.im;
  let D1 = v2.re * ( PT1.im - pt1.im ) - ( PT1.re - pt1.re ) * v2.im;

  let t1 = D1 / D;

  return pt1.add( v1.mul(t1) );

}

function intersect(pt1, pt2, region) {

  let mid = pt2.add(pt1).div(2);
  let vec = pt2.sub(pt1).mul(new Complex(0, 1));

  let res = [];

  let cant = region.length;

  let toDelete = [];
  let toAdd = [];

  // animations.push([ 'fuzzyline', mid.add(vec.mul(100)), mid.add(vec.mul(-100)) ]);

  for (let i = 0, j = 1; i < cant; i += 1) {

    let v1 = region[i].sub(mid);
    let v2 = region[j].sub(mid);

    if ( cross(vec, v1) * cross(vec, v2) <= 0 ) {
      let newP = segmentIntersection(region[i], region[j], mid, mid.add(vec));
      toAdd.push(newP);
      res.push(newP);
    }

    if ( notToRight(vec, v1) ) {
      res.push( region[i] );
      toDelete.push( i );
    }

    j += 1;
    if ( j >= cant ) {
      j = 0;
    }
  }

  if ( toAdd.length > 1 ) {
    // animations.push([ 'fuzzyline', mid.add(vec.mul(100)), mid.add(vec.mul(-100)) ]);
    animations.push([ 'line', toAdd[0], toAdd[1] ]);
  }

  while( toDelete.length > 0 ) {
    region.splice( toDelete.pop(), 1 );
  }

  while( toAdd.length > 0 ) {
    region.push( toAdd.pop() );
  }

  let ch = convex_hull([].concat(region));

  region.length = 0;

  while( ch.length > 0 ) {
    region.push( ch.pop() );
  }

  // region = convex_hull(region);

  return convex_hull(res);

}

function voronoi() {

  regions.length = 0;
  regions[0] = convex_hull([
    new Complex( -100, -100 ),
    new Complex( -100, 100 ),
    new Complex( 100, 100 ),
    new Complex( 100, -100 )
  ]);

  animations.push([ 'setRegion', 0, [].concat(regions[0]) ]);
  animations.push([ 'addPoint', points[0] ]);

  for ( let i = 1; i < SAMPLES; i += 1 ) {
    animations.push([ 'addPoint', points[i] ]);
    let pts = [];
    for (let j = 0; j < i; j += 1) {
      let poly = intersect( points[i], points[j], regions[j] );
      if ( poly.length > 0 ) {
        pts = pts.concat(poly);
        animations.push([ 'poly', [].concat(poly) ]);
      }
      animations.push([ 'setRegion', j, [].concat(regions[j]) ]);
    }

    // console.log('PTS: ', pts);

    regions[i] = convex_hull(pts);
    animations.push([ 'setRegion', i, [].concat(regions[i]) ]);
  }

}

function setup() {

  createCanvas(1500, 700);
  frameRate(FRAMES);

  for (let i = 0; i < SAMPLES; i += 1) {
    points.push( generatePoint() );
  }

  voronoi();

  // console.log('REGIONS', regions);

  hull = convex_hull([].concat(points));

  // console.log('HULL', convex_hull([].concat(points)));

  // console.log(triangles);

}

function drawPoint(cp, col, r) {
  stroke(col || 255);
  strokeWeight(r || 10);
  point(cp.re * UNIT, -cp.im * UNIT);
}

function drawLine(cp1, cp2, col) {
  stroke(col || 255);
  strokeWeight(4);
  line(cp1.re * UNIT, -cp1.im * UNIT, cp2.re * UNIT, -cp2.im * UNIT);
}

function drawTriangle(cp1, cp2, cp3, col) {
  drawLine(cp1, cp2, col);
  drawLine(cp1, cp3, col);
  drawLine(cp2, cp3, col);
}

function drawPath(path, col) {
  let cant = path.length;

  let lineCol = col || 255;

  for (let i = 0, j = 1; i < cant; i += 1) {
    drawLine( path[i], path[j], lineCol );
    j += 1;
    if ( j === cant ) {
      j = 0;
    }
  }

  // for (let i = 0; i < cant; i += 1) {
  //   // drawPoint(path[i], color(255, 45, 45) );
  //   drawPoint(path[i], lineCol );
  // }
}

function drawAxes() {
  stroke(255, 150);
  strokeWeight(2);
  line(0, CENTER_Y, WIDTH, CENTER_Y);
  line(CENTER_X, 0, CENTER_X, HEIGHT);
}

let ini = 0, fin = ini + 1;

let lines = [];

function drawTriangle1(tr, col) {
  drawTriangle(tr[0], tr[1], tr[2], col);
}

let animRegions = [];
let animPoints = [];

function draw() {

  background(0);

  drawAxes();

  translate(CENTER_X, CENTER_Y);

  let anim = animations.shift();

  switch(anim[0]) {
    case 'fuzzyline': {
      drawLine(anim[1], anim[2], color(45, 255, 45, 100));
      break;
    }
    case 'line': {
      drawLine(anim[1], anim[2], color(45, 255, 255));
      break;
    }
    case 'setRegion': {
      animRegions[ anim[1] ] = anim[2];
      break;
    }
    case 'addPoint': {
      animPoints.push( anim[1] );
      break;
    }
    case 'poly': {
      drawPath(anim[1], color(255, 45, 45));
      break;
    }
    default: {
      throw new TypeError('Unknown command ' + anim[0]);
    }
  }

  for (let i = 0, maxi = animRegions.length; i < maxi; i += 1) {
    drawPath(animRegions[i], color(45, 45, 255));
  }

  for (let i = 0, maxi = animPoints.length; i < maxi; i += 1) {
    let col = null;
    let rad = null;
    if ( i === maxi - 1 && animations.length ) {
      col = color(255, 45, 45);
      rad = 25;
    }
    drawPoint(animPoints[i], col, rad);
  }

  if ( animations.length === 0 ) {
    noLoop();
  }

  // animations.push([ 'fuzzyline', mid.add(vec.mul(100)), mid.add(vec.mul(-100)) ]);
  // animations.push([ 'line', toAdd[0], toAdd[1] ]);
  // animations.push([ 'setRegion', 0, [].concat(regions[0]) ]);
  // animations.push([ 'addPoint', points[0] ]);
  // animations.push([ 'poly', [].concat(poly) ]);

  // for (let i = 0, maxi = regions.length; i < maxi; i += 1) {
  //   drawPath(regions[i], color(45, 45, 255));
  // }
  // // drawPath(hull);

  // for (let i = 0; i < SAMPLES; i += 1) {
  //   drawPoint( points[i] );
  // }

}