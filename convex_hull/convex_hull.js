document.title = 'Convex Hull';

const WIDTH = 1500;
const HEIGHT = 750;

const CENTER_X = 0;
const CENTER_Y = HEIGHT;

const UNIT = 13;

const POINTS = 30;

let points = [];
let hull = [];

let index = 2;
let last = 1;
let inc = 1;
let Top = 1;

let button;

function generatePoint() {
  return new Complex( random(10, 100), random(10, 50) );
}

function setup() {
  createCanvas(WIDTH, HEIGHT);
  frameRate(5);

  button = createButton('Restart Animation');

  button.mouseClicked(restartAnimation);

  for (let i = 0; i < POINTS; i += 1) {
    let pt = generatePoint();
    if ( pt.re * UNIT > WIDTH ) {
      noLoop();
      throw new TypeError('width ' + pt);
    }

    if ( pt.im * UNIT > HEIGHT ) {
      noLoop();
      throw new TypeError('height ' + pt.toString());
    }
    points.push(generatePoint());
  }

  points.sort((a, b) => {
    return a.re - b.re;
  });

  hull.push(points[0]);
  hull.push(points[1]);

  // convexHull();

}

function drawPoint(cp, col) {
  stroke(col || 255);
  strokeWeight(13);
  point(cp.re * UNIT, -cp.im * UNIT);
}

function drawLine(cpA, cpB, col) {
  stroke(col || 255);
  strokeWeight(2);
  line(cpA.re * UNIT, -cpA.im * UNIT, cpB.re * UNIT, -cpB.im * UNIT);
}

function drawVertex(cp, col) {
  stroke(col || 255);
  strokeWeight(3);
  vertex(cp.re * UNIT, -cp.im * UNIT);
}

function restartAnimation() {
  hull.length = 0;
  hull.push(points[0]);
  hull.push(points[1]);
  index = 2;
  last = 1;
  inc = 1;
  loop();
}

function draw() {

  background(0);

  translate(CENTER_X, CENTER_Y);

  if ( last >= Top ) {
    // console.log('last >= 1');

    let va = hull[last].sub(hull[last - 1]);
    let vb = points[index].sub(hull[last]);

    if (va.conjugate().mul(vb).im <= 0) {
      // console.log('cross > 0');
      drawLine(hull[last - 1], hull[last]);
      drawLine(hull[last], points[index]);
      drawPoint(hull[last - 1], color(45, 45, 255));
      drawPoint(hull[last], color(45, 45, 255));
      drawPoint(points[index], color(45, 45, 255));
      last -= 1;
      hull.pop();
    } else {
      console.log('cross <= 0');
      hull.push(points[index]);
      last += 1;
      index += inc;
    }
  } else {
    console.log('last < 1');
    hull.push(points[index]);
    last += 1;
    index += inc;
  }

  beginShape();
  noFill();
  for (let i = 0; i <= last; i += 1) {
    drawVertex(hull[i], color(45, 255, 45));
  }
  endShape();

  // drawPoint(points[0], color(255, 45, 45));

  for (let i = 0; i < POINTS; i += 1) {
    drawPoint(points[i]);
  }

  if ( index >= POINTS ) {
    index = POINTS - 2;
    inc = -1;
    Top = hull.length;
  }

  if ( index < 0 ) {
    console.log('END');
    noLoop();
  }

}