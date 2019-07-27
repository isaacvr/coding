document.title = 'Longest Common Subsequence';

let word1;
let word2;
let btn;

let animation = [];

function createMatrix(rows, cols, val) {

  let arr = [];

  for (let i = 0; i < rows; i += 1) {
    let arr1 = [];
    for (let j = 0; j < cols; j += 1) {
      arr1.push(val);
    }
    arr.push(arr1);
  }

  return arr;

}

function lcs(a, b) {

  noLoop();

  animation.length = 0;

  let la = a.length;
  let lb = b.length;

  let s1 = ' ' + a;
  let s2 = ' ' + b;

  animation.push([ 'init', s1, s2, la, lb ]);

  let dp = createMatrix(la + 1, lb + 1, 0);
  let path = createMatrix(la + 1, lb + 1, 0);

  for (let i = 1; i <= la; i += 1) {
    for (let j = 1; j <= lb; j += 1) {
      animation.push([ 'show', i, j ]);
      if ( s1[i] === s2[j] ) {
        dp[i][j] = dp[i-1][j-1] + 1;
        path[i][j] = 1;
        animation.push([ 'set', i, j, dp[i-1][j-1] + 1, 1 ]);
      } else if ( dp[i-1][j] > dp[i][j-1] ) {
        dp[i][j] = dp[i-1][j];
        path[i][j] = 2;
        animation.push([ 'set', i, j, dp[i-1][j], 2 ]);
      } else {
        dp[i][j] = dp[i][j-1];
        path[i][j] = 3;
        animation.push([ 'set', i, j, dp[i][j-1], 3 ]);
      }
    }
  }

  while ( la > 0 && lb > 0 ) {
    animation.push([ 'show', la, lb ]);
    animation.push([ 'path', la, lb ]);
    if ( path[la][lb] === 1 ) {
      animation.push([ 'select', la, lb ]);
      la -= 1;
      lb -= 1;
    } else if ( path[la][lb] === 2 ) {
      la -= 1;
    } else {
      lb -= 1;
    }
  }

  loop();

}

function setup() {

  createCanvas(1500, 700);
  frameRate(20);

  word1 = createInput();
  word2 = createInput();
  btn = createButton('Run');

  btn.mouseClicked(function() {
    lcs(word1.value(), word2.value());
  });

  word1.elt.setAttribute('placeholder', 'Type your text...');
  word2.elt.setAttribute('placeholder', 'Type your text...');

}

let dp = createMatrix(1, 1, 0);
let path = createMatrix(1, 1, 0);
let str1;
let str2;
let l1;
let l2;
let toShow = { x: -1, y: -1 };
let toSet = { x: -1, y: -1 };
let selectedX = [];
let selectedY = [];
let pathX = [];
let pathY = [];

function setColor(col) {
  stroke( col );
  fill( col );
}

function showMatrix() {

  beginShape();

  let SPAN_X = 40;
  let SPAN_Y = 40;
  let OFFSET_X = 160;
  let OFFSET_Y = 100;

  stroke( color(45, 45, 255) );
  fill( color(45, 45, 255) );
  textSize(SPAN_Y);

  translate(OFFSET_Y, OFFSET_X);

  for (let i = 0; i <= l1; i += 1) {
    setColor(color(45, 45, 255));
    if ( i === toShow.x || selectedX.indexOf(i) > -1 ) {
      setColor(color(255, 45, 45));
    }
    text(str1[i], -SPAN_X - 10, i * SPAN_Y);
  }

  for (let i = 0; i <= l2; i += 1) {
    setColor(color(45, 45, 255));
    if ( i === toShow.y || selectedY.indexOf(i) > -1 ) {
      setColor(color(255, 45, 45));
    }
    text(str2[i], i * SPAN_X, -SPAN_Y - 10);
  }

  for (let i = 0; i <= l1; i += 1) {
    for (let j = 0; j <= l2; j += 1) {
      if ( i === 0 || j === 0 ) {
        setColor( color(255, 255, 255, 30) );
      } else {
        if ( i === toSet.x && j === toSet.y ) {
          setColor( color(255, 45, 45) );
        } else {
          setColor( color(255, 255, 255) );
        }
      }
      text(dp[i][j], j * SPAN_X, i * SPAN_Y);
    }
  }

  translate( OFFSET_X + l2 * SPAN_X, 0 );

  for (let i = 0; i <= l1; i += 1) {
    for (let j = 0; j <= l2; j += 1) {
      if ( i === 0 || j === 0 ) {
        setColor( color(255, 255, 255, 30) );
      } else {
        if ( i === toSet.x && j === toSet.y ) {
          setColor( color(255, 45, 45) );
        } else {
          setColor( color(255, 255, 255) );
        }
        for (let k = 0; k < pathX.length; k += 1) {
          if ( pathX[k] === i && pathY[k] === j ) {
            setColor( color(45, 255, 45) );
            break;
          }
        }
        for (let k = 0; k < selectedX.length; k += 1) {
          if ( selectedX[k] === i && selectedY[k] === j ) {
            setColor( color(255, 45, 45) );
            break;
          }
        }
      }
      text(path[i][j], j * SPAN_X, i * SPAN_Y);
    }
  }

  toShow.x = -1;
  toShow.y = -1;
  toSet.x = -1;
  toSet.y = -1;

  endShape();

}

function draw() {

  background(0);

  if ( animation.length === 0 ) {
    showMatrix();
    noLoop();
    return;
  }

  let anim = animation.shift();

  switch(anim[0]) {
    case 'init': {
      str1 = anim[1].split('');
      str2 = anim[2].split('');
      l1 = anim[3];
      l2 = anim[4];
      dp = createMatrix(l1 + 1, l2 + 1, 0);
      path = createMatrix(l1 + 1, l2 + 1, 0);
      selectedX.length = 0;
      selectedY.length = 0;
      pathX.length = 0;
      pathY.length = 0;
      break;
    }
    case 'show': {
      let x = anim[1];
      let y = anim[2];
      toShow.x = x;
      toShow.y = y;
      break;
    }
    case 'set': {
      let x = anim[1];
      let y = anim[2];
      dp[x][y] = anim[3];
      path[x][y] = anim[4];
      toShow.x = x;
      toShow.y = y;
      toSet.x = x;
      toSet.y = y;
      break;
    }
    case 'select': {
      selectedX.push( anim[1] );
      selectedY.push( anim[2] );
      break;
    }
    case 'path': {
      pathX.push( anim[1] );
      pathY.push( anim[2] );
      break;
    }
    default: {
      throw new TypeError('Invalid command ' + anim[0]);
    }
  }

  showMatrix();

  if ( animation.length === 0 ) {
    noLoop();
  }

}