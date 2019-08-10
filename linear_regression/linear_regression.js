document.title = "Linear Regression";

const WIDTH = 1500;
const HEIGHT = 700;

const CENTER_X = WIDTH >> 1;
const CENTER_Y = HEIGHT >> 1;

let points = [];
let M;
let N;
let plotter;

function setup() {
  let c = createCanvas(WIDTH, HEIGHT);

  c.mousePressed(() => {
    points.push( plotter.fromMouse(mouseX, mouseY) );
    calcRegression();
  });

  plotter = new Plotter(-CENTER_X, CENTER_Y, CENTER_X, -CENTER_Y);

  let btn = createButton('Reset');

  btn.mousePressed(() => {
    points.length = 0;
    M = N = null;
  });

}

function calcRegression() {

  let xm = 0;
  let ym = 0;
  let len = points.length;

  if ( len < 1 ) {
    return;
  }

  for (let i = 0; i < len; i += 1) {
    xm += points[i].re;
    ym += points[i].im;
  }

  xm /= len;
  ym /= len;

  // console.log('(xm; ym) = ', xm, ym);

  let num = 0;
  let den = 0;

  for (let i = 0; i < len; i += 1) {
    num += (points[i].re - xm) * (points[i].im - ym);
    den += (points[i].re - xm) * (points[i].re - xm);
  }

  if ( den === 0 ) {
    den = 1;
  }

  M = num / den;
  N = ym - M * xm;

}

function drawRegressionLine() {

  if ( M == null || N == null ) {
    return;
  }

  let x1 = CENTER_X;
  let y1 = M * x1 + N;

  let x2 = -CENTER_X;
  let y2 = M * x2 + N;

  plotter.drawLine(new Complex(x1, y1), new Complex(x2, y2), color(45, 45, 255), 4);

}

function draw() {
  background(0);

  plotter.drawAxes();

  for (let i = 0, maxi = points.length; i < maxi; i += 1) {
    plotter.drawPoint(points[i]);
  }

  drawRegressionLine();

}