document.title = 'Binary Search';

const WIDTH = 1500;
const HEIGHT = 750;

const SAMPLES = 100;
const RECT_WIDTH = WIDTH / (SAMPLES + 2) * 2 / 3;
const RECT_SPAN = RECT_WIDTH / 2;

let arr = [];
let toFind = NaN;
let a = 0, b = Infinity;

function generateValue() {
  return ~~random(1, 20);
}

function setup() {

  createCanvas(WIDTH, HEIGHT);
  frameRate(5);

  let btn = createButton('Search');
  let input = createInput('');

  input.elt.setAttribute('placeholder', 'Number to find... [1 - 20]');

  btn.mouseClicked(() => {
    toFind = ~~input.value();
    a = 0;
    b = SAMPLES - 1;
    founded = -1;
    // loop();
  });

  for (let i = 0; i < SAMPLES; i += 1) {
    arr.push( generateValue() );
  }

  arr.sort((a, b) => a - b);

}

let founded = -1;

function drawValues() {

  beginShape();
  translate(RECT_WIDTH + RECT_SPAN, HEIGHT * 3 / 4);

  const SCALE = 20;

  for (let i = 0; i < SAMPLES; i += 1) {

    if ( i === founded ) {
      // console.log('green');
      stroke(45, 255, 45);
      strokeWeight(2);
      fill(45, 255, 255, 40);
    } else if ( (i === a || i === b) && !isNaN(toFind) ) {
      stroke(45, 45, 255);
      strokeWeight(2);
      fill(255, 45, 255, 40);
    } else {
      stroke(255, 45, 45);
      strokeWeight(2);
      fill(255, 255, 45, 40);
    }

    rect((RECT_WIDTH + RECT_SPAN) * i, 0, RECT_WIDTH, -arr[i] * SCALE );

  }

  endShape();

}

function draw() {
  background(0);

  drawValues(arr);

  // console.log(index);

  if ( isNaN(toFind) ) {
    // noLoop();
    return;
  }

  let mid = (a + b) >> 1;

  if ( a > b ) {
    // noLoop();
    toFind = NaN;
    return;
  }

  if ( arr[mid] === toFind ) {
    founded = mid;
    toFind = NaN;
    // noLoop();
    return;
  }

  if ( arr[mid] > toFind ) {
    b = mid - 1;
  } else {
    a = mid + 1;
  }

}