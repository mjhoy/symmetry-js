/**
 * symmetry.raphael.js
 *
 * Symmetry functions for Raphael
 * mjhoy | michael.john.hoy@gmail.com
 *
 * v0.1.0
 */

/*global _, Raphael */

// Object.create
// from the good parts
if (typeof Object.create !== 'function') {
  Object.create = function (o) {
    var F = function () {};
    F.prototype = o;
    return new F();
  };
}

var SYM = {};

// Helper functions
SYM.util = {};

SYM.util.degToRad = function (deg) {
  return (deg * (2 * Math.PI)) / 360;
};

SYM.util.getX = function (el) {
  return el.getBBox().x;
};

SYM.util.getY = function (el) {
  return el.getBBox().y;
};


/**
 --------------
 Extend Raphael
 --------------
 */

/**
 Raphael.el.rotateAround(deg, x, y)

 Like rotate(), but it also translates the Raphael object as if it
 had pivoted around a point (x, y). 

 If used in an iterate() callback, calculates as the n-th iteration
 of rotation around a point from the root element. That is, if this
 is the second element of an iteration that rotates around a point by 
 45 degrees, it will be equivalent to a 90 degree rotation around the
 same point from the root element.

 */
Raphael.el.rotateAround = function (degree, cx, cy) {

  var degToRad = SYM.util.degToRad,
      getX = SYM.util.getX,
      getY = SYM.util.getY,
      cos = Math.cos, 
      sin = Math.sin,
      t = degToRad(parseInt(degree, 10)),
      root, rootRotate, rootRotation, cur_x, cur_y, r_x, r_y, x1, y1,
      cx1, cy1;

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
};

// Save a copy of Raphael's translate function
if (typeof Raphael.el._oldTranslate === "undefined") {
  Raphael.el._oldTranslate = Raphael.el.translate;
}

/* 
 Raphael.el.translate

 Replaces Raphael's translate method.

 If a root property is defined (through the sym_attrs property)
 then the translation is rotated accordingly.

 e.g., if the root is rotated 90 degrees, and the translation is
 (10, 10): Imagine a line from (0, 0) to (10, 10), which is rotated
 90 degrees. Where does it now point? The rotated translation is
 (-10, 10).

 The old translation function (which is called from within this method)
 can be reached at Raphael.el._oldTranslate.
*/
Raphael.el.translate = function (x, y) {
  var degToRad = SYM.util.degToRad, 
      cos = Math.cos, sin = Math.sin, 
      root, rootRotation,
      cx, cy;

  if (this.sym_attrs && this.sym_attrs.root && this.sym_attrs.root.rotate()) {
    root = this.sym_attrs.root;
    rootRotation = degToRad(root.rotate());
    // Rotate x, y
    cx = (x * cos(rootRotation)) + (-1 * y * sin(rootRotation));
    cy = (y * cos(rootRotation)) + (x * sin(rootRotation));
    x = cx;
    y = cy;
  }
  return Raphael.el._oldTranslate.apply(this, [x, y]);
};

/*

 Raphael.el.iterate(transN, transFunc)

 [transN] -> (optional) integer number of iterations
 [transFunc] -> transformation function

 Iterate is a method called from a Raphael object, or an iteration.

 Returns a raphael-like object, of type 'iteration', which adds a 
 few iteration-specific properties, to keep track of the root element.

 ex:

   var paper = Raphael('raphael-div', 200, 200);
   var rect  = paper.rect(10, 10, 10, 10);

   // An iteration that creates two additional rectangles, each
   // translated iteratively by (10, 0).
   var r1    = rect.iterate(2, function() {
     this.translate(10, 0);
   });

*/
Raphael.el.iterate = (function () {

  var degToRad = SYM.util.degToRad,
      getX = SYM.util.getX,
      getY = SYM.util.getY;

  /*
   _set_sym_vars (private)
   set the symmetry "sym" specific properties on an object
   */
  function _set_sym_vars(el, iter) {
    if (el.sym_attrs === undefined) {
      el.sym_attrs = {};
    }
    var s = el.sym_attrs;
    s.root = iter.root;
  }

  /*
   -----------------
   Iteration methods
   -----------------
   */

  /*
   setTransform
   [n] (default 1) - number of times to apply transformation
   func            - transformation to be applied in an iteration
   */
  function setTransform(n, func) {
    var _func = func, _n = n;
    if (func === undefined && typeof n === "function") {
      _func = n;
      _n = 1;
    }
    this.transFunc = _func;
    this.transN = _n;
    this.applyTransformation();
  }

  /*
   applyTransformation
   applies the transformation function again, reseting any
   elements from a previous iteration.
  */
  function applyTransformation() {
    if (this.elements.length) {
      this.resetElements();
    }
    var that = this;
    _.times(this.transN, function() {
      var last = that.elements[that.elements.length - 1] || that.root;
      var c = last.clone();
      _set_sym_vars(c, that);
      that.transFunc.call(c);
      that.elements.push(c);
    });
  }

  /*
   resetElements
   remove all objects from the elements array
  */
  function resetElements() {
    if (this.elements.length > 0) {
      _.each(this.elements, function(el) {
        el.remove();
      });
      this.elements = [];
    }
  }

  /*
   ---------------
   Raphael methods
   ---------------

   Implementation of Raphael methods for iteration objects
   (Basically, raphael functions will be applied over a collection of
   raphael objects rather than one.)
  */
  function rotate(degree, cx, cY) {
    var _root = this.root;
    if (degree === undefined) { return _root.rotate(); }
    var current = _root.rotate();
    _root.rotate(degree, cx, cY);
    this.applyTransformation();
    return this;
  }

  function translate(dx, dy) {
    this.root.translate(dx, dy);
    this.applyTransformation();
  }

  function scale(dx, dy) {
    var out = this.root.scale(dx, dy);
    this.applyTransformation();
    return out;
  }

  function clone() {
    var _els = [];
    if (this.elements.length) {
      _els = _.map(this.elements, function(el) {
        return el.clone();
      });
    }
    var c = Raphael.el.iterate.call(this.root.clone(), this.transN, this.transFunc, _els);
    return c;
  }

  function remove() {
    _.each(this.elements, function(el) {
      el.remove();
    });
    this.root.remove();
    this.removed = true;
  }

  function attr() {
    return this.root.attr();
  }

  function getBBox() {
    return this.root.getBBox(); // TODO... actually make this right? (just used for x/y currently)
  }
  
  return function (transN, transFunc, _els) {

    var _root = this; // the calling object (a raphael element or iteration group)
    var _elements = _els || [];
    var _func, _n;

    // Interpret arguments
    if (transFunc && typeof transFunc === "function") {
      _n = transN;
      _func = transFunc;
    } else if (typeof transN === "function") {
      _n = 1;
      _func = transN;
    } else {
      throw "no transformation function given";
    }

    // Iteration object
    var obj = {
      root: _root,
      elements: _elements,
      transFunc: _func,
      transN: _n,

      applyTransformation: applyTransformation,
      setTransform: setTransform,
      resetElements: resetElements,

      iterate: Raphael.el.iterate,
      translate: translate,
      scale: scale,
      rotate: rotate,
      rotateAround: Raphael.el.rotateAround,
      clone: clone,
      remove: remove,
      attr: attr,
      getBBox: getBBox,
      removed: false, // TODO: should copy from root element?
      type: "iteration"
    };
    

    if (!obj.elements.length) {
      obj.applyTransformation();
    }
    return obj;
  };

}());
