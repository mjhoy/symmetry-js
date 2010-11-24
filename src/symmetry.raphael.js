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

  function _apply() {
    if (_elements.length > 0) { // remove the current cloned elements
      _.each(_elements, function(el) {
        el.remove();
      });
      _elements = []
    }
    _set_sym_vars(root);
    _.times(_n, function() {
      var last = _elements[_elements.length - 1] || _root;
      c = last.clone();
      _post_clone(last);
      _set_sym_vars(c);
      _func.call(c);
      _elements.push(c);
    });
  }

  function _post_clone(el) {
    if (el !== _root) {
      post = el['sym_attrs']['post_apply'];
      cx = post['cy'] || 0;
      cy = post['cx'] || 0;
      el.translate( cx, cy);
    }
  }

  function _set_sym_vars(el) {
    el['sym_attrs'] = {};
    var s = el['sym_attrs']
    s['root_x'] = _root.attr()['x'];
    s['root_y'] = _root.attr()['y'];
    s['post_apply'] = {};
  }
  
  // -----------------
  // Raphael functions
  // -----------------

  function rotate(degree, cx, cY) {
    if (degree === undefined) { return _root.rotate(); }
    var current = _root.rotate();
    degree = parseInt(degree) + parseInt(current);
    _root.rotate(degree, cx, cY);
    _apply();
   // console.log(degree);
    //_.each(_elements.concat(_root), function(el) {
      // capture previous rotation
      //el.rotate(parseInt(degree, cx, cY);
    //});
  }

  function translate(dx, dy) {
    _root.translate(dx, dy);
    _apply();
    //_.each(_elements.concat(_root), function(el) {
    //  el.translate(dx, dy);
    //});
  }

  function clone() {
    var c = new this.constructor(_root.clone());
    c.setTransform(_func, _n);
    return c;
  }

  function remove() {
    _.each(_elements, function(el) {
      el.remove();
    });
    _root.remove();
  }
  
  function attr() {
    return _root.attr();
  }

  // Set public methods
  this.setTransform = setTransform;
  this.apply = apply;
  this.root = root;

  this.translate = translate;
  this.rotate = rotate;
  this.clone = clone;
  this.remove = remove;
  this.attr = attr;

  // Apply the transformation if given
  if (transFunc) {
    if (transN === undefined) { transN = 1; }
    this.setTransform(transFunc, transN);
  }

};

/* Raphael extensions */
(function (R) {
  function degToRad(deg) {
    return (deg * (2 * Math.PI)) / 360
  }

  // an implementation of rotate(deg, cx, cy) that uses translate
  // to allow for application of multiple rotations
  R.el.rotateAround = function(degree, cx, cy) {
    var cos = Math.cos, sin = Math.sin;
    t = degToRad(parseInt(degree) + parseInt(this.rotate()));
    x1 = ((cx * cos(t)) - (cy * sin(t))) * -1;
    y1 = ((cx * sin(t)) + (cy * cos(t))) * -1;

    this.rotate(degree);

    if (this.sym_attrs) {
      this.sym_attrs['post_apply']['cx'] = (x1 + cx);
      this.sym_attrs['post_apply']['cy'] = (y1 + cy);
    } else {
      this.translate((x1 + cx), (y1 + cy));
    }
  };
}(Raphael));