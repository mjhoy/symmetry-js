(function () {

  // helper functions
  function getX(el) {
    return el.attr()['x'];
  }

  function getY(el) {
    return el.attr()['y'];
  }
  // set up the DOM with a raphael div
  function raphSetUp () {
    /*:DOC += <div id="raphael"></div>
     */
    this.paper = Raphael('raphael', 600, 600);
  }

  function raphTearDown () {
    this.paper.clear();
  }

  // helper function
  // TODO: use real method?
  function setSymAttrs(el) {
    el['sym_attrs'] = {};
  }

  TestCase("rotate", {
    setUp: raphSetUp,
    tearDown: raphTearDown,

    "test acts normally with normal raphael object":
    function () {
      var r = this.paper.rect(10, 10, 10, 10);
      r.translate(10, 10);
      assertEquals(20, getX(r));
      assertEquals(20, getY(r));
    },

    "test when root is defined, translates in reference to root rotation":
    function () {
      var r = this.paper.rect(10, 10, 10, 10);
      var root = this.paper.rect(10, 10, 10, 10);
      root.rotate(90); // set root rotation
      r.sym_attrs = {};
      r.sym_attrs['root'] = root;
      r.translate(10, 10);
      assertEquals(0, getX(r));
      assertEquals(20, getY(r));
    }
  });

  TestCase("rotateAround", {
    setUp: raphSetUp,
    tearDown: raphTearDown,

    "test is defined": function () {
      var paper = this.paper, r;
      r = paper.rect(10, 10, 10, 10);
      assertFunction(r.rotateAround);
    },

    "test changes the rotation": function () {
      var paper = this.paper, r;
      r = paper.rect(10, 10, 10, 10);
      r.rotateAround(10, 0, 0);
      assertEquals(10, r.rotate());
    },

    "test doesn't change x or y when rotation around 0,0": function () {
      var paper = this.paper, 
      r, ox, oy, nx, ny;
      r = paper.rect(10, 10, 10, 10);
      ox = getX(r);
      oy = getY(r);
      r.rotateAround(10, 0, 0);
      nx = getX(r);
      ny = getY(r);
      assertEquals(ox, nx);
      assertEquals(oy, ny);
    },

    "test sets the right x and y value": function () {
      var paper = this.paper,
      r, ox, oy, nx, ny;
      r = paper.rect(10, 10, 10, 10);
      ox = getX(r);
      oy = getY(r);
      
      // at 90deg, x is +1, y is -1 (w Raphael axis)
      r.rotateAround(90, 10, 0);
      nx = getX(r);
      ny = getY(r);
      assertEquals((ox + 10), nx);
      assertEquals((oy - 10), ny);
    },

    "test additional application should be additive": function () {
      var paper = this.paper,
      r, ox, oy, nx, ny;
      r = paper.rect(10, 10, 10, 10);
      ox = getX(r);
      oy = getY(r);
      
      // at 90deg, x is +1, y is -1 (w Raphael axis)
      r.rotateAround(90, 10, 0);

      // another 90deg rotation around new point, x is +2, y is -2 (total),
      // rotation is 180 total
      r.rotateAround(90, 10, 0);
      nx = getX(r);
      ny = getY(r);
      assertEquals(180, r.rotate());
      assertEquals((ox + 20), nx);
      assertEquals((oy - 20), ny);
    },

    "test relative to root_x and root_y symmetry properties if defined":
    function () {
      var paper = this.paper,
      root, r, ox, oy, nx, ny;
      root = paper.rect(10, 10, 10, 10);
      r = paper.rect(10, 10, 10, 10);
      ox = getX(r);
      oy = getY(r);

      setSymAttrs(r);
      r['sym_attrs']['root'] = root;

      // at 90deg, x is +1, y is -1 (w Raphael axis),
      // relative to the root
      r.rotateAround(90, 10, 0);

      // at 180deg, x is +2, y is 0 (w Raphael axis),
      // relative to the root
      r.rotateAround(90, 10, 0);
      nx = getX(r);
      ny = getY(r);
      assertEquals(180, r.rotate());
      assertEquals((ox + 20), nx);
      assertEquals(oy, ny);
    },

    "test relative to root rotation":
    function () {
      var paper = this.paper,
      root, r, ox, oy, nx, ny;
      root = paper.rect(10, 10, 10, 10);
      r = paper.rect(10, 10, 10, 10);
      ox = getX(r);
      oy = getY(r);

      setSymAttrs(r);
      r['sym_attrs']['root'] = root;

      // 90 degree rotation of root
      root.rotate(90);

      // at 90deg, x is +1, y is -1 (w Raphael axis),
      // relative to the root, BUT at rotation 90
      // x is +1, y is +1 
      r.rotateAround(90, 0, 10);

      nx = getX(r);
      ny = getY(r);
      assertEquals(90, r.rotate());
      assertEquals((ox + 10), nx);
      assertEquals((oy + 10), ny);
    },

    "test sets incremental rotation in symmetry group":
    function () {
      var paper = this.paper,
      root, r, ox, oy, nx, ny;
      root = paper.rect(10, 10, 10, 10);
      root = paper.rect(10, 10, 10, 10);
      r = symmetryGroup(root, function () {
        this.rotateAround(90, 20, 0);
      }, 3);

      assertEquals(0, r.rotate());
      assertEquals(90, r.elements()[0].rotate());
      assertEquals(180, r.elements()[1].rotate());
      assertEquals(270, r.elements()[2].rotate());
    },

    "test sets incremental rotation in nested symmetry group":
    function () {
      var paper = this.paper,
      root, r, r2, ox, oy, nx, ny;
      root = paper.rect(10, 10, 10, 10);
      root = paper.rect(10, 10, 10, 10);
      r = symmetryGroup(root, function () {
        this.rotateAround(90, 20, 0);
      }, 3);
      r2 = symmetryGroup(r, function () {
        this.rotateAround(90, 50, 0);
      }, 3);

      assertEquals(0, r2.rotate());
      assertEquals(90, r2.elements()[0].rotate());
      assertEquals(180, r2.elements()[1].rotate());
      assertEquals(270, r2.elements()[2].rotate());
    }
  });

}());
