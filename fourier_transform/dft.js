importScripts('../complex.min.js');

addEventListener('message', e => fourier(e.data.map(e1 => new Complex(e1))), false);

function fourier(path) {

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