document.title = "COJ Problem 3229 - Robot";

const FRAMES = 2;

const WIDTH = 1500;
const HEIGHT = 700;

const CENTER_X = WIDTH >> 1;
const CENTER_Y = HEIGHT >> 1;

const UNIT = 20;

const SAMPLES = 40;

const EPS = 1e-4;

let plotter;

let points = [];
let hull = [];

let p1;
let p2;
let p3, vec, solVec;
let minDist = Infinity;
let lastDist = 0;
let ptSol = null, vecSol = null;

function generatePoint() {
  return new Complex( random(-35, 35), random(-35, 35) );
}

function cross(v1, v2) {
  return v1.conjugate().mul(v2).im;
}

function toRight(v1, v2) {
  return cross(v1, v2) < EPS;
}

function notToLeft(v1, v2) {
  return cross(v1, v2) <= EPS;
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

function setup() {

  createCanvas(1500, 700);
  frameRate(FRAMES);

  for (let i = 0; i < SAMPLES; i += 1) {
    points.push( generatePoint() );
  }

  hull = convex_hull([].concat(points));

  plotter = new Plotter(-CENTER_X, CENTER_Y, CENTER_X, -CENTER_Y);
  plotter.zoomFactor = 8;

  textSize(32);

  p1 = 0;
  p2 = nextIndex(p1);
  p3 = nextIndex(p2);

}

function nextIndex(i) {
  let cant = hull.length - 1;
  return ( i - 1 + cant ) % ( cant );
}

function prevIndex(i) {
  let cant = hull.length - 1;
  return ( i + 1 ) % ( cant );
}

function distPoint2Line(pt, A, B) {
  let v1 = B.sub(A);
  let v2 = pt.sub(A);
  let base = v1.abs();
  let area = abs( cross(v1, v2) );
  return area / base;
}

function draw() {

  background(0);

  plotter.drawAxes();

  console.log(p1, p2, p3);

  plotter.drawPoints(points);

  strokeWeight(2);
  stroke(255);
  fill(255);
  text('Min Distance: ' + minDist, 0, 10, width, height);

  plotter.drawPath( hull, color(0, 120, 255) );

  plotter.drawLine(hull[ p1 ], hull[ p2 ], color(255, 45, 45));

  vec = hull[ p1 ].sub( hull[ p2 ] );

  plotter.drawLine(hull[ p3 ], hull[ p3 ].add( vec ), color(45, 255, 45));

  // return;

  if ( p3 != p1 ) {
    let tmp = distPoint2Line(hull[ p3 ], hull[ p1 ], hull[ p2 ]);
    let v1 = vec.mul( new Complex({ abs: 1, arg: -PI / 2 }) );
    v1 = v1.mul( tmp / v1.abs() );

    plotter.drawArrow( hull[ p3 ], hull[ p3 ].add(v1), color(45, 45, 255) );

    if ( tmp > lastDist ) {
      lastDist = tmp;
      p3 = nextIndex(p3);
      return;
    } else if ( lastDist < minDist ) {
      minDist = lastDist;
      ptSol = prevIndex(p3);
      let v = vec.mul( new Complex({ abs: 1, arg: -PI / 2 }) );
      vecSol = v.mul( lastDist / v.abs() );
    }

    p3 = nextIndex(p3);

  }

  p1 = p2;
  p2 = nextIndex(p2);
  p3 = nextIndex(p2);

  if ( p1 == 0 ) {
    noLoop();
    background(0);
    plotter.drawAxes();
    plotter.drawPoints(points);
    plotter.drawPath( hull, color(0, 120, 255) );
    plotter.drawArrow(hull[ ptSol ], hull[ ptSol ].add(vecSol), color(255, 45, 45));
    plotter.drawLine(hull[ ptSol ], hull[ ptSol ].add( vecSol.mul( new Complex(0, 1) ) ), color(255, 45, 45));
    let pt1 = hull[ ptSol ].add(vecSol);
    plotter.drawLine(pt1, pt1.add( vecSol.mul( new Complex(0, 1) ) ), color(255, 45, 45));
    strokeWeight(2);
    stroke(255);
    fill(255);
    text('Min Distance: ' + minDist, 0, 10, width, height);
  }
  lastDist = 0;

}