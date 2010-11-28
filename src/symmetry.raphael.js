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
var SymmetryGroup = (function (Raphael) {
  
  // helper function
  function degToRad(deg) {
    return (deg * (2 * Math.PI)) / 360;
  }

  // helper functions to get an element's x or y
  function getX(el) {
    return el.getBBox()['x'];
  }

  function getY(el) {
    return el.getBBox()['y'];
  }

  // an implementation of rotate(deg, cx, cy) that uses translate
  // to allow for additive multiple rotations
  //
  // if available, uses information in the 'sym_attrs' property
  // (added to Raphael/symmetry objects) to "pivot" around a 
  // root element.
  //
  // TODO: this function is a bit hard to follow as is,
  // needs cleanup.
  function rotateAround(degree, cx, cy) {
    var cos = Math.cos, sin = Math.sin,
    root, rootRotation, cur_x, cur_y, r_x, r_y, x1, y1, t,
    cx1, cy1;
    t = degToRad(parseInt(degree, 10));

    if (this.sym_attrs && this.sym_attrs.root) {
      // define cx and cy relative to root
      root = this.sym_attrs.root;
      rootRotate = root.rotate();

      // find the current x,y of this element
      cur_x = getX(this);
      cur_y = getY(this);

      // find the root x, y
      r_x = getX(root);
      r_y = getY(root);

      // if the root (pivot) element is already rotated,
      // the (cx) and (cy) parameters should be rotated along with.
      if (root.rotate()) {
        rootRotation = degToRad(root.rotate());
        cx1 = (cx * cos(rootRotation)) + (cy * sin(rootRotation));
        cy1 = (cy * cos(rootRotation)) + (cx * sin(rootRotation));
        cx = cx1;
        cy = cy1;
      }

      // get the difference
      cx = cx - (cur_x - r_x);
      cy = cy - (cur_y - r_y);

    }
    // rotation equation. given degree t, and the "pivot"
    // point of cx, cy, find the new x, y value.
    x1 = ((cx * cos(t)) - (cy * sin(t))) * -1;
    y1 = ((cx * sin(t)) + (cy * cos(t))) * -1;

    this.rotate(degree);

    this.translate((x1 + cx), (y1 + cy));
  }

  // -----
  // extend Raphael
  Raphael.el.rotateAround = rotateAround;

  // ------
  // the constructor function
  return function(rootElement, transFunc, transN) {

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
      _reset_elements();
      _.times(_n, function() {
        var last = _elements[_elements.length - 1] || _root;
        var c = last.clone();
        _set_sym_vars(c);
        _func.call(c);
        _elements.push(c);
      });
    }

    // Reset the current cloned element array
    function _reset_elements() {
      if (_elements.length > 0) {
        _.each(_elements, function(el) {
          el.remove();
        });
        _elements = [];
      }
    }

    function _set_sym_vars(el) {
      if (el['sym_attrs'] === undefined) {
        el['sym_attrs'] = {};
      }
      var s = el['sym_attrs'];
      s['root'] = _root;
    }
    
    // -----------------
    // Raphael functions
    // -----------------

    function rotate(degree, cx, cY) {
      if (degree === undefined) { return _root.rotate(); }
      var current = _root.rotate();
      _root.rotate(degree, cx, cY);
      _apply();
      return this;
    }

    function translate(dx, dy) {
      _root.translate(dx, dy);
      _apply();
    }

    function scale(dx, dy) {
      var out = _root.scale(dx, dy);
      _apply();
      return out;
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

    function getBBox() {
      return _root.getBBox(); // TODO... actually make this right? (just used for x/y currently)
    }

    // Set public methods
    this.setTransform = setTransform;
    this.apply = apply;
    this.root = root;
    this.elements = elements;

    this.translate = translate;
    this.scale = scale;
    this.rotate = rotate;
    this.rotateAround = rotateAround;
    this.clone = clone;
    this.remove = remove;
    this.attr = attr;
    this.getBBox = getBBox;
    this.removed = false;
    this.type = "symmetrygroup";

    if (transFunc && typeof transFunc === "function") {
      if (transN === undefined) { transN = 1; }
      this.setTransform(transFunc, transN);
    } else {
      throw "no transformation function given";
    }

  };

}(Raphael));
