document.title = "Discrete Fourier Transform";

let btn;
let plotter;
let zoomSlider;
let showCircles;
let speedSlider;

let path = [];
let dft = [];
let spectrum = [];
let drawDFT = false;
let time = 0;
let path1 = [];
let DT;

function setup() {
  // frameRate(30);
  let c = createCanvas(700, 700);

  let wk = new Worker('./dft.js');

  wk.addEventListener('message', function(e) {
    // dft = e.data[0];
    // console.table(dft);
    dft = [].concat(e.data[0]);
    DT = e.data[1];
    path1.length = 0;
    drawDFT = true;
    time = 0;
  }, false);

  c.mouseMoved(() => {
    if ( mouseIsPressed ) {
      plotter.zoom(new Complex(0, 0), 1);
      path.push( plotter.fromMouse(mouseX, mouseY) );
    }
  });

  c.mousePressed(() => {
    path.length = 0;
    // frameRate(60);
    drawDFT = false;
  });

  c.mouseReleased(() => {
    wk.postMessage(path);
  });

  createP('Draw some path in the canvas to compute its Fourier Transform.');
  createP('&nbsp;');
  createP('Swap between FT and the spectrum, adjust the zoom, the animation speed.');

  btn = createButton('Show Spectrum', '0');
  btn.mouseClicked(() => {
    let val = +btn.value();

    if ( val === 0 ) {
      btn.html('Show Fourier');
    } else {
      btn.html('Show Spectrum');
    }

    btn.value(1 - val);
  });

  zoomSlider = createSlider(1, 1000, 1, 0.2);

  speedSlider = createSlider(1, 60, 60, 1);
  speedSlider.mouseMoved(() => {
    if ( mouseIsPressed ) {
      frameRate( speedSlider.value() );
    }
  });

  speedSlider.changed(() => {
    frameRate( speedSlider.value() );
  });

  showCircles = createCheckbox('Show Circles', true);

  showCircles.mouseClicked((e) => { console.log(showCircles.checked()) });

  let center_x = width >> 0;
  let center_y = height >> 0;

  let f = 1 / 4;
  let x1 = -center_x * f;
  let y1 = -center_y * f;
  let x2 = center_x * (1 - f);
  let y2 = center_y * (1 - f);

  plotter = new Plotter(x1, y1, x2, y2);
  // plotter = new Plotter(0, 0, width, height);

  loadXML('twitter.svg', function(data) {
    let P = svgToPath(data.DOM.querySelector('path').getAttribute('d'));
    // path = P.map(e => new Complex(e.re * 0.1, e.im * -0.1));
    path = P;

    let dims = (function() {
      let minx = Infinity;
      let miny = Infinity;
      let maxx = -Infinity;
      let maxy = -Infinity;

      path.forEach(e => {
        minx = min(minx, e.re);
        miny = min(miny, e.im);
        maxx = max(maxx, e.re);
        maxy = max(maxy, e.im);
      });

      return [ minx, miny, maxx, maxy ];
    }());

    console.log(dims);

    let p1 = new Complex(dims[0], dims[1]);
    let p2 = new Complex(dims[2], dims[3]);

    let w = abs(p1.re - p2.re);
    let h = abs(p1.im - p2.im);

    let f = min( 1500 / w, 700 / h );

    w *= f;
    h *= f;

    c.resize(w, h);

    p1 = p1.sub( new Complex(20, 20) );
    p2 = p2.add( new Complex(20, 20) );
    plotter.setLimits(p1, p2);

    wk.postMessage(path);

  }, function() {
    console.log('ERROR', arguments);
  });

  // setTimeout(() => {
  //   c.resize(1500, height);
  // }, 3000);

  // console.log(c);

}

function isMouseInside() {
  return !(mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height);
}

function draw() {

  background(0);

  plotter.drawAxes();

  if ( btn.value() == '0' || !drawDFT ) {
    plotter.drawPath(path, color(245, 255, 25), 3);
  }

  if (!drawDFT) {
    return;
  }

  if ( btn.value() == '0' ) {

    let cp = new Complex(0, 0);

    let elps = [];

    for (let i = 0, maxi = dft.length; i < maxi; i += 1) {
      let prev = cp;
      let freq = dft[i].freq;
      let rad = dft[i].amp;
      let phase = dft[i].phase;
      cp = cp.add(new Complex({
        abs: rad,
        arg: freq * time + phase
      }));

      elps.push([prev, rad, cp]);

    }

    path1.push(cp);

    plotter.drawPath(path1, color(255, 45, 45), 4, null, null, (e) => {
      return e.sub(path[0]).abs() < 1e-4;
    });

    for (let i = 0, maxi = elps.length; i < maxi; i += 1) {
      if ( showCircles.checked() ) {
        plotter.drawEllipse(elps[i][0], elps[i][1], color(63, 190, 243, 70), 2);
      }
      plotter.drawArrow(elps[i][0], elps[i][2]);
    }

    plotter.zoom(cp, zoomSlider.value());

    if ( path1.length > path.length - 10 ) {
      path1.shift();
    }
    time += DT;
  } else if ( dft.length > 0 ) {
    plotter.drawX();
    plotter.drawPath(spectrum, 255, 3);
  }

}