const WIDTH = 1500;
const HEIGHT = 700;

const FRAMES = 4;

let input;
let btn;

let animations = [];

function writeText(str, x, y, col) {
  stroke(col || 255);
  fill(col || 255);
  textSize(30);
  text(str, x, y);
}

function isDigit(char) {
  var digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  return digits.indexOf(char) > -1;
}

function precedence(op) {
  if ( [">>", "<<", "&", "|"].indexOf(op) > -1 ) {
    return 4;
  } else if ( ["^"].indexOf(op) > -1 ) {
    return 3;
  } else if ( ["*", "/"].indexOf(op) > -1 ) {
    return 2;
  } else if ( ["+", "-"].indexOf(op) > -1 ) {
    return 1;
  }
  return 0;
}

function isOperator(str, pos) {
  var newStr = str.substr(pos, str.length);
  var ops = [
    [/^\+/, 1],
    [/^\-/, 1],
    [/^\*/, 1],
    [/^\//, 1],
    [/^\^/, 1],
    [/^>>/, 2],
    [/^<</, 2],
    [/^\|/, 1],
    [/^&/ , 1],
  ];

  for (var i = 0, maxi = ops.length; i < maxi; i += 1) {
    if ( ops[i][0].test(newStr) ) {
      return ops[i][1];
    }
  }

  return null;
}

function countOperands(arr) {
  var res = 0;
  arr.forEach(e => {
    if ( !isNaN(e) ) {
      res += 1;
    }
  });

  return res;
}

function calcRpn() {

  clearData();
  loop();
  strokeWeight(1);

  var expression = input.value() + ')';

  var operators = [ '(' ];
  var posfix = [];
  var stack = [];

  animations.length = 0;

  animations.push([ 'setExpression', expression ]);
  animations.push([ 'operators:push', '(' ]);

  for(var i = 0, maxi = expression.length; i < maxi; i += 1) {
    animations.push([ 'cursor1', i ]);
    if ( expression[i] === ' ' ) {
      continue;
    }

    let len;

    if ( expression[i] === '(' ) {
      operators.push('(');
      animations.push([ 'operators:push', '(' ]);
    } else if ( expression[i] === ')' ) {
      while(operators.length > 0) {
        var op = operators.pop();

        animations.push([ 'operators:pop' ]);

        if ( op === '(' ) {
          break;
        }

        posfix.push(op);

        let a, b;

        if ( stack.length < 2 ) {
          animations.push(['log', 'Missing ' + ( operatorsCount - operandsCount + 1 ) + ' operands']);
          return;
        }

        b = stack.pop();
        a = stack.pop();

        let res = eval(a + ( op === '^' ? ' ** ' : ' ' + op + ' ' ) + b);

        animations.push([ 'posfix:push', op ]);
        animations.push([ 'log', `(${a})`, op, `(${b})`, '=', res ]);
        animations.push([ 'log', `(${a})`, op, `(${b})`, '=', res ]);
        animations.push([ 'stack:push', res ]);

        stack.push(res);
      }
    } else if ( isDigit(expression[i]) ) {
      var j = i;
      while(j < maxi && isDigit(expression[j])) { j++; }

      posfix.push(+expression.substr(i, j - i));
      stack.push(+expression.substr(i, j - i));
      animations.push([ 'posfix:push', +expression.substr(i, j - i) ]);
      i = j - 1;
    } else if ( len = isOperator(expression, i) ) {
      let temp = expression.substr(i, len);

      while ( operators.length > 0 ) {
        var op = operators.pop();

        if ( precedence(op) >= precedence(temp) ) {
          posfix.push(op);
          let a, b;

          if ( stack.length < 2 ) {
            animations.push(['log', 'Missing ' + ( operatorsCount - operandsCount + 1 ) + ' operands']);
            return;
          }

          b = stack.pop();
          a = stack.pop();

          let res = eval(a + ( op === '^' ? ' ** ' : ' ' + op + ' ' ) + b);

          animations.push([ 'posfix:push', op ]);
          animations.push([ 'log', `(${a})`, op, `(${b})`, '=', res ]);
          animations.push([ 'log', `(${a})`, op, `(${b})`, '=', res ]);
          animations.push([ 'stack:push', res ]);

          stack.push(res);
        } else {
          operators.push(op);
          break;
        }

        animations.push([ 'operators:pop' ]);

      }

      animations.push([ 'operators:push', temp ]);
      operators.push(temp);

      i += len - 1;
    }
  }

  while(operators.length > 0) {
    var op = operators.pop();
    animations.push([ 'operators:pop', op ]);

    if ( op === '(' ) {
      continue;
    }

    posfix.push(op);
    let a, b;

    if ( stack.length < 2 ) {
      animations.push(['log', 'Missing ' + ( operatorsCount - operandsCount + 1 ) + ' operands']);
      return;
    }

    b = stack.pop();
    a = stack.pop();

    let res = eval(a + ( op === '^' ? ' ** ' : ' ' + op + ' ' ) + b);

    animations.push([ 'posfix:push', op ]);
    animations.push([ 'log', `(${a})`, op, `(${b})`, '=', res ]);
    animations.push([ 'log', `(${a})`, op, `(${b})`, '=', res ]);
    animations.push([ 'stack:push', res ]);

    stack.push(res);
  }

}

function setup() {
  createCanvas(WIDTH, HEIGHT);
  frameRate(FRAMES);

  textFont('Courier new');

  input = createInput('3+2*1-2*(4-7)+2^3');
  btn = createButton('Calculate');

  input.elt.setAttribute('placeholder', 'Math expression...');

  btn.mousePressed(calcRpn);

  clearData();

}

function drawList(label, list, x, y, col, cur) {

  const SPAN_X = 30;
  const SPAN_Y = 40;
  const LEN = list.length;

  let acum = 0;

  writeText(label, x - SPAN_X * 4, y, color(45, 45, 255) );

  for (let i = 0; i < LEN; i += 1) {
    writeText(list[i], x + SPAN_X * acum, y, col);
    acum += list[i].toString().length;
  }

  if ( !isNaN(cur) && cur >= 0 && cur < LEN) {
    writeText('^', x + SPAN_X * cur, y + SPAN_Y, color(255, 45, 45));
  }

}

let animExpression = '';
let animOperators = [];
let animStack = [];
let animCursor1 = -1;
let animCursor2 = -1;
let animPosfix = [];
let animLogs = [];

function clearData() {
  animExpression = '';
  animOperators.length = 0;
  animStack.length = 0;
  animCursor1 = -1;
  animCursor2 = -1;
  animPosfix.length = 0;
  animLogs.length = 0;
}

function draw() {
  background(0);

  if ( animations.length === 0 ) {
    return;
  }

  let anim = animations.shift();

  switch(anim[0]) {
    case 'operators:push': {
      animOperators.push(anim[1]);
      break;
    }
    case 'operators:pop': {
      animOperators.pop();
      break;
    }
    case 'stack:push': {
      animStack.push(anim[1]);
      break;
    }
    case 'stack:pop': {
      for (let i = 0; i < anim[1]; i += 1) {
        animStack.pop();
      }
      break;
    }
    case 'setExpression': {
      animExpression = anim[1];
      break;
    }
    case 'cursor1': {
      animCursor1 = anim[1];
      break;
    }
    case 'cursor2': {
      animCursor2 = anim[1];
      break;
    }
    case 'posfix:push': {
      animPosfix.push( anim[1] );
      if ( isNaN(anim[1]) ) {
        animStack.pop();
        animStack.pop();
      } else {
        animStack.push(anim[1]);
      }
      break;
    }
    case 'log': {
      animLogs = anim.slice(1, anim.length);
      break;
    }
    default: {
      throw new TypeError('Unknown command ' + anim[0]);
    }
  }

  drawList('expr', animExpression, 200, 200, 255, animCursor1);
  drawList('op', animOperators, 200, 300, 255);
  drawList('stack', animStack, 200, 400, 255);
  drawList('posfix', animPosfix, 200, 500, 255, animPosfix.length - 1);
  drawList('logs', animLogs.join(''), 200, 600, 255);

  animLogs.length = 0;

  if ( animations.length === 0 ) {
    noFill();
    stroke(color(255, 45, 45));
    strokeWeight(3);
    rect(190, 370, 18 * (animStack[0].toString().length) + 20, 40);
    noLoop();
  }

}