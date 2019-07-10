class Complex {
  constructor(a, b) {

    if ( typeof a === 'object' ) {
      if ( a.hasOwnProperty('arg') ) {
        // console.log('A = ', a, 'B = ', b);
        this.re = Math.cos(a.arg) * a.abs;
        this.im = Math.sin(a.arg) * a.abs;
      } else {
        this.re = a.re;
        this.im = a.im;
      }
    } else {
      this.re = a;
      this.im = b;
    }
  }

  mult(c) {
    let re = this.re * c.re - this.im * c.im;
    let im = this.re * c.im + this.im * c.re;
    return new Complex(re, im);
  }

  multC(c) {
    return new Complex(this.re * c, this.im * c);
  }

  divC(c) {
    return new Complex(this.re / c, this.im / c);
  }

  add(c) {
    return new Complex(this.re + c.re, this.im + c.im);
  }

  length() {
    return sqrt(this.re ** 2 + this.im ** 2);
  }

  unit() {
    let len = this.length();
    return new Complex(this.re / len, this.im / len);
  }

  normalize() {
    let len = this.length();
    this.re /= len;
    this.im /= len;
  }
}

let time = 0;
let wave = [];
const MAX_POINTS = 1200;
let samples = [];

const MIN_X = 0;
const MAX_X = 3 * Math.PI;
const STEP_X = 0.01;

const MIN_FREC = -5;
const MAX_FREC = 5;
const STEP_F = 0.01;

const FUNCTION = 0;
const FOURIER = 1;
const END = 2;

const cx = 200;
const cy = 400;
const rad = 150;
const diam = rad * 2;
const PI2 = Math.PI * 2;

let state = FOURIER;

let frecIndex = 0;

let RESULT = {};

function myFunction(x) {
  return sin(x);
}

function setup() {
  createCanvas(1500, 800);

  for (var i = MIN_X; i <= MAX_X; i += STEP_X) {
    samples.push( new Complex(i, myFunction(i)) );
  }

  RESULT = fourier(myFunction, MIN_X, MAX_X, STEP_X, MIN_FREC, MAX_FREC, STEP_F);

  console.log(RESULT);

}

function fourier(fn, x1, x2, stepX, fra, frb, stepF) {

  //console.log(fn, x1, x2, fra, frb, step);

  var __aux;
  var sm = [], ms = [], fr = [];
  var cp, mass, cant;
  var frec, ini;

  for (frec = fra + 10 * stepF; frec <= frb; frec += stepF) {

    __aux = [];

    mass = new Complex({ re: 0, im: 0 });
    cant = 0;

    for (ini = x1; ini <= x2; ini += stepX) {

      cp = new Complex({
        arg : -2 * Math.PI * frec * ini,
        abs : fn(ini) * rad
      });

      mass = mass.add(cp);

      // if ( isNaN(mass.re) || isNaN(mass.im) ) {
      //   console.log('NAN: ', cp, mass, frec, ini, rad);
      //   return;
      // }

      __aux.push(cp);

      cant += 1;

    }

    // console.log('MASS: ', mass, ' CANT: ', cant);
    // console.log('CP: ', cp);

    mass = mass.divC(cant);

    sm.push(__aux);
    ms.push(mass);
    fr.push(frec);

    //break;

  }

  return [ sm, ms, fr ];

}

function draw() {

  background(0);
  stroke(255, 80);
  strokeWeight(3);
  noFill();
  translate(cx, cy);
  ellipse(0, 0, diam);

  if ( state === END ) {
    return;
  }

  if ( time >= samples.length ) {
    // time -= samples.length;
    time = 0;
    state = FOURIER;
  } else if ( frecIndex >= RESULT[2].length ) {
    frecIndex = 0;
    // state = FUNCTION;
    state = END;
  }

  if ( state === FUNCTION ) {

    beginShape();
      noFill();
      stroke(color(200, 45, 45), 150);
      for (let i = 0, maxi = floor(time); i < maxi; i += 1) {
        vertex(samples[i].re * 20, samples[i].im * 20);
      }
    endShape();

    time += 10;

  } else if ( state === FOURIER ) {

    beginShape();
      stroke(color(45, 45, 200), 150);
      noFill();
      for (let i = 0, maxi = RESULT[0][frecIndex].length; i < maxi; i += 1) {
        vertex(RESULT[0][frecIndex][i].re, RESULT[0][frecIndex][i].im);
      }
    endShape();

    beginShape();
      stroke(color(200, 45, 45), 150);
      fill(color(200, 45, 45), 150);
      ellipse(RESULT[1][frecIndex].re, RESULT[1][frecIndex].im, 10);
    endShape();

    beginShape();
      stroke(color(45, 200, 45), 150);
      translate(rad * 2, 0);
      noFill();
      let scale = 100;
      let offset = 200;
      for (let i = 0, maxi = frecIndex; i <= maxi; i += 1) {
        vertex(offset + scale * RESULT[2][i], -RESULT[1][i].re);
      }
      // translate(-rad, 0);

      // translate(-cx, -cy);

    endShape();

    frecIndex += 1;

    // state = FUNCTION;
    // state = END;
  }

  translate(-100, -200);
}