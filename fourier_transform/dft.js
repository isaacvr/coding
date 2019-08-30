importScripts('../complex.min.js');
importScripts('../utils.js');

const INI_F = -40;
const FIN_F = -INI_F;
const ERR = 1e-3;
// addEventListener('message', e => dft(e.data.map(e1 => new Complex(e1))), false);
addEventListener('message', e => {
  let a = (typeof e.data[1] === 'number') ? e.data[1] : INI_F;
  let b = (typeof e.data[2] === 'number') ? e.data[2] : FIN_F;
  let c = (typeof e.data[3] === 'number') ? e.data[3] : ERR;
  // console.log('MESSAGEEEEE');
  fourier(e.data[0].map(e1 => new Complex(e1)), a, b, c);
}, false);

function dft(path) {

  let dft = [];

  let N = path.length;
  const PI = Math.PI;

  for (let k = 0; k < N; k += 1) {
    let sum = new Complex(0, 0);
    for (let n = 0; n < N; n += 1) {
      let cp = new Complex({
        arg: -2 * PI * k * n / N,
        abs: 1
      });
      sum = sum.add( path[n].mul(cp) );
    }
    dft.push({
      freq: k,
      amp: sum.abs() / N,
      phase: sum.arg()
    });
  }

  postMessage([dft, 2 * PI / dft.length]);

}

function fourier(path, ini, fin, err) {

  let N = path.length;
  const TAU = Math.PI * 2;

  let dft = [];

  for (let f = ini; f <= fin; f += 1) {
    let Cn = Numeric.integrateC((t) => {
      let i = Math.round( t * (N - 1) );
      return path[i].mul( new Complex({ arg: -f * TAU * t, abs: 1 }) );
    }, 0, 1, err);
    dft.push({
      freq: f,
      amp: Cn.abs(),
      phase: Cn.arg()
    });
    postMessage(`progess ${ (f - ini) * 100 / (fin - ini) }`);
  }

  postMessage(dft);

}