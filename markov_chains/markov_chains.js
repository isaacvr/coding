document.title = 'Markov chains for text generation';

let txt;

let ngrams;

function preload() {
  txt = loadStrings('text.txt');
}

function setup() {

  noCanvas();
  noLoop();

  txt = txt.join(' ');

  let wk = new Worker('./generate_ngrams.js');

  let ignore = 100;
  let order = 3;

  wk.addEventListener('message', function(e) {
    // console.log('RESPONSE: ', e);

    if ( typeof e.data === 'number' ) {
      if ( ignore === 0 ) {
        console.log(e.data);
      }
      ignore = ( ignore + 99 ) % 100;
      return;
    }

    ngrams = e.data;

    // let k = random( Object.keys(ngrams) );
    // console.log(k, ngrams[ k ]);
    // console.log( markovIt(500, order) );
    // console.log( markovIt(100) );
    // createP( markovIt(500, order) );
    createP( markovIt(1) );

  }, false);

  wk.addEventListener('error', console.log, false);

  // wk.postMessage(['ngrams', txt, order]);
  wk.postMessage(['words', txt]);

}

function markovIt(cant, hasOrder) {

  // console.log('KEYS')
  let k = random( Object.keys(ngrams) );
  let current = k;
  let result = [ current ];
  let bw = ( typeof hasOrder === 'undefined' );
  let order = ( !bw ) ? hasOrder : null;

  // console.log('k, current, cant: ', k, current, cant);

  for (let i = 0; i < cant; i += 1) {
    let n;

    if ( !ngrams[ current ] ) {
      console.log('NO NEXT');
      break;
    } else {
      n = random( ngrams[ current ] );
    }

    result.push(n);

    if ( bw ) {
      if ( n != '.' ) {
        cant += 1;
      }
    }

    if ( bw ) {
      current = n;
    } else {
      current += n;
      current = current.substr( -order, order );
    }

    // console.log('ADD: ', n);
    // console.log('CUR: ', current);

  }

  let res = result.join( ( bw ) ? ' ' : '' );
  res = res.replace(/(?!\u3000)\s+/gm, ' ');
  res = res.replace(/ ([":;,.?»>\]])/g, '$1');
  res = res.replace(/(["¿(«<[]) /g, '$1');

  return res;

}

function draw() {

}