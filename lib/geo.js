"use strict";

var geolocationFail = function() {
  console.log("Geolocation failed.");
};

var geo = (function() {
  // private
  var g = {},
      geoAvailable  = ("geolocation" in navigator),
      position      = undefined;

  // public
  g.timeout             = 3 * 1000;
  g.maximumAge          = Infinity; //1000 * 60 * 15;
  g.enableHighAccuracy  = false;

  /*
   * Get current position
   */
  g.getCurrentPosition = function(successCallback, errorCallback, forceUpdate) {
    forceUpdate = typeof forceUpdate !== 'undefined' ? forceUpdate : false;
    // Position already available
    if (position && !forceUpdate) {
      if (typeof successCallback !== 'undefined') {
        successCallback(position);
      }
      return;
    }

    if (geoAvailable) {
      console.log("Geolocation available.")
      console.log("Attempting to get position...")
      var locationTimeout = setTimeout("geolocationFail()", g.timeout);
      // Get the location of the user's browser using the
      // native geolocation service.
      //   1st argument (required): callback
      //   2nd argument (optional): error handler callback
      //   3rd argument (optional): configuration options
      navigator.geolocation.getCurrentPosition(
        function(pos) {
          clearTimeout(locationTimeout);
          // Log the position.
          console.log("Position found: "
            + pos.coords.latitude + " "
            + pos.coords.longitude);
          position = pos;
          if (typeof successCallback !== 'undefined') {
            successCallback(position);
          }
        },
        function(error){
          clearTimeout(locationTimeout);
          console.log("Something went wrong: ", error);
          if (typeof errorCallback !== 'undefined') {
            errorCallback(error);
          }
        },
        {
          timeout:            g.timeout,
          maximumAge:         g.maximumAge,
          enableHighAccuracy: g.enableHighAccuracy
        }
      ); // navigator.geolocation.getCurrentPosition
    } else {
      console.log("Geolocation NOT available");
      if (typeof errorCallback !== 'undefined') {
        errorCallback("Geolocation NOT available");
      }
    }
  };

  return g;
}());
 
/*
  // Now that we have asked for the position of the user,
  // let's watch the position to see if it updates. This
  // can happen if the user physically moves, of if more
  // accurate location information has been found (ex.
  // GPS vs. IP address).
  //
  // NOTE: This acts much like the native setInterval(),
  // invoking the given callback a number of times to
  // monitor the position. As such, it returns a "timer ID"
  // that can be used to later stop the monitoring.
  var positionTimer = navigator.geolocation.watchPosition(
    function( position ){
      var latitude  = position.coords.latitude,
          longitude = position.coords.longitude;
 
      // Log that a newer, perhaps more accurate
      // position has been found.
      console.log( "Newer Position Found" );
 
      // center on the current position
      var pos = new google.maps.LatLng(latitude, longitude);
      map.setCenter(pos);
 
    }
  );
 
  // If the position hasn't updated within 5 minutes, stop
  // monitoring the position for changes.
  setTimeout(
    function(){
      // Clear the position watcher.
      navigator.geolocation.clearWatch( positionTimer );
    },
    (1000 * 60 * 5)
  );
*/
