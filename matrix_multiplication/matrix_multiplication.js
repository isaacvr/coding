document.title = "Matrix Multiplication";

let plotter;
let plotter1;
let ix;
let iy;
let jx;
let jy;

let cuad = [
  new Point(1, 1),
  new Point(3, 1),
  new Point(3, 3),
  new Point(1, 3),
  new Point(1, 1),
];

let pts = [];

let mt;

function createMatrix(A, B, C, D) {
  let a = int(A * 100) / 100;
  let b = int(B * 100) / 100;
  let c = int(C * 100) / 100;
  let d = int(D * 100) / 100;
  return `<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mo>[</mo><mtable><mtr><mtd><mn>${a}</mn></mtd><mtd><mn>${b}</mn></mtd></mtr><mtr><mtd><mn>${c}</mn></mtd><mtd><mn>${d}</mn></mtd></mtr></mtable><mo>]</mo></mrow></math>`
}

function setup() {
  let cnv = createCanvas(1500, 700);

  cnv.mousePressed(() => {
    pts.push(plotter.fromMouse(mouseX, mouseY));
  });

  createP();

  // ix = createSlider(-20, 20, 1.6, 0.05);
  // iy = createSlider(-20, 20, 0.5, 0.05);
  // jx = createSlider(-20, 20, -3, 0.05);
  // jy = createSlider(-20, 20, 1, 0.05);

  ix = createSlider(-20, 20, 1, 0.05);
  iy = createSlider(-20, 20, 0, 0.05);
  jx = createSlider(-20, 20, 0, 0.05);
  jy = createSlider(-20, 20, 1, 0.05);

  createP();

  mt = document.createElement('div');

  document.body.appendChild(mt);

  plotter = new Plotter();
  plotter.zoomFactor = 100;

  plotter1 = new Plotter();
  plotter1.zoomFactor = plotter.zoomFactor;

  // frameRate(1);

}

function mapper(x) {
  return ( Math.tanh(x) + 1 )/ 2;
}

function nonLinearTransform(pt) {
  let x = pt.re;
  let y = pt.im;
  // return new Point( 0, x ** 2 - y ** 2 );
  // return new Point( x + cos(y), y + sin(x) );
  // return new Point( x + sin(x - y), y + sin(x + y) );
  return new Point( x + sin(x), y );
  // return new Point(x + sin(y), y + cos(x));
  // return new Point(x + sin(y), y - cos(x));
  // return new Point(x, y);
}

function draw() {

  console.clear();
  console.log( frameRate() );

  background(0);

  plotter.axes = Matrix.fromArray([
      ix.value(),
      jx.value(),
      iy.value(),
      jy.value()
    ],
    [2, 2]
  );

  mt.innerHTML = createMatrix(ix.value(), jx.value(), iy.value(), jy.value());

  plotter.applyNonlinearTransform( nonLinearTransform );

  plotter.drawGrid();
  plotter1.drawGrid();

  // plotter.drawEllipse( new Point(0, 0), 3, 2 );

  // plotter.drawPath( cuad,  );

  plotter.drawLine( new Point(0, 0), new Point(1, 1) );

  plotter.drawArrow( new Point(0, 0), new Point(1, 0), color(255, 45, 45) );
  plotter.drawArrow( new Point(0, 0), new Point(0, 1), color(45, 45, 255) );


  // plotter.drawGrid( color(47, 162, 203) );

  // plotter.drawArrow(new Complex(0, 0), new Complex(1, 0), color(255, 45, 45));
  // plotter.drawArrow(new Complex(0, 0), new Complex(0, 1), color(45, 45, 255));

  // plotter.drawLine( new Complex(0, 0), new Complex(1, 1), color(255, 152, 0) );

  // plotter.drawEllipse(new Complex(3, 2), 2, 1.2);

}

function mouseDragged() {
  // console.log(mouseX, mouseY, pmouseX, pmouseY);
  plotter.center.re += (mouseX - pmouseX);
  plotter.center.im += (mouseY - pmouseY);
  plotter1.center.re += (mouseX - pmouseX);
  plotter1.center.im += (mouseY - pmouseY);
}

function mouseWheel(e) {
  // console.log(e);
  e.preventDefault();
  plotter.zoomFactor -= e.delta;
  plotter1.zoomFactor -= e.delta;
  plotter.zoomFactor = Math.max(plotter.zoomFactor, 1);
  plotter1.zoomFactor = Math.max(plotter1.zoomFactor, 1);
}