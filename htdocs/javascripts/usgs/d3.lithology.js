/**
 * Namespace: D3_Lithology
 *
 * D3_Lithology is a JavaScript library to provide a set of functions to build
 *  well lithology column in svg format.
 *
 * version 3.19
 * January 2, 2025
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
// https://www.google.com/search?q=javascript+create+new+array+from+existing+array+of+objects&client=firefox-b-1-d&sca_esv=bc26b88b20004dbc&ei=QSMsZ43tGaTK0PEPl5GJsAQ&oq=javascript+create+new+array+from+array&gs_lp=Egxnd3Mtd2l6LXNlcnAiJmphdmFzY3JpcHQgY3JlYXRlIG5ldyBhcnJheSBmcm9tIGFycmF5KgIIAjIFEAAYgAQyBhAAGAcYHjIGEAAYBxgeMgQQABgeMgYQABgIGB4yBhAAGAgYHjIGEAAYCBgeMgYQABgIGB4yCxAAGIAEGIYDGIoFMgsQABiABBiGAxiKBUismQFQ9h1Y_GVwAngBkAEAmAFToAHtC6oBAjIxuAEByAEA-AEBmAIWoALqDMICChAAGLADGNYEGEfCAg0QABiABBiwAxhDGIoFwgIHEAAYgAQYDcICCxAAGIAEGJECGIoFwgIIEAAYBxgIGB7CAggQABgIGA0YHpgDAIgGAZAGCpIHAjIyoAewuwE&sclient=gws-wiz-serp

// Set globals
//
var svg;
var jsonData;
var lithologyData;

//var svg_width   = '60rem';
//var svg_height  = '50rem';

var svg_width   = '800';
var svg_height  = '700';
var viewBox     = `0 0 ${svg_width} ${svg_height}`;

var y_min, y_max, y_interval, y_range;
var y_box_min   = 50;
var y_box_max   = 650;
var y_axis      = y_box_max - y_box_min;

var x_min, x_max, x_interval, x_range;
var x_box_min   = 75;
var x_box_width = 200;
var x_box_max   = x_box_min + x_box_width;
var x_axis      = x_box_max - x_box_min;

var x_legend    = x_box_max + 100
var y_legend    = y_box_min
var legend_box  = 20
var y_top       = y_box_min


// Plot lithology column
//
function plotLithology([
    siteData,
    lithologyData,
    WellConstruction,
    LithologyLegend,
    ConstructionLegend]) {
    
    myLogger.info("plotLithology");
    myLogger.info(siteData);
    myLogger.info('lithologyData');
    myLogger.info(lithologyData);
    myLogger.info('WellConstruction');
    myLogger.info(WellConstruction);
    myLogger.info('LithologyLegend');
    myLogger.info(LithologyLegend);
    myLogger.info('ConstructionLegend');
    myLogger.info(ConstructionLegend);

    // Fade modal dialog
    //
    fadeModal(1000);

    // Add tooltip
    //
    var tooltip = addToolTip();

    // SVG canvas
    //
    var svg = d3.select("#svgCanvas")
        .attr("title", "Lithology and Well Construction " + coop_site_no)
        .attr("version", 1.1)
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
        .attr('width', svg_width)
        .attr('height', svg_height)
        .attr('viewBox', viewBox)
        .attr('fill', 'white')

    // Draw bore hole
    //
    axisBox(
        svg,
        x_box_min,
        x_box_max,
        y_box_min,
        y_box_max,
        "none"
    );

    // Site information
    //
    station_nm    = siteData.station_nm;
    minDepth      = 0.0;
    maxDepth      = siteData.hole_depth_va;
    minDia        = 0.0;
    maxDia        = siteData.max_dia_va;
    land_surface  = siteData.alt_va;
    verticalDatum = siteData.alt_datum_cd;
    myLogger.info(`Site information well depth ${maxDepth} diameter ${maxDia} land surface ${land_surface} vertical datum ${verticalDatum}`);
    
    [y_min, y_max, y_interval] = get_max_min(minDepth, maxDepth);
    if(y_min < 0.0) { y_min = 0.0; }
    myLogger.info(`Y-axis information max ${y_max} min ${y_min} y_interval ${y_interval}`);

    [x_min, x_max, x_interval] = get_max_min(minDia, maxDia);
    if(x_min < 0.0) { x_min = 0.0; }
    x_max += x_interval * 4;
    myLogger.info(`X-axis information max ${x_max} min ${x_min} x_interval ${x_interval}`);

    // Prepare site title
    //
    let siteTitle = [];
    if(coop_site_no) { siteTitle.push(`OWRD ${coop_site_no}`); }
    if(site_no) { siteTitle.push(`USGS ${site_no}`); }
    if(station_nm) { siteTitle.push(`${station_nm}`); }

    // Add site information
    //
    var myRect = svg.append("g")
        .append("text")
        .attr('x', 0.0)
        .attr('y', y_box_min * 0.5)
        .style("text-anchor", "start")
        .style("font-family", "sans-serif")
        .style("font-weight", "700")
        .style("fill", 'black')
        .text(`Site ${siteTitle.join(' -- ')}`)

    // Show printing
    //
    jQuery('#printButton').show();

    // Lithology
    //
    if(lithologyData) {
        addLithology(
            svg,
            y_min,
            y_max,
            x_box_min,
            x_box_max,
            y_box_min,
            y_box_max,
            lithologyData,
            LithologyLegend,
            tooltip
        )
    }
    else {
        lithologyLegend(svg, [], 'No lithology reported');
    }

    // Construction
    //
    if(WellConstruction) {

        myLogger.info("WellConstruction");

        addWellConstruction(svg,
                                x_min,
                                x_max,
                                y_min,
                                y_max,
                                x_box_min,
                                x_box_max,
                                y_box_min,
                                y_box_max,
                                WellConstruction,
                                ConstructionLegend,
                                tooltip)
    }
    else {
        constructionLegend(svg, [], 'No well construction reported');
    }

    // Left y axis
    //
    yAxis(
        svg,
        x_box_min,
        x_box_max,
        y_box_min,
        y_box_max,
        y_min,
        y_max,
        'left',
        "Depth Below Land Surface, in feet"
    );

    // Right y axis (elevation)
    //
    var elevation_max = land_surface;
    var elevation_min = elevation_max - y_max;

    yAxis(
      svg,
      x_box_min,
      x_box_max,
      y_box_min,
      y_box_max,
      elevation_max,
      elevation_min,
      'right',
      'Elevation, in feet ' + verticalDatum
    );
    
    // Print svg to file
    //
    jQuery("#viewReport").click(function() {

        viewReport(site_no, coop_site_no, station_nm);
    });
    
    // Print svg to file
    //
    jQuery(".printSvg").click(function() {
        myLogger.info("printSvg method");
        //const svg = d3.select("#svgCanvas").node();
        //const svg = document.querySelector('svg');
        //const svgClone = svg.cloneNode(true);
        //svgClone.id = 'svgClone';
        //myLogger.info(svgClone);

        const svgClone = d3.select('svg')
              .clone(true)
              .attr('id', 'svgClone')

        // Modify the clone as needed for printing
        // ...
        myLogger.info('svgClone');
        myLogger.info(svgClone);
        var myUsgs = USGS_logo(svgClone, 'US Geological Survey', svg_width, svg_height, 45)
        const svgElement = document.querySelector('#svgClone');
        
        const svgString = new XMLSerializer().serializeToString(svgElement);
        svgElement.remove()

        const printWindow = window.open('', '_blank', '');
        printWindow.document.write(`<html><head><title>${siteTitle}</title></head><body>`);
        printWindow.document.write(svgString);
        printWindow.document.write("</body></html>");
        printWindow.document.close();

        printWindow.print();        //writeDownloadLink(svg, 'test.svg');
    });
}

function addLithology(
    svgContainer,
    y_min,
    y_max,
    x_box_min,
    x_box_max,
    y_box_min,
    y_box_max,
    lithologyData,
    LithologyLegend,
    tooltip) {

    myLogger.info('addLithology');
    myLogger.info('lithologyData');
    myLogger.info(lithologyData);
    myLogger.info('LithologyLegend');
    myLogger.info(LithologyLegend);

    // Set
    //
    let y_range = y_max - y_min;
    let y_axis  = y_box_max - y_box_min;

    // Set defs section of svg
    //
    buildDefs(svgContainer, LithologyLegend);
              
    // Loop through lithology
    //
    for(let i = 0; i < lithologyData.length; i++) {

        let lithRecord  = lithologyData[i];
        myLogger.debug(lithRecord);

        let id          = lithRecord.id;
        let top_depth   = lithRecord.top_depth;
        let bot_depth   = lithRecord.bot_depth;
        let description = lithRecord.description;
        let symbol      = lithRecord.symbol;
        let color       = lithRecord.color;

        // Add lithology if bottom depth is defined
        //
        if(bot_depth) {

            let width       = x_box_max - x_box_min

            let y_top       = y_box_min + y_axis * (top_depth - y_min) / y_range
            let y_bot       = y_box_min + y_axis * (bot_depth - y_min) / y_range
            let thickness   = y_bot - y_top

            // Add color
            //
            if(color && color.length > 0) {
                let lithology   = svgContainer.append("g")
                    .attr("class", "lithology")
                let myRect      = lithology.append("rect")
                    .attr('x', x_box_min)
                    .attr('y', y_top)
                    .attr('width', width)
                    .attr('height', thickness)
                    .attr('fill', color)
            }

            // Add lith pattern
            //
            let toolTip     = [description, "from", top_depth, "to", bot_depth, "feet"].join(" ");
            let data        = [ {x:x_box_min, tooltip: toolTip}];

            let lithology = svgContainer.append("g")
                .attr("class", "lithology")
                .data(data)

            let myRect = lithology.append("rect")
                .attr('id', id)
                .attr('class', 'lithology')
                .attr('x', x_box_min)
                .attr('y', y_top)
                .attr('width', width)
                .attr('height', thickness)
                .attr('fill', `url(#${id})`)
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
    
    // Add and fade last lithology if needed
    //
    let lithRecord  = lithologyData[lithologyData.length - 1];
    myLogger.info('Last lithology');
    myLogger.info(lithRecord);

    let id          = lithRecord.id;
    let top_depth   = lithRecord.top_depth;
    let bot_depth   = lithRecord.bot_depth;
    let description = lithRecord.description;
    let symbol      = lithRecord.symbol;
    let color       = lithRecord.color;

    if(top_depth && bot_depth) {
        top_depth = bot_depth;
        bot_depth = y_max;
    }
    else if(top_depth) {
        bot_depth = y_max;
    }
    myLogger.info(`  Lithology ${description} Top ${top_depth} Bottom ${bot_depth}`);

    let width       = x_box_max - x_box_min

    let y_top       = y_box_min + y_axis * (top_depth - y_min) / y_range
    let y_bot       = y_box_min + y_axis * (bot_depth - y_min) / y_range
    let thickness   = y_bot - y_top

    let toolTip     = [description, "from", top_depth, "to ?? depth"].join(" ");
    let data        = [ {x:x_box_min, tooltip: toolTip}];
 
    let lithology = svgContainer.append("g")
        .attr("class", "lastLithology")
        .data(data)

    let myRect = lithology.append("rect")
        .attr('id', id)
        .attr('class', 'lithology')
        .attr('x', x_box_min)
        .attr('y', y_top)
        .attr('width', width)
        .attr('height', thickness)
        .attr('fill', `url(#${id})`)
        .attr('stroke', 'white')
        .attr('stroke-width', 1)

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
   
    let lastGradient = defs.append('linearGradient')
        .attr('id', 'lastGradient')
        .attr('x1', '0%')
        .attr('x2', '0%')
        .attr('y1', '0%')
        .attr('y2', '100%')
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("spreadMethod", "pad");

    lastGradient.append('stop')
        .attr('class', 'start')
        .attr('offset', '0%')
        .attr('stop-color', 'transparent')
        .attr('stop-opacity', 1);

    lastGradient.append('stop')
        .attr('class', 'end')
        .attr('offset', '100%')
        .attr('stop-color', 'white')
        .attr('stop-opacity', 1);

    let myLast = lithology.append("rect")
        .attr('id', id)
        .attr('class', 'lithology')
        .attr('x', x_box_min)
        .attr('y', y_top)
        .attr('width', width)
        .attr('height', thickness)
        .attr('fill', 'url(#lastGradient)')
        .attr('fill-opacity', 1)
        .attr('stroke', 'white')
        .attr('stroke-width', 1)
        .on("mousemove", function(event, d) {
            tooltip
                .style("left", event.pageX + "px")
                .style("top", event.pageY + "px")
                .style("display", "inline-block")
                .html(d.tooltip);
        })
        .on("mouseout", function(d){ tooltip.style("display", "none");});
    
    // Add unknown ?? text to bottom
    //
    let textInfo    = textSize('?-?-?-?-?-?');
    let text_height = textInfo.height;
    
    let myText = lithology.append("text")
        .attr('x', x_box_min + 0.5 * (x_box_max - x_box_min))
        .attr('y', y_bot + (y_box_max - y_bot) * 0.5 - text_height * 0.5)
        .style("text-anchor", "middle")
        .style("font-family", "sans-serif")
        .style("font-size", "1rem")
        .style("font-weight", "600")
        .style("opacity", 1)
        .style("fill", 'black')
        .text('?-?-?-?-?-?')

    // Add lithology legend
    //
    lithologyLegend(svgContainer, LithologyLegend, 'Lithology')
  }

function buildDefs(svgContainer, lithologyDefs) {
    myLogger.info("addLegend");
    myLogger.info(lithologyData);
    myLogger.info(lithologyDefs);

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
    for(let i = 0; i < lithologyDefs.length; i++) {

        let id          = lithologyDefs[i].id;
        let description = lithologyDefs[i].description;
        let symbol      = lithologyDefs[i].symbol;

        // Build legend
        //
        let pattern = defs.append("pattern")
            .attr('id', id)
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

    return;
  }

function lithologyLegend(svgContainer, myLegend, myTitle) {
    myLogger.info("lithologyLegend");
    myLogger.info(myLegend);

    // Set legend
    //
    let descriptions = svgContainer.append("g")
        .attr("id", "lithology_descriptions")
        .attr("class", "legend_descriptions")

    // Set legend title
    //
    descriptions.append("rect")
        .attr('id', 'lithEntries')
        .attr('x', x_legend)
        .attr('y', y_top)
        .attr('width', 1)
        .attr('height', 1)
        .attr('fill', 'none')
        .attr('stroke', 'black')
        .attr('stroke-width', 0);
    descriptions.append("text")
        .attr('x', x_legend)
        .attr('y', y_top + legend_box * 0.75)
        .style("text-anchor", "start")
        .style("alignment-baseline", "center")
        .style("font-family", "sans-serif")
        .style("font-weight", "500")
        .style("fill", 'black')
        .text(myTitle);

    // Loop through lithology legend
    //
    for(let i = 0; i < myLegend.length; i++) {

        y_top += legend_box * 1.5

        let Record      = myLegend[i];
        
        let id          = Record.id
        let description = Record.description
        let symbol      = Record.symbol;

        myLogger.info(  `Legend lithology ${description} pattern ${symbol}`);

        let myRect = descriptions.append("rect")
            .attr('id', 'lithEntries')
            .attr('class', id)
            .attr('x', x_legend)
            .attr('y', y_top)
            .attr('width', legend_box)
            .attr('height', legend_box)
            .attr('fill', `url(#${id})`)
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

        let myText = descriptions.append("text")
            .style("text-anchor", "start")
            .style("alignment-baseline", "center")
            .style("font-family", "sans-serif")
            .style("font-weight", "300")
            .style("fill", 'black')
            .text(description)
            .attr('class', id)
            .attr('x', x_legend + legend_box * 1.25)
            .attr('y', y_top + legend_box * 0.75)
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
    }
  }










// Not Needed


function addOwrdLithology(
    svgContainer,
    y_min,
    y_max,
    x_box_min,
    x_box_max,
    y_box_min,
    y_box_max,
    lithologyData,
    LithologyLegend,
    tooltip) {

    myLogger.info('addLithology');
    myLogger.info('lithologyData');
    myLogger.info(lithologyData);
    myLogger.info('LithologyLegend');
    myLogger.info(LithologyLegend);

    // Set
    //
    var y_range     = y_max - y_min;
    var y_axis      = y_box_max - y_box_min;

    // Set defs section of svg
    //
    buildDefs(svgContainer, LithologyLegend);
              
    // Loop through lithology
    //
    for(let i = 0; i < lithologyData.length; i++) {

        var lithRecord  = lithologyData[i];
        myLogger.debug(lithRecord);

        var id          = lithRecord.svg;
        var lithCode    = lithRecord.lithology.replace(/\s+&\s+/g, '');
        var color       = lithRecord.color;
        var description = lithRecord.lithology_description;

       var top_depth   = parseFloat(lithRecord.start_depth);
       if(!top_depth) { top_depth = 0.0; }
        var bot_depth   = parseFloat(lithRecord.end_depth);

        var width       = x_box_max - x_box_min

        var y_top       = y_box_min + y_axis * (top_depth - y_min) / y_range
        var y_bot       = y_box_min + y_axis * (bot_depth - y_min) / y_range
        var thickness   = y_bot - y_top

        // Add color
        //
        if(color && color.length > 0) {
            var lithology   = svgContainer.append("g")
                .attr("class", "lithology")
            var myRect      = lithology.append("rect")
                .attr('x', x_box_min)
                .attr('y', y_top)
                .attr('width', width)
                .attr('height', thickness)
                .attr('fill', color)
        }

        // Add lith pattern
        //
        //var id          = lithologyDefs[lithCode].pattern
        var url         = 'url(#' + id + ')'

        var toolTip     = [description, "from", top_depth, "to", bot_depth, "feet"].join(" ");
        var data        = [ {x:x_box_min, tooltip: toolTip}];

        var lithology   = svgContainer.append("g")
                                      .attr("class", "lithology")
                                      .data(data)

        var myRect      = lithology.append("rect")
                                   .attr('id', lithCode)
                                   .attr('class', 'lithology')
                                   .attr('x', x_box_min)
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
        //      .text(function(d) { return toolTip; });
    }

    // Set svg container
    //
    var defs = d3.select("#definitions")
    if(!defs[0]) {
        var defs = svgContainer.append("defs")
            .attr('id', 'definitions')
    }
    var gradient = defs.append('linearGradient')
        .attr('id', 'svgGradient')
        .attr('x1', '0%')
        .attr('x2', '0%')
        .attr('y1', '0%')
        .attr('y2', '100%')
        .attr('fill', url);

    gradient.append('stop')
        .attr('class', 'start')
        .attr('offset', '0%')
        .attr('stop-color', 'none')
        .attr('stop-opacity', 1)
        .attr('fill', url);

    gradient.append('stop')
        .attr('class', 'end')
        .attr('offset', '100%')
        .attr('stop-color', 'none')
        .attr('stop-opacity', 0)
        .attr('fill', url);
    
    // Add and fade last lithology
    //
    var lithology   = svgContainer.append("g")
        .attr("class", "lithology")
    //var url         = 'url(#svgGradient)'

    var toolTip     = [description, "from", bot_depth, "to unknown depth"].join(" ");
    var data        = [ {x:x_box_min, tooltip: toolTip}];
    var thickness   = y_box_max - y_bot

    var lithology   = svgContainer.append("g")
        .attr("class", "lithology")
        .data(data)

    var myRect      = lithology.append("rect")
        .attr('id', lithCode)
        .attr('class', 'lithology')
        .attr('x', x_box_min)
        .attr('y', y_bot)
        .attr('width', width)
        .attr('height', thickness)
        .attr('fill', url)
        .attr('fill-opacity', 0.25)
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
    
    // Add unknown ?? text to bottom
    //
    var textInfo    = textSize('?-?-?-?-?-?');
    var text_height = textInfo.height;
    
    var lithology   = svgContainer.append("g")
        .attr("class", "lithology")
    
    var myText = lithology.append("text")
        .attr('x', x_box_min + 0.5 * (x_box_max - x_box_min))
        .attr('y', y_box_max - 0.5 * (y_box_max - y_bot) + 0.5 * text_height)
        .style("text-anchor", "middle")
        .style("font-family", "sans-serif")
        .style("font-size", "1rem")
        .style("font-weight", "700")
        .style("opacity", 0.6)
        .style("fill", 'black')
        .text('?-?-?-?-?-?')

    // Add lithology legend
    //
    lithologyLegend(svgContainer, LithologyLegend)
  }


function buildLegend(lithologyData, lithologyDefs) {

    myLogger.info("buildLegend");
    myLogger.info(lithologyData);
    myLogger.info(lithologyDefs);

    let lithologyLegend = [];

    // Build lithology description
    //
    for(let i = 0; i < lithologyData.length; i++) {
        lithologyData[i]['svg'] = '000';
        myLithology             = lithologyData[i].lithology;
        myLogger.info(lithologyData[i]);
        myLogger.info(`Lithology ${myLithology}`);

        if(lithologyDefs[myLithology]) {
            lithologyData[i]['svg'] = lithologyDefs[myLithology];

            // Set lithology defintions
            //
            if(lithologyLegend.findIndex(x => x.lithology === myLithology) < 0) {
                lithologyLegend.push({ 'lithology': myLithology, 'symbol': lithologyDefs[myLithology] })
            }
        }
        else {
            message = `No lithology pattern for ${myLithology}`;
            myLogger.error(message);
            updateModal(message);
            fadeModal(2000);
        }
    }

    return lithologyLegend;
  }

function writeDownloadLink(svgContainer, myFile) {
    const xmlns = "http://www.w3.org/2000/xmlns/";
    const xlinkns = "http://www.w3.org/1999/xlink";
    const svgns = "http://www.w3.org/2000/svg";
    return function serialize(svgContainer) {
        svg = svg.cloneNode(true);
        const fragment = window.location.href + "#";
        const walker = document.createTreeWalker(svg, NodeFilter.SHOW_ELEMENT);
        while (walker.nextNode()) {
            for (const attr of walker.currentNode.attributes) {
                if (attr.value.includes(fragment)) {
                    attr.value = attr.value.replace(fragment, "#");
                }
            }
        }
        svg.setAttributeNS(xmlns, "xmlns", svgns);
        svg.setAttributeNS(xmlns, "xmlns:xlink", xlinkns);
        const serializer = new window.XMLSerializer;
        const string = serializer.serializeToString(svg);
        return new Blob([string], {type: "image/svg+xml"});
    };
}

function serialize (svg) {
  const xmlns = "http://www.w3.org/2000/xmlns/";
  const xlinkns = "http://www.w3.org/1999/xlink";
  const svgns = "http://www.w3.org/2000/svg";
  return function serialize(svg) {
    svg = svg.cloneNode(true);
    const fragment = window.location.href + "#";
    const walker = document.createTreeWalker(svg, NodeFilter.SHOW_ELEMENT);
    while (walker.nextNode()) {
      for (const attr of walker.currentNode.attributes) {
        if (attr.value.includes(fragment)) {
          attr.value = attr.value.replace(fragment, "#");
        }
      }
    }
    svg.setAttributeNS(xmlns, "xmlns", svgns);
    svg.setAttributeNS(xmlns, "xmlns:xlink", xlinkns);
    const serializer = new window.XMLSerializer;
    const string = serializer.serializeToString(svg);
    return new Blob([string], {type: "image/svg+xml"});
  };
}
function downloadSVGAsText() {
            myLogger.info('downloadSVGAsText');
  const svg = document.querySelector('svg');
  const base64doc = btoa(unescape(encodeURIComponent(svg.outerHTML)));
  const a = document.createElement('a');
  const e = new MouseEvent('click');
  a.download = 'download.svg';
  a.href = 'data:image/svg+xml;base64,' + base64doc;
  a.dispatchEvent(e);
}
function saveSvg() {
            myLogger.info('saveSvg');
  const svg = document.querySelector('svg');
  const base64doc = btoa(unescape(encodeURIComponent(svg.outerHTML)));
  const a = document.createElement('a');
  const e = new MouseEvent('click');
  a.download = 'download.svg';
  a.href = 'data:image/svg+xml;base64,' + base64doc;
  a.dispatchEvent(e);
}
