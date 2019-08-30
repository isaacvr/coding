addEventListener('message', (e) => {
  // console.log('MESSAGE: ', e.data);
  if ( e.data[0] === 'words' ) {
    getWords(e.data[1]);
  } else {
    getNGrams(e.data[1], +e.data[2]);
  }
}, false);

function getWords(text) {
  let ngrams = Object.create(null);
  let txt = text;

  txt = txt.replace(/([":;,.¿?()«»<>[\]])/g, " $1 ");

  let txtArr = txt.split(/ /).map(e => e.trim()).filter(e => e != '');

  // console.log(txtArr);

  for (let i = 0, maxi = txtArr.length; i < maxi && true; i += 1) {
    let word = txtArr[i];

    if ( !ngrams[ word ] ) {
      ngrams[ word ] = [];
    }

    ngrams[ word ].push( txtArr[i + 1] || '' );

    // postMessage(i * 100 / maxi);

  }

  postMessage( ngrams );
}

function getNGrams(text, order) {

  let ngrams = Object.create(null);
  // let next = [];
  let txt = text;

  for (let i = 0, maxi = txt.length - order; i <= maxi; i += 1) {
    let gram = txt.substr(i, order);
    // let idx = ngrams.indexOf( gram );

    if ( !ngrams[ gram ] ) {
      ngrams[ gram ] = [];
    }

    ngrams[ gram ].push( txt.charAt(i + order) );

    // postMessage(i * 100 / maxi);

  }

  postMessage(ngrams);

}
