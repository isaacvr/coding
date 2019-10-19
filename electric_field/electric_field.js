document.title = "Electric Field";

const e0 = 8.854187e-12;
const RAD = 60;
const TOTAL = 2;

let isFixed = true;

let system = [];
let moving = [];
let paths = [];

class Particle {
  constructor(RAD) {
    this.rad = RAD;

    if ( random(-1, 1) < 0 ) {
      this.label = "-";
      this.mass = 9.109382e-31;
      this.charge = -1.602176e-19;
    } else {
      this.label = "+";
      this.mass = 1.672621e-27;
      this.charge = 1.602176e-19;
    }

    this.pos = new Complex( random( RAD * 2, width - RAD * 2 ), random( RAD * 2, height - RAD * 2 ) );

  }

  show() {

    strokeWeight(4);
    if ( this.charge < 0 ) {
      stroke(198, 74, 75);
      fill(223, 149, 139);
    } else {
      stroke(27, 117, 8);
      fill(103, 145, 203);
    }

    ellipse(this.pos.re, this.pos.im, this.rad, this.rad);

    if ( this.rad > 10 ) {
      stroke(0);
      strokeWeight(1);
      fill(255);
      text(this.label, this.pos.re, this.pos.im);
    }
  }

}

function setup() {
  createCanvas(1500, 800);

  textAlign(CENTER, CENTER);
  textSize(RAD * 0.6);

  createP('Keys: ');
  createP('- f: Select the position of the first particle ( fixed or mouse controlled )');
  createP('- space: Draw field lines');
  createP('- c: Clears field lines');
  createP('- ArrowUp: Add a random particle');
  createP('- ArrowDown: Remove the last particle');

  for (let i = 0; i <= TOTAL; ++i) {
    system.push( new Particle(RAD) );
  }

  plotter = new Plotter();
  plotter.center = new Complex(0, 0);
  plotter.axes = Matrix.fromArray([1, 0, 0, -1], [2, 2]);

}

function E(pos) {

  let res = new Complex(0, 0);

  for(let i = 0, maxi = system.length; i < maxi; i += 1) {
    let p = system[i];
    let r = pos.sub(p.pos);
    let rAbs = r.abs();
    if ( rAbs * 2.5 < RAD && p.charge < 0 ) {
      return new Complex(0, 0);
    }
    let ur = r.div( rAbs );
    res = res.add( ur.mul( p.charge / ( rAbs * rAbs ) ) );
  }

  return res.div(4 * PI * e0);

}

function getColor(alpha) {
  if ( alpha < 0 ) {
    return color(0, 255, 0);
  } else if ( alpha > 1 ) {
    return color(255, 0, 0);
  } else {
    if ( alpha < 0.5 ) {
      let red = int( map(alpha, 0, 0.5, 0, 255) );
      return color(red, 255, 0);
    } else {
      let green = int( map(alpha, 0.5, 1, 255, 0) );
      return color(255, green, 0);
    }
  }
}

function drawField() {
  let resolution = 50;
  for (let i = resolution; i < width; i += resolution) {
    for (let j = resolution; j < height; j += resolution) {
      let elect = E( new Complex(i, j) ).mul(1e+15);
      let eAbs = elect.abs();
      let col = getColor( 1 - exp(-eAbs / 50) );
      elect = elect.mul(resolution * 0.6 / eAbs );
      plotter.drawSimpleArrow(new Complex(i, j), new Complex(i + elect.re, j + elect.im), col);
    }
  }
}

function generatePaths() {

  let di = TAU / 30;

  for(let i = 0, maxi = system.length; i < maxi; i += 1) {
    let p = system[i];
    if ( p.charge > 0 ) {
      for(let j = 0; j <= TAU; j += di) {
        let pt = p.pos.add( new Complex({ abs: RAD / 4, arg: j }) );
        moving.push( pt );
        paths.push( [ pt ] );
      }
    }
  }

  let di1 = 70;

  for (let i = 0; i <= width || i <= height; i += di1) {
    if ( i <= width ) {
      moving.push( new Complex(i, 2) );
      paths.push( [ new Complex(i, 2) ] );
      moving.push( new Complex(i, height - 2) );
      paths.push( [ new Complex(i, height - 2) ] );
    }
    if ( i <= height ) {
      moving.push( new Complex(2, i) );
      paths.push( [ new Complex(2, i) ] );
      moving.push( new Complex(width - 2, i) );
      paths.push( [ new Complex(width - 2, i) ] );
    }
  }

}

function updateMovingParticles() {
  for(let i = 0, maxi = moving.length; i < maxi; i += 1) {
    let p = moving[i];
    if ( !(p.re < 0 || p.re > width || p.im < 0 || p.im > height) ) {
      // console.log('YEAH');
      let elect = E( p ).mul(1e+15);
      let len = clip(elect.abs(), 6, 15);
      elect = elect.mul(len / elect.abs());
      moving[i] = p.add( elect );
      plotter.drawPoint( moving[i] );
      paths[i].push( moving[i] );

      if ( elect.re == 0 && elect.im == 0 ) {
        moving[i].re = -1;
      }
    }
  }
}

function draw() {
  background(0);
  drawField();

  console.clear();
  console.log( frameRate() );

  if ( !isFixed ) {
    system[0].pos = new Complex(mouseX, mouseY);
  }

  updateMovingParticles();

  paths.forEach((path) => plotter.drawDirectedPath(path, color(255, 235, 85)));
  system.forEach((e) => e.show());

}

function keyPressed() {
  if ( keyCode == 32 ) {
    generatePaths();
  } else if ( keyCode == 67 ) {
    moving.length = 0;
    paths.length = 0;
  } else if ( keyCode == 70 ) {
    isFixed = !isFixed;
  } else if ( keyCode == 38 ) {
    system.push( new Particle(RAD) );
  } else if ( keyCode == 40 ) {
    if ( system.length > 1 ) {
      system.pop();
    }
  }
}