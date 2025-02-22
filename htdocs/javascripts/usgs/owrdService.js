/* Javascript plotting library for jQuery and flot.
 *
 * A JavaScript library to retrieve the OWRD lithology and construction
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

// Set OWRD information
//
var owrdSiteInfo;
var owrdLithologyInfo;
var owrdWellConstruction;
var owrdConstructionLegend;
var owrdLithDepth;
var owrdWellDepth;
var owrdWellDia;

// Functions
//
//----------------------------------------------------

// Parse OWRD site information
//
var myOwrdFields  = {
    'gw_logid' : 'coop_site_no',
    'aquifer' : 'aqfr_type_cd',
    'aquifer_description' : 'aqfr_cd',
    'latitude_dec' : 'dec_lat_va',
    'longitude_dec' : 'dec_long_va',
    'lsd_elevation' : 'alt_va',
    'elevation_datum' : 'alt_datum_cd',
    'primary_use' : 'water_use_1_cd',
    'state_observation_well_nbr' : 'site_use_1_cd',
    'observation_status' : 'site_use_2_cd',
    'observation_type' :  'site_use_3_cd',
    'usgs_pls_notation_display' : 'station_nm',
    'water_level_count' : 'site_rmks_tx',
    'max_depth' : 'hole_depth_va'
};

function processOwrdSiteService(myData) {
    myLogger.debug("processOwrdSiteService");
    myLogger.debug(myData);

    let mySiteInfo = null;

    // Parse for site information
    //
    let feature_count = myData.feature_count;
    if(feature_count == 1) {
        mySiteInfo = {};
        let myKeys       = Object.keys(myOwrdFields);
        let mySiteRecord = myData.feature_list[0];
        myLogger.debug(mySiteRecord);
        for(let myColumn of myKeys) {
            let myValue = mySiteRecord[myColumn];
            let usgsColumn = myOwrdFields[myColumn];
            if(!myValue) { myValue = null; }
            if(myUsgsFields.includes(usgsColumn)) { mySiteInfo[usgsColumn] = myValue; }
            myLogger.debug(`Site column ${myColumn} ${usgsColumn} ${mySiteInfo[usgsColumn]} ${myValue}`);
        }
    }
    myLogger.debug(mySiteInfo);

    // Return information
    //
    return mySiteInfo;
  }

// Parse OWRD lithology information
//
var myOwrdLithFields  = [
    'site_number',
    'start_depth',
    'end_depth',
    'lithology',
    'lithology_description',
    'color',
    'water_bearing_zone',
    'water_bearing_zone_water_level'
];

function processOwrdLithService(myData, lithologyDefs) {
    myLogger.info("processOwrdLithService");
    myLogger.debug(myData);
    myLogger.debug(lithologyDefs);

    myLithology     = null;
    myLegend        = [];
    LegendList      = [];
    myColors        = {};

    maxDepth        = null;

    let myRgbTest   = /^rgb\(0, 0, 0/;
    let myRgbaTest  = /^rgba\(0, 0, 0, 0\)/;
    let myColorTest = /^\w+$/;

    // Parse for lithology information
    //
    let feature_count = myData.feature_count;
    if(feature_count > 0) {
        myLithology = [];
        let myLithRecords = myData.feature_list;
        for(let i = 0; i < myLithRecords.length; i++) {

            // Valid record if seal has depth
            //
            if(isNumeric(myLithRecords[i].start_depth) || isNumeric(myLithRecords[i].end_depth)) {

                // Set
                //
                let top_depth    = myLithRecords[i].start_depth;
                let bot_depth    = myLithRecords[i].end_depth;
                let lithology    = myLithRecords[i].lithology;
                let description  = myLithRecords[i].lithology_description;
                let color        = null;
                let symbol       = '000.svg';

                // Maximum depth
                //
                if(bot_depth) { maxDepth = bot_depth; }

                // Adjust lithology capitalization
                //
                lithology = lithology.charAt(0).toUpperCase() + lithology.substring(1).toLowerCase()

                // Adjust lithology description capitalization
                //
                // color modifier lithology
                //   |      |        |
                // Gray  Broken    Lava
                //
                let myLiths = description.split(" ");
                for(let ii = 0; ii < myLiths.length; ii++) {
                    myLiths[ii] = myLiths[ii][0].toUpperCase() + myLiths[ii].substring(1).toLowerCase();
                }

                description = myLiths.join(' ');
                myLogger.debug(`Lithology ${description}`);

                // If primary lithology matches existing lithology definitions
                //
                if(lithologyDefs[lithology]) {
                    myLogger.debug(`  Primary lithology ${lithology} pattern ${lithologyDefs[lithology]}`)
                    symbol = lithologyDefs[lithology];
                }

                // If lithology description matches existing lithology definitions [no color or modifier]
                //
                if(lithologyDefs[description]) {
                    myLogger.debug(`  Lithology description ${description} pattern ${lithologyDefs[description]}`)
                    lithology = description;
                    symbol    = lithologyDefs[description];
                }

                // Search for a matching definition with full lithology description
                //   skipping color and modifier
                //
                else {
                    myLogger.debug(`  Lithology description ${description}`);

                    // Set lithology if determined
                    //
                    let myLiths     = [];
                    let lithologies = description.split(' ');
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
                        if(!myColorTest.test(myColor)) { continue; }
                        if(!myColors[myColor]) {
                            $('<div class="' + myColor + '"></div>').appendTo("body");
                            let myRgb = $('.' + myColor).css('background-color');
                            $('.' + myColor).remove();
                            let myType = typeof myRgb;
                            myLogger.debug(`Color ${myColor} Background-color ${myRgb} Type -> ${myType}`);
                            myLogger.debug(myRgbTest.test(myRgb));
                            if(myRgb == 'rgb(0, 0, 0)') { continue; }
                            else if(myRgb == 'rgba(0, 0, 0, 0)') { continue; }
                            else if(!myRgb) { continue; }
                            else if(myRgb == 'transparent') { continue; }
                            else {
                                color = myRgb;
                                myColors[myColor] = myRgb;
                                break;
                            }
                        }
                        else {
                            color = myColors[myColor];
                            //LithRecord['color']  = myColors[myColor];
                            break;
                        }
                    }
                }

                let id = lithology.replace(/\s+&\s+/g, '');

                // Set lithology
                //
                myLithology.push({
                    'id' : id,
                    'top_depth': parseFloat(top_depth),
                    'bot_depth' : parseFloat(bot_depth),
                    'description': description,
                    'symbol' : symbol,
                    'color' : color                   
                });
                myLogger.info(`Final Lithology lithology ${lithology} pattern ${symbol} color ${color}`);

                // Build legend
                //
                if(LegendList.indexOf(lithology) < 0) {
                    LegendList.push(lithology);
                    myLegend.push({
                        'id': id,
                        'description': lithology,
                        'symbol': symbol
                    });
                }
            }
        }
    }

    return [myLithology, myLegend, maxDepth];
}

// Process OWRD construction into NWIS construction
//
function processOwrdConstructionService(myData, constructionDefs) {
    myLogger.info("processOwrdConstructionService");
    myLogger.debug(myData);
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

    // Prepare seal attributes
    //
    let sealDict = constructionDefs.seal_cd.Codes;
    myLogger.debug('Seal');
    myLogger.debug(sealDict);

    // Prepare casing attributes
    //
    let csngDict = constructionDefs.csng_material_cd.Codes;
    myLogger.debug('Casing');
    myLogger.debug(csngDict);

    // Prepare open-interval attributes
    //
    let openDict = constructionDefs.open_cd.Codes;
    myLogger.debug('Open-interval');
    myLogger.debug(openDict);

    // Parse for site information
    //
    var feature_count = myData.feature_count;
    if(feature_count > 0) {

        let cons_seq_nu = 0;

        // Loop through records
        //
        for(let i = 0; i < feature_count; i++) {
            let Record            = myData.feature_list[i];
            let feature_type_desc = Record.feature_type_desc.toLowerCase();
            myLogger.debug(Record);
            
            cons_seq_nu += 1;

            // Seal
            //
            if(feature_type_desc == 'seal') {

                // Valid record if seal has depth
                //
                if(isNumeric(Record.bottom_depth_ft)) {
                    let top_depth    = Record.top_depth_ft;
                    let bottom_depth = Record.bottom_depth_ft;
                    let diameter     = Record.diameter;
                    let description  = Record.interval_material;
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
                            myLogger.error(`OWRD Seal material ${description} no NWIS code`);
                        }
                    }

                    let id = `Seal_${description.toLowerCase().replace(/\s+/g, '')}`;

                    // Push record
                    //
                    if(!gw_cons) { gw_cons = []; }
                    gw_cons.push({
                        'id' : id,
                        'top_depth' : top_depth,
                        'bottom_depth' : bottom_depth,
                        'seal_dia_va' : diameter,
                        'description' : description,
                        'symbol': null,
                        'color': color
                    });
                    //                gw_hole.push({
                    //                    'cons_seq_nu' : gw_cons.length,
                    //                    'hole_seq_nu' : gw_hole.length + 1,
                    //                    'hole_top_va' : myRecord.top_depth_ft,
                    //                    'hole_bottom_va' : myRecord.bottom_depth_ft,
                    //                    'hole_dia_va' : myRecord.diameter
                    //                });

                    // Max/min depth
                    //
                    if(bottom_depth > maxDepth) { maxDepth = bottom_depth; }

                    // Prepare legend
                    //
                    let legendEntry   = ["Seal,", description].join(" ");

                    if(!LegendList.includes(legendEntry)) {
                        LegendList.push(legendEntry);

                        Legend.push({
                            'id': id,
                            'description': legendEntry,
                            'symbol': null,
                            'color': color
                        })
                    }
                }
            }

            // Casing
            //
            if(feature_type_desc == 'casing') {

                // Valid record if has top/bottom depths and diameter
                //
                if(isNumeric(Record.top_depth_ft) && isNumeric(Record.bottom_depth_ft) && isNumeric(Record.diameter)) {
                    let top_depth    = Record.top_depth_ft;
                    let bottom_depth = Record.bottom_depth_ft;
                    let diameter     = Record.diameter;
                    let description  = Record.interval_material;
                    
                    let color        = "#ED9EE9";
                    let symbo        = null;

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
                    if(!gw_hole) { gw_hole = []; }
                    gw_hole.push({
                        'id' : 1,
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

                    // Build legend
                    //
                    let legendEntry = ["Casing,", description].join(" ")

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

            // Open-interval
            //
            if(feature_type_desc == 'open interval') {

                // Valid record if has top/bottom depths
                //
                myLogger.info(`Open-interval depth ${isNaN(Record.bottom_depth_ft)}`);
                if(isNumeric(Record.top_depth_ft) && isNumeric(Record.bottom_depth_ft)) {

                    let top_depth        = Record.top_depth_ft;
                    let bottom_depth     = Record.bottom_depth_ft;
                    let diameter         = Record.diameter;
                    let description      = Record.interval_material;
                    
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

                    if(description.includes('Open')) {
                        if(!gw_hole) { gw_hole = []; }
                        gw_hole.push({
                            'id' : 1,
                            'top_depth' : top_depth,
                            'bottom_depth' : bottom_depth,
                            'diameter' : diameter,
                            'symbol' : null,
                            'color' : '#FFFFFF'
                        });
                    }

                    let id = `Open_${description.toLowerCase().replace(/\s+/g, '')}`;
                    
                    if(!gw_open) { gw_open = []; }
                    gw_open.push({
                        'id' : id,
                        'top_depth' : top_depth,
                        'bottom_depth' : bottom_depth,
                        'diameter' : diameter,
                        'description' : description,
                        'symbol': `url(#${symbol})`,
                        'color': color
                    });

                    // Max/min diameter and depth
                    //
                    if(diameter < minDia) { minDia = diameter; }
                    if(diameter > maxDia) { maxDia = diameter; }
                    if(bottom_depth > maxDepth) { maxDepth = bottom_depth; }

                    // Prepare legend
                    //
                    let legendEntry   = ["Open interval,", description].join(" ");

                    if(!LegendList.includes(legendEntry)) {
                        LegendList.push(legendEntry);
                        Legend.push({
                            'id': id,
                            'description': legendEntry,
                            'symbol': symbol,
                            'color': color
                        })
                    }
                }
            }
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

    // return information
    //
    return [myConstruction, Legend, maxDepth, maxDia];
  }
