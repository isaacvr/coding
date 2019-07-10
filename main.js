let time = 0;
let wave = [];
let MAX_POINTS = 1200;

let slider;

function setup() {
  createCanvas(1500, 700);
  slider = createSlider(1, 30, 1, 1);
  slider.value('1');

}

function draw() {

  let radCircle = 100;
  let radDot = 3;

  background(0);
  strokeWeight(3);

  translate(200, 300);
  stroke(255);
  noFill();

  let x = 0;
  let y = 0;

  for (let i = 0; i < slider.value(); i += 1) {

    let n = i * 2 + 1;
    let prevx = x;
    let prevy = y;

    let rad = radCircle * 4  / (n * PI);

    noFill();
    stroke(255, 100);
    ellipse(prevx, prevy, rad * 2);

    x += rad * cos(n * time);
    y += rad * sin(n * time);

    stroke(255);
    // fill(255);
    line(prevx, prevy, x, y);
    ellipse(x, y, radDot);

  }

  wave.unshift(y);

  translate(300, 0);
  line(x - 300, y, 0, wave[0]);

  beginShape();

  noFill();
  stroke( color(34, 99, 237) );

  for (let i = 0, maxi = wave.length; i < maxi; i += 1) {
    vertex(i, wave[i]);
  }

  endShape();

  translate(-300, 0);

  time += 0.03;

  if ( wave.length > MAX_POINTS ) {
    wave.pop();
  }

}