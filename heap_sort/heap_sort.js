document.title = 'Heap Sort';

const WIDTH = 1500;
const HEIGHT = 750;

const SAMPLES = 30;
const RECT_WIDTH = WIDTH / (SAMPLES + 2) * 2 / 3;
const RECT_SPAN = RECT_WIDTH / 2;

let list = [];
let animation = [];
let list1 = [];
let rst;

function generateValue() {
  return random(1, 10);
}

function heap_sort(arr) {

  for (let i = 1, maxi = arr.length; i < maxi; i += 1) {

    let node = i;
    let parent;

    do {
      parent = (node - 1) >> 1;
      animation.push([ 'show', [node, parent] ]);
      if ( arr[ parent ] < arr[ node ] ) {
        let temp = arr[ parent ];
        arr[ parent ] = arr[ node ];
        arr[ node ] = temp;
        animation.push([ 'swap', [parent, node], [node, parent] ]);
      } else {
        break;
      }
      node = parent;
    } while( parent );

  }

  // console.log('HEAP', arr);

  for (let i = SAMPLES - 1; i >= 0; i -= 1) {
    // break;

    animation.push([ 'show', [0, i] ]);

    let temp = arr[0];
    arr[0] = arr[ i ];
    arr[ i ] = temp;

    animation.push([ 'swap', [0, i], [0, i] ]);

    // console.log('SWAP', arr);

    for (let node = 0;;) {
      let left = node * 2 + 1;
      let right = node * 2 + 2;

      animation.push([ 'show', [node, -left, -right] ]);

      if ( left < i && right < i ) {
        if ( arr[ left ] > arr[ right ] && arr[ left ] > arr[ node ]) {
          animation.push([ 'show', [node, left] ]);
          animation.push([ 'swap', [node, left], [node, left] ]);
          let temp = arr[ node ];
          arr[ node ] = arr[ left ];
          arr[ left ] = temp;
          node = left;
          // console.log('LEFT', arr);
        } else if ( arr[ right ] > arr[ left ] && arr[ right ] > arr[ node ]) {
          animation.push([ 'show', [node, right] ]);
          animation.push([ 'swap', [node, right], [node, right] ]);
          let temp = arr[ node ];
          arr[ node ] = arr[ right ];
          arr[ right ] = temp;
          node = right;
          // console.log('RIGH', arr);
        } else {
          break;
        }
      } else if ( left < i && arr[ left ] > arr[node] ) {
        animation.push([ 'show', [node, left] ]);
        animation.push([ 'swap', [node, left], [node, left] ]);
        let temp = arr[node];
        arr[node] = arr[ left ];
        arr[ left ] = temp;
        node = left;
        // console.log('LEFT', arr);
      } else {
        break;
      }
    }
  }

}

function setup() {

  createCanvas(WIDTH, HEIGHT);
  frameRate(10);

  rst = createButton('Reset');

  rst.mouseClicked(() => {
    list.length = 0;
    list1.length = 0;
    animation.length = 0;
    animId = 0;

    for (let i = 0; i < SAMPLES; i += 1) {
      let v = generateValue();
      list.push( v );
      list1.push( v );
    }

    animation.push([ 'show' ]);

    heap_sort(list);

    loop();

  });

  for (let i = 0; i < SAMPLES; i += 1) {
    let v = generateValue();
    list.push( v );
    list1.push( v );
  }

  animation.push([ 'show' ]);

  heap_sort(list);

  for (let i = 1; i < SAMPLES; i += 1) {
    if ( list[i] < list[i - 1] ) {
      throw new TypeError('Bad Sort');
    }
  }

}

function drawValues(vals, highlights) {

  beginShape();
  translate(RECT_WIDTH + RECT_SPAN, HEIGHT * 2 / 4);

  const SCALE = 20;
  const cant = vals.length;

  let high = highlights || [];

  for (let i = 0; i < cant; i += 1) {

    stroke(255, 45, 45);
    strokeWeight(2);
    fill(255, 255, 45, 40);

    if ( high.indexOf(i) > -1 ) {
      stroke(45, 45, 255);
      fill(255, 45, 255, 40);
    } else if ( high.indexOf(-i) > -1 ) {
      stroke(45, 255, 45);
      fill(45, 255, 255, 40);
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
    case 'show': {
      drawValues(list1, anim[1]);
      break;
    }
    case 'swap': {
      let a = anim[1][0];
      let b = anim[1][1];
      let temp = list1[a];
      list1[a] = list1[b];
      list1[b] = temp;
      drawValues(list1, anim[2]);
      break;
    }
    default: {
      throw new ReferenceError('Undefined ' + anim[0] + ' state');
    }
  }

  if ( animId >= animation.length ) {
    noLoop();
  }

}