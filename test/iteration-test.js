(function () {

  // helper functions
  // TODO: for some reason
  // getBBox() doesn't work
  // in the tests. hmm...
  function getX(el) {
    return el.attr()['x'];
  }

  function getY(el) {
    return el.attr()['y'];
  }

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
        var s = r.iterate();
      });
    },

    "test should set root": function () {
      var r = this.rect;
      r['foo'] = "bar"; // note below..
      var s = r.iterate(function() {
        this.translate(10, 0);
      });
      // For some reason asserting equivalance between
      // r and s.root creates an infinite loop, so...
      assertEquals("bar", s.root['foo']);
    }
  });


  TestCase("Translation", {
    setUp: raphSetUp,
    tearDown: raphTearDown,

    "test with one transformation":
    function() {
      var r = this.rect;
      var s = r.iterate(function() {
        this.translate(10, 0);
      });
      assertEquals(1, s.elements.length);

      var el = _.last(s.elements); // get the last of the elements array
      assertEquals(20, getX(el)); // element has moved 10
    },

    "test increment with multiple transformations":
    function () {
      var r = this.rect;
      var s = r.iterate(3, function () {
        this.translate(10,0);
      });
      assertEquals(3, s.elements.length);
      // translation should increment
      assertEquals(10, getX(s.root));
      assertEquals(20, getX(s.elements[0]));
      assertEquals(30, getX(s.elements[1]));
      assertEquals(40, getX(s.elements[2]));
    },

    "test translates all elements":
    function () {
      var r = this.rect;
      var s = r.iterate(3, function () {
        this.translate(10,0);
      });
      s.translate(10, 0);
      assertEquals(20, getX(s.root));
      assertEquals(30, getX(s.elements[0]));
      assertEquals(40, getX(s.elements[1]));
      assertEquals(50, getX(s.elements[2]));
    }
  });

  TestCase("Scale", {
    setUp: raphSetUp,
    tearDown: raphTearDown,

    "test should scale the root":
    function () {
      var r = this.rect;
      var s = r.iterate(3, function () {
        this.translate(10,0);
      });
      s.scale(2, 2);
      assertEquals(2, s.root.scale()['x']);
      assertEquals(2, s.root.scale()['y']);
      assertEquals(2, s.scale()['y']);
      assertEquals(r.scale(), s.scale());
    }
  });

  TestCase("Raphael functions", {
    setUp: raphSetUp,
    tearDown: raphTearDown,

    "test clone() clones the iteration": function () {
      var r = this.rect;
      var s = r.iterate(3, function () {
        this.translate(10,0);
      });
      var c = s.clone();
      assertEquals("iteration", c.type);
      assertEquals(10, getX(c.root));
      assertEquals(s.elements.length, c.elements.length);
      // move the clone 10
      c.translate(10, 0);
      assertEquals(20, getX(c.root));
      assertEquals(10, getX(s.root));
    },

    "test attr() returns the root element's attr()": function () {
      var r = this.rect;
      var s = r.iterate(3, function () {
        this.translate(10,0);
      });
      assertEquals(s.attr(), r.attr());
    },

    "test remove() removes the elements": function () {
      var r = this.rect;
      var s = r.iterate(3, function () {
        this.translate(10,0);
      });
      assertFalse(s.removed);
      s.remove();
      assert(r.removed);
      assert(s.elements[0].removed);
      assert(s.removed);
    }
  });

  TestCase("Nested groups", {
    setUp: raphSetUp,
    tearDown: raphTearDown,

    "test can take an iteration as a root element":
    function () {
      var r = this.rect;
      var s = r.iterate(3, function () {
        this.translate(10,0);
      });
      s['foo'] = 'bar';
      // now create an iteration using the previous iteration
      var s1 = s.iterate(3, function () {
        this.translate(0, 10);
      });
      assertEquals(s1.root['foo'], 'bar');
      assertEquals(3, s1.elements.length);
      assertEquals("iteration", s1.elements[0].type);
    },

    "test applies nested transformations":
    function () {
      var r = this.rect;
      var s = r.iterate(3, function () {
        this.translate(10,0);
      });
      // now create an iteration using the previous iteration
      var s1 = s.iterate(3, function () {
        this.translate(0, 10);
      });
      var s1g0 = s1.root;
      var s1g1 = s1.elements[0];
      var s1g2 = s1.elements[1];
      var s1g3 = s1.elements[2];

      // assert that nested groups are transformed
      assertEquals(10, getY(s1g0));
      assertEquals(20, getY(s1g1));
      assertEquals(30, getY(s1g2));
      assertEquals(40, getY(s1g3));
    }
  });
    
}());


