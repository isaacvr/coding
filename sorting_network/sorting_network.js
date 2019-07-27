const WIDTH = 1500;
const HEIGHT = 700;

const FRAMES = 30;

let input;
let btn;
let lines = 0;
let maxIndex;

let arr = [];
let network = [];
let pnetwork = [];
let watchTimes = [];
let currentWatch = 0;

const OFFSET = 80;
const OFFSET_2 = OFFSET << 1;
let INC_X = (WIDTH - OFFSET_2) / (Math.max(1, maxIndex) + 2);
let INC_Y = (HEIGHT - OFFSET_2) / Math.max(1, lines - 1);

function Pbracket(i, x, j, y) {
  let a, b;

  if(x == 1 && y == 1) {
    network.push([ i-1, j-1 ]);
  } else if(x == 1 && y == 2) {
    network.push([ i-1, j ]);
    network.push([ i-1, j-1 ]);
  } else if(x == 2 && y == 1) {
    network.push([ i-1, j-1 ]);
    network.push([ i, j-1 ]);
  } else {
    a = x >> 1;
    b = (x & 1) ? (y >> 1) : ((y + 1) >> 1);
    Pbracket(i, a, j, b);
    Pbracket((i + a), (x - a), (j + b), (y - b));
    Pbracket((i + a), (x - a), j, b);
  }
}

function bose(i, m) {
  let a;

  if(m > 1) {
    a = m >> 1;
    bose(i, a);
    bose((i + a), (m - a));
    Pbracket(i, a, (i + a), (m - a));
  }
}

function setup() {
  createCanvas(WIDTH, HEIGHT);
  frameRate(FRAMES);

  textAlign(RIGHT, CENTER);

  input = createInput('5', 'number');
  btn = createButton('Generate');

  input.elt.setAttribute('min', '1');
  input.elt.setAttribute('max', '100');

  btn.mouseClicked(function() {
    let cant = input.value();
    if ( cant < 1 || cant > 100 ) {
      alert('Invalid input. [1; 100]');
      return;
    }

    lines = cant;
    network.length = 0;
    pnetwork.length = 0;
    arr.length = 0;

    for (let i = 0; i < lines; i += 1) {
      arr.push( ~~random(1, lines) );
    }

    animArr = [].concat(arr);

    bose(1, lines);

    maxIndex = -1;

    let last = new Array(lines);

    for (let i = 0; i < lines; i += 1) {
      last[i] = -1;
    }

    for (let i = 0, maxi = network.length; i < maxi; i += 1) {
      let a = min(network[i][0], network[i][1]);
      let b = max(network[i][0], network[i][1]);

      let idx = -1;

      for (let j = a; j <= b; j += 1) {
        idx = max(idx, last[j]);
      }

      idx += 1;

      network[i][2] = idx;
      pnetwork[ idx ] = pnetwork[ idx ] || [];
      pnetwork[ idx ].push( network[i] );

      maxIndex = max(maxIndex, idx);

      for (let j = a; j <= b; j += 1) {
        last[j] = idx;
      }

    }

    time = 0;

    watchTimes.length = 0;
    currentWatch = 0;

    for (let i = 0, inc = 1 / (pnetwork.length + 1); i <= 1; i += inc) {
      watchTimes.push(i);
    }

    watchTimes.shift();

    INC_X = (WIDTH - OFFSET_2) / (Math.max(1, maxIndex) + 2);
    INC_Y = (HEIGHT - OFFSET_2) / Math.max(1, lines - 1);

  });

}

let time = 0;
let dt = 0.002;
let animArr = [];

function draw() {
  background(0);

  translate(OFFSET, OFFSET);

  stroke(100);
  strokeWeight(2);

  for (let i = 0, y = 0; i < lines; i += 1, y += INC_Y) {
    line(0, y, WIDTH - OFFSET_2, y);
  }

  stroke(255);
  fill(255);
  textSize(30 - int((lines - 1) / 5) * 4);

  if ( time > watchTimes[ currentWatch ] ) {
    for (let i = 0, maxi = pnetwork[ currentWatch ].length; i < maxi; i += 1) {
      let a = min(pnetwork[ currentWatch ][i][0], pnetwork[ currentWatch ][i][1]);
      let b = max(pnetwork[ currentWatch ][i][0], pnetwork[ currentWatch ][i][1]);
      if ( animArr[a] > animArr[b] ) {
        let tmp = animArr[a];
        animArr[a] = animArr[b];
        animArr[b] = tmp;
      }
    }
    currentWatch += 1;
    if ( currentWatch >= watchTimes.length ) {
      currentWatch = 0;
    }
  }

  let textPos = (WIDTH - OFFSET_2) * time;
  for (let i = 0, y = 0; i < lines; i += 1, y += INC_Y) {
    text(animArr[i], textPos, y);
  }

  // for (let i = 0, maxi = watchTimes.length; i < maxi; i += 1) {
  //   stroke(color(45, 255, 45));
  //   strokeWeight(3);
  //   let x = watchTimes[i]*( WIDTH - OFFSET_2 );
  //   line(x, 0, x, lines * INC_Y);
  // }

  translate(INC_X, 0);

  for (let i = 0, maxi = network.length; i < maxi; i += 1) {
    stroke(color(45, 45, 255));
    strokeWeight(3);
    let x = network[i][2] * INC_X;
    line(x, network[i][0] * INC_Y, x, network[i][1] * INC_Y);
    stroke(color(255, 45, 45));
    strokeWeight(13);
    point(x, network[i][0] * INC_Y);
    point(x, network[i][1] * INC_Y);
  }

  time += dt;

  if ( time > 1 ) {
    time = 0;
    animArr = [].concat(arr);
    currentWatch = 0;
  }

}