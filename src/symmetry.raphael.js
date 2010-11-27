/*
 * symmetry.raphael.js
 * by mjhoy, 2010
 * 
 * requires: raphael, underscore.js
 */


/*
 * SymmetryGroup
 * constructor function which returns an object
 * that wraps a set of raphael elements, and also
 * allows for transformations to be additively applied
 */
var SymmetryGroup = function (rootElement, transFunc, transN) {

  var _root = rootElement;
  var _elements = [];
  var _func, _n = 1;

  // ------------------------
  // Symmetry group functions
  // ------------------------

  // - setTransform(func, n)
  // set the transformation to be appled to the root element,
  // over n times.
  function setTransform(func, n) {
    if (n === undefined) { n = 1; }
    _func = func;
    _n = n;
    _apply();
  }

  function root() {
    return _root; 
  }
  
  function apply() {
    _apply();
  }

  function elements() {
    return _elements;
  }

  // Apply transformation function from the root element
  function _apply() {
    // Reset the current cloned element array
    if (_elements.length > 0) {
      _.each(_elements, function(el) {
        el.remove();
      });
      _elements = [];
    }
    _.times(_n, function() {
      var last = _elements[_elements.length - 1] || _root;
      var c = last.clone();
      _set_sym_vars(c);
      _func.call(c);
      _elements.push(c);
    });
  }

  function _post_clone(el) {
    post = el['sym_attrs']['post_apply'];
    cx = post['cy'] || 0;
    cy = post['cx'] || 0;
    el.translate( cx, cy);
    console.log(cx, cy);
  }

  function _set_sym_vars(el) {
    if (el['sym_attrs'] === undefined) {
      el['sym_attrs'] = {};
      var s = el['sym_attrs'];
      s['root_x'] = _root.attr()['x'];
      s['root_y'] = _root.attr()['y'];
      s['root'] = _root;
      s['post_apply'] = {};
    }
  }
  
  // -----------------
  // Raphael functions
  // -----------------

  function rotate(degree, cx, cY) {
    if (degree === undefined) { return _root.rotate(); }
    var current = _root.rotate();
    degree = parseInt(degree, 10) + parseInt(current, 10);
    _root.rotate(degree, cx, cY);
    _apply();
    return this;
  }

  function rotateAround(degree, cx, cy) {

  }

  function translate(dx, dy) {
    _root.translate(dx, dy);
    _apply();
  }

  function clone() {
    var c = new this.constructor(_root.clone(), _func, _n);
    return c;
  }

  function remove() {
    _.each(_elements, function(el) {
      el.remove();
    });
    _root.remove();
    this.removed = true;
  }
  
  function attr() {
    return _root.attr();
  }

  // Set public methods
  this.setTransform = setTransform;
  this.apply = apply;
  this.root = root;
  this.elements = elements;

  this.translate = translate;
  this.rotate = rotate;
  this.clone = clone;
  this.remove = remove;
  this.attr = attr;
  this.removed = false;
  this.type = "symmetrygroup";

  if (transFunc && typeof transFunc === "function") {
    if (transN === undefined) { transN = 1; }
    this.setTransform(transFunc, transN);
  } else {
    throw "no transformation function given";
  }

};

/* Raphael extensions */
(function (R) {
  function degToRad(deg) {
    return (deg * (2 * Math.PI)) / 360;
  }

  // an implementation of rotate(deg, cx, cy) that uses translate
  // to allow for application of multiple rotations
  R.el.rotateAround = function(degree, cx, cy) {
    var cos = Math.cos, sin = Math.sin,
    root, cur_x, cur_y, r_x, r_y, x1, y1, t;
    t = degToRad(parseInt(degree, 10));

    if (this.sym_attrs && this.sym_attrs.root) {
      // define cx and cy relative to root
      root = this.sym_attrs.root;
      cur_x = this.attr()['x'];
      cur_y = this.attr()['y'];
      r_x = root.attr()['x'];
      r_y = root.attr()['y'];
      cx = cx - (cur_x - r_x);
      cy = cy - (cur_y - r_y);
    }

    x1 = ((cx * cos(t)) - (cy * sin(t))) * -1;
    y1 = ((cx * sin(t)) + (cy * cos(t))) * -1;

    this.rotate(degree);

    this.translate((x1 + cx), (y1 + cy));
  };
}(Raphael));
