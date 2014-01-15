"use strict";
var display = (function(){

/*
 * The content window
 */
function Content(vis, id, rect, speed, dynamic_light, closeFn, prevFn, nextFn) {
  var _me = this;
  this._vis = vis;
  this._id = id;
  this._rect = rect;
  this._speed = speed;
  this._pad      = 12; //this._rect.h * 0.015;
  this._closeD   = 20, //this._rect.h * 0.04,
  this._controlR = 10; //this._rect.h * 0.02;
  this._visible = false;

  this._contentGroup = vis.append("svg:g")
    .attr("id", id)
    .style("opacity", 0)
    .style("display", "none");

  // the background
  this._background = this._contentGroup
    .append("svg:rect")
    .attr("x", this._rect.x)
    .attr("y", this._rect.y)
    .attr("width", this._rect.w)
    .attr("height", this._rect.h);

  // the html content
  this._foreignObj = this._contentGroup.append("foreignObject")
    .attr("x", this._rect.x)
    .attr("y", this._rect.y)
    .attr("width", this._rect.w)
    .attr("height", this._rect.h)
  this.doc = this._foreignObj.append("xhtml:body")
      .attr("class", "content");
  this.doc.classed("dynamic_light", dynamic_light);

  /*
   * the close icon
   */
  this._closeIcon = this._contentGroup.append("svg:g");
  // base rect
  this._closeIcon.bg = this._closeIcon.append("svg:rect")
    .style("opacity", 0);
  // the cross lines
  this._closeIcon.line0 = this._closeIcon.append("svg:line")
    .attr("class", "cross");
  this._closeIcon.line1 = this._closeIcon
    .append("svg:line")
      .attr("class", "cross");
  this._closeIcon.line0.classed("dynamic_light", dynamic_light);
  this._closeIcon.line1.classed("dynamic_light", dynamic_light);

  // setup the close function
  var showClose = true;
  if ((typeof(closeFn)==='boolean' && closeFn==true)
      || (typeof(closeFn)==='undefined')) {
    // default
    this._closeIcon.on("click", function() {
        return _me.hideContent();
      });
  } else if (typeof(closeFn)==='function') {
    // custom
    this._closeIcon.on("click", closeFn);
  } else {
    // none
    this._closeIcon.on("click",null);
    showClose = false;
  }
  this._closeIcon.style("display", showClose ? "block" : "none");

  // the next/prev icons
  this._contentControls = this._contentGroup.append("svg:g");
  // title text
  this._label = this._contentControls.append("svg:text")
    .style("class", "header")
    .style("display", "none") // TODO: maybe remove this
    .attr("text-anchor", "middle")
    .attr("x", this._rect.x + 100)
    .attr("y", this._rect.y + 100)
    .attr("dy", ".3em");
  this._label.classed("dynamic_light", dynamic_light);
  // next/previous arrows
  var selectFn = function(fn, defaultFn) {
    if ((typeof(fn)==='boolean' && fn==true)
        || (typeof(fn)==='undefined')) {
      // default
      return defaultFn;
    } else if (typeof(fn)==='function') {
      // custom
      return fn;
    } else {
      // none
      return null;
    }
  }
  this._contentControlData = function() {
    return [ { cx    : this._rect.x + this._rect.w - 3*this._controlR - 2*this._pad
             , cy    : this._rect.y + this._controlR + this._pad
             , r     : this._controlR
             , dir   : "left"
             , click : selectFn(prevFn, _me.prev)
             }
           , { cx    : this._rect.x + this._rect.w - this._controlR - this._pad
             , cy    : this._rect.y + this._controlR + this._pad
             , r     : this._controlR
             , dir   : "right"
             , click : selectFn(nextFn, _me.next)
             }
           ];
  }

  this._arrows = this._contentControls
    .selectAll("content_arrows")
    .data(this._contentControlData()).enter()
      .append("svg:path")
        .on("click", function(d) {
          return d.click();
      })
      .attr("class", "content_arrows");
  this._arrows.classed("dynamic_light", dynamic_light);
  this.resize(rect);
}

Content.prototype._updateCloseIcon = function() {
  // background
  this._closeIcon.bg
    .attr("x", this._rect.x + this._pad/2)
    .attr("y", this._rect.y + this._pad/2)
    .attr("width",  this._closeD + this._pad)
    .attr("height", this._closeD + this._pad);
  // lines
  this._closeIcon.line0
    .attr("x1", this._rect.x + this._pad)
    .attr("y1", this._rect.y + this._pad)
    .attr("x2", this._rect.x + this._closeD + this._pad)
    .attr("y2", this._rect.y + this._closeD + this._pad);
  this._closeIcon.line1
    .attr("x1", this._rect.x + this._pad)
    .attr("y1", this._rect.y + this._closeD + this._pad)
    .attr("x2", this._rect.x + this._closeD + this._pad)
    .attr("y2", this._rect.y + this._pad);
}

Content.prototype._updateArrows = function() {
  this._arrows
    .data(this._contentControlData())
    .attr("d", function(d) {
        return arrowPath(d.cx, d.cy, d.r, d.dir);
    })
}

Content.prototype.visible = function() {
  return this._visible;
}

Content.prototype.resize = function(rect) {
  this._rect = rect;
  this._background
    .attr("x", this._rect.x)
    .attr("y", this._rect.y)
    .attr("width",  this._rect.w)
    .attr("height", this._rect.h);
  // html content
  this._foreignObj
    .attr("x", this._rect.x + this._pad)
    .attr("y", this._rect.y + this._closeD + 2*this._pad)
    .attr("width",  this._rect.w - 2*this._pad)
    .attr("height", this._rect.h - this._closeD - 3*this._pad);
  this.doc
    .style("width",  this._foreignObj.attr("width") - this._pad + "px")
    .style("height", this._foreignObj.attr("height") + "px")
  // controls
  this._updateArrows();
  this._updateCloseIcon();
}

Content.prototype.showContent = function(c, i) {
  var _me = this;
  var isObject = typeof(c) === "object";
  i = typeof(i) === 'number' ? i : 0;

  // display the content
  this._content = isObject ? c.content : c;
  this._colours = isObject ? c.colours : undefined;
  this._colours_text = isObject ? c.colours_text : undefined;
  this._currentContentID = i;
  var id = isObject ? this._content[i] : this._content;
  this._label.text(isObject ? c.label : "");
  // the content controls are only available in list mode
  this._contentControls.style("display", isObject ? "block" : "none");

  if (!!id!=false) {
    this._contentID = id;
    this._visible = true;
    _me.doc.html(d3.select("#content-"+id).html());
    _me.doc.style("display", "block").style("opacity", 1);
    _me._foreignObj.style("display", "block");
    _me._contentGroup.style("display", "block");
    _me._background.style("opacity",  1);
    if (!!_me._colours!=false)
      _me._background.style("fill", _me._colours[i]);
    if (!!_me._colours_text!=false) {
      var c = _me._colours_text[i];
      _me.doc.style("color", c);
      _me._closeIcon.line0.style("stroke", c);
      _me._closeIcon.line1.style("stroke", c);
      _me._arrows.style("fill", c);
      _me._label.style("fill", c);
    }
    _me._contentGroup.transition()
      .duration(_me._speed())
      .style("opacity", 0.95)
  }
}

Content.prototype.hideContent = function() {
  var _me = this;
  if (_me.visible()) {
    _me._visible = false;
    _me._contentGroup.transition()
      .duration(_me._speed())
      .style("opacity", 0)
      .each("end", function() {
        _me._foreignObj.style("display", "none");
        _me._contentGroup.style("display", "none");
      });
  }
}

Content.prototype.showControls = function(closeBtnVisible, arrowsVisible) {
  this._arrows.transition()
      .duration(this._speed())
      .style("opacity", arrowsVisible ? 1 : 0);
  this._label.transition()
      .duration(this._speed())
      .style("opacity", arrowsVisible ? 1 : 0);
  this._closeIcon.transition()
    .duration(this._speed())
    .style("opacity", closeBtnVisible ? 1 : 0);
}

Content.prototype.setContentID = function(i) {
  var _me = this;
  i = i % this._content.length;
  if (i < 0) {
    i = this._content.length + i;
  }
  if (this._currentContentID === i)
    return;

  this._currentContentID = i;

  // set the colour
  _me._background
    .transition().duration(_me._speed())
    .style("fill", _me._colours[i]);
  // fade out the old
  _me.doc.transition().duration(_me._speed()/2)
    .style("opacity", 0)
      .each("end", function() {
        // set the content
        var c = d3.select("#content-" + _me._content[i]).html();
        _me.doc.html(c);
        if (!!_me._colours_text!=false) {
          var c = _me._colours_text[i];
          _me.doc.style("color", c);
          _me._closeIcon.line0.style("stroke", c);
          _me._closeIcon.line1.style("stroke", c);
          _me._arrows.style("fill", c);
          _me._label.style("fill", c);
        }
        // fade in the new
        _me.doc.transition().duration(_me._speed()/2)
          .style("opacity", 1);
      });
}

Content.prototype.next = function() {
  this.setContentID(this._currentContentID + 1);
}

Content.prototype.prev = function() {
  this.setContentID(this._currentContentID - 1);
}

Content.prototype.updateColour = function(c, t) {
  this._background.style("fill", c);
  this.doc.style("color", t);
}

// return an svg path string for a triangle
var arrowPath = function(cx, cy, r, dir) {
  var ps = [];
  switch (dir) {
    case "up":
      ps = [ [cx-r, cy+r], [cx, cy-r], [cx+r, cy+r] ];
      break;
    case "down":
      ps = [ [cx-r, cy-r], [cx, cy+r], [cx+r, cy-r] ];
      break;
    case "left":
      ps = [ [cx+r, cy-r], [cx-r, cy], [cx+r, cy+r] ];
      break;
    case "right":
      ps = [ [cx-r, cy-r], [cx+r, cy], [cx-r, cy+r] ];
      break;
  }
  return "M " + ps[0][0] + " " + ps[0][1]
      + " L " + ps[1][0] + " " + ps[1][1]
      + " L " + ps[2][0] + " " + ps[2][1];
}

return {
  Content: Content,
}

})(); // end display namespace
