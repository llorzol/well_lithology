/* Javascript plotting library for jQuery and flot.
 *
 * A JavaScript library to retrieve the USGS lithology and construction
 * information for a site(s).
 *
 * version 3.28
 * February 22, 2025
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

// Set USGS information
//
var usgsSiteInfo;
var usgsLithologyInfo;
var usgsLithologyLegend;
var usgsWellConstruction;
var usgsConstructionLegend;
var usgsLithDepth;
var usgsWellDepth;
var usgsWellDia;

// Functions
//
//----------------------------------------------------

// USGS sitefile fields
//
let myUsgsFields = [
    'site_no',
    'coop_site_no',
    'agency_cd',
    'agency_use_cd',
    'alt_acy_va',
    'alt_datum_cd',
    'alt_meth_cd',
    'alt_va',
    'aqfr_cd',
    'aqfr_type_cd',
    'basin_cd',
    'construction_dt',
    'contrib_drain_area_va',
    'coord_acy_cd',
    'coord_datum_cd',
    'coord_meth_cd',
    'country_cd',
    'county_cd',
    'data_types_cd',
    'dec_lat_va',
    'dec_long_va',
    'depth_src_cd',
    'district_cd',
    'drain_area_va',
    'gw_file_cd',
    'hole_depth_va',
    'huc_cd',
    'instruments_cd',
    'inventory_dt',
    'land_net_ds',
    'lat_va',
    'local_time_fg',
    'long_va',
    'map_nm',
    'map_scale_fc',
    'mcd_cd',
    'nat_aqfr_cd',
    'nat_water_use_cd',
    'project_no',
    'reliability_cd',
    'site_rmks_tx',
    'site_tp_cd',
    'site_use_1_cd',
    'site_use_2_cd',
    'site_use_3_cd',
    'site_web_cd',
    'state_cd',
    'station_ix',
    'station_nm',
    'topo_cd',
    'tz_cd',
    'water_use_1_cd',
    'water_use_2_cd',
    'water_use_3_cd',
    'well_depth_va'
];

function processUsgsSiteService(myData) {
    myLogger.debug("processUsgsSiteService");
    myLogger.debug(myData);

    let mySiteInfo = null;

    // Parse for site information
    //
    let contentL = myData.trim().split(/\r\n|\r|\n/);
    let myDataL  = [];
    for(let i = 0; i < contentL.length; i++) {
        if(!contentL[i].startsWith('#')) {
            myDataL = contentL.slice(i);
            break;
        }
    }
    myLogger.debug('myDataL');
    myLogger.debug(myDataL);
    if(myDataL.length > 0) {
        mySiteInfo = {};
        let myKeyL = myDataL.shift();
        let myKeys = myKeyL.split(/\t/);
        myLogger.debug('myKeys');
        myLogger.debug(myKeys);
        
        myDataL.shift(); // Remove line
        
        let myValuesL = myDataL.shift().split(/\t/);
        myLogger.debug(myValuesL);
        for(let i = 0; i < myKeys.length; i ++) {
            let myValue = myValuesL[i];
            if(!myValue) { myValue = null; }
            mySiteInfo[myKeys[i]] = myValue;
            myLogger.debug(`Site column ${myKeys[i]} ${mySiteInfo[myKeys[i]]} ${myValue}`);
        }
    }
    myLogger.debug(mySiteInfo);

    // Return information
    //
    return mySiteInfo;
  }

function processUsgsLithService(myData, lithologyDefs) {
    myLogger.info("processUsgsLithService");
    myLogger.info(myData);
    myLogger.debug(lithologyDefs);

    myLithology     = null;
    myLegend        = [];
    LegendList      = [];
    myColors        = {};

    maxDepth        = null;

    var myRgbTest   = /^rgb\(0, 0, 0/;
    var myRgbaTest  = /^rgba\(0, 0, 0, 0\)/;
    let myColorTest = /^\w+$/;

    // Parse for lithology information
    //
    if(myData.gw_geoh) {
        myLithology = [];
        let myLithRecords = myData.gw_geoh;
        for(let i = 0; i < myLithRecords.length; i++) {

            // Set
            //
            let top_depth    = myLithRecords[i].lith_top_va;
            let bot_depth    = myLithRecords[i].lith_bottom_va;
            let lithology    = myLithRecords[i].lith_ds;
            let description  = myLithRecords[i].lith_unit_ds;
            let color        = null;
            let symbol       = '000.svg';
            
            // Maximum depth
            //
            if(top_depth) { maxDepth = top_depth; }
            if(bot_depth) { maxDepth = bot_depth; }

            // Adjust lithology description capitalization
            //
            // color modifier lithology
            //   |      |        |
            // Gray  Broken    Lava
            //
            myLiths = lithology.split(' ');
            for(let ii = 0; ii < myLiths.length; ii++) {
                myLiths[ii] = myLiths[ii][0].toUpperCase() + myLiths[ii].substring(1).toLowerCase();
            }
            lithology = myLiths.join(' ');
            
            myLiths = [lithology, `-- ${description}`].join(' ').split(' ');
            for(let ii = 0; ii < myLiths.length; ii++) {
                myLiths[ii] = myLiths[ii][0].toUpperCase() + myLiths[ii].substring(1).toLowerCase();
            }
            
            let lithology_description = myLiths.join(' ');
            myLogger.info(`Lithology description ${lithology_description}`);
            myLogger.info(`Lithology ${lithology}`);
            
            // If primary lithology matches existing lithology definitions
            //
            if(lithologyDefs[lithology]) {
                myLogger.debug(`  Primary lithology ${lithology} pattern ${lithologyDefs[lithology]}`)
                symbol = lithologyDefs[lithology];
            }
            
            // If lithology description matches existing lithology definitions [no color or modifier]
            //
            if(lithologyDefs[description]) {
                myLogger.debug(`  Lithology description ${lithology_description} pattern ${lithologyDefs[lithology_description]}`)
                lithology = lithology_description;
                symbol    = lithologyDefs[lithology_description];
            }

            // Search for a matching definition with full lithology description
            //   skipping color and modifier
            //
            else {
                myLogger.debug(`  Lithology description ${lithology_description}`);

                // Set lithology if determined
                //
                let myLiths     = [];
                let lithologies = lithology_description.split(' ');
                for(let ii = 0; ii < lithologies.length; ii++) {
                    let myLith = lithologies[ii]
                    
                    if(myLith == '&') { continue; }

                    // An existing lithology definition
                    //
                    if(lithologyDefs[myLith]) {
                        myLogger.debug(`    Lith ${myLith} -> ${lithologyDefs[myLith]}`);
                        if(!myLiths.includes(myLith)) {
                            myLiths.push(myLith);
                        }
                    }

                    // No lithology definition or color or modifier
                    //
                    else {
                        myLogger.debug(`    Lith ${myLith} -> missing`);
                    }
                }
                
                // Check for an existing definition for more than 1 lithologies
                //
                let myLithology = myLiths.join(" & ");
                myLogger.debug(`    Combined Lithology description ${myLithology}`);
                if(lithologyDefs[myLithology]) {
                    myLogger.debug(`      Lithology description ${myLithology} pattern ${lithologyDefs[myLithology]}`);
                    lithology = myLithology;
                    symbol    = lithologyDefs[myLithology];
                }
                else {
                    myLogger.error(`      Combined Lithology description ${myLithology} needs pattern`);
                }

                // Set color if determined
                //
                for(let ii = 0; ii < lithologies.length; ii++) {
                    let myColor = lithologies[ii]
                    if(myColor == '&') { continue; }
                    myLogger.debug(`myColor ${myColor}`);
                    if(!myColorTest.test(myColor)) { continue; }
                    myLogger.debug(`myColor ${myColor} ${myColorTest.test(myColor)}`);
                    if(!myColors[myColor]) {
                        $('<div class="' + myColor + '"></div>').appendTo("body");
                        let myRgb = $(`.${myColor}`).css('background-color');
                        $('.' + myColor).remove();
                        let myType = typeof myRgb;
                        myLogger.debug(`Color ${myColor} Background-color ${myRgb} Type -> ${myType}`);
                        myLogger.debug(myRgbTest.test(myRgb));
                        if(myRgb == 'rgb(0, 0, 0)') { continue; }
                        else if(myRgb == 'rgba(0, 0, 0, 0)') { continue; }
                        else if(!myRgb) { continue; }
                        else if(myRgb == 'transparent') { continue; }
                        else {
                            color  = myRgb;
                            myColors[myColor] = myRgb;
                            break;
                        }
                    }
                    else {
                        color  = myColors[myColor];
                        //LithRecord['color']  = myColors[myColor];
                        break;
                    }
                }
            }

            let id = lithology.replaceAll(/\W/g, '');

            // Set lithology
            //
            myLithology.push({
                'id' : id,
                'top_depth': parseFloat(top_depth),
                'bot_depth' : parseFloat(bot_depth),
                'description': `${lithology} -- ${description}`,
                'symbol' : symbol,
                'color' : color
            });
            myLogger.info(`Final Lithology ${lithology} description ${lithology_description} pattern ${svg} color ${color}`);

            // Build legend
            //
            if(!LegendList.includes(lithology)) {
                LegendList.push(lithology);
                myLegend.push({
                    'id': id,
                    'description': lithology,
                    'symbol': symbol
                });
            }
        }
        
    }

    return [myLithology, myLegend, maxDepth];
}

// Process USGS construction from NWIS construction
//
function processUsgsConstructionService(myData, constructionDefs) {
    myLogger.info("processUsgsConstructionService");
    myLogger.info(myData);
    myLogger.debug(constructionDefs);

    // Output construction components
    //
    let myConstruction = null;
    
    // Set construction components
    //
    let gw_cons  = null;
    let gw_hole  = null;
    let gw_csng  = null;
    let gw_open  = null;
    let minDia   = 99999.99;
    let maxDia   = 0.0
    let maxDepth = 0.0
    
    let LegendList = [];
    let Legend     = [];

    // Loop through construction
    //
    if(myData) {
        
        // Well construction records
        //
        let wellConstruction = myData.well_construction;
        myLogger.debug(wellConstruction);
        
        if(wellConstruction) {

            // Construction record
            //
            if(wellConstruction.gw_cons) {
                let wellRecord  = wellConstruction.gw_cons;

                // Prepare NWIS casing material codes
                //
                sealDict       = constructionDefs.seal_cd.Codes;
                myLogger.debug(sealDict);

                myLogger.info(`*** Seal information ***`);
                myLogger.info(wellRecord);

                // Loop
                //
                for(let i = 0; i < wellRecord.length; i++) {
                    let Record = wellRecord[i];

                    myLogger.info(`  Seal depth bottom ${Record.seal_depth_va} material ${Record.seal_ds}`);

                    // Valid record if seal has depth
                    //
                    myLogger.debug(`Seal depth ${isNumeric(Record.seal_depth_va)}`);
                    myLogger.debug(`Seal depth ${Number.isNaN(Record.seal_depth_va)}`);
                    if(isNumeric(Record.seal_depth_va)) {

                        //let cons_seq_nu  = Record.cons_seq_nu;
                        let top_depth    = null;
                        let bottom_depth = Record.seal_depth_va;
                        let diameter     = null;
                        let description  = Record.seal_ds;
                        let color        = "#ED9EE9";
                        let symbol       = null;

                        if(!description) { description = "Other"; }
                        else {
                            let wordL = description.split(/\s+/);
                            for(let i = 0; i < wordL.length; i++) {
                                wordL[i] = wordL[i].charAt(0).toUpperCase() + wordL[i].substring(1).toLowerCase();
                            }
                            description = wordL.join(' ');
                            if(sealDict[description]) { color = sealDict[description]; }
                            else {
                                myLogger.error(`USGS Seal material ${description} no NWIS code`);
                            }
                        }

                        let id = `Seal_${description.toLowerCase().replace(/\s+/g, '')}`;

                        // Push record
                        //
                        if(!gw_cons) { gw_cons = []; }
                        gw_cons.push({
                            'id' : id,
                            'bottom_depth' : bottom_depth,
                            'top_depth' : top_depth,
                            'seal_dia_va' : diameter,
                            'description' : description,
                            'symbol': null,
                            'color': color
                        });

                        // Max/min depth
                        //
                        if(bottom_depth > maxDepth) { maxDepth = bottom_depth; }

                        // Build legend
                        //
                        let legendEntry   = ["Seal,", description].join(" ")
                        
                        if(!LegendList.includes(legendEntry)) {
                            LegendList.push(legendEntry);
                            
                            Legend.push({
                                'id': id,
                                'description': legendEntry,
                                'symbol': null,
                                'color': color
                            });
                        }
                    }
                }
            }
            myLogger.debug('Construction record');
            myLogger.debug(gw_cons);
            myLogger.debug(`Seal depth `);

            // Hole record
            //
            if(wellConstruction.gw_hole) {
                let wellRecord = wellConstruction.gw_hole;

                myLogger.info(`*** Hole information ***`);
                myLogger.info(wellRecord);
                // Loop
                //
                for(let i = 0; i < wellRecord.length; i++) {
                    let Record = wellRecord[i];

                    myLogger.info(`  Hole depth top ${Record.hole_top_va} bottom ${Record.hole_bottom_va} diameter ${Record.hole_dia_va}`);

                    // Valid record if borehole has depth and diameter
                    //
                    myLogger.debug(`Hole depth ${Number.isNaN(Record.hole_top_va)}`);
                    myLogger.debug(`Hole depth ${isNumeric(Record.hole_top_va)}`);
                    myLogger.debug(`Hole bottom depth ${isNumeric(Record.hole_bottom_va)}`);
                    myLogger.debug(`Hole bottom depth ${isNumeric(Record.hole_dia_va)}`);
                    if(isNumeric(Record.hole_top_va) && isNumeric(Record.hole_bottom_va) && isNumeric(Record.hole_dia_va)) {

                        let cons_seq_nu  = Record.cons_seq_nu;
                        let hole_seq_nu  = i + 1;
                        let top_depth    = Record.hole_top_va;
                        let bottom_depth = Record.hole_bottom_va;
                        let diameter     = Record.hole_dia_va;

                        // Push record
                        //
                        if(!gw_hole) { gw_hole = []; }
                        gw_hole.push({
                            'id' : hole_seq_nu,
                            'top_depth' : top_depth,
                            'bottom_depth' : bottom_depth,
                            'diameter' : diameter,
                            'symbol' : null,
                            'color' : '#FFFFFF',
                        });

                        // Max/min diameter and depth
                        //
                        if(diameter < minDia) { minDia = diameter; }
                        if(diameter > maxDia) { maxDia = diameter; }
                        if(bottom_depth > maxDepth) { maxDepth = bottom_depth; }
                    }
                }
            }
            myLogger.info(gw_hole);
            myLogger.debug(`Hole diameter ${maxDia}`);

            // Casing record
            //
            myLogger.debug('Casing');
            if(wellConstruction.gw_csng) {
                let wellRecord = wellConstruction.gw_csng;

                // Prepare NWIS casing material codes
                //
                csngDict       = constructionDefs.csng_material_cd.Codes;
                myLogger.debug(csngDict);

                myLogger.info(`*** Casing information ***`);
                myLogger.info(wellRecord);
                
                // Loop
                //
                for(let i = 0; i < wellRecord.length; i++) {
                    let Record = wellRecord[i];

                    myLogger.info(`  Casing depth top ${Record.csng_top_va} bottom ${Record.csng_bottom_va} diameter ${Record.csng_dia_va}`);

                    // Valid record if borehole has depth and diameter
                    //
                    myLogger.debug(`Casing depth ${isNumeric(Record.csng_top_va)}`);
                    myLogger.debug(`Casing bottom depth ${isNumeric(Record.csng_bottom_va)}`);
                    myLogger.debug(`Casing bottom depth ${isNumeric(Record.csng_dia_va)}`);
                    if(isNumeric(Record.csng_top_va) && isNumeric(Record.csng_bottom_va) && isNumeric(Record.csng_dia_va)) {
                        
                        let cons_seq_nu  = Record.cons_seq_nu;
                        let csng_seq_nu  = Record.csng_seq_nu;
                        let top_depth    = Record.csng_top_va;
                        let bottom_depth = Record.csng_bottom_va;
                        let diameter     = Record.csng_dia_va;
                        let description  = Record.csng_material_ds;

                        let color        = "#ED9EE9";
                        let symbol       = null;

                        if(!description) { description = "Unknown"; }
                        else {
                            let wordL = description.split(/\s+/);
                            for(let i = 0; i < wordL.length; i++) {
                                wordL[i] = wordL[i].charAt(0).toUpperCase() + wordL[i].substring(1).toLowerCase();
                            }
                            description = wordL.join(' ');
                            if(csngDict[description]) { color = csngDict[description]; }
                            else {
                                myLogger.error(`USGS Casing material ${description} no NWIS code`);
                            }
                        }

                        let id = `Casing_${description.toLowerCase().replace(/\s+/g, '')}`;

                        // Push record
                        //
                        if(!gw_csng) { gw_csng = []; }
                        gw_csng.push({
                            'id' : id,
                            'top_depth' : top_depth,
                            'bottom_depth' : bottom_depth,
                            'diameter' : diameter,
                            'description' : description,
                            'symbol': null,
                            'color': color
                        });
 
                        // Max/min diameter and depth
                        //
                        if(diameter < minDia) { minDia = diameter; }
                        if(diameter > maxDia) { maxDia = diameter; }
                        if(bottom_depth > maxDepth) { maxDepth = bottom_depth; }

                        // Build legend
                        //
                        let legendEntry = ["Casing,", description].join(" ");
                        
                        if(!LegendList.includes(legendEntry)) {
                            LegendList.push(legendEntry);
                            Legend.push({
                                'id': id,
                                'description': legendEntry,
                                'symbol': null,
                                'color': color
                            });
                        }
                    }
                }
            }
            myLogger.debug(`Casing diameter ${maxDia}`);

            // Open interval record
            //
            if(wellConstruction.gw_open) {
                let wellRecord = wellConstruction.gw_open;

                // Prepare NWIS open-interval codes
                //
                openDict       = constructionDefs.open_cd.Codes;
                myLogger.debug(openDict);

                for(let i = 0; i < wellRecord.length; i++) {
                    let Record         = wellRecord[i];

                    // Valid record if open-interval has depth and diameter
                    //
                    if(isNumeric(Record.open_top_va) && isNumeric(Record.open_bottom_va) && isNumeric(Record.open_dia_va)) {

                        let top_depth        = Record.open_top_va;
                        let bottom_depth     = Record.open_bottom_va;
                        let diameter         = Record.open_dia_va;
                        let description      = Record.open_ds;
                        
                        let color            = '#FFFFFF';
                        let symbol           = null;

                        if(!description) { open_ds = "Unknown"; }
                        else {
                            let wordL = description.split(/\s+/);
                            for(let i = 0; i < wordL.length; i++) {
                                wordL[i] = wordL[i].charAt(0).toUpperCase() + wordL[i].substring(1).toLowerCase();
                            }
                            description = wordL.join(' ');
                            if(openDict[description]) { symbol = openDict[description]; }
                            else {
                                myLogger.error(`USGS Casing material ${description} no NWIS code`);
                            }
                        }

                        let id  = `Open_${description.toLowerCase().replace(/\s+/g, '')}`;
                        let url = null;
                        if(symbol) { url = `url(#${symbol})`; }

                        // Push record
                        //
                        if(!gw_open) { gw_open = []; }
                        gw_open.push({
                            'id' : id,
                            'top_depth' : top_depth,
                            'bottom_depth' : bottom_depth,
                            'diameter' : diameter,
                            'description' : description,
                            'symbol': url,
                            'color': color
                        });

                        // Max/min diameter and depth
                        //
                        if(diameter < minDia) { minDia = diameter; }
                        if(diameter > maxDia) { maxDia = diameter; }
                        if(bottom_depth > maxDepth) { maxDepth = bottom_depth; }

                        // Build legend
                        //
                        let legendEntry = ["Open interval,", description].join(" ");
                        
                        if(!LegendList.includes(legendEntry)) {
                            LegendList.push(legendEntry);
                            Legend.push({
                                'id': id,
                                'description': legendEntry,
                                'symbol': symbol,
                                'color': color
                            });
                        }
                    }
                }
                myLogger.debug(`Open-interval diameter ${maxDia}`);
            }
        }
        
        // Add information
        //
        if(mySiteInfo) {
            if(!mySiteInfo.hole_depth_va && maxDepth) { mySiteInfo.hole_depth_va = maxDepth; }
            else if(mySiteInfo.hole_depth_va && maxDepth) {
                if(maxDepth > mySiteInfo.hole_depth_va) { mySiteInfo.hole_depth_va = maxDepth; }
            }
            mySiteInfo.max_dia_va = null;
            if(!mySiteInfo.max_dia_va && maxDia) { mySiteInfo.max_dia_va = maxDia; }
        }

        // Construction information
        //
        if(gw_cons || gw_hole || gw_csng || gw_open) {
            myConstruction = { 'gw_cons': gw_cons,
                               'gw_hole': gw_hole,
                               'gw_csng': gw_csng,
                               'gw_open': gw_open
                             };
        }
    }
    myLogger.debug('Legend');
    myLogger.debug(Legend);

    // Return information
    //
    return [myConstruction, Legend, maxDepth, maxDia];
  }
