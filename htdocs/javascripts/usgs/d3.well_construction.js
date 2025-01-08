/**
 * Namespace: D3_Construction
 *
 * D3_Construction is a JavaScript library to provide a set of functions to build
 *  well construction information in svg format.
 *
 * version 3.18
 * January 7, 2025
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

function addWellConstruction(svgContainer,
                                 x_min,
                                 x_max,
                                 y_min,
                                 y_max,
                                 x_box_min,
                                 x_box_max,
                                 y_box_min,
                                 y_box_max,
                                 wellConstruction,
                                 constructionDefs,
                                 tooltip) {
    myLogger.info("addWellConstruction");
    myLogger.debug(wellConstruction);
    myLogger.debug(constructionDefs);
    myLogger.info(`X-axis information max ${x_max} min ${x_min} x_interval ${x_interval}`);

    // Set
    //
    let dia_max    = x_max;
    let x_range    = x_max - x_min;
    let y_range    = y_max - y_min;
    let y_axis     = y_box_max - y_box_min;

    // Construction legend
    //
    buildDefs(svgContainer, constructionDefs)

    // wellBore
    //
    let wellBore   = svgContainer.append("g")
        .attr("class", "wellBore")

    // Loop through construction
    //
    if(wellConstruction) {

        // Construction record
        //
        if(wellConstruction.gw_cons) {
            let = wellRecord = wellConstruction.gw_cons;

            // Loop
            //
            myLogger.debug(wellRecord);
            
            for(let i = 0; i < wellRecord.length; i++) {
                let Record = wellRecord[i];
                
                let id           = Record.id;
                let description  = Record.description;
                let bottom_depth = Record.bottom_depth;
                let symbol       = Record.symbol;
                let color        = Record.color;

                let top_depth = 0.0;
                let bot_depth = parseFloat(bottom_depth);

                let x_mid     = x_box_min + ( x_box_max - x_box_min ) * 0.5;
                let width     = ( x_box_max - x_box_min ) * 0.8;
                let x         = x_mid - width * 0.5;

                let y_top     = y_box_min + y_axis * (top_depth - y_min) / y_range
                let y_bot     = y_box_min + y_axis * (bot_depth - y_min) / y_range
                let thickness = y_bot - y_top

                let toolTip   = ["Seal,", description, "from", top_depth, "to", bot_depth, "feet"].join(" ");
                let data      = [ {x:x_box_min, tooltip: toolTip}];

                // Check for existing definitions section
                //
                let defs = d3.select("defs");

                // Set definitions in svg container if needed
                //
                if(defs.size() < 1) {
                    myLogger.info(`Creating definitions section seal defs ${defs.size()}`);
                    defs = svgContainer.append("defs")
                }
                else {
                    myLogger.info(`Appending to definitions section seal defs ${defs.size()}`);
                }

                // Check for existing definitions section
                //
                let newDefs = d3.selectAll(`#gradient${id}`);

                // Set color scale for 3-D shading
                //
                if(newDefs.size() < 1) {
                    let ii       = -0.5
                    let myScale = [];
                    while (ii < 0.5) {
                        myScale.push(shadeHexColor(color, ii))
                        ii += 0.1;
                    }
                    var colorScale = d3.scaleLinear()
                        .range(myScale);

                    let gradient = defs.append('linearGradient')
                        .attr('id', `gradient${id}`)
                        .attr("x1", "0%")
                        .attr("y1", "0%")
                        .attr("x2", "100%")
                        .attr("y2", "0%")
                    gradient.selectAll("stop")
                        .data( colorScale.range() )
                        .enter().append("stop")
                        .attr("offset", function(d,i) { return i/(colorScale.range().length-1); })
                        .attr("stop-color", function(d) { return d; });
                }
                
                let Seal = wellBore.append("g")
                    .data(data);
                let myRect = Seal.append("rect")
                    .attr('id', id)
                    .attr('class', 'seal')
                    .attr('x', x)
                    .attr('y', y_top)
                    .attr('width', width)
                    .attr('height', thickness)
                    .attr('fill', `url(#gradient${id})`)
                    .attr('stroke', 'black')
                    .attr('stroke-width', 1)
                    .on("mousemove", function(event, d) {
                        tooltip
                            .style("left", event.pageX + "px")
                            .style("top", event.pageY + "px")
                            .style("display", "inline-block")
                            .html(d.tooltip);
                    })
                    .on("mouseout", function(d){ tooltip.style("display", "none");});
            }
        }

        // Hole record
        //
        myLogger.error(' *** Hole record ***');
        myLogger.error(wellConstruction.gw_hole)
        if(wellConstruction.gw_hole) {
            let = wellRecord = wellConstruction.gw_hole;
            myLogger.error(wellRecord);

            for(let i = 0; i < wellRecord.length; i++) {
                let Record       = wellRecord[i];

                let id           = Record.id;
                let top_depth    = parseFloat(Record.top_depth)
                let bot_depth    = parseFloat(Record.bottom_depth);
                let diameter     = parseFloat(Record.diameter);
                let color        = Record.color;

                let x_mid        = ( x_box_max + x_box_min ) * 0.5;
                let width        = x_axis * diameter / x_range
                let x            = x_mid - 0.5 * width

                let y_top        = y_box_min + y_axis * (top_depth - y_min) / y_range
                let y_bot        = y_box_min + y_axis * (bot_depth - y_min) / y_range
                let thickness    = y_bot - y_top

                let toolTip      = ["Borehole diameter", diameter, "inches from", top_depth, "to", bot_depth, "feet"].join(" ");
                let data         = [ {x:x, tooltip: toolTip}];

                // Check for existing definitions section
                //
                let defs = d3.select("defs");

                // Set definitions in svg container if needed
                //
                if(defs.size() < 1) {
                    myLogger.info(`Creating definitions section hole defs ${defs.size()}`);
                    defs = svgContainer.append("defs")
                }
                else {
                    myLogger.info(`Appending to definitions section hole defs ${defs.size()}`);
                }

                // Check for existing definitions section
                //
                let newDefs = d3.selectAll(`#gradient${id}`);

                // Set color scale for 3-D shading
                //
                if(newDefs.size() < 1) {
                    let ii       = -0.15
                    let myScale = [];
                    while (ii < 0.5) {
                        myScale.push(shadeHexColor(color, ii))
                        ii += 0.05;
                    }
                    let colorScale = d3.scaleLinear()
                        .range(myScale);

                    let gradient = defs.append('linearGradient')
                        .attr('id', `gradient${id}`)
                        .attr("x1", "0%")
                        .attr("y1", "0%")
                        .attr("x2", "100%")
                        .attr("y2", "0%")
                    gradient.selectAll("stop")
                        .data( colorScale.range() )
                        .enter().append("stop")
                        .attr("offset", function(d,i) { return i/(colorScale.range().length-1); })
                        .attr("stop-color", function(d) { return d; });
                }
                
                let Hole = wellBore.append("g")
                    .data(data);

                let myRect = Hole.append("rect")
                    .attr('id', 'hole')
                    .attr('class', 'hole')
                    .attr('x', x)
                    .attr('y', y_top)
                    .attr('width', width)
                    .attr('height', thickness)
                    .attr('fill', `url(#gradient${id})`)
                    .attr('stroke', 'black')
                    .attr('stroke-width', 1)
                    .on("mousemove", function(event, d) {
                        tooltip
                            .style("left", event.pageX + "px")
                            .style("top", event.pageY + "px")
                            .style("display", "inline-block")
                            .html(d.tooltip);
                    })
                    .on("mouseout", function(d){ tooltip.style("display", "none");});
            }
        }

        // Casing record
        //
        myLogger.debug('Casing');
        if(wellConstruction.gw_csng) {
            let = wellRecord = wellConstruction.gw_csng;

            myLogger.debug('Casing record');
            for(let i = 0; i < wellRecord.length; i++) {
                let Record         = wellRecord[i];
                myLogger.debug(Record);

                let id           = Record.id;
                let top_depth    = parseFloat(Record.top_depth)
                let bot_depth    = parseFloat(Record.bottom_depth);
                let diameter     = parseFloat(Record.diameter);
                let description  = Record.description;
                let color        = Record.color;

                let x_mid        = ( x_box_max + x_box_min ) * 0.5;
                let width        = x_axis * diameter / x_range
                let x            = x_mid - 0.5 * width

                let y_top          = y_box_min + y_axis * (top_depth - y_min) / y_range
                let y_bot          = y_box_min + y_axis * (bot_depth - y_min) / y_range
                let thickness      = y_bot - y_top

                let toolTip        = ["Casing,", description, "casing diameter", diameter, "inches from", top_depth, "to", bot_depth, "feet"].join(" ");
                let data           = [ {x:x, tooltip: toolTip}];

                // Check for existing definitions section
                //
                let defs = d3.select("defs");

                // Set definitions in svg container if needed
                //
                if(defs.size() < 1) {
                    myLogger.info(`Creating definitions section casing defs ${defs.size()}`);
                    defs = svgContainer.append("defs")
                }
                else {
                    myLogger.info(`Appending to definitions section casing defs ${defs.size()}`);
                }

                // Check for existing definitions section
                //
                let newDefs = d3.selectAll(`#gradient${id}`);

                // Set color scale for 3-D shading
                //
                if(newDefs.size() < 1) {
                    let ii       = -0.5
                    let myScale = [];
                    while (ii < 0.5) {
                        myScale.push(shadeHexColor(color, ii))
                        ii += 0.1;
                    }
                    let colorScale = d3.scaleLinear()
                        .range(myScale);

                    let gradient = defs.append('linearGradient')
                        .attr('id', `gradient${id}`)
                        .attr("x1", "0%")
                        .attr("y1", "0%")
                        .attr("x2", "100%")
                        .attr("y2", "0%")
                    gradient.selectAll("stop")
                        .data( colorScale.range() )
                        .enter().append("stop")
                        .attr("offset", function(d,i) { return i/(colorScale.range().length-1); })
                        .attr("stop-color", function(d) { return d; });
                }
               
                let Casing = wellBore.append("g")
                    .data(data);

                let myRect = Casing.append("rect")
                    .attr('id', id)
                    .attr('class', 'csng')
                    .attr('x', x)
                    .attr('y', y_top)
                    .attr('width', width)
                    .attr('height', thickness)
                    .style('fill', `url(#gradient${id})`)
                    .attr('stroke', 'black')
                    .attr('stroke-width', 1)
                    .on("mousemove", function(event, d) {
                        tooltip
                            .style("left", event.pageX + "px")
                            .style("top", event.pageY + "px")
                            .style("display", "inline-block")
                            .html(d.tooltip);
                    })
                    .on("mouseout", function(d){ tooltip.style("display", "none");});
            }
        }
        // Open interval record
        //
        if(wellConstruction.gw_open) {
            let = wellRecord = wellConstruction.gw_open;

            for(let i = 0; i < wellRecord.length; i++) {
                let Record         = wellRecord[i];
                myLogger.info('Open interval record');
                myLogger.info(Record);

                let id           = Record.id;
                let top_depth    = parseFloat(Record.top_depth)
                let bot_depth    = parseFloat(Record.bottom_depth);
                let diameter     = parseFloat(Record.diameter);
                let description  = Record.description;
                let symbol       = Record.symbol;
                let color        = Record.color;

                let x_mid          = ( x_box_max + x_box_min ) * 0.5;
                let width          = x_axis * diameter / x_range
                let x              = x_mid - 0.5 * width

                let y_top          = y_box_min + y_axis * (top_depth - y_min) / y_range
                let y_bot          = y_box_min + y_axis * (bot_depth - y_min) / y_range
                let thickness      = y_bot - y_top

                let toolTip        = ["Open interval,", description, "from", top_depth, "to", bot_depth, "feet"].join(" ");
                let data           = [ {x:x, tooltip: toolTip}];
                
                let Open = wellBore.append("g")
                    .data(data);
                let myRect = Open.append("rect")
                    .attr('id', id)
                    .attr('class', 'open')
                    .attr('x', x)
                    .attr('y', y_top)
                    .attr('width', width)
                    .attr('height', thickness)
                    .attr('fill', symbol)
                    .attr('stroke', 'black')
                    .attr('stroke-width', 1)
                    .on("mousemove", function(event, d) {
                        tooltip
                            .style("left", event.pageX + "px")
                            .style("top", event.pageY + "px")
                            .style("display", "inline-block")
                            .html(d.tooltip);
                    })
                    .on("mouseout", function(d){ tooltip.style("display", "none");});
            }
        }
    }

    // Construction legend
    //
    constructionLegend(svgContainer, constructionDefs, 'Well Construction')

    // Wellbore axis
    //
    labelWellboreDiameter(
        svgContainer,
        x_box_min,
        x_box_max,
        y_box_min,
        y_box_max,
        0.0,
        x_max,
        "Borehole Diameter, inches"
    );
}


function buildWellDefs(svgContainer, constructionDefs) {
    myLogger.info("buildWellDefs");
    myLogger.info(constructionDefs);

    // Check for existing definitions section
    //
    let defs = d3.select("defs");
    
    // Set definitions in svg container if needed
    //
    if(defs.size() < 1) {
        myLogger.info(`Creating definitions section defs ${defs.size()}`);
        defs = svgContainer.append("defs")
    }
    else {
        myLogger.info(`Appending to definitions section defs ${defs.size()}`);
    }

    // Build definitions section
    //
    for(let i = 0; i < constructionDefs.length; i++) {

        let description = constructionDefs[i].description;
        let symbol      = constructionDefs[i].symbol;
        let color       = constructionDefs[i].color;
        myLogger.info(`Checking definition ${description} symbol ${symbol} color ${color}`);

        // Pattern definition
        //
        if(symbol) {
        myLogger.info(`Adding definition ${description} symbol ${symbol} color ${color}`);
            let pattern = defs.append("pattern")
                .attr('id', symbol)
                .attr('patternUnits', 'userSpaceOnUse')
                .attr('width', 100)
                .attr('height', 100)

            let myimage = pattern.append('image')
                .attr('xlink:href', ["lithology_patterns", symbol].join("/"))
                .attr('width', 100)
                .attr('height', 100)
                .attr('x', 0)
                .attr('y', 0)
        }
    }

    return;
  }

function constructionLegend(svgContainer, Legend, myTitle) {
    myLogger.info("constructionLegend");
    myLogger.debug(Legend);

    // Check for existing lithology legend
    //
    let descriptions = d3.select(".legend_descriptions")
    myLogger.info("descriptions");
    myLogger.info(descriptions.size());
    if(descriptions.size() > 0) {
        // Works
        //
        //let lithEntries = d3.select(".legend_descriptions").selectAll("#lithEntries")
        //    .each(function(d,i) { y_top += legend_box * 1.5; });
        //y_top += legend_box * 0.5;
 
        // Get legend x and y coordinates
        //
        lithLegend = getLegendPosition("#lithEntries")
        myLogger.debug("lithLegend");
        myLogger.debug(lithLegend);
        x_legend = lithLegend.x;
        y_legend = lithLegend.y + lithLegend.height + legend_box;
        myLogger.debug(`Existing lithology legend ${x_legend} ${y_legend}`);
   }
    else {
        descriptions = svgContainer.append("g")
            .attr("class", "legend_descriptions")
    }

    // Set legend title
    //
    descriptions.append("rect")
        .attr('id', 'lithEntries')
        .attr('x', x_legend)
        .attr('y', y_legend)
        .attr('width', 1)
        .attr('height', 1)
        .attr('fill', 'none')
        .attr('stroke', 'black')
        .attr('stroke-width', 0);
    descriptions.append("text")
        .attr('x', x_legend)
        .attr('y', y_legend + legend_box * 0.75)
        .style("text-anchor", "start")
        .style("alignment-baseline", "center")
        .style("font-family", "sans-serif")
        .style("font-weight", "500")
        .style("fill", 'black')
        .text(myTitle);
    
    // Loop through legend
    //
    for(let i = 0; i < Legend.length; i++) {
        
        y_legend += legend_box * 1.5
        
        var Record      = Legend[i];
        
        var id          = Record.id;
        var description = Record.description;
        var symbol      = Record.symbol;
        var color       = Record.color;

        var url         = 'url(#' + symbol + ')';
        if(color && !symbol) { url = color; }

        var myRect = descriptions.append("rect")
            .attr('id', 'consEntries')
            .attr('class', id)
            .attr('x', x_legend)
            .attr('y', y_legend)
            .attr('width', legend_box)
            .attr('height', legend_box)
            .attr('fill', url)
            .attr('stroke', 'black')
            .attr('stroke-width', 1)
            .on('mouseover', function(d, i) {
                let id = d3.select(this).attr('class');
                d3.selectAll("#" + id)
                    .transition()
                    .duration(100)
                    .attr('stroke-width', 4)
                    .attr('stroke', 'yellow')
            })
            .on('mouseout', function(d, i) {
                let id = d3.select(this).attr('class');
                d3.selectAll("#" + id)
                    .transition()
                    .duration(100)
                    .attr('stroke-width', 1)
                    .attr('stroke', 'black')
            })
        
        var myText = descriptions.append("text")
            .style("text-anchor", "start")
            .style("alignment-baseline", "center")
            .style("font-family", "sans-serif")
            .style("font-weight", "300")
            .style("fill", 'black')
            .text(description)
            .attr('class', id)
            .attr('x', x_legend + legend_box * 1.25)
            .attr('y', y_legend + legend_box * 0.75)
            .on('mouseover', function(d, i) {
                var id = d3.select(this).attr('class');
                d3.selectAll("#" + id)
                    .transition()
                    .duration(100)
                    .attr('stroke-width', 4)
                    .attr('stroke', 'yellow')
            })
            .on('mouseout', function(d, i) {
                var id = d3.select(this).attr('class');
                d3.selectAll("#" + id)
                    .transition()
                    .duration(100)
                    .attr('stroke-width', 1)
                    .attr('stroke', 'black')
            })
    }
  
   myLogger.debug("done addLegend");
  }










// Not Needed


function addOwrdWellConstruction(svgContainer,
                                 x_min,
                                 x_max,
                                 y_min,
                                 y_max,
                                 x_box_min,
                                 x_box_max,
                                 y_box_min,
                                 y_box_max,
                                 wellConstruction,
                                 constructionDefs,
                                 tooltip) {
    myLogger.info("addOwrdWellConstruction");
    myLogger.info(wellConstruction);
    myLogger.info(constructionDefs);

    // Set
    //
    let Legend     = [];
    let LegendList = [];

    // Set
    //
    var y_range    = y_max - y_min;
    var y_axis     = y_box_max - y_box_min;

    // wellBore
    //
    var wellBore    = svgContainer.append("g")
        .attr("class", "wellBore")

    var protocol    = window.location.protocol; // Returns protocol only
    var host        = window.location.host;     // Returns host only
    var pathname    = window.location.pathname; // Returns path only
    var url         = window.location.href;     // Returns full URL
    var origin      = window.location.origin;   // Returns base URL
    var webPage     = (pathname.split('/'))[1];

    var defs        = d3.select("#definitions")
    if(!defs[0]) {
        var defs = svgContainer.append("defs")
            .attr('id', 'definitions')
    }

    // Loop through construction
    //
    if(wellConstruction) {

        // Prepare 
        //
        let x_min   = wellConstruction.minDia;
        let dia_max = wellConstruction.maxDia;
        [x_min, x_max, x_interval] = get_max_min( 0.0, dia_max);
        x_max += x_interval * 4;
        x_range                    = x_max - x_min;

        // Construction record
        //
        var wellRecord  = wellConstruction.gw_cons;
        if(wellRecord) {

            // Prepare seal attributes
            //
            let sealRecords = constructionDefs.seal_cd.Codes;
            myLogger.debug(sealRecords);
            let sealDict   = {};
            for(myCode in sealRecords) {
                var Record = sealRecords[myCode];
                sealDict[Record[0]] = Record[1];
            }
            myLogger.debug(sealDict);
            
            for(let i = 0; i < wellRecord.length; i++) {
                var Record = wellRecord[i];

                if(Record.seal_depth_va.toString().length > 0) {
                    var seal_code     = Record.seal_cd;
                    var seal_depth_va = Record.seal_depth_va;
                    var seal_ds       = Record.seal_ds;
                    var seal_color    = Record.seal_cl;

                    if(!seal_ds) { seal_ds = "Unknown"; }
                    if(sealDict[seal_ds]) { seal_color = sealDict[seal_ds]; }
                    if(!seal_color) { seal_color = "#ED9EE9"; }

                    var legendEntry   = ["Seal,", seal_ds].join(" ")
                    var color         = ""

                    // Build legend
                    //
                    if(LegendList.indexOf(legendEntry) < 0) {
                        var id          = fill_id
                        var svg_file    = fill_image
                        //var link_http   = [protocol + '/', host, webPage, svg_file].join("/");
                        var link_http   = ["lithology_patterns", svg_file].join("/");

                        var pattern     = defs.append("pattern")
                            .attr('id', id)
                            .attr('patternUnits', 'userSpaceOnUse')
                            .attr('width', 100)
                            .attr('height', 100)

                        var myimage     = pattern.append('image')
                            .attr('xlink:href', link_http)
                            .attr('width', 100)
                            .attr('height', 100)
                            .attr('x', 0)
                            .attr('y', 0)

                        LegendList.push(legendEntry);
                        Legend.push({
                            'id': ['seal_', seal_code].join(""),
                            'description': legendEntry,
                            'color': seal_color,
                            'image': fill_id
                        })
                    }

                    var top_depth = 0.0;
                    var bot_depth = parseFloat(seal_depth_va);

                    var x_mid     = ( x_box_max + x_box_min ) * 0.5;
                    //var width     = ( x_box_max - x_box_min ) * 0.9;
                    var max_width = x_axis * dia_max / x_range;
                    var width     = max_width + ( x_box_max - x_box_min - max_width) * 0.3;
                    var x         = x_mid - 0.5 * width

                    var y_top     = y_box_min + y_axis * (top_depth - y_min) / y_range
                    var y_bot     = y_box_min + y_axis * (bot_depth - y_min) / y_range
                    var thickness = y_bot - y_top

                    var toolTip   = ["Seal,", seal_ds, "from", top_depth, "to", bot_depth, "feet"].join(" ");
                    var data      = [ {x:x_box_min, tooltip: toolTip}];
                    var Seal      = wellBore.append("g")
                        .data(data);
                    var myRect    = Seal.append("rect")
                        .attr('id', ['seal_', seal_code].join(""))
                        .attr('class', 'seal')
                        .attr('x', x)
                        .attr('y', y_top)
                        .attr('width', width)
                        .attr('height', thickness)
                        .attr('fill', seal_color)
                        .attr('stroke', 'black')
                        .attr('stroke-width', 1)
                        .on("mousemove", function(event, d) {
                            tooltip
                                .style("left", event.pageX + "px")
                                .style("top", event.pageY + "px")
                                .style("display", "inline-block")
                                .html(d.tooltip);
                        })
                        .on("mouseout", function(d){ tooltip.style("display", "none");});
                    //myRect.append("title")
                    //      .text(function(d) { return toolTip; });
                }
            }
        }

        // Hole record
        //
        var wellRecord = wellConstruction.gw_hole;
        if(wellRecord) {
            for(let i = 0; i < wellRecord.length; i++) {
                var Record         = wellRecord[i];

                var hole_top_va    = Record.hole_top_va;
                var hole_bottom_va = Record.hole_bottom_va;
                var hole_dia_va    = Record.hole_dia_va;

                var top_depth      = parseFloat(hole_top_va);
                var bot_depth      = parseFloat(hole_bottom_va);
                var hole_height    = parseFloat(hole_bottom_va);

                var x_mid          = ( x_box_max + x_box_min ) * 0.5;
                var width          = x_axis * hole_dia_va / x_range
                var x              = x_mid - 0.5 * width

                var y_top          = y_box_min + y_axis * (top_depth - y_min) / y_range
                var y_bot          = y_box_min + y_axis * (bot_depth - y_min) / y_range
                var thickness      = y_bot - y_top

                var toolTip        = ["Borehole diameter", hole_dia_va, "inches from", top_depth, "to", bot_depth, "feet"].join(" ");
                var data           = [ {x:x, tooltip: toolTip}];
                var Hole           = wellBore.append("g")
                    .data(data);

                var myRect         = Hole.append("rect")
                    .attr('class', 'hole')
                    .attr('id', 'hole')
                    .attr('class', 'hole')
                    .attr('x', x)
                    .attr('y', y_top)
                    .attr('width', width)
                    .attr('height', thickness)
                    .attr('fill', 'white')
                    .attr('stroke', 'black')
                    .attr('stroke-width', 1)
                    .on("mousemove", function(event, d) {
                        tooltip
                            .style("left", event.pageX + "px")
                            .style("top", event.pageY + "px")
                            .style("display", "inline-block")
                            .html(d.tooltip);
                    })
                    .on("mouseout", function(d){ tooltip.style("display", "none");});
                //myRect.append("title")
                //      .text(function(d) { return toolTip; });
            }
        }

        // Casing record
        //
        myLogger.debug('Casing');
        var wellRecord = wellConstruction.gw_csng;
        if(wellRecord) {

            // Prepare casing attributes
            //
            let csngRecords = constructionDefs.csng_material_cd.Codes;
            myLogger.debug(csngRecords);
            let csngDict   = {};
            for(myCode in csngRecords) {
                var Record = csngRecords[myCode];
                csngDict[Record[0].toUpperCase()] = Record[1];
            }
            myLogger.info('csngDict');
            myLogger.info(csngDict);

            myLogger.debug('Casing record');
            for(let i = 0; i < wellRecord.length; i++) {
                var Record         = wellRecord[i];
                myLogger.debug(Record);

                var csng_top_va    = Record.csng_top_va;
                var csng_bottom_va = Record.csng_bottom_va;
                var csng_dia_va    = Record.csng_dia_va;
                var csng_code      = Record.csng_material_cd;
                var csng_material  = Record.csng_material_ds.toUpperCase();
                var csng_color     = Record.csng_material_cl;

                if(!csng_material) { csng_material = "Not recorded"; }
                if(csngDict[csng_material]) { csng_color = csngDict[csng_material]; }
                var legendEntry    = ["Casing,", csng_material].join(" ")
                myLogger.debug(csng_color);

                // Build legend
                //
                if(LegendList.indexOf(legendEntry) < 0) {
                    var id          = fill_id
                    var svg_file    = fill_image
                    //var link_http   = [protocol + '/', host, webPage, svg_file].join("/");
                    var link_http   = ["lithology_patterns", svg_file].join("/");

                    var pattern     = defs.append("pattern")
                        .attr('id', id)
                        .attr('patternUnits', 'userSpaceOnUse')
                        .attr('width', 100)
                        .attr('height', 100)

                    var myimage     = pattern.append('image')
                        .attr('xlink:href', link_http)
                        .attr('width', 100)
                        .attr('height', 100)
                        .attr('x', 0)
                        .attr('y', 0)

                    LegendList.push(legendEntry);
                    Legend.push({
                        'id': ['casing_', csng_code].join(""),
                        'description': legendEntry,
                        'color': csng_color,
                        'image': fill_id
                    })
                }

                var top_depth      = parseFloat(csng_top_va);
                var bot_depth      = parseFloat(csng_bottom_va);

                var x_mid          = ( x_box_max + x_box_min ) * 0.5;
                var width          = x_axis * csng_dia_va / x_range
                var x              = x_mid - 0.5 * width

                var y_top          = y_box_min + y_axis * (top_depth - y_min) / y_range
                var y_bot          = y_box_min + y_axis * (bot_depth - y_min) / y_range
                var thickness      = y_bot - y_top

                var toolTip        = [csng_material, "casing diameter", csng_dia_va, "inches from", top_depth, "to", bot_depth, "feet"].join(" ");
                var data           = [ {x:x, tooltip: toolTip}];
                var Casing         = wellBore.append("g")
                    .data(data);

                var myRect         = Casing.append("rect")
                    .attr('id', ['casing_', csng_code].join(""))
                    .attr('class', 'csng')
                    .attr('x', x)
                    .attr('y', y_top)
                    .attr('width', width)
                    .attr('height', thickness)
                    .attr('fill', csng_color)
                    .attr('stroke', 'black')
                    .attr('stroke-width', 1)
                    .on("mousemove", function(event, d) {
                        tooltip
                            .style("left", event.pageX + "px")
                            .style("top", event.pageY + "px")
                            .style("display", "inline-block")
                            .html(d.tooltip);
                    })
                    .on("mouseout", function(d){ tooltip.style("display", "none");});
            }
        }
        // Open interval record
        //
        var wellRecord = wellConstruction.gw_open;
        if(wellRecord) {

            // Prepare open interval attributes
            //
            let openRecords = constructionDefs.open_cd.Codes;
            myLogger.info(openRecords);
            let openDict   = {};
            for(myCode in openRecords) {
                var Record = openRecords[myCode];
                openDict[Record[0].toUpperCase()] = Record[1];
            }
            myLogger.info('openDict');
            myLogger.info(openDict);

            for(let i = 0; i < wellRecord.length; i++) {
                var Record         = wellRecord[i];
                myLogger.info(Record);

                var open_top_va    = Record.open_top_va;
                var open_bottom_va = Record.open_bottom_va;
                var open_dia_va    = Record.open_dia_va;
                var open_code      = Record.open_cd;
                var open_material  = Record.open_material_cd;
                var open_type      = Record.open_ds.toUpperCase();
                var fill_id        = '001.svg';
                if(openDict[open_type]) { fill_id = openDict[open_type]; }
                var fill_image     = fill_id;
                var url            = 'url(#' + fill_id + ')'
                var legendEntry    = ["Open interval,", open_type].join(" ")

                var open_dia_va_ds = "";
                if(open_dia_va.toString().length > 0) { open_dia_va_ds = ["diameter", open_dia_va, "inches,"].join(" "); }

                // Build legend
                //
                if(LegendList.indexOf(legendEntry) < 0) {
                    var id          = fill_id
                    var svg_file    = fill_image
                    //var link_http   = [protocol + '/', host, webPage, svg_file].join("/");
                    var link_http   = ["lithology_patterns", svg_file].join("/");

                    var pattern     = defs.append("pattern")
                        .attr('id', id)
                        .attr('patternUnits', 'userSpaceOnUse')
                        .attr('width', 100)
                        .attr('height', 100)

                    var myimage     = pattern.append('image')
                        .attr('xlink:href', link_http)
                        .attr('width', 100)
                        .attr('height', 100)
                        .attr('x', 0)
                        .attr('y', 0)

                    LegendList.push(legendEntry);
                    Legend.push({
                        'id': ['open_', open_code].join(""),
                        'description': legendEntry,
                        'image': fill_id
                    })
                }

                var top_depth      = parseFloat(open_top_va);
                var bot_depth      = parseFloat(open_bottom_va);

                var x_mid          = ( x_box_max + x_box_min ) * 0.5;
                var width          = x_axis * open_dia_va / x_range
                var x              = x_mid - 0.5 * width

                var y_top          = y_box_min + y_axis * (top_depth - y_min) / y_range
                var y_bot          = y_box_min + y_axis * (bot_depth - y_min) / y_range
                var thickness      = y_bot - y_top

                var toolTip        = ["Open interval, ", open_dia_va_ds, open_type, "from", top_depth, "to", bot_depth, "feet"].join(" ");
                var data           = [ {x:x, tooltip: toolTip}];
                var Open           = wellBore.append("g")
                    .data(data);
                var myRect         = Open.append("rect")
                    .attr('id', ['open_', open_code].join(""))
                    .attr('class', 'open')
                    .attr('x', x)
                    .attr('y', y_top)
                    .attr('width', width)
                    .attr('height', thickness)
                    .attr('fill', url)
                    .attr('stroke', 'black')
                    .attr('stroke-width', 1)
                    .on("mousemove", function(event, d) {
                        tooltip
                            .style("left", event.pageX + "px")
                            .style("top", event.pageY + "px")
                            .style("display", "inline-block")
                            .html(d.tooltip);
                    })
                    .on("mouseout", function(d){ tooltip.style("display", "none");});
                //myRect.append("title")
                //     .text(function(d) { return toolTip; });
            }
        }
    }

    // Construction legend
    //
    constructionLegend(svgContainer, LegendList, Legend)

    // Wellbore axis
    //
    labelWellboreDiameter(
        svgContainer,
        x_box_min,
        x_box_max,
        y_box_min,
        y_box_max,
        0.0,
        x_max,
        "Borehole Diameter, inches"
    );
}

function addUsgsWellConstruction(svgContainer,
                                 x_min,
                                 x_max,
                                 y_min,
                                 y_max,
                                 x_box_min,
                                 x_box_max,
                                 y_box_min,
                                 y_box_max,
                                 myConstruction,
                                 constructionDefs,
                                 tooltip) {
    myLogger.info("addUsgsWellConstruction");
    myLogger.info(myConstruction);
    myLogger.info(constructionDefs);
    myLogger.info(`X-axis information max ${x_max} min ${x_min} x_interval ${x_interval}`);

    let wellConstruction = myConstruction.well_construction;

    // Set
    //
    let Legend     = [];
    let LegendList = [];

    // Set
    //
    let dia_max    = x_max;
    let x_range    = x_max - x_min;
    let y_range    = y_max - y_min;
    let y_axis     = y_box_max - y_box_min;

    // wellBore
    //
    var wellBore    = svgContainer.append("g")
        .attr("class", "wellBore")

    var protocol    = window.location.protocol; // Returns protocol only
    var host        = window.location.host;     // Returns host only
    var pathname    = window.location.pathname; // Returns path only
    var url         = window.location.href;     // Returns full URL
    var origin      = window.location.origin;   // Returns base URL
    var webPage     = (pathname.split('/'))[1];

    var defs        = d3.select("#definitions")
    if(!defs[0]) {
        var defs = svgContainer.append("defs")
            .attr('id', 'definitions')
    }

    // Loop through construction
    //
    if(wellConstruction) {

        // Construction record
        //
        var wellRecord  = wellConstruction.gw_cons;
        if(wellRecord) {

            // Prepare seal attributes
            //
            let sealDict = constructionDefs.seal_cd.Codes;
            myLogger.debug(wellRecord);
            
            for(let i = 0; i < wellRecord.length; i++) {
                var Record = wellRecord[i];

                if(Record.seal_depth_va.toString().length > 0) {
                    var seal_code     = Record.seal_cd;
                    var seal_depth_va = Record.seal_depth_va;
                    var seal_ds       = Record.seal_ds;
                    var seal_color    = Record.seal_cl;

                    if(!seal_ds) { seal_ds = "Unknown"; }
                    if(!seal_color) { seal_color = "#ED9EE9"; }

                    var legendEntry   = ["Seal,", seal_ds].join(" ")
                    var color         = ""

                    // Build legend
                    //
                    if(LegendList.indexOf(legendEntry) < 0) {
                        var id          = fill_id
                        var svg_file    = fill_image
                        //var link_http   = [protocol + '/', host, webPage, svg_file].join("/");
                        var link_http   = ["lithology_patterns", svg_file].join("/");

                        var pattern     = defs.append("pattern")
                            .attr('id', id)
                            .attr('patternUnits', 'userSpaceOnUse')
                            .attr('width', 100)
                            .attr('height', 100)

                        var myimage     = pattern.append('image')
                            .attr('xlink:href', link_http)
                            .attr('width', 100)
                            .attr('height', 100)
                            .attr('x', 0)
                            .attr('y', 0)

                        LegendList.push(legendEntry);
                        Legend.push({
                            'id': ['seal_', seal_code].join(""),
                            'description': legendEntry,
                            'color': seal_color,
                            'image': fill_id
                        })
                    }

                    var top_depth = 0.0;
                    var bot_depth = parseFloat(seal_depth_va);

                    var x_mid     = x_box_min + ( x_box_max - x_box_min ) * 0.5;
                    var width     = ( x_box_max - x_box_min ) * 0.8;
                    var x         = x_mid - width * 0.5;

                    var y_top     = y_box_min + y_axis * (top_depth - y_min) / y_range
                    var y_bot     = y_box_min + y_axis * (bot_depth - y_min) / y_range
                    var thickness = y_bot - y_top

                    var toolTip   = ["Seal,", seal_ds, "from", top_depth, "to", bot_depth, "feet"].join(" ");
                    var data      = [ {x:x_box_min, tooltip: toolTip}];
                    var Seal      = wellBore.append("g")
                        .data(data);
                    var myRect    = Seal.append("rect")
                        .attr('id', ['seal_', seal_code].join(""))
                        .attr('class', 'seal')
                        .attr('x', x)
                        .attr('y', y_top)
                        .attr('width', width)
                        .attr('height', thickness)
                        .attr('fill', seal_color)
                        .attr('stroke', 'black')
                        .attr('stroke-width', 1)
                        .on("mousemove", function(event, d) {
                            tooltip
                                .style("left", event.pageX + "px")
                                .style("top", event.pageY + "px")
                                .style("display", "inline-block")
                                .html(d.tooltip);
                        })
                        .on("mouseout", function(d){ tooltip.style("display", "none");});
                    //myRect.append("title")
                    //      .text(function(d) { return toolTip; });
                }
            }
        }

        // Hole record
        //
        var wellRecord = wellConstruction.gw_hole;
        if(wellRecord) {
            for(let i = 0; i < wellRecord.length; i++) {
                var Record         = wellRecord[i];

                var hole_top_va    = Record.hole_top_va;
                var hole_bottom_va = Record.hole_bottom_va;
                var hole_dia_va    = Record.hole_dia_va;

                var top_depth      = parseFloat(hole_top_va);
                var bot_depth      = parseFloat(hole_bottom_va);
                var hole_height    = parseFloat(hole_bottom_va);

                var x_mid          = ( x_box_max + x_box_min ) * 0.5;
                var width          = x_axis * hole_dia_va / x_range
                var x              = x_mid - 0.5 * width

                var y_top          = y_box_min + y_axis * (top_depth - y_min) / y_range
                var y_bot          = y_box_min + y_axis * (bot_depth - y_min) / y_range
                var thickness      = y_bot - y_top

                var toolTip        = ["Borehole diameter", hole_dia_va, "inches from", top_depth, "to", bot_depth, "feet"].join(" ");
                var data           = [ {x:x, tooltip: toolTip}];
                var Hole           = wellBore.append("g")
                    .data(data);

                var myRect         = Hole.append("rect")
                    .attr('class', 'hole')
                    .attr('id', 'hole')
                    .attr('class', 'hole')
                    .attr('x', x)
                    .attr('y', y_top)
                    .attr('width', width)
                    .attr('height', thickness)
                    .attr('fill', 'white')
                    .attr('stroke', 'black')
                    .attr('stroke-width', 1)
                    .on("mousemove", function(event, d) {
                        tooltip
                            .style("left", event.pageX + "px")
                            .style("top", event.pageY + "px")
                            .style("display", "inline-block")
                            .html(d.tooltip);
                    })
                    .on("mouseout", function(d){ tooltip.style("display", "none");});
                //myRect.append("title")
                //      .text(function(d) { return toolTip; });
            }
        }

        // Casing record
        //
        myLogger.debug('Casing');
        var wellRecord = wellConstruction.gw_csng;
        if(wellRecord) {

            myLogger.debug('Casing record');
            for(let i = 0; i < wellRecord.length; i++) {
                var Record         = wellRecord[i];
                myLogger.debug(Record);

                var csng_top_va    = Record.csng_top_va;
                var csng_bottom_va = Record.csng_bottom_va;
                var csng_dia_va    = Record.csng_dia_va;
                var csng_code      = Record.csng_material_cd;
                var csng_material  = Record.csng_material_ds.toUpperCase();
                var csng_color     = Record.csng_material_cl;

                if(!csng_material) { csng_material = "Not recorded"; }
                var legendEntry    = ["Casing,", csng_material].join(" ")
                myLogger.debug(csng_color);

                // Build legend
                //
                if(LegendList.indexOf(legendEntry) < 0) {
                    var id          = fill_id
                    var svg_file    = fill_image
                    //var link_http   = [protocol + '/', host, webPage, svg_file].join("/");
                    var link_http   = ["lithology_patterns", svg_file].join("/");

                    var pattern     = defs.append("pattern")
                        .attr('id', id)
                        .attr('patternUnits', 'userSpaceOnUse')
                        .attr('width', 100)
                        .attr('height', 100)

                    var myimage     = pattern.append('image')
                        .attr('xlink:href', link_http)
                        .attr('width', 100)
                        .attr('height', 100)
                        .attr('x', 0)
                        .attr('y', 0)

                    LegendList.push(legendEntry);
                    Legend.push({
                        'id': ['casing_', csng_code].join(""),
                        'description': legendEntry,
                        'color': csng_color,
                        'image': fill_id
                    })
                }

                var top_depth      = parseFloat(csng_top_va);
                var bot_depth      = parseFloat(csng_bottom_va);

                var x_mid          = ( x_box_max + x_box_min ) * 0.5;
                var width          = x_axis * csng_dia_va / x_range
                var x              = x_mid - 0.5 * width

                var y_top          = y_box_min + y_axis * (top_depth - y_min) / y_range
                var y_bot          = y_box_min + y_axis * (bot_depth - y_min) / y_range
                var thickness      = y_bot - y_top

                var toolTip        = [csng_material, "casing diameter", csng_dia_va, "inches from", top_depth, "to", bot_depth, "feet"].join(" ");
                var data           = [ {x:x, tooltip: toolTip}];
                var Casing         = wellBore.append("g")
                    .data(data);

                var myRect         = Casing.append("rect")
                    .attr('id', ['casing_', csng_code].join(""))
                    .attr('class', 'csng')
                    .attr('x', x)
                    .attr('y', y_top)
                    .attr('width', width)
                    .attr('height', thickness)
                    .attr('fill', csng_color)
                    .attr('stroke', 'black')
                    .attr('stroke-width', 1)
                    .on("mousemove", function(event, d) {
                        tooltip
                            .style("left", event.pageX + "px")
                            .style("top", event.pageY + "px")
                            .style("display", "inline-block")
                            .html(d.tooltip);
                    })
                    .on("mouseout", function(d){ tooltip.style("display", "none");});
            }
        }
        // Open interval record
        //
        var wellRecord = wellConstruction.gw_open;
        if(wellRecord) {

            for(let i = 0; i < wellRecord.length; i++) {
                var Record         = wellRecord[i];

                var open_top_va    = Record.open_top_va;
                var open_bottom_va = Record.open_bottom_va;
                var open_dia_va    = Record.open_dia_va;
                var open_code      = Record.open_cd;
                var open_material  = Record.open_material_cd;
                var open_type      = Record.open_ds.toUpperCase();
                var fill_id        = '001.svg';
                var fill_image     = fill_id;
                var url            = 'url(#' + fill_id + ')'
                var legendEntry    = ["Open interval,", open_type].join(" ")

                var open_dia_va_ds = "";
                if(open_dia_va.toString().length > 0) { open_dia_va_ds = ["diameter", open_dia_va, "inches,"].join(" "); }

                // Build legend
                //
                if(LegendList.indexOf(legendEntry) < 0) {
                    var id          = fill_id
                    var svg_file    = fill_image
                    //var link_http   = [protocol + '/', host, webPage, svg_file].join("/");
                    var link_http   = ["lithology_patterns", svg_file].join("/");

                    var pattern     = defs.append("pattern")
                        .attr('id', id)
                        .attr('patternUnits', 'userSpaceOnUse')
                        .attr('width', 100)
                        .attr('height', 100)

                    var myimage     = pattern.append('image')
                        .attr('xlink:href', link_http)
                        .attr('width', 100)
                        .attr('height', 100)
                        .attr('x', 0)
                        .attr('y', 0)

                    LegendList.push(legendEntry);
                    Legend.push({
                        'id': ['open_', open_code].join(""),
                        'description': legendEntry,
                        'image': fill_id
                    })
                }

                var top_depth      = parseFloat(open_top_va);
                var bot_depth      = parseFloat(open_bottom_va);

                var x_mid          = ( x_box_max + x_box_min ) * 0.5;
                var width          = x_axis * open_dia_va / x_range
                var x              = x_mid - 0.5 * width

                var y_top          = y_box_min + y_axis * (top_depth - y_min) / y_range
                var y_bot          = y_box_min + y_axis * (bot_depth - y_min) / y_range
                var thickness      = y_bot - y_top

                var toolTip        = ["Open interval, ", open_dia_va_ds, open_type, "from", top_depth, "to", bot_depth, "feet"].join(" ");
                var data           = [ {x:x, tooltip: toolTip}];
                var Open           = wellBore.append("g")
                    .data(data);
                var myRect         = Open.append("rect")
                    .attr('id', ['open_', open_code].join(""))
                    .attr('class', 'open')
                    .attr('x', x)
                    .attr('y', y_top)
                    .attr('width', width)
                    .attr('height', thickness)
                    .attr('fill', url)
                    .attr('stroke', 'black')
                    .attr('stroke-width', 1)
                    .on("mousemove", function(event, d) {
                        tooltip
                            .style("left", event.pageX + "px")
                            .style("top", event.pageY + "px")
                            .style("display", "inline-block")
                            .html(d.tooltip);
                    })
                    .on("mouseout", function(d){ tooltip.style("display", "none");});
                //myRect.append("title")
                //     .text(function(d) { return toolTip; });
            }
        }
    }

    // Construction legend
    //
    constructionLegend(svgContainer, LegendList, Legend)

    // Wellbore axis
    //
    labelWellboreDiameter(
        svgContainer,
        x_box_min,
        x_box_max,
        y_box_min,
        y_box_max,
        0.0,
        x_max,
        "Borehole Diameter, inches"
    );
}
