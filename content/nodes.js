"use strict";

var science = [ "science-evolving_through_the_seasons"
              , "science-light_and_health"
              , "science-seasonal_highs_and_lows"
              , "science-winter_blues_and_black_dogs"
              , "science-winter_cycles_of_gloom"
              , "science-seeing_the_light"
              ];

var fiction = [ "fiction-survival_dog"
              , "fiction-strip-light_dog"
              , "fiction-your_dog"
              , "fiction-domestic_dog"
              , "fiction-duvet_dog"
              , "fiction-dog_departed"
              ];

var e = sun.TimeOfDayEnum;
var TimeOfDayToContentMapping = {}
TimeOfDayToContentMapping[e.AM.NIGHT] = 0
TimeOfDayToContentMapping[e.AM.TWILIGHT.ASTRONOMICAL] = 1;
TimeOfDayToContentMapping[e.AM.TWILIGHT.NAUTICAL] = 1;
TimeOfDayToContentMapping[e.AM.TWILIGHT.CIVIL] = 1;
TimeOfDayToContentMapping[e.AM.DAY] = 2;
TimeOfDayToContentMapping[e.PM.DAY] = 3;
TimeOfDayToContentMapping[e.PM.TWILIGHT.CIVIL] = 4;
TimeOfDayToContentMapping[e.PM.TWILIGHT.NAUTICAL] = 4;
TimeOfDayToContentMapping[e.PM.TWILIGHT.ASTRONOMICAL] = 4;
TimeOfDayToContentMapping[e.PM.NIGHT] = 5;

/*
 * The data for the nodes
 *   Mostly self-explanatory.  Some quirks:
 *     title: breaks on spaces, replace spaces with _
 *            if you don't want this.
 */
var nodeData = [
  { "id"            : "home"
  , "has_content"   : false
  , "image"         : { "filename" : "images/logo_rgb.svg"
                      , "root"     : "logo"
                      }
  , "r"             : 16 // quartz crystal
  , "fixed"         : true
  , "pos"           : { "x" : 0.5, "y" : 0.5 } // relative
  , "colour"        : "rgb(255, 255, 255)"
  , "stroke_width"  : 0
  },
  { "id"            : "about"
  , "has_content"   : true
  , "title"         : "About"
  , "r"             : 12.75
  , "colour_offset" : 0.1
  , "stroke_width"  : 0
  },
  { "id"            : "gallery"
  , "has_content"   : true
  , "title"         : "Gallery"
  , "r"             : 9
  , "colour_offset" : 0.1
  , "stroke_width"  : 0
  },
  { "id"            : "tickets"
  , "has_content"   : true
  , "title"         : "Tickets"
  , "r"             : 7.25
  , "colour_offset" : 0.2
  , "stroke_width"  : 0
  },
  { "id"            : "process"
  , "has_content"   : true
  , "title"         : "Process"
  , "r"             : 7
  , "colour_offset" : 0.1
  , "stroke_width"  : 0
  },
  { "id"            : "writing"
  , "has_content"   : true
  , "title"         : "Writing"
  , "pages"         : [ { "label"   : "Science"
                        , "content" : science
                        }
                      , { "label"   : "Fiction"
                        , "content" : fiction
                        }
                      ]
  , "r"             : 7
  , "colour_offset" : 0.1
  , "stroke_width"  : 0
  },
  { "id"            : "audio"
  , "has_content"   : true
  , "title"         : "Audio"
  , "r"             : 6.5
  , "colour_offset" : 0.1
  , "stroke_width"  : 0
  },
  { "id"            : "digital"
  , "has_content"   : true
  , "title"         : "Digital"
  , "r"             : 5.75
  , "colour_offset" : 0.1
  , "stroke_width"  : 0
  },
  { "id"            : "light"
  , "has_content"   : true
  , "title"         : "Light"
  , "r"             : 5
  , "colour_offset" : 0.1
  , "stroke_width"  : 0
  },
  { "id"            : "credits"
  , "has_content"   : true
  , "title"         : "Credits"
  , "r"             : 5
  , "colour_offset" : 0.1
  , "stroke_width"  : 0
  },
  { "id"            : "links"
  , "has_content"   : true
  , "title"         : "Links"
  , "r"             : 4.5
  , "colour_offset" : 0.1
  , "stroke_width"  : 0
  },
  { "id"            : "press"
  , "has_content"   : true
  , "title"         : "Press"
  , "r"             : 4.0 // This should be 3.5, but it's too small for the title
  , "colour_offset" : 0.1
  , "stroke_width"  : 0
  },
  { "id"            : ""
  , "has_content"   : false
  , "title"         : ""
  , "r"             : 2.5
  , "colour_offset" : 0.1
  , "stroke_width"  : 0
  }
].map(Object);
