document.title = 'Maximun Circle Problem';

const FRAMES = 1;

const WIDTH = 1500;
const HEIGHT = 700;

const CENTER_X = WIDTH >> 1;
const CENTER_Y = HEIGHT >> 1;

const UNIT = 20;

const SAMPLES = 5;

const EPS = 1e-4;

let points = [];
let regions = [];
let ngb = [];

function generatePoint(id) {
  let cp = new Complex( random(-35, 35), random(-15, 15) );
  cp.id = id;
  return cp;
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

function lineIntersection(pt1, pt2, PT1, PT2) {
  let v1 = pt2.sub(pt1);
  let v2 = PT2.sub(PT1);

  let D = v2.re * v1.im - v1.re * v2.im;
  let D1 = v2.re * ( PT1.im - pt1.im ) - ( PT1.re - pt1.re ) * v2.im;

  let t1 = D1 / D;

  return pt1.add( v1.mul(t1) );

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
      let newP = lineIntersection(region[i], region[j], mid, mid.add(vec));
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

  // region = convex_hull(region);

  return convex_hull(res);

}

function distance(pt1, pt2) {
  return pt2.sub(pt1).abs();
}

function haveIntersection(pt1, pt2, reg2) {
  let mid = pt1.add( pt2.sub(pt1).div(2) );
  let v1 = pt2.sub(pt1).mul( new Complex(0, 1) );

  for (let i = 0, maxi = reg2.length; i < maxi; i += 1) {
    if ( toLeft(v1, reg2[i].sub(mid)) ) {
      return true;
    }
  }

  return false;
}

function voronoi() {

  regions.length = 0;
  regions[0] = convex_hull([
    new Complex( -100, -100 ),
    new Complex( -100, 100 ),
    new Complex( 100, 100 ),
    new Complex( 100, -100 )
  ]);

  ngb.length = 0;
  ngb.push([]);

  for ( let i = 1; i < SAMPLES; i += 1 ) {
    ngb[i] = [];

    let pts = [];
    let closest = 0;
    let d = distance(points[i], points[0]);

    for (let j = 0; j < i; j += 1) {
      let d1 = distance(points[i], points[j]);
      if ( d1 < d ) {
        d = d1;
        closest = j;
      }
    }

    let q = [ closest ];
    let q1 = [];
    let mark = [];

    while( q.length > 0 ) {

      let pt = q.shift();

      if (!mark[pt]) {
        if ( haveIntersection(points[i], points[pt], regions[pt]) ) {
          q1.push(pt);
          let poly = intersect(points[i], points[pt], regions[pt]);
          pts = pts.concat(poly);
          ngb[i].push(pt);
          for (let i = ngb[pt].length - 1; i >= 0; i -= 1) {
            q.push( ngb[pt][i] );
          }
        }

        mark[pt] = true;
      }

    }

    for (let j = 0; j < ngb[i].length; j += 1) {
      ngb[ ngb[i][j] ].push(i);
    }

    q1.length = 0;

    while( q1.length > 0 ) {

      let pt = q1.shift();

      for(let i = ngb[pt].length - 1; i >= 0; i -= 1) {
        let region = regions[ ngb[pt][i] ];
        let d = Infinity;
        let p = region.length - 1;
        for (let j = p; j >= 0; j -= 1) {
          let d1 = distance(points[pt], region[j]);
          if ( d1 < d ) {
            d = d1;
            p = j;
          }
        }

        if ( Math.abs(d - distance(points[p], points[ ngb[pt][i] ])) > 1e-4 ) {
          let idx = ngb[ ngb[pt][i] ].indexOf(pt);
          ngb[ ngb[pt][i] ].splice(idx, 1);
          ngb[pt].splice(i, 1);
        }
      }

    }

    regions[i] = convex_hull(pts);
  }

}

function setup() {

  createCanvas(1500, 700);
  frameRate(FRAMES);

  for (let i = 0; i < SAMPLES; i += 1) {
    points.push( generatePoint(i) );
  }

  hull = convex_hull(points);

  voronoi();

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

function drawEllipse(center, diam, col) {
  stroke(col || 255);
  noFill();
  strokeWeight(3);
  ellipse(center.re * UNIT, -center.im * UNIT, diam * UNIT);
}

function drawAxes() {
  stroke(255, 150);
  strokeWeight(2);
  line(0, CENTER_Y, WIDTH, CENTER_Y);
  line(CENTER_X, 0, CENTER_X, HEIGHT);
}

let hull = [];

function draw() {

  background(0);

  drawAxes();

  translate(CENTER_X, CENTER_Y);

  for (let i = 0; i < SAMPLES; i += 1) {
    drawPoint(points[i]);
  }

  for (let i = 0, maxi = regions.length; i < maxi; i += 1) {
    beginShape();
    for (let j = 0, k = 1, maxj = regions[i].length; j < maxj; j += 1) {
      drawLine(regions[i][j], regions[i][k], color(45, 45, 255));
      k += 1;
      if ( k >= maxj ) {
        k = 0;
      }
      drawPoint(regions[i][j], color(255, 45, 45));
    }
    endShape();
  }

  beginShape();
  for (let i = 0, j = 1, maxi = hull.length; i < maxi; i += 1) {
    drawLine(hull[i], hull[j], color(45, 255, 45, 100));
    j += 1;
    if ( j >= maxi ) {
      j = 0;
    }
    drawPoint(hull[i], color(45, 255, 255));
  }
  endShape();

}
