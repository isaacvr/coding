document.title = "Fourier Transform";

const MAX_DT = Math.PI * 1.98;

let btn;
let plotter;
let zoomSlider;
let showCircles;
let speedSlider;
let componentsInput;
let errorInput;

let path = [];
let dft = [];
let spectrum = [];
let drawDFT = false;
let time = 0;
let path1 = [];
let path1T = [];
let DT;

let wk;

function sendFourierData() {
  // wk.terminate();
  let tot = +componentsInput.value() - 1;
  let mid = tot >> 1;
  let minf = -mid;
  let maxf = tot - mid;
  let err = +errorInput.value();
  if ( err < 0 ) {
    alert('The error can not be a negative number');
    return;
  }
  wk.postMessage([path, minf, maxf, err]);
}

function setup() {
  // frameRate(30);
  let c = createCanvas(1500, 700);

  wk = new Worker('./dft.js');

  wk.addEventListener('message', function(e) {
    // dft = e.data[0];
    dft = [].concat(e.data);
    // console.log(dft);
    // DT = e.data[1];
    // DT = 0.1;
    path1.length = 0;
    path1T.length = 0;
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

  c.mouseReleased(sendFourierData);

  createP('Draw some path in the canvas to compute its Fourier Transform.');
  createP('&nbsp;');
  createP('Swap between FT and the spectrum, select the # of components and the error');

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

  componentsInput = createInput('40', 'number');
  componentsInput.attribute('min', 1);
  componentsInput.elt.addEventListener('keyup', (e) => {
    if ( keyCode === ENTER ) {
      sendFourierData();
    }
  }, false);

  errorInput = createInput('0.001');
  errorInput.attribute('placeholder', 'Error...');
  errorInput.elt.addEventListener('keyup', (e) => {
    if ( keyCode === ENTER ) {
      sendFourierData();
    }
  }, false);

  showCircles = createCheckbox('Show Circles', true);

  let calc = createButton('Calc');

  calc.mousePressed(sendFourierData);

  createP('Adjust the animation speed');

  DT = 0.01;
  speedSlider = createSlider(0, 0.05, DT, 0.00001);
  speedSlider.mouseMoved(() => {
    if ( mouseIsPressed ) {
      DT = speedSlider.value();
    }
  });

  speedSlider.changed(() => {
    DT = speedSlider.value();
  });

  speedSlider.elt.style.display = 'block';
  speedSlider.elt.style.width = '100%';

  createP('There is also a zoom slider (1 to 10^3 zoom factor)');
  zoomSlider = createSlider(1, 1000, 1, 0.01);
  zoomSlider.elt.style.display = 'block';
  zoomSlider.elt.style.width = '100%';

  // showCircles.mouseClicked((e) => { console.log(showCircles.checked()) });

  let center_x = width >> 0;
  let center_y = height >> 0;

  let f = 0.5;
  let x1 = -center_x * f;
  let y1 = -center_y * f;
  let x2 = center_x * (1 - f);
  let y2 = center_y * (1 - f);

  plotter = new Plotter(x1, y1, x2, y2);

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

    // console.log(dims);

    let p1 = new Complex(dims[0], dims[1]);
    let p2 = new Complex(dims[2], dims[3]);

    let w = abs(p1.re - p2.re);
    let h = abs(p1.im - p2.im);

    let f = min( width / w, height / h );

    w *= f;
    h *= f;

    c.resize(w, h);

    let mid = p1.add(p2).div(2);
    let v1 = p1.sub(mid).mul(1.3);
    let v2 = p2.sub(mid).mul(1.3);

    p1 = mid.add(v1);
    p2 = mid.add(v2);

    plotter.setLimits(p1, p2);

    sendFourierData();

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

function shouldShiftPath1() {

  let ini = path1T[0];
  let fin = path1T[ path1T.length - 1 ];
  // let tau = TAU || (Math.PI * 2);
  // let delta = ( (fin - ini) % tau + tau ) % tau;

  return fin - ini >= MAX_DT;

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
    path1T.push(time);

    // plotter.drawPath(path1, color(255, 45, 45), 4, null, null, (e) => {
    //   return e.sub(path[0]).abs() < 1e-4;
    // });
    // plotter.drawPath(path1, color(255, 45, 45), 4);
    plotter.drawColoredPath(path1, (_, pos) => {
      // let op = map(path1T[pos], 0, TAU, 255, 0);
      return color(255, 45, 45);
    }, 4);

    for (let i = 0, maxi = elps.length; i < maxi; i += 1) {
      if ( showCircles.checked() ) {
        plotter.drawEllipse(elps[i][0], elps[i][1], color(63, 190, 243, 70), 2);
      }
      plotter.drawArrow(elps[i][0], elps[i][2]);
    }

    plotter.zoom(cp, zoomSlider.value());

    while ( shouldShiftPath1() ) {
      path1.shift();
      path1T.shift();
    }
    time += DT;
    // time %= TAU;
  } else if ( dft.length > 0 ) {
    plotter.drawX();
    plotter.drawPath(spectrum, 255, 3);
  }

}

/**
 *
 * !!!!! ALERT
 *
 * There is a very strange number for the error
 *
 * 7.8563638511388824703374211
 *
 * If the error is greater than that, by just a little bit
 * then the ft goes crazy!!!!!!!
 *
 */