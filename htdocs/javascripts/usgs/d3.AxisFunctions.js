/**
 * Namespace: d3_AxisFunctions
 *
 * d3_AxisFunctions is a JavaScript library to provide a set of functions to build
 *  axes and labelling for well construction and lithology applications in svg format.
 *
 * version 3.07
 * December 22, 2024
*/

/*
###############################################################################
# Copyright (c) Oregon Water Science Center
# 
# Permission is hereby granted, free of charge, to any person obtaining a
# copy of this software and associated documentation files (the "Software"),
# to deal in the Software without restriction, including without limitation
# the rights to use, copy, modify, merge, publish, distribute, sublicense,
# and/or sell copies of the Software, and to permit persons to whom the
# Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included
# in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
# OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
# THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
# FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
# DEALINGS IN THE SOFTWARE.
###############################################################################
*/

// Tooltip
//
function addToolTip()
  { 
   myLogger.debug("addToolTip");
  
   // Add tooltip
   //
   var tooltip = d3.select("body")
                   .append("div")
                   .attr("class", "toolTip");

   return tooltip;
  }

// Add USGS logo
//
function USGS_logo(svgContainer, message, svg_width, svg_height, angle) {

    var myUsgs = svgContainer.append("g")
        .append("text")
        .attr("id", "myLogo")
        .attr("transform", `translate( ${svg_width * 0.5},  ${svg_height * 0.5}) rotate(${angle})`)
        .style("text-anchor", "middle")
        .style("font-family", "sans-serif")
        .style("font-size", "4rem")
        .style("font-weight", "700")
        .style("opacity", 0.2)
        .style("fill", 'black')
        .text(message);

    return myUsgs;
  }

// No log or no information
//
function noLog(svgContainer, message, x_box_min, x_box_max, y_box_min, y_box_max) {
    myLogger.debug("noLog");

    // No log label
    //
    var  label      = "translate("
    label          += [( x_box_max + x_box_min ) * 0.5, + (y_box_max + y_box_min ) * 0.5].join(", ");
    label          += ") rotate(-90)";

    var myText      = svgContainer.append("text")
        .attr("transform", label)
        .attr('class', 'y_axis_label')
        .style("text-anchor", "middle")
        .style("font-family", "sans-serif")
        .style("font-size", "1.5rem")
        .style("font-weight", "700")
        .style("fill", 'black')
        .text(message);
}

// Axis Box
//
function axisBox(
                 svgContainer, 
                 x_box_min, 
                 x_box_max, 
                 y_box_min, 
                 y_box_max,
                 fill
                )
  { 
    myLogger.debug("axesBox");
    myLogger.debug(`x_box_min ${x_box_min} x_box_max ${x_box_max} y_box_min ${y_box_min} y_box_max ${y_box_max}`);

    // Draw the Rectangle
    //
    var rectangle = svgContainer.append("g")
        .append("rect")
        .attr("x", x_box_min)
        .attr("y", y_box_min)
        .attr("width", Math.abs(x_box_max - x_box_min))
        .attr("height", Math.abs(y_box_max - y_box_min))
        .attr("stroke", "black")
        .attr("strokeWidth", 2)
        .attr("fill", fill);
  }

// X axis
//
function xAxis(
                  svgContainer,
                  x_box_min, 
                  x_box_max, 
                  y_box_min,
                  y_box_max,
                  x_min,
                  x_max,
                  axis_side,
                  axis_label
                 )
  {
    myLogger.debug("xAxis");
    myLogger.debug(`x_box_min ${x_box_min} x_box_max ${x_box_max} y_box_min ${y_box_min} y_box_max ${y_box_max}`);
    myLogger.debug(`x_min ${x_min} x_max ${x_max} axis_side ${axis_side} axis_label ${axis_label}`);

    // Bottom axis
    //
    var width    = Math.abs(x_box_max - x_box_min);
    let thisAxis = d3.scaleLinear().domain([x_min, x_max]).rangeRound([0, width]);

    // Tic values
    //
    var tickFormat = ".0f";

    // X axis
    //
    if(axis_side.toLowerCase() == 'top') {
      var graph = svgContainer.append("g")
          .attr("transform", "translate(" + x_box_min + "," + y_box_min + ")");

      // Top axis
      //
      var theAxis = graph.append("g")
          .attr("class", "axis axis--x")
          .call(d3.axisTop(thisAxis).tickSizeOuter(0).ticks(5).tickFormat(d3.format(tickFormat)))
    }
    else {
      var graph = svgContainer.append("g")
          .attr("transform", "translate(" + x_box_max + "," + y_box_max + ")");

      // Bottom axis
      //
      var theAxis = graph.append("g")
          .attr("class", "axis axis--x")
          .call(d3.axisBottom(thisAxis).tickSizeOuter(0).ticks(5).tickFormat(d3.format(tickFormat)))

      // Determine text width for label placement
      //
      var text_label  = String(max);
      var text_length = text_label.length;
      myLogger.debug(`text_label ${text_label}`);

      var myText      = svgContainer.append("text")
          .attr("class", "tic_labels")
          .text(text_label);
      var textInfo    = textSize(myText)
      var text_height = textInfo.height;

      // Axis label
      //
      var labelOffset = text_height * 4
      var label       = "translate("
      label          += [(x_box_max + x_box_min ) * 0.5, y_box_max + labelOffset].join(", ");
      label          += ")";

      var axis_label = svgContainer.append("g")
          .append("text")
          .attr("transform", label)
          .attr('class', 'x_axis_label')
          .style("text-anchor", "middle")
          .style("font-family", "sans-serif")
          .style("font-weight", "700")
          .style("fill", 'black')
          .text(axis_label);
    }
}

// Y axis
//
function yAxis(
                  svgContainer,
                  x_box_min, 
                  x_box_max, 
                  y_box_min,
                  y_box_max,
                  y_min,
                  y_max,
                  axis_side,
                  axis_label
                 )
  { 
    myLogger.debug("yAxis");
    myLogger.debug(`x_box_min ${x_box_min} x_box_max ${x_box_max} y_box_min ${y_box_min} y_box_max ${y_box_max}`);
    myLogger.debug(`y_min ${y_min} y_max ${y_max} axis_side ${axis_side} axis_label ${axis_label}`);

    // Y axis
    //
    var height   = Math.abs(y_box_max - y_box_min);
    var thisAxis = d3.scaleLinear().domain([y_min, y_max]).rangeRound([0, height]);

    // Tic format
    //
    var tickFormat     = ".0f";

    // Y axis
    //
    if(axis_side.toLowerCase() == 'left') {
      var graph = svgContainer.append("g")
          .attr("transform", "translate(" + x_box_min + "," + y_box_min + ")");

      // Left axis
      //
      var theAxis = graph.append("g")
          .attr("class", "axis axis--y")
          .call(d3.axisLeft(thisAxis).tickSizeOuter(0).ticks(5).tickFormat(d3.format(tickFormat)))
    }
    else {
      var graph = svgContainer.append("g")
          .attr("transform", "translate(" + x_box_max + "," + y_box_min + ")");

      // Right axis
      //
      var theAxis = graph.append("g")
          .attr("class", "axis axis--y")
          .call(d3.axisRight(thisAxis).tickSizeOuter(0).ticks(5).tickFormat(d3.format(tickFormat)))
    }

    // Determine text width for label placement
    //
    var text_label  = String(y_max);
    var text_length = text_label.length;
    if(String(y_min).length > text_length) {
      text_label  = String(y_min);
      text_length = text_label.length;
    }
    myLogger.debug(`text_label ${text_label}`);

    var myText      = svgContainer.append("text")
        .text(text_label);
    var textInfo    = textSize(myText)
    var text_width  = textInfo.width / text_label.length;

    // Left axis label
    //
    var labelOffset = text_width * text_length
    var label       = "translate("
    if(axis_side.toLowerCase() == 'left') {
      label += [x_box_min - labelOffset, (y_box_max + y_box_min ) * 0.5].join(", ");
    }
    else {
      label += [x_box_max + labelOffset, (y_box_max + y_box_min ) * 0.5].join(", ");
    }
    label          += ") rotate(-90)";

    var y_axis_label = svgContainer.append("g")
        .append("text")
        .attr("transform", label)
        .style("text-anchor", "middle")
        .style("font-family", "sans-serif")
        .style("font-weight", "700")
        .style("fill", 'black')
        .text(axis_label);
  }

// Label wellbore column
//
function labelWellboreDiameter(
                               svgContainer,
                               x_box_min, 
                               x_box_max, 
                               y_box_min,
                               y_box_max,
                               x_min,
                               x_max,
                               axis_label
) {
    myLogger.info("labelWellboreDiameter");
    myLogger.info(`x_min ${x_min} x_max ${x_max} x_box_min ${x_box_min} x_box_max ${x_box_max} y_box_min ${y_box_min} y_box_max ${y_box_max}`);

    // Tic values
    //
    var tickFormat = ".0f";

    // Middle position
    //
    var x_mid      = ( x_box_max + x_box_min ) * 0.5;

    // Right side of bottom axis
    //
    var width    = Math.abs(x_box_max - x_box_min) * 0.5;
    let thisAxis = d3.scaleLinear().domain([x_min, x_max]).rangeRound([0, width]);

    // X axis
    //
    var graph = svgContainer.append("g")
        .attr("transform", "translate(" + x_mid + "," + y_box_max + ")");

    // Bottom axis
    //
    var theAxis = graph.append("g")
        .attr("class", "axis axis--x")
        .call(d3.axisBottom(thisAxis).tickSizeOuter(0).ticks(2).tickFormat(d3.format(tickFormat)))

    // X axis
    //
    var graph = svgContainer.append("g")
        .attr("transform", "translate(" + x_box_min + "," + y_box_max + ")");

    // Left side of bottom axis
    //
    thisAxis = d3.scaleLinear().domain([x_max, x_min]).rangeRound([0, width]);

    // Bottom axis
    //
    var theAxis = graph.append("g")
        .attr("class", "axis axis--x")
        .call(d3.axisBottom(thisAxis).tickSizeOuter(0).ticks(2).tickFormat(d3.format(tickFormat)))

    // X axis label
    //
    var myText      = svgContainer.append("text")
    var textInfo    = textSize(myText)
    var text_height = textInfo.height;

    label_x          = x_mid;
    label_y          = y_box_max + text_height * 3;

    var x_axis_label = svgContainer.append("g")
        .append("text")
        .attr('x', label_x)
        .attr('y', label_y)
        .style("text-anchor", "middle")
        .style("font-family", "sans-serif")
        .style("font-weight", "700")
        .style("fill", 'black')
        .text(axis_label);
  }


// Min and max
//
function get_max_min( min_value, max_value)
  { 
   var factor         = 0.01; 
   var interval_shift = 0.67; 
   var range          = max_value - min_value; 
        
   var interval       = factor; 
   range              = range / 5.0; 
        
   // Determine interval 
   // 
   while (range > factor) 
     { 
      if(range <= (factor * 1)) 
        { 
   	 interval = factor * 1; 
        } 
      else if (range <= (factor * 2))
        { 
   	 interval = factor * 2; 
        } 
      else if (range <= (factor * 2.5))
        { 
   	 if(factor < 10.0) 
           { 
            interval = factor * 2; 
           } 
         else 
           { 
            interval = factor * 2.5; 
           } 
        } 
      else if (range <= (factor * 5))
        { 
         interval = factor * 5;
        } 
      else
        { 
         interval = factor * 10;
        } 

       factor = factor * 10; 
    } 

   // Maximum
   //
   factor = parseInt(max_value / interval); 
   value  = factor * interval; 
   if(max_value >= value ) 
     { 
      value += interval; 
     } 
   if(max_value >= value ) 
     { 
      max_value = value + interval; 
     } 
   else 
     { 
      max_value = value; 
     } 

   // Minimum
   //
   factor = parseInt(min_value / interval); 
   value  = factor * interval; 
   if(min_value >= value ) 
     { 
      value = (factor - 1) * interval; 
     } 
   if(Math.abs(min_value - value) <= interval_shift * interval) 
     { 
      min_value = value - interval; 
     } 
   else 
     { 
      min_value = value; 
     } 
      
   return [min_value, max_value, interval];
  }

function textSize(text) {
  let container = d3.select('body').append('svg');

  container.append('text')
    .style("font-size", "9px")      // todo: these need to be passed to the function or a css style
    .style("font-family", "sans-serif")
    .text(text);

  let sel = container.selectAll('text').node()
  let width = sel.getComputedTextLength()
  let height = sel.getExtentOfChar(0).height
  container.remove()
  
  return {width, height}
}

function getLegendPosition(svgElement) {
    let elem = document.querySelector(svgElement);
    let svg  = elem.ownerSVGElement;

    // Get the x and y coordinates
    //
    let pt = svg.createSVGRect();
    pt.x   = elem.x.baseVal.value;
    pt.y   = elem.y.baseVal.value;

    while (true) {
        // Get this elements transform
        //
        var transform = elem.transform.baseVal.consolidate();
        
        // If it has a transform, then apply it to our point
        //
        if (transform) {
            var matrix = elem.transform.baseVal.consolidate().matrix;
            pt = pt.matrixTransform(matrix);
        }

        // If this element's parent is the root SVG element, then stop
        //
        if (elem.parentNode == svg)
            break;

        // Otherwise step up to the parent element and repeat the process
        //
        elem = elem.parentNode;
        elemBox = elem.getBoundingClientRect();
        myLogger.info(`elemBox`);
        myLogger.info(elemBox);
    }
    return {
        x: pt.x,
        y: pt.y,
        width: elemBox.width,
        height: elemBox.height
    };
}

function isNumeric(str) {
  if (typeof str == "number") return true; // we only process strings!  
  return !isNaN(str) && // use type coercion to parse the string
         !isNaN(parseFloat(str)); // ensure the parsed number is a number
}









// Old versions


// Left axis
//
function leftAxis2(
                  svgContainer,
                  x_box_min, 
                  x_box_max, 
                  y_box_min,
                  y_box_max,
                  y_min,
                  y_max,
                  y_interval,
                  axis_label
                 )
  { 
   myLogger.debug("leftAxis");

   // Determine text width for label placement
   //
   var text_label  = String(y_max);
   var text_length = text_label.length;

   var myText      = svgContainer.append("text")
                                 .attr("class", "tic_labels")
                                 .text(text_label);
   var text_width  = myText.node().getComputedTextLength() / text_label.length;
   myLogger.debug("text_width " + text_width);

   // Draw y tics and labels
   //
   var y           = 0.0
   var y_range     = y_max - y_min;
   var y_axis      = y_box_max - y_box_min;
   myLogger.debug("y_range " + y_range);

   var tics        = svgContainer.append("g")
                                 .attr("id", "tics")
                                 .attr("stroke", "black")
                                 .attr("strokeWidth", 1)

   var tic_labels  = svgContainer.append("g")
                                 .attr("class", "tic_labels")
    
   // Left y tics and labels
   //
   while ( y <= y_max ) {
        y_tic            = y_box_min + y_axis * (y - y_min) / y_range

        // Left tic
        //
        var myLine      = tics.append("line")
                              //.attr('id', lith_cd)
                              .attr("x1", x_box_min)
                              .attr("y1", y_tic)
                              .attr("x2", x_box_min + 10)
                              .attr("y2", y_tic);

        // Left tic labels
        //
        y_label_txt      = String(y);
        label_x          = x_box_min - text_width;
        label_y          = y_tic + text_width * 0.50;
        //myLogger.debug("Max Y " + y_max + " Y " + y);

        var myText       = tic_labels.append("text")
                                     .attr('x', label_x)
                                     .attr('y', label_y)
                                     .attr('class', 'tic_labels')
                                     .text(y_label_txt);
     
        y               += y_interval
   }

   // Left axis label
   //
   var labelOffset = ( text_length + 2 ) * text_width;
   var label       = "translate("
   label          += [x_box_min - labelOffset, (y_box_max + y_box_min ) * 0.5].join(", ");
   label          += ") rotate(-90)";

   var left_axis_label = svgContainer.append("g")
                                     .append("text")
                                     .attr("transform", label)
                                     .attr('class', 'y_axis_label')
                                     .text(axis_label);
  }

// Right axis
//
function rightAxis2(
                  svgContainer,
                  x_box_min, 
                  x_box_max, 
                  y_box_min,
                  y_box_max,
                  y_min,
                  y_max,
                  y_interval,
                  axis_label,
                  altitude_accuracy
                 )
  { 
   myLogger.debug("rightAxis");
   myLogger.debug("y_min " + y_min);
   myLogger.debug("y_max " + y_max);

   // Determine text width for label placement
   //
   var text_label  = y_max.toFixed(altitude_accuracy);
   var text_length = text_label.length;

   if(y_min.toFixed(altitude_accuracy).length > text_length)
     {
      text_label  = y_min.toFixed(altitude_accuracy);
      text_length = text_label.length;
     }

   var myText      = svgContainer.append("text")
                                 .attr("class", "tic_labels")
                                 .text(text_label);
   var text_offset = myText.node().getComputedTextLength() / text_label.length;
   myLogger.debug("text_offset " + text_offset);

   // Draw y tics and labels
   //
   var y           = y_max;
   var y_range     = y_max - y_min;
   var y_axis      = y_box_max - y_box_min;
   myLogger.debug("y_range " + y_range);

   var tics        = svgContainer.append("g")
                                 .attr("id", "tics")
                                 .attr("stroke", "black")
                                 .attr("strokeWidth", 1)

   var tic_labels  = svgContainer.append("g")
                                 .attr("class", "tic_labels")
    
   // Right tics and labels
   //
   while ( y >= y_min ) {
        y_tic            = y_box_min + y_axis * (y_max - y) / y_range

        // Right tic
        //
        var myLine      = tics.append("line")
                              //.attr('id', lith_cd)
                              .attr("x1", x_box_max)
                              .attr("y1", y_tic)
                              .attr("x2", x_box_max - 10)
                              .attr("y2", y_tic);

        // Right tic labels
        //
        y_label_txt      = y.toFixed(altitude_accuracy);
        label_x          = x_box_max + ( text_length + 1 ) * text_offset;
        label_y          = y_tic + text_offset * 0.50;
        myLogger.debug("Y " + y + " y_label_txt " + y_label_txt);

        var myText       = tic_labels.append("text")
                                     .attr('x', label_x)
                                     .attr('y', label_y)
                                     .attr('class', 'tic_labels')
                                     .text(y_label_txt);
     
        y               -= y_interval
   }

   // Right axis label
   //
   var labelOffset = ( text_length + 2 ) * text_offset;
   var label       = "translate("
   label          += [x_box_max + labelOffset, (y_box_max + y_box_min ) * 0.5].join(", ");
   label          += ") rotate(90)";

   var left_axis_label = svgContainer.append("g")
                                     .append("text")
                                     .attr("transform", label)
                                     .attr('class', 'y_axis_label')
                                     .text(axis_label);
  }


// Label y axes
//
function label_YAxes(
                     svgContainer,
                     x_box_min, 
                     x_box_max, 
                     y_box_min,
                     y_box_max,
                     y_min,
                     y_max,
                     y_interval
                    )
  { 
   myLogger.debug("label_YAxes");

   // Determine text width for label placement
   //
   var text_label  = String(y_max);
   var text_length = text_label.length;

   var myText      = svgContainer.append("text")
                                 .attr("class", "tic_labels")
                                 .text(text_label);
   var text_width  = myText.node().getComputedTextLength() / text_label.length;
   myLogger.debug("text_width " + text_width);

   // Draw y tics and labels
   //
   var y           = 0.0
   var y_range     = y_max - y_min;

   var tics        = svgContainer.append("g")
                                 .attr("id", "tics")
                                 .attr("stroke", "black")
                                 .attr("strokeWidth", 1)

   var tic_labels  = svgContainer.append("g")
                                 .attr("class", "tic_labels")
    
   // Left y tics and labels
   //
   while ( y <= y_max ) {
        y_tic            = y_box_min + y_axis * (y - y_min) / y_range

        // Left tic
        //
        var myLine      = tics.append("line")
                              //.attr('id', lith_cd)
                              .attr("x1", x_box_min)
                              .attr("y1", y_tic)
                              .attr("x2", x_box_min + 10)
                              .attr("y2", y_tic);

        // Left tic labels
        //
        y_label_txt      = String(y);
        label_x          = x_box_min - text_width;
        label_y          = y_tic + text_width * 0.50;
        //myLogger.debug("Max Y " + y_max + " Y " + y);

        var myText       = tic_labels.append("text")
                                     .attr('x', label_x)
                                     .attr('y', label_y)
                                     .attr('class', 'tic_labels')
                                     .text(y_label_txt);
     
        y               += y_interval
   }

   // Left axis label
   //
   label_txt       = "Depth Below Land Surface, in feet";
   var labelOffset = ( text_length + 2 ) * text_width;
   var label       = "translate("
   label          += [x_box_min - labelOffset, (y_box_max + y_box_min ) * 0.5].join(", ");
   label          += ") rotate(-90)";

   var left_axis_label = svgContainer.append("g")
                                     .append("text")
                                     .attr("transform", label)
                                     .attr('class', 'y_axis_label')
                                     .text(label_txt);

   // Prepare
   //
   elevation_max   = land_surface;
   var elev_offset = String(elevation_max).length;
   elevation_max   = land_surface - y_max;
   if(elev_offset < elevation_max.toFixed(altitude_accuracy).length)
     {
      elev_offset = elevation_max.toFixed(altitude_accuracy).length;
     }
   label_offset    = ( elev_offset + 1 ) * text_width;

   // Right y tics and labels
   //
   var y         = 0.0
   while ( y <= y_max ) {
        y_tic            = y_box_min + y_axis * (y - y_min) / y_range

        // Right tics
        //
        var myLine      = tics.append("line")
                              //.attr('id', lith_cd)
                              .attr("x1", x_box_max)
                              .attr("y1", y_tic)
                              .attr("x2", x_box_max - 10)
                              .attr("y2", y_tic);
             
        // Right tic labels
        //
        y_label_txt      = land_surface.toFixed(altitude_accuracy);
        label_x          = x_box_max + label_offset;
        label_y          = y_tic + text_size * 0.50;
        var myText       = tic_labels.append("text")
                                     .attr('x', label_x)
                                     .attr('y', label_y)
                                     .attr('class', 'tic_labels')
                                     .text(y_label_txt);
     
        y               += y_interval
        land_surface    -= y_interval
   }

   // Right axis label
   //
   label_txt       = "Elevation, in feet";
   var  label      = "translate("
   label          += [x_box_max + label_offset + text_width * 2, (y_box_max + y_box_min ) * 0.5].join(", ");
   label          += ") rotate(90)";

   var right_axis_label = svgContainer.append("g")
                                      .append("text")
                                      .attr("transform", label)
                                      .attr('class', 'y_axis_label')
                                      .text(label_txt);
  }
