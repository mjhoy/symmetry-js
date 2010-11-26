var paper = Raphael('raphael', 600, 300)

var r = paper.rect(80, 80, 10, 10);



var r1 = new SymmetryGroup(r, function() {
  this.rotateAround(20,10,10);
}, 17);

var r2 = new SymmetryGroup(r1, function () {
  this.translate(50, 50);
}, 2);

