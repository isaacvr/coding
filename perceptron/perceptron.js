document.title = "Perceptron";

const FRAMES = 20;
const SAMPLES = 100;

class Perceptron {

  constructor(w) {
    this.weights = [];
    this.bias = random(-1, 1);

    for (let i = 0; i < w; i += 1) {
      this.weights.push( random(-1, 1) );
    }
  }

  guess(input) {
    let len = this.weights.length;

    if ( len != input.length ) {
      throw new TypeError('Lengths does not match');
    }

    let sum = this.bias;

    for (let i = 0; i < len; i += 1) {
      sum += this.weights[i] * input[i];
    }

    if ( sum >= 0 ) {
      return 1;
    }

    return -1;
  }

  train(input, result) {
    let guess = this.guess(input);
    let error = result - guess;
    let learningRate = 0.01;

    for (let i = 0, maxi = this.weights.length; i < maxi; i += 1) {
      this.weights[i] += error * input[i] * learningRate;
    }

    this.bias += error / learningRate;
    // console.log('TRAINED: ', this.weights);
  }

}

let p;
let dataset = [];

let errorP;

function setup() {

  createCanvas(1500, 700);
  frameRate(FRAMES);

  errorP = createP();

  p = new Perceptron(2);
  // console.log(p.weights);

  // let mid = random( 300, 400 );

  let c1 = 20;
  let c2 = -30;
  let c3 = 1000;

  for (let i = 0; i < SAMPLES; i += 1) {
    dataset.push([ random(100, width - 100), random(100, height - 100) ]);
    if ( dataset[i][0] * c1 + dataset[i][1] * c2 + c3 >= 0 ) {
      dataset[i].class = 1;
    } else {
      dataset[i].class = -1;
    }
  }
}

function drawLine() {

  let w = p.weights;

  // -x * w[0] / w[1] - b / w[1] = y

  let x1 = 0;
  let y1 = -x1 * w[0] / w[1] - p.bias / w[1];

  let x2 = width;
  let y2 = -x2 * w[0] / w[1] - p.bias / w[1];

  stroke( color(45, 45, 255) );
  strokeWeight(3);
  line(x1, y1, x2, y2);

  // console.log(x1, y1, x2, y2);

}

function quadraticError() {

  let sum = 0;

  for (let i = 0; i < SAMPLES; i += 1) {
    sum += ( dataset[i].class - p.guess( dataset[i] ) ) ** 2;
  }

  return sum;

}

let idx = 0;
let ep = 1;

function draw() {
  background(0);

  stroke(255);
  fill(255);
  strokeWeight(10);

  for (let i = 0; i < SAMPLES; i += 1) {
    if ( dataset[i].class === 1 ) {
      stroke(color(255, 45, 45));
    } else {
      stroke(color(45, 255, 45));
    }
    point(dataset[i][0], dataset[i][1]);
  }

  // stroke(color(255, 45, 255));
  // strokeWeight(15);
  // point(dataset[idx][0], dataset[idx][1]);

  for (let i = 0; i < SAMPLES; i += 1) {
    p.train( dataset[i], dataset[i].class );
  }

  // p.train( dataset[idx], dataset[idx].class );
  // idx += 1;

  drawLine();

  // if ( idx >= SAMPLES ) {
    // noLoop();
    ep += 1;
    // idx = 0;
  // }

  let qerr = quadraticError();

  errorP.html(`
    Error: ${qerr}<br>
    Pesos: ${p.weights[0]} &nbsp; ${p.weights[1]}<br>
    Épocas: ${ep}
  `);

  if ( quadraticError() < 1 ) {
    noLoop();
  }
}