(function () {

  var paper;
  // set up the DOM with a raphael div
  function raphSetUp () {
    /*:DOC += <div id="raphael"></div>
     */
    if (typeof paper === "undefined") {
      paper = Raphael('raphael', 600, 600);
    }
    this.rect = paper.rect(10, 10, 10, 10);
  }

  function raphTearDown() {
    paper.clear();
  }


  TestCase("Basic creation", {
    setUp: raphSetUp,
    tearDown: raphTearDown,

    "test without a transformation should raise error":
    function () {
      var r = this.rect;
      assertException(function() {
        s = new SymmetryGroup(r);
      });
    },

    "test should set root": function () {
      var r = this.rect;
      r['foo'] = "bar"; // note below..
      var s = new SymmetryGroup(r, function() {
        this.translate(10, 0);
      });
      // For some reason asserting equivalance between
      // r and s.root() creates an infinite loop, so...
      assertEquals("bar", s.root()['foo']);
    }
  });


  TestCase("Translation", {
    setUp: raphSetUp,
    tearDown: raphTearDown,

    "test with one transformation":
    function() {
      var r = this.rect;
      var s = new SymmetryGroup(r, function() {
        this.translate(10, 0);
      });
      assertEquals(1, s.elements().length);

      el = _.last(s.elements()); // get the last of the elements array
      assertEquals(20, el.attr()['x']); // element has moved 10
    },

    "test increment with multiple transformations":
    function () {
      var r = this.rect;
      var s = new SymmetryGroup(r, function () {
        this.translate(10,0);
      }, 3);
      assertEquals(3, s.elements().length);
      // translation should increment
      assertEquals(10, s.root().attr()['x']);
      assertEquals(20, s.elements()[0].attr()['x']);
      assertEquals(30, s.elements()[1].attr()['x']);
      assertEquals(40, s.elements()[2].attr()['x']);
    },

    "test translates all elements":
    function () {
      var r = this.rect;
      var s = new SymmetryGroup(r, function () {
        this.translate(10,0);
      }, 3);
      s.translate(10, 0);
      assertEquals(20, s.root().attr()['x']);
      assertEquals(30, s.elements()[0].attr()['x']);
      assertEquals(40, s.elements()[1].attr()['x']);
      assertEquals(50, s.elements()[2].attr()['x']);
    }
  });

  TestCase("Raphael functions", {
    setUp: raphSetUp,
    tearDown: raphTearDown,

    "test clone() clones the symmetry group": function () {
      var r = this.rect;
      var s = new SymmetryGroup(r, function () {
        this.translate(10,0);
      }, 3);
      var c = s.clone();
      assertEquals(10, c.root().attr()['x']);
      assertEquals(s.elements().length, c.elements().length);
      // move the clone 10
      c.translate(10, 0);
      assertEquals(20, c.root().attr()['x']);
      assertEquals(10, s.root().attr()['x']);
    },

    "test attr() returns the root element's attr()": function () {
      var r = this.rect;
      var s = new SymmetryGroup(r, function () {
        this.translate(10,0);
      }, 3);
      assertEquals(s.attr(), r.attr());
    },

    "test remove() removes the elements": function () {
      var r = this.rect;
      var s = new SymmetryGroup(r, function () {
        this.translate(10,0);
      }, 3);
      assertFalse(s.removed);
      s.remove();
      assert(r.removed);
      assert(s.elements()[0].removed);
      assert(s.removed);
    }
  });
    
}());


