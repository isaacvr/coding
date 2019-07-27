document.title = 'Bubble Sort';

const WIDTH = 1500;
const HEIGHT = 750;

const SAMPLES = 30;
const RECT_WIDTH = WIDTH / (SAMPLES + 2) * 2 / 3;
const RECT_SPAN = RECT_WIDTH / 2;

let values = [];
let idx1 = 0, idx2 = 1;
let rst;

function generateValue() {
  return random(1, 10);
}

function setup() {
  createCanvas(WIDTH, HEIGHT);
  frameRate(10);

  rst = createButton('Reset');

  rst.mouseClicked(() => {
    values.length = 0;
    for (let i = 0; i < SAMPLES; i += 1) {
      values.push( generateValue() );
    }
    idx1 = 0;
    idx2 = 1;
    loop();
  });

  for (let i = 0; i < SAMPLES; i += 1) {
    values.push( generateValue() );
  }

}

function drawValues() {

  beginShape();
  translate(RECT_WIDTH + RECT_SPAN, HEIGHT * 3 / 4);

  const SCALE = 40;

  for (let i = 0; i < SAMPLES; i += 1) {

    if ( i === idx1 || i === idx2 ) {
      stroke(45, 45, 255);
      strokeWeight(2);
      fill(255, 45, 255, 40);
    } else {
      stroke(255, 45, 45);
      strokeWeight(2);
      fill(255, 255, 45, 40);
    }
    rect((RECT_WIDTH + RECT_SPAN) * i, 0, RECT_WIDTH, -values[i] * SCALE );
  }

  endShape();

}

function draw() {
  background(0);
  drawValues();

  if ( values[idx1] > values[idx2] ) {
    let temp = values[idx1];
    values[idx1] = values[idx2];
    values[idx2] = temp;
  }

  idx2 += 1;

  if ( idx2 >= values.length ) {
    idx1 += 1;
    idx2 = idx1 + 1;
  }

  if ( idx1 >= values.length ) {
    // console.timeEnd('benchmark');
    noLoop();
  }

}