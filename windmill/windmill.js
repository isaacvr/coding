document.title = "Windmill Problem";

let PTS;
const DA = 0.003;

let bigRect = [];

let plotter;
let points = [];
let pivot;
let nextPivotId;
let lastPivotId;
let cnt;
let arg;

function generatePoints(n) {
  points.length = 0;
  let lx = width >> 1;
  let ly = height >> 1;

  for (let i = 0; i < n; i += 1) {
    points.push( new Point( random(-lx + 100, lx - 100), random(-ly + 100, ly - 100) ) );
  }

}

function angles(vec) {
  return points.
    map((e) => {
      return vec.cross( e.sub(pivot).unit() );
    }).
    map((e) => {
      return e < 0 ? 0 : 1;
    }).
    map((e, pos) => {
      if ( e ) {
        let c2 = 1 - ( points[ pos ].sub(pivot).unit().sub(vec).abs() ** 2 ) / 2;
        return acos(c2);
      }
      return Infinity;
    });
}

function updateCounter() {

  let vec = new Point({ arg, abs: 1 });
  let vec1 = vec.mul(-1);
  let dAng = angles(vec);
  let dAng1 = angles(vec1);
  let res;
  let minAng = Infinity;

  for (let i = 0, maxi = dAng.length; i < maxi; i += 1) {
    res = Math.min(dAng[i], dAng1[i]);

    if ( i != pivotId && i != lastPivotId && res < minAng ) {
      minAng = res;
      nextPivotId = i;
      cnt = ~~(res / DA);
    }

  }

}

function init() {

  generatePoints( PTS );

  pivot = random( points );
  pivotId = points.indexOf( pivot );
  arg = random(-1, 1);

  updateCounter();

}

function setup() {

  createCanvas(1500, 700);

  let centerX = width >> 1;
  let centerY = height >> 1;

  plotter = new Plotter(-centerX, centerY, centerX, -centerY);

  textSize(30);
  textAlign(CENTER, CENTER);

  bigRect = [
    new Point(-10000000, -1000000),
    new Point(-10000000, 1000000),
    new Point(10000000, 1000000),
    new Point(10000000, -1000000),
    // new Point(-10000000, -1000000),
  ];

  createP();

  let sld = createSlider(1, 50, 10, 1);
  let runBtn = createButton('Run');

  runBtn.mousePressed(() => {
    PTS = sld.value();
    init();
  });

  PTS = sld.value();

  init();

  let angs = [
    new Point(10, 0),
    new Point(10, 10),
    new Point(0, 10),
    new Point(-10, 10),
    new Point(-10, 0),
    new Point(-10, -10),
    new Point(0, -10),
    new Point(10, -10),
  ];

  for (let i = 0; i < 8; i += 1) {
    for (let j = 0; j < 8; j += 1) {
      console.log('%d %d => ', i, j, angs[i].angleTo(angs[ (i + j) & 7 ]) * 180 / Math.PI);
    }
  }

}

function draw() {

  background(0);

  let vec = new Point({ arg, abs: 1 });

  let pts = Plotter.intersect(pivot, pivot.add( vec ), bigRect);
  let path1 = pts.concat( bigRect.filter(e => vec.cross( e.sub(pivot) ) <= 0 ) );
  let path2 = pts.concat( bigRect.filter(e => vec.cross( e.sub(pivot) ) >= 0 ) );

  plotter.drawPath(path1, color(0, 0, 0, 0), 1, color(26, 59, 66), CLOSE);
  plotter.drawPath(path2, color(0, 0, 0, 0), 1, color(33, 29, 26), CLOSE);

  plotter.drawLine( pivot, pivot.add( vec ), color(155, 65, 65) );

  for (let i = 0, maxi = points.length; i < maxi; i += 1) {
    plotter.drawPoint( points[i], 255, ( i == pivotId ) ? 15 : 10 );
  }

  cnt -= 1;

  if ( cnt <= 0 ) {
    // noLoop();
    lastPivotId = pivotId;
    pivotId = nextPivotId;
    pivot = points[ pivotId ];
    updateCounter();
  }

  arg = arg + DA;

}