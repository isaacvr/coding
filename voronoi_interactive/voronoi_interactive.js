document.title = 'Interactive Voronoi';

const WIDTH = 1500;
const HEIGHT = 700;

const FRAMES = 60;

const SAMPLES = 20;

const EPS = 1e-4;

let points = [];
let regions = [];

let lastX = -100000;
let lastY = -100000;

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

  return convex_hull(res);

}

function voronoi() {

  regions.length = 0;
  regions[0] = convex_hull([
    new Complex( -10, -10 ),
    new Complex( -10, HEIGHT + 10 ),
    new Complex( WIDTH + 10, HEIGHT + 10 ),
    new Complex( WIDTH + 10, -10 )
  ]);

  for ( let i = 1; i < SAMPLES; i += 1 ) {
    let pts = [];
    for (let j = 0; j < i; j += 1) {
      let poly = intersect( points[i], points[j], regions[j] );
      if ( poly.length > 0 ) {
        pts = pts.concat(poly);
      }
    }

    regions[i] = convex_hull(pts);
  }

}

function genRandom() {
  return ~~random(0, 255);
}

function generatePoint() {
  let r = genRandom();
  let g = genRandom();
  let b = genRandom();
  let cp = new Complex(~~random(30, WIDTH - 30), ~~random(30, HEIGHT - 30));
  cp.color = color(r, g, b);
  return cp;
}

function setup() {
  createCanvas(WIDTH, HEIGHT);
  frameRate(FRAMES);

  for (let i = 0; i < SAMPLES; i += 1) {
    points.push( generatePoint() );
  }

  // imagen = createImage(WIDTH, HEIGHT);

  // console.time('voronoi');
  // voronoi();
  // console.timeEnd('voronoi');

}

function draw() {

  background(0);

  if ( mouseX >= 0 && mouseX < WIDTH && mouseY >= 0 && mouseY < HEIGHT ) {
    let col = points[0].color;
    points[0] = new Complex(mouseX, mouseY);
    points[0].color = col;
    if ( mouseX != lastX || mouseY != lastY ) {
      lastX = mouseX;
      lastY = mouseY;
      voronoi();
    }
  }

  // stroke(color(45, 45, 255));
  stroke(0);
  strokeWeight(3);

  for (let i = 0; i < SAMPLES; i += 1) {
    beginShape();
    fill( points[i].color );
    for (let j = 0, k = 1, maxj = regions[i].length; j < maxj; j += 1) {
      vertex(regions[i][j].re, regions[i][j].im);
      k += 1;
      if ( k >= maxj ) {
        k = 0;
      }
    }
    endShape();
  }

  strokeWeight(10);

  for (let i = 0; i < SAMPLES; i += 1) {
    stroke(255);
    point(points[i].re, points[i].im);
  }

}