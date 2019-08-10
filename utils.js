/**
 * @author Isaac Vega Rodriguez          <isaacvega1996@gmail.com>
 *
 * Helper functions for p5.js
 */

if ( !Complex ) {
  throw new ReferenceError('This library needs Complex class to function.');
}

Point = Complex;

/// Extending Complex class
Point.prototype.angleTo = function(p) {
  let cp = new Point(p);
  let dif = cp.sub(this);
  return Math.atan2(dif.im, dif.re);
};

class Plotter {

  constructor(x1, y1, x2, y2) {

    this.EPS = 1e-4;
    this.zoomFactor = 1;
    this.zoomCenter = new Complex(0, 0);
    this.setLimits(new Complex(x1, y1), new Complex(x2, y2));

  }

  static EPS() {
    return 1e-9;
  }

  static cross(v1, v2) {
    return v1.conjugate().mul(v2).im;
  }

  static lineIntersection(pt1, pt2, PT1, PT2) {
    let v1 = pt2.sub(pt1);
    let v2 = PT2.sub(PT1);

    let D = v2.re * v1.im - v1.re * v2.im;
    let D1 = v2.re * ( PT1.im - pt1.im ) - ( PT1.re - pt1.re ) * v2.im;

    let t1 = D1 / D;

    return pt1.add( v1.mul(t1) );

  }

  static intersect(pt1, pt2, region) {

    let vec = pt2.sub(pt1);

    let res = [];

    let cant = region.length;

    for (let i = 0, j = 1; i < cant; i += 1) {

      let v1 = region[i].sub(pt1);
      let v2 = region[j].sub(pt1);

      if ( Plotter.cross(vec, v1) * Plotter.cross(vec, v2) <= 0 ) {
        let newP = Plotter.lineIntersection(region[i], region[j], pt1, pt2);
        res.push(newP);
      }

      j += 1;
      if ( j >= cant ) {
        j = 0;
      }
    }

    return res;

  }

  static rotatePolygon(path, ref, ang, degree) {
    let factor = ( degree ) ? PI / 180 : 1;
    let rotor = new Complex({
      arg: factor * ang,
      abs: 1
    });
    let p1 = path.map(e => e.sub(ref).mul(rotor).add(ref));
    return p1;
  }

  static averagePoint(path) {
    let cp = new Complex(0, 0);
    let len = path.length;
    for (let i = 0; i < len; i += 1) {
      cp = cp.add( path[i] );
    }
    return cp.div( Math.max( len, 1 ) );
  }

  setLimits(pA, pB) {
    this.p1 = pA;
    this.p2 = pB;
  }

  zoom(pt, f) {
    this.zoomCenter = pt;
    this.zoomFactor = f;
  }

  drawX() {
    if ( this.p1.im * this.p2.im <= 0 ) {
      let y0 = map(0, this.p1.im, this.p2.im, 0, height);
      line(0, y0, width, y0);
    }
  }

  drawY() {
    if ( this.p1.re * this.p2.re <= 0 ) {
      let x0 = map(0, this.p1.re, this.p2.re, 0, width);
      line(x0, 0, x0, height);
    }
  }

  drawAxes() {
    stroke(100);
    strokeWeight(2);
    this.drawX();
    this.drawY();
  }

  convertPoint(pt) {
    let newPt = pt.sub(this.zoomCenter).mul(this.zoomFactor).add(this.zoomCenter);
    let ptx = map(newPt.re, this.p1.re, this.p2.re, 0, width);
    let pty = map(newPt.im, this.p1.im, this.p2.im, 0, height);
    return new Complex(ptx, pty);
  }

  fromMouse(x, y) {
    let newX = map(x, 0, width, this.p1.re, this.p2.re);
    let newY = map(y, 0, height, this.p1.im, this.p2.im);
    let newPt = new Complex(newX, newY);
    return newPt.sub(this.zoomCenter).div(this.zoomFactor).add(this.zoomCenter);
  }

  drawPoint(pt, col, diam) {
    let newPt = this.convertPoint(pt);
    stroke(col || 255);
    strokeWeight(diam || 10);
    point(newPt.re, newPt.im);
  }

  drawVertex(pt, col, diam) {
    let newPt = this.convertPoint(pt);
    stroke(col || 255);
    strokeWeight(diam || 10);
    vertex(newPt.re, newPt.im);
  }

  drawSegment(ptA, ptB, col, str) {
    let newPta = this.convertPoint(ptA);
    let newPtb = this.convertPoint(ptB);
    let w = (str || 3);
    stroke(col || 255);
    strokeWeight(w);
    line(newPta.re, newPta.im, newPtb.re, newPtb.im);
  }

  drawLine(ptA, ptB, col, str) {
    let newPta = this.convertPoint(ptA);
    let newPtb = this.convertPoint(ptB);
    let w = (str || 3);
    stroke(col || 255);
    strokeWeight(w);
    let pts = Plotter.intersect(newPta, newPtb, [
      new Complex(0, 0),
      new Complex(0, height),
      new Complex(width, height),
      new Complex(width, 0),
    ]);
    if ( pts.length > 1 ) {
      // console.table(pts);
      line(pts[0].re, pts[0].im, pts[1].re, pts[1].im);
    }
  }

  drawEllipse(center, rad, col1, str, col2) {
    let fl = !(typeof col2 === 'undefined');
    let c = this.convertPoint(center);
    let diamP = this.convertPoint(new Complex(rad * 2, rad * 2));
    let origin = this.convertPoint(new Complex(0, 0));
    let diam = diamP.sub(origin);
    stroke(col1 || 255);
    strokeWeight(str || 2);
    if ( fl ) {
      fill(col2 || 255);
    } else {
      noFill();
    }
    ellipse(c.re, c.im, abs(diam.re), abs(diam.im));
  }

  drawPath(path, col1, str, col2, close, fn) {
    let cb = ( typeof fn === 'function' ) ? fn : ( () => false );
    let len = path.length;
    let cls = (typeof close === 'undefined' || close === null) ? close : ( close || CLOSE );

    beginShape();
    stroke(col1 || 255);
    strokeWeight(str || 3);
    if ( typeof col2 === 'undefined' || col2 === null ) {
      noFill();
    } else {
      fill(col2 || color(0, 0, 0, 0));
    }
    for (let i = 0; i < len; i += 1) {
      if ( cb(path[i], i, path) ) {
        endShape();
        beginShape();
      }
      let newp = this.convertPoint(path[i]);
      vertex(newp.re, newp.im);
    }
    endShape(cls);
  }

  drawTriangle(ptA, ptB, ptC, col1, str, col2) {
    this.drawPath([ ptA, ptB, ptC ], col1, str, col2, CLOSE);
  }

  drawArrow(cp1, cp2, col, nrm) {

    let p1 = this.convertPoint(cp1);
    let p2 = this.convertPoint(cp2);
    let isNorm = Boolean(nrm);
    let v1 = p2.sub(p1);
    let len = ( isNorm ) ? v1.abs() : 1;

    v1 = v1.div(len);

    let rotor = new Complex({
      arg: PI / 8,
      abs: 1
    });

    let pA = p2.sub( v1.mul(rotor).div(15) );
    let pB = p2.sub( v1.div(rotor).div(15) );
    let newP2 = pA.add(pB).div(2);
    let sw = pA.sub(pB).abs() / 10;

    fill(col || 255);
    stroke(col || 255);
    strokeWeight(sw);
    line(p1.re, p1.im, newP2.re, newP2.im);

    beginShape();
    strokeWeight(1);
    vertex(p2.re, p2.im);
    vertex(pA.re, pA.im);
    vertex(pB.re, pB.im);
    endShape(CLOSE);

  }

}

function svgToPath(dValue) {
  let d = dValue;

  let log = function() {
    // console.log.apply(null, arguments);
  };

  d = d.replace(/,/gm, ' '); // get rid of all commas

  for (let i = 0; i < 2; i += 1) {
    d = d.replace(/([MmZzLlHhVvCcSsQqTtAa])([^\s])/gm, '$1 $2');
  }
  d = d.replace(/([^\s])([MmZzLlHhVvCcSsQqTtAa])/gm, '$1 $2');
  d = d.replace(/([0-9])([+\-])/gm, '$1 $2');

  for (let i = 0; i < 2; i += 1) {
    d = d.replace(/(\.[0-9]*)(\.)/gm, '$1 $2');
  }
  d = d.replace(/([Aa](\s+[0-9]+){3})\s+([01])\s*([01])/gm, '$1 $3 $4 ');
  d = d.replace(/(?!\u3000)\s+/gm, ' ');
  d = d.replace(/^\s+|\s+$/g, '');

  let pp = new (function (d) {
    this.tokens = d.split(' ');

    this.reset = function () {
      this.i = -1;
      this.command = '';
      this.previousCommand = '';
      this.start = new Complex(0, 0);
      this.control = new Complex(0, 0);
      this.current = new Complex(0, 0);
      this.points = [];
      this.angles = [];
    }

    this.isEnd = function () {
      return this.i >= this.tokens.length - 1;
    }

    this.isCommandOrEnd = function () {
      return (this.isEnd()) ? true : this.tokens[this.i + 1].match(/^[A-Za-z]$/) != null;
    }

    this.isRelativeCommand = function () {
      return "mlhvcsqtaz".indexOf(this.command) > -1;
    }

    this.getToken = function () {
      return this.tokens[++this.i];
    }

    this.getScalar = function () {
      return parseFloat(this.getToken());
    }

    this.nextCommand = function () {
      this.previousCommand = this.command;
      this.command = this.getToken();
    }

    this.getPoint = function () {
      return this.makeAbsolute( new Complex(this.getScalar(), this.getScalar()) );
    }

    this.getAsControlPoint = function () {
      return this.control = this.getPoint();
    }

    this.getAsCurrentPoint = function () {
      return this.current = this.getPoint();
    }

    this.getReflectedControlPoint = function () {
      let pc = this.previousCommand.toLowerCase();
      return ( "csqt".indexOf(pc) === -1 ) ? this.current : this.current.mul(2).sub(this.control);
    }

    this.makeAbsolute = function (p) {
      return ( this.isRelativeCommand() ) ? p.add(this.current) : p;
    }

    this.addMarker = function (p, from, priorTo) {
      if (priorTo != null && this.angles.length > 0 && this.angles[this.angles.length - 1] == null) {
        this.angles[this.angles.length - 1] = this.points[this.points.length - 1].angleTo(priorTo);
      }
      this.addMarkerAngle(p, from == null ? null : from.angleTo(p));
    }

    this.addMarkerAngle = function (p, a) {
      this.points.push(p);
      this.angles.push(a);
    }

    this.getMarkerPoints = function () {
      return this.points;
    }

    this.getMarkerAngles = function () {
      for (let i = 0, maxi = this.angles.length; i < maxi; i += 1) {
        if (this.angles[i] == null) {
          for (var j = i + 1, maxj = this.angles.length; j < maxj; j += 1) {
            if (this.angles[j] != null) {
              this.angles[i] = this.angles[j];
              break;
            }
          }
        }
      }
      return this.angles;
    }
  })(d);

  pp.reset();

  let result = []
  let ref = new Complex(0, 0);
  let pow = Math.pow;
  let sqrt = Math.sqrt;
  let sin = Math.sin;
  let cos = Math.cos;
  let PI = Math.PI;

  let lineTo = function(pt) {
    log('LINE');
    const STEP = 0.1;
    let vec = pt.sub(ref);
    for (let i = 0; i < 1; i += STEP) {
      result.push( ref.add( vec.mul(i) ) );
    }
    result.push(pt);
    return pt;
  };

  let comb = function(n) {
    let mat = [1];
    for (let i = 1; i <= n; i += 1) {
      mat = mat.map((e, i, a) => (i > 0) ? a[i] + a[i-1] : e );
      mat.push(1);
    }
    return mat;
  };

  let bezierTo = function() {
    log('BEZIER');
    const STEP = 0.001;
    let cant = arguments.length;
    let pts = [];
    let c = comb(cant - 1);

    for (let i = 0; i < cant; i += 1) {
      pts.push( arguments[i] );
    }

    for (let i = 0; i < 1; i += STEP) {
      let fp = new Complex(0, 0);
      for (let j = 0; j < cant; j += 1) {
        fp = fp.add( pts[j].mul( c[j] * pow(1 - i, cant - 1 - j) * pow(i, j) ) );
      }
      result.push(fp);
    }

    return pts[ cant - 1 ];
  };

  let fmod = function(a, b) {
    return (a % b + b) % b;
  };

  let arcTo = function(cx, cy, r, a1, a2, dir) {
    log('ARC');
    // 0, 0, r, a1, a1 + ad, 1 - sweepFlag
    let center = new Complex(cx, cy);

    let aIni = fmod(a1, 2 * PI);
    let aFin = fmod(a2, 2 * PI);
    let PI2 = PI * 2;

    if ( !dir ) {
      if ( aIni > aFin ) {
        aFin += ( ~~( (aIni - aFin) / PI2 + 1 ) * PI2 );
      }
    } else {
      if ( aFin > aIni ) {
        aIni += ( ~~( (aFin - aIni) / PI2 + 1 ) * PI2 );
      }
    }

    let delta = aFin - aIni;
    const STEP = 1 / ( Math.abs(delta) * r * 2);
    let vec = new Complex({ arg: aIni, abs: r });

    for (let i = 0; i < 1; i += STEP) {
      result.push(center.add( vec.mul( new Complex({ arg: delta * i, abs: 1 }) ) ));
    }

    result.push(center.add( vec.mul( new Complex({ arg: delta, abs: 1 }) ) ));

    return result[ result.length - 1 ];

  };

  while ( !pp.isEnd() ) {
    pp.nextCommand();
    log('COMMAND: ', pp.command);
    switch ( pp.command.toLowerCase() ) {
      case 'm': {
        let p = pp.getAsCurrentPoint();
        pp.addMarker(p);
        ref = p;
        pp.start = pp.current;
        while ( !pp.isCommandOrEnd() ) {
          let p = pp.getAsCurrentPoint();
          pp.addMarker(p, pp.start);
          ref = lineTo(p);
        }
        break;
      }
      case 'l': {
        while (!pp.isCommandOrEnd()) {
          var c = pp.current;
          var p = pp.getAsCurrentPoint();
          pp.addMarker(p, c);
          ref = lineTo(p);
        }
        break;
      }
      case 'h': {
        while (!pp.isCommandOrEnd()) {
          var newP = new Complex((pp.isRelativeCommand() ? pp.current.re : 0) + pp.getScalar(), pp.current.im);
          pp.addMarker(newP, pp.current);
          pp.current = newP;
          ref = lineTo(pp.curernt);
        }
        break;
      }
      case 'v': {
        while (!pp.isCommandOrEnd()) {
          var newP = new Complex(pp.current.re, (pp.isRelativeCommand() ? pp.current.im : 0) + pp.getScalar());
          pp.addMarker(newP, pp.current);
          pp.current = newP;
          ref = lineTo(pp.current);
        }
        break;
      }
      case 'c': {
        while (!pp.isCommandOrEnd()) {
          var curr = pp.current;
          var p1 = pp.getPoint();
          var cntrl = pp.getAsControlPoint();
          var cp = pp.getAsCurrentPoint();
          pp.addMarker(cp, cntrl, p1);
          ref = bezierTo(p1, cntrl, cp);
        }
        break;
      }
      case 's': {
        while (!pp.isCommandOrEnd()) {
          var curr = pp.current;
          var p1 = pp.getReflectedControlPoint();
          var cntrl = pp.getAsControlPoint();
          var cp = pp.getAsCurrentPoint();
          pp.addMarker(cp, cntrl, p1);
          ref = bezierTo(p1, cntrl, cp);
        }
        break;
      }
      case 'q': {
        while (!pp.isCommandOrEnd()) {
          var curr = pp.current;
          var cntrl = pp.getAsControlPoint();
          var cp = pp.getAsCurrentPoint();
          pp.addMarker(cp, cntrl, cntrl);
          ref = bezierTo(cntrl, cp);
        }
        break;
      }
      case 't': {
        while (!pp.isCommandOrEnd()) {
          var curr = pp.current;
          var cntrl = pp.getReflectedControlPoint();
          pp.control = cntrl;
          var cp = pp.getAsCurrentPoint();
          pp.addMarker(cp, cntrl, cntrl);
          ref = bezierTo(cntrl, cp);
        }
        break;
      }
      case 'a': {
        while (!pp.isCommandOrEnd()) {

          var curr = pp.current;
          var rx = pp.getScalar();
          var ry = pp.getScalar();
          var xAxisRotation = pp.getScalar() * (PI / 180.0);
          var largeArcFlag = pp.getScalar();
          var sweepFlag = pp.getScalar();
          var cp = pp.getAsCurrentPoint();

          var currp = new Complex(
            cos(xAxisRotation) * (curr.re - cp.re) / 2.0 + sin(xAxisRotation) * (curr.im - cp.im) / 2.0, -sin(xAxisRotation) * (curr.re - cp.re) / 2.0 + cos(xAxisRotation) * (curr.im - cp.im) / 2.0
          );
          // adjust radii
          var l = pow(currp.re, 2) / pow(rx, 2) + pow(currp.im, 2) / pow(ry, 2);
          if (l > 1) {
            rx *= sqrt(l);
            ry *= sqrt(l);
          }
          // cx', cy'
          var s = (largeArcFlag == sweepFlag ? -1 : 1) * sqrt(
            ((pow(rx, 2) * pow(ry, 2)) - (pow(rx, 2) * pow(currp.im, 2)) - (pow(ry, 2) * pow(currp.re, 2))) /
            (pow(rx, 2) * pow(currp.im, 2) + pow(ry, 2) * pow(currp.re, 2))
          );
          if (isNaN(s)) s = 0;
          var cpp = new Complex(s * rx * currp.im / ry, s * -ry * currp.re / rx);
          // cx, cy
          var centp = new Complex(
            (curr.re + cp.re) / 2.0 + cos(xAxisRotation) * cpp.re - sin(xAxisRotation) * cpp.im,
            (curr.im + cp.im) / 2.0 + sin(xAxisRotation) * cpp.re + cos(xAxisRotation) * cpp.im
          );
          // vector magnitude
          var m = function (v) { return sqrt(pow(v[0], 2) + pow(v[1], 2)); }
          // ratio between two vectors
          var r = function (u, v) { return (u[0] * v[0] + u[1] * v[1]) / (m(u) * m(v)) }
          // angle between two vectors
          var a = function (u, v) { return (u[0] * v[1] < u[1] * v[0] ? -1 : 1) * acos(r(u, v)); }
          // initial angle
          var a1 = a([1, 0], [(currp.re - cpp.re) / rx, (currp.im - cpp.im) / ry]);
          // angle delta
          var u = [(currp.re - cpp.re) / rx, (currp.im - cpp.im) / ry];
          var v = [(-currp.re - cpp.re) / rx, (-currp.im - cpp.im) / ry];
          var ad = a(u, v);
          if (r(u, v) <= -1) ad = PI;
          if (r(u, v) >= 1) ad = 0;

          // for markers
          var dir = 1 - sweepFlag ? 1.0 : -1.0;
          var ah = a1 + dir * (ad / 2.0);
          var halfWay = new Complex(
            centp.re + rx * cos(ah),
            centp.im + ry * sin(ah)
          );
          pp.addMarkerAngle(halfWay, ah - dir * PI / 2);
          pp.addMarkerAngle(cp, ah - dir * PI);

          if ( !isNaN(a1) && !isNaN(ad) ) {
            var r = rx > ry ? rx : ry;
            var sx = rx > ry ? 1 : rx / ry;
            var sy = rx > ry ? ry / rx : 1;

            // ctx.translate(centp.re, centp.im);
            // ctx.rotate(xAxisRotation);
            // ctx.scale(sx, sy);
            arcTo(centp.re, centp.im, r, a1, a1 + ad, 1 - sweepFlag);
            // ctx.scale(1 / sx, 1 / sy);
            // ctx.rotate(-xAxisRotation);
            // ctx.translate(-centp.re, -centp.im);
          }
        }
        break;
      }
      case 'z': {
        pp.current = pp.start;
      }
    }
  }

  this.getMarkers = function () {
    var points = this.PathParser.getMarkerPoints();
    var angles = this.PathParser.getMarkerAngles();

    var markers = [];
    for (var i = 0; i < points.length; i++) {
      markers.push([points[i], angles[i]]);
    }
    return markers;
  }

  return result;

}