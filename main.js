let time = 0;
let wave = [];
let MAX_POINTS = 1000;

let slider;

function setup() {
  createCanvas(1500, 700);
  slider = createSlider(1, 1000, 1, 1);
  slider.value('1');
}

function draw() {

  let radCircle = 50;
  let radDot = 3;

  background(0);
  strokeWeight(3);

  translate(200, 300);
  stroke(255);
  noFill();

  let sum = new Complex({ re: 0, im: 0 });

  for (let i = 1; i <= slider.value(); i += 1) {

    let n = i;
    // let n = i * 2 + 1;
    // let n = i;
    let prevSum = sum;

    // let rad = radCircle * 2 * ( (-1) ** (n + 1) ) / n ;
    // let rad = radCircle * 4 / n;
    let rad = radCircle * 4 / n;

    noFill();
    stroke(255, 100);
    ellipse(prevSum.re, prevSum.im, rad * 2);

    let temp = new Complex({
      arg: n * time,
      abs: rad
    });

    sum = sum.add( temp );

    stroke(255);
    // fill(255);
    line(prevSum.re, prevSum.im, sum.re, sum.im);
    ellipse(sum.re, sum.im, radDot);

  }

  wave.unshift(sum.im);

  let diff = 600;
  translate(diff, 0);
  line(sum.re - diff, sum.im, 0, wave[0]);

  beginShape();

  noFill();
  stroke( color(34, 99, 237) );

  for (let i = 0, maxi = wave.length; i < maxi; i += 1) {
    vertex(i * 2, wave[i]);
  }

  endShape();

  translate(-diff, 0);

  time += 0.03;

  if ( wave.length > MAX_POINTS ) {
    wave.pop();
  }

}
