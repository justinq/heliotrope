/*
 * A multi-item scale
 *   with interpolation between set points
 */
"use strict";
var scale = (function(){
  var Scale = function(points) {
    this._points = points;
    this._interpolators = new Array();
    this._min =  99999;
    this._max = -99999;
    for (var i = 1; i < points.length; i++) {
      var x0 = points[i - 1],
          x1 = points[i],
          min = x0[0],
          max = x1[0],
          interpolator = d3.interpolate(x0[1], x1[1]);
      this._interpolators.push({
        'min'   : min,
        'max'   : max,
        'range' : max - min,
        'interpolator' : interpolator
      })
      if (min < this._min)
        this._min = min;
      if (max > this._max)
        this._max = max;
    }
  }

  // Get the colour for this point
  Scale.prototype.valueAtPoint = function(p) {
    if (p < this._min) p = this._min;
    if (p > this._max) p = this._max;
    var c = null;
    for (var i = 0; i < this._interpolators.length; i++) {
      c = this._interpolators[i];
      if (p >= c.min && p <= c.max)
        break;
    }
    return c.interpolator((p - c.min)/c.range);
  };

  return {
    Scale: Scale
  };

})(); // end scale namespace
