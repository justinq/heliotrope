//"use strict";
var sun = (function(){

var i = 0,
    TimeOfDayEnum = {
      AM: {
        NIGHT: i++,
        TWILIGHT: {
          ASTRONOMICAL: i++,
          NAUTICAL: i++,
          CIVIL: i++,
        },
        DAY: i++,
      },
      PM: {
        DAY: i++,
        TWILIGHT: {
          CIVIL: i++,
          NAUTICAL: i++,
          ASTRONOMICAL: i++,
        },
        NIGHT: i++,
      }
    };

console.log(TimeOfDayEnum);

// TODO: need to work out DST: getTimezoneOffset

// get the Julian date from a date object
Date.prototype.getJulian = function() {
  return (this / 86400000) - (this.getTimezoneOffset()/1440) + 2440587.5;
}
// m is an angle measure in degrees
function radians(m) { return m * Math.PI / 180.0; }
// m is an angle measure in radians
function degrees(m) { return m * 180.0 / Math.PI; }
// create time string from decimal
function timeStr(t) {
  var totalMins = t*1440,
      hours   = Math.floor(totalMins/60),
      mins    = Math.floor(totalMins%60),
      seconds = Math.floor(totalMins%1 * 60);
  return (hours + ':'
      + (mins < 10 ? '0' : '') + mins + ':'
      + (seconds < 10 ? '0' : '') + seconds);
}
var timeToDecimal = function(h, m, s, ms) {
  h  = typeof h  !== 'undefined' ? h  : 0;
  m  = typeof m  !== 'undefined' ? m  : 0;
  s  = typeof s  !== 'undefined' ? s  : 0;
  ms = typeof ms !== 'undefined' ? ms : 0;
  return (h*3600 + m*60 + s + ms*0.001) / 86400.0;
}

// compare two floats
function floatCompare(a,comp,b,decimals) {
  if (!decimals) decimals = 2;
  var multiplier = Math.pow(10,decimals);
  a = Math.round(a * multiplier);
  // multiply to do integer comparison instead of floating point
  b = Math.round(b * multiplier);
  switch (comp) {
    case ">":  return (a > b);
    case ">=": return (a >= b);
    case "<":  return (a < b);
    case "<=": return (a <= b);
    case "==": return (a == b);
  }
  return null;
}

/*
 * The Sun class
 */
function Sun(date, latitude, longitude) {
  this._date      = date;
  this._latitude  = latitude;
  this._longitude = longitude;
  this.calculateTimes();
}

// Sunrise time strings
Sun.prototype.solarNoonStr = function() {
  return timeStr(this.solarNoon);
};
Sun.prototype.sunriseStr = function() {
  return timeStr(this.sunrise);
};
Sun.prototype.sunsetStr = function() {
  return timeStr(this.sunset);
};

/*
 * Date/time getter and setter
 */
Sun.prototype.date    = function() { return this._date; };
Sun.prototype.setDate = function(date) {
  // check if we need to recalculate times
  var recalculate =
       this._date.getUTCDate()     != date.getUTCDate()
    || this._date.getUTCMonth()    != date.getUTCMonth()
    || this._date.getUTCFullYear() != date.getUTCFullYear()
  this._date = date;
  if (recalculate)
    this.calculateTimes();
}
// the time as a decimal 0-1
Sun.prototype.time    = function() {
  return timeToDecimal(
      this._date.getHours(),
      this._date.getMinutes(),
      this._date.getSeconds(),
      this._date.getMilliseconds()
    );
}
Sun.prototype.setTime = function(t) {
  var total_s  = t * 86400,
      h  = Math.floor(total_s / 3600),
      m  = Math.floor(total_s % 3600 / 60),
      s  = Math.floor(total_s % 3600 % 60),
      ms = Math.floor(total_s % 1 * 1000);

  this._date.setHours(h);
  this._date.setMinutes(m);
  this._date.setSeconds(s);
  this._date.setMilliseconds(ms);
}

Sun.prototype.timeOfDay = function() {
  var t = this.time();
  if (t < this.twilight.astronomical.start)
    return TimeOfDayEnum.AM.NIGHT;
  else if (t < this.twilight.nautical.start)
    return TimeOfDayEnum.AM.TWILIGHT.ASTRONOMICAL;
  else if (t < this.twilight.civil.start)
    return TimeOfDayEnum.AM.TWILIGHT.NAUTICAL;
  else if (t < this.sunrise)
    return TimeOfDayEnum.AM.TWILIGHT.CIVIL;
  else if (t < this.solarNoon)
    return TimeOfDayEnum.AM.DAY;
  else if (t < this.sunset)
    return TimeOfDayEnum.PM.DAY;
  else if (t < this.twilight.civil.end)
    return TimeOfDayEnum.PM.TWILIGHT.CIVIL;
  else if (t < this.twilight.nautical.end)
    return TimeOfDayEnum.PM.TWILIGHT.NAUTICAL;
  else if (t < this.twilight.astronomical.end)
    return TimeOfDayEnum.PM.TWILIGHT.ASTRONOMICAL;
  return TimeOfDayEnum.PM.NIGHT;
}

/*
 * Position getter and setter
 */
Sun.prototype.position = function() {
  return {
    "latitude"  : this._latitude,
    "longitude" : this._longitude
  };
}
Sun.prototype.setPosition = function(latitude, longitude) {
  // check if we need to recalculate times
  var recalculate = (!floatCompare(this._latitude,'==',latitude) || !floatCompare(this._latitude,'==',latitude));
  this._latitude  = latitude;
  this._longitude = longitude;
  if (recalculate)
    this.calculateTimes();
}

/*
 * The solar calculations
 * TODO: twilight calculations
 */
Sun.prototype.calculateTimes = function() {
  // date
  var julianDay     = this._date.getJulian(),
      julianCentury = (julianDay - 2451545)/36525,
      // sun calculations
      geomMeanLongSun, geomMeanAnomSun, eccentEarthOrbit,
      sunEqOfCentre, sunTrueLong, sunTrueAnom, sunRadVector,
      sunAppLong, meanObliqEcliptic, obliqCorr,
      sunRtAscen, sunDeclin, varY, eqOfTime,
      // sun times
      haSunrise;
  // calculate sunrise/sunset times etc.
  with (Math) {
    geomMeanLongSun = (280.46646 + julianCentury * (36000.76983 + julianCentury * 0.0003032)) % 360; // degrees
    geomMeanAnomSun = 357.52911 + julianCentury * (35999.05029 - 0.0001537 * julianCentury); // degrees
    eccentEarthOrbit = 0.016708634 - julianCentury * (0.000042037 + 0.0000001267 * julianCentury);
    sunEqOfCentre = sin(radians(geomMeanAnomSun)) * (1.914602 - julianCentury * (0.004817+0.000014 * julianCentury)) + sin(radians(2 * geomMeanAnomSun)) * (0.019993 - 0.000101 * julianCentury) + sin(radians(3 * geomMeanAnomSun)) * 0.000289;
    sunTrueLong = geomMeanLongSun + sunEqOfCentre; // degrees
    sunTrueAnom = geomMeanAnomSun + sunEqOfCentre; // degrees
    sunRadVector = (1.000001018 * (1 - pow(eccentEarthOrbit, 2))) / (1 + eccentEarthOrbit * cos(radians(sunTrueAnom))); // AUs
    sunAppLong = sunTrueLong - 0.00569 - 0.00478*sin(radians(125.04 - 1934.136*julianCentury)); // AUs

    meanObliqEcliptic = 23 + (26 + ((21.448 - julianCentury*(46.815 + julianCentury*(0.00059 - julianCentury*0.001813))))/60)/60; // degrees
    obliqCorr = meanObliqEcliptic + 0.00256*cos(radians(125.04 - 1934.136*julianCentury)); // degrees

    sunRtAscen = 90 - /* added the 90- */ degrees(atan2(cos(radians(sunAppLong)),cos(radians(obliqCorr))*sin(radians(sunAppLong)))); // degrees
    sunDeclin = degrees(asin(sin(radians(obliqCorr))*sin(radians(sunAppLong)))); // degrees
    varY = tan(radians(obliqCorr/2))*tan(radians(obliqCorr/2));

    eqOfTime = 4*degrees(varY*sin(2*radians(geomMeanLongSun))-2*eccentEarthOrbit*sin(radians(geomMeanAnomSun))+4*eccentEarthOrbit*varY*sin(radians(geomMeanAnomSun))*cos(2*radians(geomMeanLongSun))-0.5*varY*varY*sin(4*radians(geomMeanLongSun))-1.25*eccentEarthOrbit*eccentEarthOrbit*sin(2*radians(geomMeanAnomSun))); // minutes

    // Sunrise times
    haAstronomical = degrees(acos(cos(radians(108))/(cos(radians(this._latitude))*cos(radians(sunDeclin)))-tan(radians(this._latitude))*tan(radians(sunDeclin)))); // degrees
    haNautical = degrees(acos(cos(radians(102))/(cos(radians(this._latitude))*cos(radians(sunDeclin)))-tan(radians(this._latitude))*tan(radians(sunDeclin)))); // degrees
    haCivil = degrees(acos(cos(radians(96))/(cos(radians(this._latitude))*cos(radians(sunDeclin)))-tan(radians(this._latitude))*tan(radians(sunDeclin)))); // degrees
    haSunrise = degrees(acos(cos(radians(90.833))/(cos(radians(this._latitude))*cos(radians(sunDeclin)))-tan(radians(this._latitude))*tan(radians(sunDeclin)))); // degrees

    this.solarNoon = (720-4*this._longitude-eqOfTime+this._date.getTimezoneOffset())/1440; // LST
    this.sunrise   = (this.solarNoon*1440-haSunrise*4)/1440; // LST
    this.sunset    = (this.solarNoon*1440+haSunrise*4)/1440; // LST
    // TODO: twilight times (and remove noon/rise/set override
    // add timezone offset +/- 1 hour for BST
    // currently just from http://www.spectralcalc.com/solar_calculator/solar_position.php
    this.twilight = {}
    this.twilight['astronomical'] = {
        'start' : (this.solarNoon*1440-haAstronomical*4)/1440, // LST
        'end'   : (this.solarNoon*1440+haAstronomical*4)/1440, // LST
      };
    this.twilight['nautical'] = {
        'start' : (this.solarNoon*1440-haNautical*4)/1440, // LST
        'end'   : (this.solarNoon*1440+haNautical*4)/1440, // LST
      };
    this.twilight['civil'] = {
        'start' : (this.solarNoon*1440-haCivil*4)/1440, // LST
        'end'   : (this.solarNoon*1440+haCivil*4)/1440, // LST
      };
  }
};

return {
  TimeOfDayEnum: TimeOfDayEnum,
  Sun: Sun,
  timeStr: timeStr
}

})(); // end sun namespace
