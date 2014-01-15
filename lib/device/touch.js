// To be called when there's a move event on the body itself:
var BlockMove = function (event) {
  event.preventDefault(); // Tell Safari not to move the window.
};

/*
 * Check for touch-enabled browser
 */
var is_touch_device = (function(){
    try {
        document.createEvent("TouchEvent");
        return true;
    } catch (e) {
        return false;
    }
}());
