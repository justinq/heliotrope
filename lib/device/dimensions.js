/*
 * Browser dimensions
 */
var dimensions = (function(){

  var dims = {};

  // get screen width/height:
  dims.screenWidth = function() { window.screen.width };
  dims.screenHeight = function() { return window.screen.height };

  // get screen width/height minus chrome:
  dims.availWidth = function() { return window.screen.availWidth };
  dims.availHeight = function() { return window.screen.availHeight };

  // get document width/height (with-out scrollbars):
  if (window.document.compatMode == "CSS1Compat"){ // if IE Standards Mode
    dims.documentWidth = function() { return document.body.offsetWidth };
    dims.documentHeight = function() { return document.body.offsetHeight };
  }
  else {
    dims.documentWidth = function() { return document.documentElement.offsetWidth };
    dims.documentHeight = function() { return document.documentElement.offsetHeight };
  }

  // get viewport width/height (with scrollbars):
  if (window.innerWidth != null) {
    dims.viewportWidth = function () { return window.innerWidth };
    dims.viewportHeight = function () { return window.innerHeight };
  }
  // if IE in Standards Mode
  else if (window.document.compatMode == "CSS1Compat"){
    dims.viewportWidth = function () { 
        return window.document.documentElement.clientWidth
      };
    dims.viewportHeight = function () { 
        return window.document.documentElement.clientHeight
      };
  }

  // get scrollbar offsets:
  if (window.pageXOffset != null) {
    dims.scrollXOffset = function() { return window.pageXOffset };
    dims.scrollYOffset = function() { return window.pageYOffset };
  }
  // if IE in Standards Mode
  else if (window.document.compatMode == "CSS1Compat"){
    dims.scrollXOffset = function() { return document.documentElement.scrollLeft };
    dims.scrollYOffset = function() { return document.documentElement.scrollTop };  
  }

  return dims;
}());
