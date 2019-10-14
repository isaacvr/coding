document.title = 'Maurer Rose';

let N;
let D;
const RAD = 300;

let plotter;

function setup() {
  createCanvas(1500, 700);

  createP();

  N = createSlider(1, 50, 3, 1);
  D = createSlider(1, 50, 3, 1);

  plotter = new Plotter();

}

function draw() {

  background(0);

  let path = [];
  let delta = TAU / 360;

  for (let i = 0; i < TAU; i += delta) {
    let k = i * D.value();
    let r = RAD * sin(N.value() * k);
    let x = r * cos(k);
    let y = r * sin(k);
    path.push( new Point(x, y) );
  }

  plotter.drawPath(path, color(233, 30, 99));

}