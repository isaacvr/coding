document.title = "XOR problem (TensorFlow.js)";

let grid;
let cols;
let rows;
let resolution;
let inputs = null;

// UI
let activationHidden;
let activationOutput;
let optDropdown;
let runBtn;
let lrSlider;
let lossP;

// TF Stuff
let model;
let optimizer;

let prediction = [];

let isInit;

const train_x = tf.tensor2d([
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1],
]);

const train_y = tf.tensor2d([
  [0],
  [1],
  [1],
  [0],
]);

function createMatrix(n, m) {
  let res = [];

  for (let i = 0; i < n; i += 1) {
    res[i] = [];
    for (let j = 0; j < m; j += 1) {
      res[i][j] = 0;
    }
  }

  return res;
}

function init(act1, act2, opt, lr) {

  isInit = true;

  resolution = 50;

  rows = height / resolution;
  cols = width / resolution;

  if ( inputs === null ) {
    let temp = [];
    for (let i = 0; i < rows; i += 1) {
      for (let j = 0; j < cols; j += 1) {
        temp.push([ i / rows, j / cols ]);
      }
    }
    inputs = tf.tensor2d(temp);
  }

  grid = createMatrix(rows, cols);

  model = tf.sequential();

  let hidden = tf.layers.dense({
    inputShape: [2],
    units: 5,
    activation: act1 || 'sigmoid'
  });

  let output = tf.layers.dense({
    units: 1,
    activation: act2 || 'sigmoid'
  });

  model.add(hidden);
  model.add(output);

  optimizer = tf.train[ opt || 'sgd' ]( lr || 0.05);

  model.compile({
    optimizer,
    loss: 'meanSquaredError'
  });

  isInit = false;

}

function setup() {
  createCanvas(600, 600);
  init();
  prediction = model.predict(inputs).dataSync();
  setTimeout(train, 100);

  let actFuncs = [
    'elu',
    'hardSigmoid',
    'linear',
    'relu6',
    'selu',
    'sigmoid',
    'softmax',
    'softplus',
    'softsign',
    'tanh',
  ];

  lossP = createP();

  createP('Select the activation function of the layers, the learning rate, the optimizer and click "Run"');
  activationHidden = createSelect(false);
  activationOutput = createSelect(false);

  optDropdown = createSelect(false);
  optDropdown.option('sgd');
  optDropdown.option('adagrad');
  optDropdown.option('adadelta');
  optDropdown.option('adam');
  optDropdown.option('adamax');
  optDropdown.option('rmsprop');

  lrSlider = createSlider(0, 1, 0.05, 0.01);
  runBtn = createButton('Run');

  actFuncs.forEach(e => {
    activationHidden.option(e);
    activationOutput.option(e);
  });

  runBtn.mousePressed(() => {
    init(activationHidden.value(), activationOutput.value(), optDropdown.value(), lrSlider.value());
  });
}

function train() {
  if ( isInit ) {
    return;
  }
  tf.tidy(() => {
    trainModel().then((res) => {
      lossP.html('Loss: ' + nf(res.history.loss[0], 1, 6));
      setTimeout(train, 10);
    });
  });
}

function trainModel() {
  return model.fit(train_x, train_y, {
    shuffle: true,
    ephocs: 50
  });
}

function draw() {

  let index = 0;

  textAlign(CENTER, CENTER);
  textSize(resolution / 3);

  tf.tidy(() => {
    prediction = model.predict(inputs).dataSync();

    for (let i = 0; i < rows; i += 1) {
      for (let j = 0; j < cols; j += 1) {
        fill( prediction[index] * 255 );
        rect(j * resolution, i * resolution, resolution, resolution);
        fill( (1 - prediction[index]) * 255 );
        text(nf(prediction[index], 1, 2), j * resolution, i * resolution, resolution, resolution);
        index += 1;
      }
    }
  });

  // noLoop();

}