Raphael.fn.comma = function (x, y) {
  return this.path("M-12.087-10.269c-1.066-7.127,6.048-13.766,12.784-13.799c8.725-0.043,19.277,8.929,17.654,24.554 C16.293,20.301-4.583,24.836-15.762,23.968c-4.356-0.963-3.009-2.939,0.319-2.646c4.763,0.276,14.935-3.807,13.854-10.487 C-2.218,6.941-10.748-1.342-12.087-10.269z").translate(x, y);
}

Raphael.fn.indian = function (x, y) {
  return this.path("M0,0v56.596h23.304L19.632,45.58H6.658L6.414,8.127l11.016,17.136c0,0,1.282-17.291,1.224-17.594 S17.184,0,17.184,0H0z").translate(x, y);
}

var start = new Date();

var paper = Raphael('raphael', 600, 600)

var r = paper.indian(0, 10).attr({fill:'black'});

var r1 = r.iterate(1, function() {
 this.scale(-1, 1);
 this.translate(23, 0);
});

var r2 = r1.iterate(1, function() {
 this.rotate(180)
 this.translate(80, -10);
});

var r3 = r2.iterate(5, function() {
 this.translate(115, 0);
});

var r4 = r3.iterate(5, function () {
  this.translate(0, 100);
});

var end = new Date();

console.log("time: " + (end - start));


//var o = paper.comma(120, 150).attr({fill:'black'})
//
//var o1 = o.iterate(2, function() {
//  this.rotateAround(45, 50, 0);
//});
//
//var o2 = o1.clone();
//o2.translate(200, 0);
//o2.scale(-1.0, 1.0);
