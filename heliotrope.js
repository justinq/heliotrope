"use strict";
var heliotrope = (function(){
// default location, Glasgow Botanic gardens.
var defaultLatitude  =  55.878864,
    defaultLongitude = -4.288244,
    mySun = new sun.Sun(new Date(), defaultLatitude, defaultLongitude),
    daytimes = 
      [ 0.0 // Midnight
      , mySun.twilight.astronomical.start
      , mySun.twilight.nautical.start
      , mySun.twilight.civil.start
      , mySun.sunrise
      , mySun.solarNoon
      , mySun.sunset
      , mySun.twilight.civil.end
      , mySun.twilight.nautical.end
      , mySun.twilight.astronomical.end
      , 1.0 // Midnight
      ],
    colours = [ d3.rgb(0, 0, 0)
              , d3.rgb(52, 43,128)
              , d3.rgb(92, 66,125)
              , d3.rgb(136, 96,118)
              , d3.rgb(228, 169, 72)
              , d3.rgb(247, 233, 50)
              ],
    colours_text = [ d3.rgb(0, 199, 255)
                   , d3.rgb(151, 124, 187)
                   , d3.rgb(228, 169, 72)
                   , d3.rgb(228, 169, 72)
                   , d3.rgb(247, 233, 50)
                   , d3.rgb(52, 43, 128)
                   ],
    bgColourScale = new scale.Scale(
      [ [daytimes[0],  colours[0]]
      , [daytimes[1],  colours[1]]
      , [daytimes[2],  colours[2]]
      , [daytimes[3],  colours[3]]
      , [daytimes[4],  colours[4]]
      , [daytimes[5],  colours[5]]
      , [daytimes[6],  colours[4]]
      , [daytimes[7],  colours[3]]
      , [daytimes[8],  colours[2]]
      , [daytimes[9],  colours[1]]
      , [daytimes[10], colours[0]]
      ]),
    textColourScale = new scale.Scale(
      [ [daytimes[0],  colours_text[0]]
      , [daytimes[1],  colours_text[1]]
      , [daytimes[2],  colours_text[2]]
      , [daytimes[3],  colours_text[3]]
      , [daytimes[4],  colours_text[4]]
      , [daytimes[5],  d3.rgb(255, 255, 255)]
      , [daytimes[6],  colours_text[4]]
      , [daytimes[7],  colours_text[3]]
      , [daytimes[8],  colours_text[2]]
      , [daytimes[9],  colours_text[1]]
      , [daytimes[10], colours_text[0]]
      ]),
    textColourScaleRollover = new scale.Scale(
      [ [daytimes[0],  colours_text[0].brighter(3)]
      , [daytimes[1],  colours_text[1].brighter(3)]
      , [daytimes[2],  colours_text[2].brighter(3)]
      , [daytimes[3],  colours_text[3].brighter(3)]
      , [daytimes[4],  colours_text[4].brighter(3)]
      , [daytimes[5],  colours_text[5]]
      , [daytimes[6],  colours_text[4].brighter(3)]
      , [daytimes[7],  colours_text[3].brighter(3)]
      , [daytimes[8],  colours_text[2].brighter(3)]
      , [daytimes[9],  colours_text[1].brighter(3)]
      , [daytimes[10], colours_text[0].brighter(3)]
      ]),
    sunColourScale = new scale.Scale(
      [ [daytimes[0], d3.rgb(52, 43, 128)]
      , [daytimes[1], d3.rgb(92, 66, 125)]
      , [daytimes[2], d3.rgb(255, 255, 255)]
      , [daytimes[3], d3.rgb(255, 255, 255)]
      , [daytimes[4], d3.rgb(255, 255, 255)]
      , [daytimes[5], d3.rgb(255, 255, 255)]
      , [daytimes[6], d3.rgb(255, 255, 255)]
      , [daytimes[7], d3.rgb(255, 255, 255)]
      , [daytimes[8], d3.rgb(255, 255, 255)]
      , [daytimes[9], d3.rgb(92, 66, 125)]
      , [daytimes[10], d3.rgb(52, 43, 128)]
      ]),
    floatScale = new scale.Scale(
      [ [daytimes[0],  0]
      , [daytimes[1],  52/255]
      , [daytimes[2],  92/255]
      , [daytimes[3],  136/255]
      , [daytimes[4],  228/255]
      , [daytimes[5],  247/255]
      , [daytimes[6],  228/255]
      , [daytimes[7],  136/255]
      , [daytimes[8],  92/255]
      , [daytimes[9],  52/255]
      , [daytimes[10], 0]
      ]);

var scalingFactor = 7.5;
var speed = function() {
  return (1-floatScale.valueAtPoint(mySun.time())) * 1000;
};

console.log("astronomical start", sun.timeStr(mySun.twilight.astronomical.start));
console.log("nautical start", sun.timeStr(mySun.twilight.nautical.start));
console.log("civil start", sun.timeStr(mySun.twilight.civil.start));
console.log("sunrise", sun.timeStr(mySun.sunrise));
console.log("solarNoon", sun.timeStr(mySun.solarNoon));
console.log("sunset", sun.timeStr(mySun.sunset));
console.log("civil end", sun.timeStr(mySun.twilight.civil.end));
console.log("nautical end", sun.timeStr(mySun.twilight.nautical.end));
console.log("astronomical end", sun.timeStr(mySun.twilight.astronomical.end));

// prevent annoying scrollbars
document.documentElement.style.overflow = 'hidden'; // firefox, chrome
document.body.scroll = "no"; // ie only

var w = dimensions.viewportWidth(),
    h = dimensions.viewportHeight(),
    centre = {
        'x' : w / 2,
        'y' : h / 2,
      },
    vis = d3.select("body").append("svg:svg")
            .attr("width",  w)
            .attr("height", h);

/*
 * the sun svg
 */
var sun_radius = w > h ? w : h;
var sunSVG = Object;
sunSVG.gradient = vis.append("svg:defs")
  .append("svg:radialGradient")
    .attr("id", "sun_gradient")
    .attr("cx", "50%")
    .attr("cy", "50%")
    //.attr("fx", "5%")
    //.attr("fy", "5%")
    .attr("r",  "50%")
    .attr("spreadMethod", "pad");
sunSVG.inner = sunSVG.gradient.append("svg:stop")
  .attr("offset", "0%")
  .attr("stop-color", "#ffffff")
  .attr("stop-opacity", 1);
sunSVG.mid = sunSVG.gradient.append("svg:stop")
  .attr("offset", "10%")
  .attr("stop-color", "#ffffff")
  .attr("stop-opacity", 1);
sunSVG.outer = sunSVG.gradient.append("svg:stop")
  .attr("offset", "100%")
  .attr("stop-color", "#ffffff")
  .attr("stop-opacity", 1);
sunSVG.rect = vis.append("svg:rect")
  .attr("width", sun_radius)
  .attr("height", sun_radius)
  .style("fill", "url(#sun_gradient)");

/*
 * The nodes
 */
var f = floatScale.valueAtPoint(mySun.time()),
    force = d3.layout.force()
              .nodes(nodeData)
              //.links([])
              //.linkDistance(30)
              .size([w, h])
              .friction([0.4 + (f/2)])
              .charge([-2000]) // -ve for node repulsion
              .start();

// Append node group, background circle, [image|title]
var nodeGroups = vis.selectAll("circle.node")
  .data(nodeData).enter()
  .append("svg:g")
    .attr("class", "node")
    .attr("id", function(d) { return "node_"+d.id; })
    .attr("transform", function(d) {
      return "translate("+d.x+","+d.y+")";
    })
    .on("mouseover", function(d, i) {
        if (!('colour' in d)) {
          var n = vis.select("#node_"+d.id),
              t = mySun.time(),
              dt = mySun.solarNoon - t, // the time to solar noon
              ct = t + dt*d.colour_offset*2.5,
              cBg = bgColourScale.valueAtPoint(ct),
              cTxt = textColourScaleRollover.valueAtPoint(ct);

          n.selectAll(".node_background")
            .transition().duration(speed())
              .style("fill",   cBg)

          n.selectAll(".header")
            .transition().duration(speed())
              .style("fill",   cTxt)
              .style("stroke", cTxt)
              .style("color",  cTxt);
        }
    })
    .on("mouseout", function(d, i) {
        if (!('colour' in d)) {
          var n = vis.select("#node_"+d.id),
              t = mySun.time(),
              dt = mySun.solarNoon - t, // the time to solar noon
              ct = t + dt*d.colour_offset,
              cBg = bgColourScale.valueAtPoint(ct),
              cTxt = textColourScale.valueAtPoint(ct);

          n.selectAll(".node_background")
            .transition().duration(speed())
              .style("fill",   cBg)

          n.selectAll(".header")
            .transition().duration(speed())
              .style("fill",   cTxt)
              .style("stroke", cTxt)
              .style("color",  cTxt);
        }
    })
    .on("click", function(d, i) {
      /*
       * show the content
       */
      hideContent();
      if ('pages' in d) {
        var pid = 0;
        switch(d.pages.length) {
          case 1:
            var p = d.pages[0];
            p['colours'] = colours;
            p['colours_text'] = colours_text;
            contentWindows.main.showContent(p, pid);
            break;
          case 2:
            var p0 = d.pages[0],
                p1 = d.pages[1];
            p0['colours'] = colours;
            p0['colours_text'] = colours_text;
            p1['colours'] = colours;
            p1['colours_text'] = colours_text;
            // left window closes both
            contentWindows.left.showContent(p0, pid, function() {
              contentWindows.left.hideContent();
              contentWindows.right.hideContent();
            });
            contentWindows.right.showContent(p1, pid, false);
            break;
          default:
            console.log("ERROR: incorrect number of pages");
        }
      } else if ('has_content' in d && d.has_content) {
        contentWindows.main.showContent(d.id);
      }
    });
    //.call(force.drag)

nodeGroups.append("svg:circle")
  .attr("class", "node_background")
  .attr("r",  function(d) {
    d.r_scaled = d.r*scalingFactor;
    return d.r_scaled;
  })

/*
 * load each node's components
 */
nodeData.forEach(function(d, i) {
  var n = d3.select("#node_"+d.id);
  /*
   * background image
   */
  if ("image" in d) {
    var filename,
        radius = d.r*scalingFactor;
    if (typeof(d.image) == "string") filename = d.image;
    else if ("filename" in d.image)  filename = d.image.filename;

    if (filename) {
      // check the type of image (SVG is handled differently)
      var ext = filename.split('.').pop().toLowerCase();
      if (ext == "svg") {
        d3.xml(filename, "image/svg+xml", function (xml) {
          var importedNode = document.importNode(xml.getElementById('logo'), true);
          d3.select(importedNode)
            .attr("class", "colour" in d ? "" : "dynamic_light")
            .attr("width", 20)
            .attr("transform",
              // TODO: calculate correct scale and position
              "translate("+(-radius-22)+","+(-radius-22)+")" +
              "scale(2)" + 
              ""
            );
          n.node().appendChild(importedNode);
        });
      }
      else {
        n.append("image")
          .attr("xlink:href", filename)
          .attr("x", -radius).attr("y", -radius)
          .attr("width", 2*radius).attr("height", 2*radius)
      }
    }
  }

  /*
   * title text
   */
  if ("title" in d) {
    // separate the words into lines
    var words = d.title.split(" ");
    var textNode = n.append("svg:text")
      .attr("class", "header dynamic_light")
      .attr("text-anchor", "middle")
      .attr("dy", ".3em")
      .style("fill", "none");
    textNode.selectAll("tspan")
      .data(words).enter()
      .append("svg:tspan")
        .attr("x", 0)
        .attr("y", function(d, i) {
          return -(words.length-1)/2 + i*(1.5) + "em";
        })
        .text(function(d, i) {
          return d.replace(/_/g, " ").toUpperCase();
        });
  }
});

/*
 * the content windows
 */
var contentDimensions = function(w, h) {
  var cX = w * 0.1,
      cY = h * 0.1,
      cW = w - (2 * cX),
      cH = h - cY - (h * 0.15),
      cSplit = cW * 0.01,
      portrait = cH > cW; // screen is portrait/landscape
  return { "isPortrait" : portrait
         , "main"  : { "x" : cX, "y" : cY, "w": cW, "h" : cH }
         , "left"  : { "x" : cX
                     , "y" : cY
                     , "w" : portrait ? cW : cW/2 - cSplit
                     , "h" : portrait ? cH/2 - cSplit : cH
                     }
         , "right" : { "x" : portrait ? cX : cX + cW/2 + cSplit
                     , "y" : portrait ? cY + cH/2 + cSplit : cY
                     , "w" : portrait ? cW : cW/2 - cSplit
                     , "h" : portrait ? cH/2 - cSplit : cH
                     }
         };
}

var hideContent = function() {
  for (var cw in contentWindows) {
    contentWindows[cw].hideContent();
  }
}

var contentPrev = function() {
  contentWindows.left.prev();
  contentWindows.right.prev();
}

var contentNext = function() {
  contentWindows.left.next();
  contentWindows.right.next();
}

var d = contentDimensions(w, h);
var contentWindows =
  { "main"  : new display.Content(vis, 'window-main', d.main, speed, true)
  , "left"  : new display.Content(vis, 'window-left', d.left, speed, false, hideContent, contentPrev, contentNext)
  , "right" : new display.Content(vis, 'window-right', d.right, speed, false, false, contentPrev, contentNext)
  };
contentWindows.left.showControls(true, d.isPortrait);
contentWindows.right.showControls(false, !d.isPortrait);

/*
 * Update the time dependent visuals
 */
function updateTime() {
  mySun.setDate(new Date());
  var t = mySun.time(),
      dt = (mySun.solarNoon - t), // the time to solar noon
      bgColour = bgColourScale.valueAtPoint(t),
      textColour = textColourScale.valueAtPoint(t),
      f = floatScale.valueAtPoint(t);

  // the debug timer
  d3.select("#currentTime").text(sun.timeStr(t));

  // the background
  d3.select("body").style("background-color", bgColour);

  // The sun
  sunSVG.gradient
    .attr("cx", t)
    .attr("r",  f*0.65);
  var sunColour = sunColourScale.valueAtPoint(t);
  sunSVG.inner.attr("stop-color", d3.rgb(sunColour).brighter());
  sunSVG.mid.attr("stop-color",   sunColour);
  sunSVG.outer.attr("stop-color", bgColour);

  /*
   * the nodes
   */
  // background
  vis.selectAll(".node_background")
     .style("fill", function(d) {
       if ("colour" in d) { return d.colour; }
       else if (d.colour_offset) {
         return bgColourScale.valueAtPoint(t + dt*d.colour_offset);
       }
       return bgColour;
     });

  // the dynamic_light class
  var update_light = function(d) {
    if (d) {
      if ("text_colour" in d)
        return d.text_colour;
      else if ("colour_offset" in d)
        return textColourScale
          .valueAtPoint(t + dt*d.colour_offset);
    }
    return textColour;
  };
  vis.selectAll(".dynamic_light")
    .style("fill",   function(d) { return update_light(d); })
    .style("stroke", function(d) { return update_light(d); })
    .style("color",  function(d) { return update_light(d); });

  // links
  d3.selectAll("a")
    .style("color", d3.rgb(textColour).brighter(1));

  // content
  contentWindows.main.updateColour(
      bgColourScale.valueAtPoint(t + dt*0.1),
      textColourScale.valueAtPoint(t + dt*0.1)
    );
}

function updateLocation(latitude, longitude) {
  // Update the location
  var url = "http://www.openstreetmap.org/?"
              + "lat=" + latitude
              + "&long=" + longitude
              + "&zoom=18"
              + "&layers=M";
  d3.select("#currentLocation").html(
      "<a href='" + encodeURI(url) + "' target='_blank'>"
        + "lat = " + latitude + ", long = " + longitude
      + "</a>"
    );
  mySun.setPosition(latitude, longitude);
}

function locationFound(pos) {
  d3.select("#locationMsg").text("Location:");
  updateLocation(pos.coords.latitude, pos.coords.longitude);
}

function locationError(error) {
  console.log("Error getting location, using default.");
  d3.select("#locationMsg").text("Default location:");
  updateLocation(defaultLatitude, defaultLongitude);
}

/*
 * start the visualisation
 */
addEvent(window, 'load', function(event) {
  /* more code to run on page load */
  // TODO: add this geolocation back in
  geo.getCurrentPosition(locationFound, locationError);

  updateTime();
  var updateIntervalId = setInterval(updateTime, 300000); // 5mins

  // turn on the forces
  force.on("tick", function(e) {
    nodeData.forEach(function(d, i) {
      // make sure fixed nodes don't move
      if (d.fixed == true) {
        d.x = w * d.pos.x;
        d.y = h * d.pos.y;
      } else {
        // push nodes from the edges 
        if (d.x < 0 + d.r_scaled) d.x = d.r_scaled;
        if (d.x > w - d.r_scaled) d.x = w - d.r_scaled;
        if (d.y < 0 + d.r_scaled) d.y = d.r_scaled;
        if (d.y > h - d.r_scaled) d.y = h - d.r_scaled;
        //d.x += d.x < centre.x ? 1 : -1;
        //d.y += d.y < centre.y ? 1 : -1;
      }
    });
    // move the node groups
    nodeGroups.attr("transform", function(d) {
      return "translate("+d.x+","+d.y+")";
    })
  });

  // fade in the vis
  d3.select("body")
    .style("display", "block")
     .transition()
       .duration(speed()*4)
       .style("opacity", 1);
});

/*
 * resize the window
 */
addEvent(window, 'resize', function(event) {
  w = dimensions.viewportWidth();
  h = dimensions.viewportHeight();
  centre = { 'x' : w / 2, 'y' : h / 2 };
  vis.attr("width",  w).attr("height", h);
  // update the sun
  sun_radius = w > h ? w : h;
  sunSVG.rect
    .attr("width", sun_radius)
    .attr("height", sun_radius)
  // move the nodes
  force.resume();
  // the content windows
  var d = contentDimensions(w, h);
  contentWindows.main.resize(d.main);
  contentWindows.left.resize(d.left);
  contentWindows.left.showControls(true, d.isPortrait);
  contentWindows.right.resize(d.right);
  contentWindows.right.showControls(true, !d.isPortrait);
});

return {
  mySun: mySun,
  updateTime: updateTime
}

})(); // end heliotrope namespace
