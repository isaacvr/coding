document.title = "Polynomial approximation (TensorFlow.js)";

let LEARNING_RATE = 0.05;
let optimizer = tf.train.sgd(LEARNING_RATE);

let DEGREE = 3;

let X = [];
let Y = [];

let plotter;

let coef = [];

let xp = [];
let yp = [];

let setBtn;
let optDropdown;
let lrSlider;
let degInput;

function init() {
  xp.length = 0;
  yp.length = 0;

  for (let i = 0, maxi = coef.length; i < maxi; i += 1) {
    coef[i].dispose();
  }

  coef.length = 0;

  for (let i = 0; i <= DEGREE; i += 1) {
    coef.push( tf.variable( tf.scalar( random(-1, 1) ) ) );
  }

  for (let i = -1;; i += 0.01) {
    xp.push(i);
    yp.push(0);
    if ( i > 1 ) {
      break;
    }
  }
}

function setup() {
  let canvas = createCanvas(1500, 700);
  // frameRate(1);

  canvas.mousePressed(() => {
    let cp = plotter.fromMouse(mouseX, mouseY);
    X.push( cp.re );
    Y.push( cp.im );
  });

  createP('Select the Optimizer, the learning rate, the polynomial degree and click "Set params"');

  optDropdown = createSelect(false);
  optDropdown.option('sgd');
  // optDropdown.option('momentum');
  optDropdown.option('adagrad');
  optDropdown.option('adadelta');
  optDropdown.option('adam');
  optDropdown.option('adamax');
  optDropdown.option('rmsprop');

  lrSlider = createSlider(0, 1, LEARNING_RATE, 0.01);

  degInput = createInput(DEGREE);
  degInput.attribute('type', 'number');
  degInput.attribute('min', '0');
  degInput.attribute('max', '10');
  degInput.attribute('size', 10);
  degInput.attribute('placeholder', 'degree...');

  setBtn = createButton('Set params');
  let cl = createButton('Clear Points');

  setBtn.mousePressed(() => {
    // console.log(optDropdown.value(), lrSlider.value(), degInput.value());
    LEARNING_RATE = +lrSlider.value();
    optimizer = tf.train[optDropdown.value()](LEARNING_RATE);
    DEGREE = degInput.value();

    init();
  });

  cl.mousePressed(() => {
    X.length = 0;
    Y.length = 0;
  });

  plotter = new Plotter(-1, 1, 1, -1);

  init();

  setTimeout(train, 100);

}

function loss(pred, labels) {
  return pred.sub(labels).square().mean();
}

function predict(x) {
  const xs = tf.tensor1d(x);
  let ys = tf.tensor1d([0]);
  for (let i = 0; i <= DEGREE; i += 1) {
    ys = ys.add( xs.pow(i).mul(coef[i]) );
  }
  return ys;
}

function train() {

  tf.tidy(() => {
    if ( X.length > 0 ) {
      let ys = tf.tensor1d(Y);
      optimizer.minimize(() => loss(predict(X), ys));
    }

    let ys = predict(xp);
    ys.data().then((res) => {
      yp.length = 0;
      for (let i = 0, maxi = res.length; i < maxi; i += 1) {
        yp.push(res[i]);
      }
    });

    setTimeout(train, 10);
  });

}

function draw() {

  background(0);

  plotter.drawAxes();

  for (let i = 0, maxi = X.length; i < maxi; i += 1) {
    plotter.drawPoint( new Point(X[i], Y[i]) );
  }

  plotter.drawPath(xp.map((e, pos) => new Point(e, yp[pos])), color(45, 45, 255));

}