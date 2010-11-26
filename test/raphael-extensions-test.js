(function () {

  // set up the DOM with a raphael div
  function raphSetUp () {
    /*:DOC += <div id="raphael"></div>
     */
    this.paper = Raphael('raphael', 600, 600);
  }

  // helper function
  // TODO: use real method?
  function setSymAttrs(el) {
    el['sym_attrs'] = {};
  }

  TestCase("rotateAround", {
    setUp: raphSetUp,

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
      ox = r.attr()['x'];
      oy = r.attr()['y'];
      r.rotateAround(10, 0, 0);
      nx = r.attr()['x'];
      ny = r.attr()['y'];
      assertEquals(ox, nx);
      assertEquals(oy, ny);
    },

    "test sets the right x and y value": function () {
      var paper = this.paper,
      r, ox, oy, nx, ny;
      r = paper.rect(10, 10, 10, 10);
      ox = r.attr()['x'];
      oy = r.attr()['y'];
      
      // at 90deg, x is +1, y is -1 (w Raphael axis)
      r.rotateAround(90, 10, 0);
      nx = r.attr()['x'];
      ny = r.attr()['y'];
      assertEquals((ox + 10), nx);
      assertEquals((oy - 10), ny);
    },

    "test additional application should be additive": function () {
      var paper = this.paper,
      r, ox, oy, nx, ny;
      r = paper.rect(10, 10, 10, 10);
      ox = r.attr()['x'];
      oy = r.attr()['y'];
      
      // at 90deg, x is +1, y is -1 (w Raphael axis)
      r.rotateAround(90, 10, 0);

      // another 90deg rotation around new point, x is +2, y is -2 (total),
      // rotation is 180 total
      r.rotateAround(90, 10, 0);
      nx = r.attr()['x'];
      ny = r.attr()['y'];
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
      ox = r.attr()['x'];
      oy = r.attr()['y'];

      setSymAttrs(r);
      r['sym_attrs']['root'] = root;

      // at 90deg, x is +1, y is -1 (w Raphael axis),
      // relative to the root
      r.rotateAround(90, 10, 0);

      // at 180deg, x is +2, y is 0 (w Raphael axis),
      // relative to the root
      r.rotateAround(90, 10, 0);
      nx = r.attr()['x'];
      ny = r.attr()['y'];
      assertEquals(180, r.rotate());
      assertEquals((ox + 20), nx);
      assertEquals(oy, ny);
    }
  });

}());
