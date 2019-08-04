document.title = "Discrete Fourier Transform";

const WIDTH = 1500;
const HEIGHT = 700;
// const FRAMES = 0;

const CENTER_X = WIDTH >> 1;
const CENTER_Y = HEIGHT >> 1;

let btn;

function setup() {
  createCanvas(WIDTH, HEIGHT);
  btn = createButton('Show Spectrum', '0');
  btn.mouseClicked(() => {
    let val = +btn.value();

    if ( val === 0 ) {
      btn.html('Show Fourier');
    } else {
      btn.html('Show Spectrum');
    }

    btn.value(1 - val);
  });

  console.log(btn);
}

let prevMousePressed = false;
let path = [];
let dft = [];
let drawDFT = false;

function fourier() {

  dft.length = 0;

  for (let k = 0, N = path.length; k < N; k += 1) {
    let sum = new Complex(0, 0);
    for (let n = 0; n < N; n += 1) {
      let cp = new Complex({
        arg: -2 * PI * k * n / N,
        abs: 1
      });
      sum = sum.add( path[n].mul(cp) );
    }
    dft.push({
      freq: k,
      amp: sum.abs() / N,
      phase: sum.arg()
    });
  }

}

let time = 0;
let path1 = [];

function drawArrow(cp1, cp2) {

  let v1 = cp2.sub(cp1);
  let len = v1.abs() / 20;

  let rotor = new Complex({
    arg: PI / 6,
    abs: 1
  });

  let p1 = cp2.sub( v1.mul(rotor).div(10) );
  let p2 = cp2.sub( v1.div(rotor).div(10) );

  beginShape();
  fill(255);
  vertex(cp2.re, cp2.im);
  vertex(p1.re, p1.im);
  vertex(p2.re, p2.im);
  endShape(CLOSE);


}

function draw() {

  background(0);

  translate(CENTER_X, CENTER_Y);

  if ( mouseIsPressed ) {
    if ( !(mouseX < 0 || mouseX > WIDTH || mouseY < 0 || mouseY > HEIGHT) ) {
      if ( !prevMousePressed ) {
        path = [];
        frameRate(60);
      }
      path.push( new Complex(mouseX - CENTER_X, mouseY - CENTER_Y) );
      drawDFT = false;
    }
  } else if ( prevMousePressed ) {
    frameRate(20);
    fourier();
    path1.length = 0;
    drawDFT = true;
    time = 0;
  }

  prevMousePressed = mouseIsPressed;

  if ( btn.value() == '0' || !drawDFT ) {
    beginShape();
    stroke(180);
    strokeWeight(3);
    noFill();
    for (let i = 0, maxi = path.length; i < maxi; i += 1) {
      vertex(path[i].re, path[i].im);
    }
    endShape();
  }

  if (!drawDFT) {
    return;
  }

  if ( btn.value() == '0' ) {

    let cp = new Complex(0, 0);

    for (let i = 0, maxi = dft.length; i < maxi; i += 1) {
      let prev = cp;
      let freq = dft[i].freq;
      let rad = dft[i].amp;
      let phase = dft[i].phase;
      cp = cp.add(new Complex({
        abs: rad,
        arg: freq * time + phase
      }));

      stroke(100);
      strokeWeight(2);
      noFill();
      ellipse(prev.re, prev.im, rad * 2);
      stroke(200);
      if ( i + 1 === maxi ) {
        stroke( color(45, 255, 45) );
        strokeWeight(4);
      }
      line(prev.re, prev.im, cp.re, cp.im);
      drawArrow(prev, cp);

      // stroke(255);
      // strokeWeight(4);
      // point(cp.re, cp.im);

    }

    path1.push(cp);

    endShape();

    beginShape();
    stroke(color(255, 45, 45));
    strokeWeight(4);
    noFill();
    for (let i = 0, maxi = path1.length; i < maxi; i += 1) {
      vertex(path1[i].re, path1[i].im);
    }
    endShape();

    if ( path1.length > path.length - 10 ) {
      path1.shift();
    }

    let DT = 2 * PI / dft.length;

    time += DT;
  } else if ( dft.length > 0 ) {
    stroke(100);
    line(-CENTER_X, 0, CENTER_X, 0);
    beginShape();
    stroke(255);
    let stepX = WIDTH / dft.length;
    for (let i = 0, maxi = dft.length; i < maxi; i += 1) {
      vertex(i * stepX - CENTER_X, -dft[i].amp);
    }
    endShape();
  }

}