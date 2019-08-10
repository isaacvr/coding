document.title = "Gradient Descent";

const D = 2;
const FRAMES = 30;

let learning_rate = 0.1;

let points = [];
let inputs;
let targets;

let W;
let B;
let plotter;

let errP;

function init() {
  inputs = new Matrix(D + 1, 0);
  targets = new Matrix(1, 0);
  W = new Matrix(D + 1, 1);
  B = new Matrix(1, 1);
  W.randomize(-5, 5);
  W.print();
}

function setup() {
  let c = createCanvas(1500, 700);
  frameRate(FRAMES);

  c.mousePressed(() => {
    let pt = plotter.fromMouse(mouseX, mouseY);
    points.push(pt);
    let m = Matrix.fromArray([1, pt.re, pt.im], [D + 1, 1]);
    let t = Matrix.fromArray([0], [1, 1]);
    inputs.appendRight(m, true);
    targets.appendRight(t, true);
    // targets.print();
  });

  errP = createP();

  // let shift = 5;
  // let center_x = width >> shift;
  // let center_y = height >> shift;

  plotter = new Plotter(-1, 1, 1, -1);
  let btn = createButton('Reset');

  btn.mousePressed(() => {
    points.length = 0;
    init();
  });

  init();
}

function drawLine() {
  let p1 = new Point(0, -W.get(0, 0) / W.get(2, 0));
  let v1 = new Point(W.get(1, 0), W.get(2, 0)).mul(new Complex(0, 1));
  let p2 = p1.add(v1);
  plotter.drawLine(p1, p2, color(45, 45, 255), 4);
}

function sigmoid(x) {
  // return 1 / (1 + Math.exp(-x));
  // return z;
  return Math.tanh(x);
}

function dsigmoid(x) {
  // return Math.exp(-x) / ( (1 + Math.exp(-x)) ** 2 );
  // return 1;
  return 1 / ( Math.cosh(x) ** 2 );
}

function predict(inputs) {
  let ans = W.transpose().mul(inputs);
  return ans.forEach(sigmoid);
  // return ans;
}

function updateWeights(input, target) {
  let guess = predict(input);
  let guessDSig = guess.forEach(dsigmoid);
  let err = target.sub(guess);
  // console.log('GUESS: ', guess.get(0, 0));
  // err.print('Error');
  // console.log('ECM: ', err.agregate(x => x * x));
  // let deltaW = inputs.dot( err.transpose() ).mul( learning_rate );
  let prod = guessDSig.mul( input.transpose() );
  let deltaW = err.transpose().mul( prod ).mul( 2 * learning_rate ).transpose();
  // console.log('WEIGHTS: ', W.dims());
  // console.log('INPUTS: ', inputs.dims());
  // console.log('GUESS: ', guess.dims());
  // console.log('ERR: ', err.dims());
  // console.log('PROD: ', prod.dims());
  // console.log('DELTAW: ', deltaW.dims());
  W = W.add( deltaW );
  let sum = W.agregate(x => Math.abs(x));
  W.div(sum, true);
}

function gradientDescent() {

  if ( points.length === 0 ) {
    return;
  }

  for (let i = 0, maxi = points.length; i < maxi; i += 1) {
    updateWeights( inputs.subCols(i, i + 1), targets.subCols(i, i + 1) );
  }

  // updateWeights();

}

function getError() {
  let guess = predict(inputs);
  let err = targets.sub(guess);
  let ecm = err.agregate(x => x * x);
  let digits = 10 ** 6;
  errP.html(`err: ${ Math.round(ecm * digits) / digits }`);
}

function draw() {
  background(0);

  plotter.drawAxes();

  let pts = points.length;

  for (let i = 0; i < pts; i += 1) {
    plotter.drawPoint(points[i]);
  }

  gradientDescent();
  drawLine();
  getError();

}