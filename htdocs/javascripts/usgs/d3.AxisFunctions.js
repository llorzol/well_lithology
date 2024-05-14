/**
 * Namespace: d3_AxisFunctions
 *
 * d3_AxisFunctions is a JavaScript library to provide a set of functions to build
 *  axes and labelling for well construction and lithology applications in svg format.
 *
 * version 1.18
 * August 20, 2020
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
   console.log("addToolTip");
  
   // Add tooltip
   //
   var tooltip = d3.select("body")
                   .append("div")
                   .attr("class", "toolTip");

   return tooltip;
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
   console.log("axesBox");

   // Draw the Rectangle
   //
   var rectangle = svgContainer.append("g")
                               .append("rect")
                               .attr("x", x_box_min)
                               .attr("y", y_box_min)
                               .attr("width", x_box_max- x_box_min)
                               .attr("height", y_box_max)
                               .attr("stroke", "black")
                               .attr("strokeWidth", 2)
                               .attr("fill", fill);
  }

// Label y axes
//
function leftAxis(
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
   console.log("leftAxis");
  
   // Y axis
   //
   var height = y_box_max - y_box_min;
   var yAxis  = d3.scaleLinear().rangeRound([height, 0]);

   yAxis.domain([y_max, y_min]); 
    
   // Tic values
   //
   var tickValuesList = [];
   var tickFormat     = ".0f";
   var y              = y_min;
   while ( y <= y_max ) {
        var tic_value = d3.format(tickFormat)(y);
        tickValuesList.push(tic_value);
        y            += y_interval;
   }

   // Graph
   //
   var graph = svgContainer.append("g")
                           .attr("transform", "translate(" + x_box_min + "," + y_box_min + ")");

   // Y axis
   //
   var yaxis = graph.append("g")
                    .attr("class", "axis axis--y")
                    .call(d3.axisLeft(yAxis).tickValues(tickValuesList).tickFormat(d3.format(tickFormat)))

   // Determine text width for label placement
   //
   var text_label  = String(y_max);
   var text_length = text_label.length;

   var myText      = svgContainer.append("text")
                                 .attr("class", "tic_labels")
                                 .text(text_label);
   var text_width  = myText.node().getComputedTextLength() / text_label.length;

   // Left axis label
   //
   var labelOffset = ( text_length + 3 ) * text_width;
   var label       = "translate("
   label          += [x_box_min - labelOffset, (y_box_max + y_box_min ) * 0.5].join(", ");
   label          += ") rotate(-90)";

   var left_axis_label = svgContainer.append("g")
                                     .append("text")
                                     .attr("transform", label)
                                     .attr('class', 'y_axis_label')
                                     .text(axis_label);
  }

// Label y axes
//
function rightElevationAxis(
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
   console.log("rightElevationAxis");
  
   // Y axis
   //
   var height = y_box_max - y_box_min;
   var yAxis  = d3.scaleLinear().rangeRound([height, 0]);

   yAxis.domain([y_min, y_max]); 
    
   // Tic values
   //
   var tickValuesList = [];
   var tickFormat     = "." + altitude_accuracy + "f";
   var y              = y_max;
   while ( y >= y_min ) {
        var tic_value = d3.format(tickFormat)(y);
        tickValuesList.push(tic_value);
        y            -= y_interval;
   }

   // Graph
   //
   var graph = svgContainer.append("g")
                           .attr("transform", "translate(" + x_box_max + "," + y_box_min + ")");

   // Y axis
   //
   var yaxis = graph.append("g")
                    .attr("class", "axis axis--y")
                    .call(d3.axisRight(yAxis).tickValues(tickValuesList).tickFormat(d3.format(tickFormat)))

   // Determine text width for label placement
   //
   var text_label  = String(y_max);
   var text_length = text_label.length;

   var myText      = svgContainer.append("text")
                                 .attr("class", "tic_labels")
                                 .text(text_label);
   var text_width  = myText.node().getComputedTextLength() / text_label.length;
   console.log("text_width " + text_width);

   // Axis label
   //
   var labelOffset = ( text_length + 5 ) * text_width;
   var label       = "translate("
   label          += [x_box_max + labelOffset, (y_box_max + y_box_min ) * 0.5].join(", ");
   label          += ") rotate(90)";

   var axis_label  = svgContainer.append("g")
                                 .append("text")
                                 .attr("transform", label)
                                 .attr('class', 'y_axis_label')
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
                              )
  { 
   console.log("labelWellboreDiameter");

   var tic_labels  = svgContainer.append("g")
                                 .attr("class", "x_tic_labels")

   x_range         = x_max - x_min;
   var max_label   = String(x_max).length;
   var tic_offset  = ( String(x_max).length + 1 ) * text_size;

   // Draw x tics and labels
   //
   var tics        = svgContainer.append("g")
                                 .attr("id", "tics")
                                 .attr("stroke", "black")
                                 .attr("strokeWidth", 1)

   // Tic labels
   //
   label_txt       = String(x_max);
   label_x         = x_box_min;
   label_y         = y_box_max + y_box_min + text_size * 1.50;

   var myText      = tic_labels.append("text")
                               .attr('x', label_x)
                               .attr('y', label_y)
                               .attr('class', 'x_tic_labels')
                               .text(label_txt);
    
   label_x         = x_box_max;

   var myText      = tic_labels.append("text")
                               .attr('x', label_x)
                               .attr('y', label_y)
                               .attr('class', 'x_tic_labels')
                               .text(label_txt);
    
   // Zero
   //
   var x_mid       = ( x_box_max + x_box_min ) * 0.5;

   var myLine      = tics.append("line")
                         .attr("x1", x_mid)
                         .attr("y1", y_box_max + y_box_min)
                         .attr("x2", x_mid)
                         .attr("y2", y_box_max + y_box_min - 10)
    
   label_txt        = String(0);
   label_x          = x_mid;

   var myText       = tic_labels.append("text")
                                .attr('x', label_x)
                                .attr('y', label_y)
                                .attr('class', 'x_tic_labels')
                                .text(label_txt);
    
   // X axis label
   //
   label_x          = x_mid;
   label_y          = y_box_max + y_box_min + text_size * 4;

   var myText       = tic_labels.append("text")
                                .attr('x', label_x)
                                .attr('y', label_y)
                                .attr('class', 'x_axis_label')
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
   console.log("leftAxis");

   // Determine text width for label placement
   //
   var text_label  = String(y_max);
   var text_length = text_label.length;

   var myText      = svgContainer.append("text")
                                 .attr("class", "tic_labels")
                                 .text(text_label);
   var text_width  = myText.node().getComputedTextLength() / text_label.length;
   console.log("text_width " + text_width);

   // Draw y tics and labels
   //
   var y           = 0.0
   var y_range     = y_max - y_min;
   var y_axis      = y_box_max - y_box_min;
   console.log("y_range " + y_range);

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
        //console.log("Max Y " + y_max + " Y " + y);

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
   console.log("rightAxis");
   console.log("y_min " + y_min);
   console.log("y_max " + y_max);

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
   console.log("text_offset " + text_offset);

   // Draw y tics and labels
   //
   var y           = y_max;
   var y_range     = y_max - y_min;
   var y_axis      = y_box_max - y_box_min;
   console.log("y_range " + y_range);

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
        console.log("Y " + y + " y_label_txt " + y_label_txt);

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
   console.log("label_YAxes");

   // Determine text width for label placement
   //
   var text_label  = String(y_max);
   var text_length = text_label.length;

   var myText      = svgContainer.append("text")
                                 .attr("class", "tic_labels")
                                 .text(text_label);
   var text_width  = myText.node().getComputedTextLength() / text_label.length;
   console.log("text_width " + text_width);

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
        //console.log("Max Y " + y_max + " Y " + y);

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
