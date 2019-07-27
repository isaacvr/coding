document.title = 'Merge Sort';

const WIDTH = 1500;
const HEIGHT = 750;

const SAMPLES = 20;
const RECT_WIDTH = WIDTH / (SAMPLES + 2) * 2 / 3;
const RECT_SPAN = RECT_WIDTH / 2;

let values = [];
let animation = [];
let index = 0;
let rst;

function generateValue() {
  return random(1, 10);
}

function merge(arr, ini, mid, fin) {

  let temp = [];
  let a = ini;
  let b = mid;

  animation.push(['merge', [].concat(arr), [].concat(temp), a, b, ini, mid, fin]);

  while( a < mid || b < fin ) {
    if ( a < mid && b < fin ) {
      if ( arr[a] < arr[b] ) {
        temp.push( arr[a] );
        a += 1;
      } else {
        temp.push( arr[b] );
        b += 1;
      }
    } else if ( a < mid ) {
      temp.push( arr[a] );
      a += 1;
    } else {
      temp.push( arr[b] );
      b += 1;
    }
    animation.push(['merge', [].concat(arr), [].concat(temp), a, b, ini, mid, fin]);
  }

  for (let i = ini; i < fin; i += 1) {
    arr[i] = temp[i - ini];
  }

}

function mergeSort(arr, idx1, idx2) {

  // console.log(idx1, idx2);

  if ( idx2 - idx1 > 1 ) {
    let mid = (idx1 + idx2) >> 1;
    animation.push(['sort', [].concat(arr), idx1, mid]);
    mergeSort(arr, idx1, mid);
    animation.push(['sort', [].concat(arr), mid, idx2]);
    mergeSort(arr, mid, idx2);
    animation.push(['merge', [].concat(arr), idx1, mid, idx2]);
    merge(arr, idx1, mid, idx2);
  }

}

function setup() {

  createCanvas(WIDTH, HEIGHT);
  frameRate(10);

  // noCanvas();

  for (let i = 0; i < SAMPLES; i += 1) {
    values.push( generateValue() );
  }

  rst = createButton('Reset');

  rst.mouseClicked(() => {
    values.length = 0;
    animation.length = 0;

    for (let i = 0; i < SAMPLES; i += 1) {
      values.push( generateValue() );
    }
    animId = 0;

    mergeSort(values, 0, values.length);

    animation.push([ 'sort', values, 0, values.length]);

    loop();

  });

  mergeSort(values, 0, values.length);

  animation.push([ 'sort', values, 0, values.length]);

}

let a, b, ini, mid, fin;

function drawValues(vals, tmp) {

  beginShape();
  translate(RECT_WIDTH + RECT_SPAN, HEIGHT * 2 / 4);

  const SCALE = 20;
  const cant = vals.length;

  let temp = tmp || [];

  for (let i = 0; i < cant; i += 1) {

    if ( ini <= i && i < fin ) {
      stroke(45, 255, 45);
      strokeWeight(2);
      fill(45, 255, 255, 40);
      // for (let j = 0, maxj = temp.length; j < maxj; j += 1) {
      rect((RECT_WIDTH + RECT_SPAN) * i, 200, RECT_WIDTH, -temp[i - ini] * SCALE );
      // }
    } else {
      stroke(255, 45, 45);
      strokeWeight(2);
      fill(255, 255, 45, 40);
    }

    if ( i === a || i === b ) {
      stroke(45, 45, 255);
      strokeWeight(2);
      fill(255, 45, 255, 40);
    }

    rect((RECT_WIDTH + RECT_SPAN) * i, 0, RECT_WIDTH, -vals[i] * SCALE );

  }

  endShape();

}

let animId = 0;

function draw() {
  background(0);

  let op = animation[ animId++ ];

  if ( op[0] === 'sort' ) {
    a = -1;
    b = -1;
    ini = op[2];
    fin = op[3];
    drawValues(op[1]);
  } else {
    // ['merge', [].concat(arr), [].concat(temp), a, b, ini, mid, fin]
    a = op[3];
    b = op[4];
    ini = op[5];
    mid = op[6];
    fin = op[7];

    drawValues(op[1], op[2]);
  }

  if ( animId >= animation.length ) {
    // console.timeEnd('benchmark');
    noLoop();
  }

}