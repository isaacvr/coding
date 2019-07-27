document.title = 'Delaunay Triangulation';

const FRAMES = 5;

const WIDTH = 1500;
const HEIGHT = 700;

const CENTER_X = WIDTH >> 1;
const CENTER_Y = HEIGHT >> 1;

const UNIT = 20;

const SAMPLES = 20;

let points = [];

let animations = [];

function generatePoint() {
  return new Complex( random(-35, 35), random(-15, 15) );
}

function cCenter(pt1, pt2, pt3) {

  let rotor = new Complex(0, 1);
  let v1 = pt2.sub(pt1).mul(rotor);
  let v2 = pt3.sub(pt1).mul(rotor);
  let mid1 = pt1.add( pt2.sub(pt1).div(2) );
  let mid2 = pt1.add( pt3.sub(pt1).div(2) );

  let A = v2.re * v1.im - v2.im * v1.re;
  let x1 = (mid2.re - mid1.re) * (-v2.im) + (mid2.im - mid1.im) * v2.re;

  let f1 = x1 / A;

  return mid1.add(v1.mul(f1));

}

function distance(pt1, pt2) {
  return pt2.sub(pt1).abs();
}

function isDelaunay(A, B, C, p) {

  let center = cCenter(A, B, C);
  let d = distance(center, A);

  return distance(p, center) >= d;

}

function triangulate() {

  const SUPER_TRIANGLE = [
    new Complex(-1000000, -1000000),
    new Complex(0, 1000000),
    new Complex(1000000, -1000000)
  ];

  let triangles = [
    [].concat(SUPER_TRIANGLE)
  ];

  animations.push([ 'addTriangle', SUPER_TRIANGLE ]);

  const EPS = 1e-4;

  for (let i = 0, maxi = points.length; i < maxi; i += 1) {

    let badTriangles = [];

    animations.push([ 'addPoint', points[i] ]);

    for (let j = triangles.length - 1; j >= 0; j -= 1) {
      let triang = triangles[j];
      // animations.push([ 'check', triang, points[i] ]);
      if ( !isDelaunay( triang[0], triang[1], triang[2], points[i] ) ) {
        animations.push([ 'delTriangle', j ]);
        triangles.splice(j, 1);
        badTriangles.push(triang);
        animations.push([ 'addBadTriangle', triang ]);
      }
    }

    let poly = [];

    for (let j = 0, maxj = badTriangles.length; j < maxj; j += 1) {
      for (let k1 = 0; k1 < 3; k1 += 1) {
        for (let l1 = k1 + 1; l1 < 3; l1 += 1) {

          let v1 = badTriangles[j][k1];
          let v2 = badTriangles[j][l1];

          let isShared = false;

          for (let t = 0, maxt = badTriangles.length; t < maxt && !isShared; t += 1) {
            if ( j === t ) {
              continue;
            }
            for (let k2 = 0; k2 < 3 && !isShared; k2 += 1) {
              for (let l2 = k2 + 1; l2 < 3 && !isShared; l2 += 1) {
                let V1 = badTriangles[t][k2];
                let V2 = badTriangles[t][l2];

                // animations.push([ 'showLines', [[v1, v2], [V1, V2]] ]);

                if ( V1.sub(v1).abs() < EPS && V2.sub(v2).abs() < EPS ) {
                  isShared = true;
                }
              }
            }
          }

          if ( !isShared ) {
            poly.push( [v1, v2] );
          }
        }
      }
    }

    // console.log('POLY: ', [].concat(poly));

    animations.push([ 'removeBadTriangles' ]);

    for (let p = 0, maxp = poly.length; p < maxp; p += 1) {
      animations.push([ 'addTriangle', [ poly[p][0], poly[p][1], points[i] ] ]);
      triangles.push( [ poly[p][0], poly[p][1], points[i] ] );
    }

    // console.log('triangles', [].concat(triangles));

  }

  for (let i = triangles.length - 1; i >= 0; i -= 1) {
    let exists = false;
    for (let j = 0; j < 3 && !exists; j += 1) {
      for (let k = 0; k < 3 && !exists; k += 1) {
        if ( triangles[i][j].sub(SUPER_TRIANGLE[k]).abs() < EPS ) {
          exists = true;
        }
      }
    }

    if ( exists ) {
      triangles.splice(i, 1);
      animations.push([ 'delTriangle', i ]);
    }
  }

}

function setup() {

  createCanvas(1500, 700);
  frameRate(FRAMES);

  for (let i = 0; i < SAMPLES; i += 1) {
    points.push( generatePoint() );
  }

  triangulate();

  // console.log(triangles);

}

function drawPoint(cp, col) {
  stroke(col || 255);
  strokeWeight(10);
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

function drawAxes() {
  stroke(255, 150);
  strokeWeight(2);
  line(0, CENTER_Y, WIDTH, CENTER_Y);
  line(CENTER_X, 0, CENTER_X, HEIGHT);
}

let triangulation = [];
let badTriang = [];
let pts = [];

function draw() {

  background(0);

  drawAxes();

  translate(CENTER_X, CENTER_Y);

  for (let i = 0, maxi = triangulation.length; i < maxi; i += 1) {
    drawTriangle(triangulation[i][0], triangulation[i][1], triangulation[i][2], color(45, 45, 255));
  }

  for (let i = 0, maxi = badTriang.length; i < maxi; i += 1) {
    drawTriangle(badTriang[i][0], badTriang[i][1], badTriang[i][2], color(255, 45, 45));
  }

  for (let i = 0; i < pts.length; i += 1) {
    drawPoint(pts[i]);
  }

  if ( animations.length === 0 ) {
    noLoop();
    return;
  }

  let anim = animations.shift();

  switch(anim[0]) {
    case 'delTriangle': {
      triangulation.splice(anim[1], 1);
      // [ 'delTriangle', j ]
      break;
    }
    case 'addTriangle': {
      triangulation.push(anim[1]);
      // [ 'addTriangle', SUPER_TRIANGLE ]
      break;
    }
    case 'check': {
      let triang = anim[1];
      let pt = anim[2];
      drawLine(triang[0], triang[1], color(45, 255, 45));
      drawLine(triang[0], triang[2], color(45, 255, 45));
      drawLine(triang[1], triang[2], color(45, 255, 45));
      for (let i = 0; i < 3; i += 1) {
        drawPoint(triang[i]);
      }
      drawPoint(pt, color(255, 45, 45));
      break;
    }
    case 'addBadTriangle': {
      badTriang.push(anim[1]);
      // [ 'addBadTriangle', triang ]
      break;
    }
    case 'showLines': {
      let lines = anim[1];
      for (let i = 0; i < lines.length; i += 1) {
        drawLine(lines[i][0], lines[i][1], color(255, 255, 45));
      }
      // [ 'showLines', [[v1, v2], [V1, V2]] ]
      break;
    }
    case 'removeBadTriangles': {
      badTriang.length = 0;
      // [ 'removeBadTriangles' ]
      break;
    }
    case 'addPoint': {
      pts.push(anim[1]);
      drawPoint(anim[1], color(255, 45, 45));
      // [ 'addPoint', points[i] ]
      break;
    }
    default: {
      throw TypeError('Bad command ' + anim[0]);
    }
  }

  // if ( animations.length === 0 ) {
  //   noLoop();
  // }

}

// delTriangle
// addTriangle
// check
// addBadTriangle
// showLines
// removeBadTriangles
// addPoint