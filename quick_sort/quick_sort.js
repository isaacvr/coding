document.title = 'Quick Sort';

const WIDTH = 1500;
const HEIGHT = 750;

const SAMPLES = 40;
const RECT_WIDTH = WIDTH / (SAMPLES + 2) * 2 / 3;
const RECT_SPAN = RECT_WIDTH / 2;

let values = [];
let values1 = [];
let animation = [];
let rst;

function generateValue() {
  return random(1, 10);
}

function quicksort(arr, ini, fin) {

  // console.log(ini, fin);

  if ( ini < fin ) {

    let piv = arr[ fin ];
    let i = ini;

    animation.push([ 'select', [fin] ]);

    for (let j = ini; j < fin; j += 1) {
      animation.push([ 'select', [i, j, fin] ]);
      if ( arr[ j ] < piv ) {
        animation.push([ 'swap', i, j, fin ]);
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
        i += 1;
      }
    }

    let temp = arr[i];
    arr[i] = arr[fin];
    arr[fin] = temp;

    animation.push([ 'swap', i, fin, fin ]);

    quicksort(arr, ini, i - 1);
    quicksort(arr, i + 1, fin);

  }

}

function setup() {

  createCanvas(WIDTH, HEIGHT);
  frameRate(10);

  rst = createButton('Reset');

  rst.mouseClicked(() => {
    values.length = 0;
    animation.length = 0;
    animId = 0;

    for (let i = 0; i < SAMPLES; i += 1) {
      values.push( generateValue() );
    }

    values1 = [].concat(values);

    quicksort(values, 0, values.length - 1);

    loop();

  });


  for (let i = 0; i < SAMPLES; i += 1) {
    values.push( generateValue() );
  }

  values1 = [].concat(values);

  quicksort(values, 0, values.length - 1);

  for (let i = 1; i < SAMPLES; i += 1) {
    if ( values[i - 1] > values[i] ) {
      throw new TypeError('Bad Sort');
    }
  }

}

let selected = [];

function drawValues(vals) {

  beginShape();
  translate(RECT_WIDTH + RECT_SPAN, HEIGHT * 2 / 4);
  // translate(-RECT_WIDTH - RECT_SPAN, HEIGHT * 1 / 4);

  const SCALE = 20;
  const cant = vals.length;

  for (let i = 0; i < cant; i += 1) {

    let index = selected.indexOf(i);
    if ( index > -1 ) {
      if ( index === selected.length - 1 ) {
        stroke(45, 255, 45);
        strokeWeight(2);
        fill(45, 255, 255, 40);
      } else {
        stroke(45, 45, 255);
        strokeWeight(2);
        fill(255, 45, 255, 40);
      }
    } else {
      stroke(255, 45, 45);
      strokeWeight(2);
      fill(255, 255, 45, 40);
    }

    rect((RECT_WIDTH + RECT_SPAN) * i, 0, RECT_WIDTH, -vals[i] * SCALE );

  }

  endShape();

}

let animId = 0;

function draw() {
  background(0);

  let anim = animation[ animId++ ];

  switch(anim[0]) {
    case 'select': {
      selected = anim[1];
      break;
    }
    case 'swap': {
      let a = anim[1];
      let b = anim[2];
      let temp = values1[a];
      values1[a] = values1[b];
      values1[b] = temp;
      selected = [ a, b, anim[3] ];
    }
  }

  drawValues(values1);

  if ( animId >= animation.length === 0 ) {
    noLoop();
  }

}