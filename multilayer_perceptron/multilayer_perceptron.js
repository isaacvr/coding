document.title = "Multilayer Perceptron";

let brain;

function setup() {
  createCanvas(600, 600);
  brain = new NeuralNetwork(2, 2, 1, 0.05, 'sigmoid');
  setTimeout(train, 100);
}

const inputs = [
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1],
];

const outputs = [
  [-1],
  [1],
  [1],
  [-1],
];

let indexes = inputs.map((a, b) => b);
let ephocs = 20;
let resolution = 50;

function train() {
  // let ecm = new Matrix(1, 1);
  for (let i = 0; i < ephocs; i += 1) {
    for (let j = 0, maxj = indexes.length; j < maxj; j += 1) {
      brain.train(inputs[j], outputs[j]);
      // let err = brain.train(inputs[j], outputs[j]);
      // ecm.add( err.forEach(x => x * x), true );
    }
    indexes = shuffle(indexes);
  }
  // ecm.div(ephocs, true);
  // console.log('ECM: ', ecm.agregate());
  setTimeout(train, 10);
}

function draw() {
  background(0);

  let cols = width / resolution;
  let rows = height / resolution;

  textAlign(CENTER, CENTER);

  for (let i = 0; i < cols; i += 1) {
    for (let j = 0; j < rows; j += 1) {
      let a = i / cols;
      let b = j / rows;
      let res = brain.predict([ a, b ], true);
      fill(map(res[0], -1, 1, 0, 1) * 255);
      rect(i * resolution, j * resolution, resolution, resolution);
      fill( map(res[0], -1, 1, 1, 0) * 255 );
      text(nf(map(res[0], -1, 1, 0, 1), 1, 2), i * resolution, j * resolution, resolution, resolution);
    }
  }

}