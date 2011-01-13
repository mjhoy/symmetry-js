/*
 * symmetry.raphael.js
 * by mjhoy, 2010
 * 
 * requires: raphael, underscore.js
 */


(function (Raphael) {

  // Object.create
  // from the good parts
  if (typeof Object.create !== 'function') {
    Object.create = function (o) {
      var F = function () {};
      F.prototype = o;
      return new F();
    };
  }

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

  // -----
  // extend Raphael

  // rotateAround(deg, x, y)
  //
  // an implementation of rotate(deg, cx, cy) that uses translate
  // to allow for additive multiple rotations
  //
  // if available, uses information in the 'sym_attrs' property
  // (added to Raphael/iteration objects) to "pivot" around a 
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

  Raphael.el.rotateAround = rotateAround;

  // r_translate(x, y)
  //
  // A replacement translation function for Raphael elements
  // if a root property is defined (through the sym_attrs property)
  // then the translation is rotated accordingly.
  //
  // e.g., if the root is rotated 90 degrees, and the translation is
  // (10, 10): Imagine a line from (0, 0) to (10, 10), which is rotated
  // 90 degrees. Where does it now point? The rotated translation is
  // (-10, 10).
  //
  // This becomes Raphael's translate() function.
  //
  // The old translation function (which is still called) can be
  // reached at _oldTranslate(x, y).
  function r_translate(x, y) {
    if (this.sym_attrs && this.sym_attrs.root && this.sym_attrs.root.rotate()) {
      var cos = Math.cos, sin = Math.sin, root = this.sym_attrs.root,
      rootRotation, cx, cy;
      rootRotation = degToRad(root.rotate());

      // Rotate x, y
      cx = (x * cos(rootRotation)) + (-1 * y * sin(rootRotation));
      cy = (y * cos(rootRotation)) + (x * sin(rootRotation));
      x = cx;
      y = cy;
    }
    return this._oldTranslate(x, y);
  }
  Raphael.el._oldTranslate = Raphael.el.translate;
  Raphael.el.translate = r_translate;


  // ------
  // the iterate method
  //
  // called on a raphael object or an iteration
  //
  // returns an iteration object, of type 'iteration',
  // which mimics (somewhat) a Raphael element.
  //
  //   [transN] -> (optional) integer number of iterations
  //   [transFunc] -> transformation function
  //
  var iterate = (function () {

    // Private functions
    function _set_sym_vars(el, iter) {
      if (el['sym_attrs'] === undefined) {
        el['sym_attrs'] = {};
      }
      var s = el['sym_attrs'];
      s['root'] = iter.root;
    }

    // ------------------------
    // Iteration methods
    // ------------------------

    // - setTransform([n], func)
    // set the transformation to be appled to the root element,
    // over n times. If no n is given, assumed to be 1.
    function setTransform(n, func) {
      var _func = func, _n = n;
      if (func === undefined && typeof n === "function") {
        _func = n;
        _n = 1;
      }
      this.transFunc = _func;
      this.transN = _n;
      this.apply();
    }

    // - apply()
    // applies the transformation function again, reseting
    // any previous iterated elements.
    function apply() {
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
      //if (this.root.type === "iteration") {
      //  this.root.apply();
      //}
    }

    // Reset the current cloned element array
    function resetElements() {
      if (this.elements.length > 0) {
        _.each(this.elements, function(el) {
          el.remove();
        });
        this.elements = [];
      }
    }

    // -----------------
    // Raphael methods
    // -----------------

    function rotate(degree, cx, cY) {
      var _root = this.root;
      if (degree === undefined) { return _root.rotate(); }
      var current = _root.rotate();
      _root.rotate(degree, cx, cY);
      this.apply();
      return this;
    }

    function translate(dx, dy) {
      this.root.translate(dx, dy);
      if (this.elements.length) {
        _.each(this.elements, function (el) {
          el.translate(dx, dy);
        });
      } else {
        this.apply();
      }
    }

    function scale(dx, dy) {
      var out = this.root.scale(dx, dy);
      this.apply();
      return out;
    }

    function clone() {
      _els = [];
      if (this.elements.length) {
        _els = _.map(this.elements, function(el) {
          return el.clone();
        });
      }
      var c = iterate.call(this.root.clone(), this.transN, this.transFunc, _els);
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
    
    return function iterate(transN, transFunc, _els) {

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

        apply: apply,
        setTransform: setTransform,
        resetElements: resetElements,

        iterate: iterate,
        translate: translate,
        scale: scale,
        rotate: rotate,
        rotateAround: rotateAround,
        clone: clone,
        remove: remove,
        attr: attr,
        getBBox: getBBox,
        removed: false, // TODO: should copy from root element?
        type: "iteration"
      };
      

      if (!obj.elements.length) {
        obj.apply();
      }
      //obj.apply();
      return obj;

    };

  }());

  Raphael.el.iterate = iterate;

}(Raphael));
