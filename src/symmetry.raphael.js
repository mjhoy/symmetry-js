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
    _.times(_n, function() {
      var last = _elements[_elements.length - 1] || _root;
      c = last.clone();
      _func.call(c);
      _elements.push(c);
    });
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
    _.each(_elements.concat(_root), function(el) {
      el.translate(dx, dy);
    });
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

  // Set public methods
  this.setTransform = setTransform;
  this.apply = apply;
  this.root = root;

  this.translate = translate;
  this.rotate = rotate;
  this.clone = clone;
  this.remove = remove;

  // Apply the transformation if given
  if (transFunc) {
    if (transN === undefined) { transN = 1; }
    this.setTransform(transFunc, transN);
  }
};

/* Raphael extensions */
(function (Raphael) {

}(Raphael));
