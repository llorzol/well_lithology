/**
 * Namespace: downloadData
 *
 * downloadData is a JavaScript library to provide a set of functions to download
 *  site information and measurements.
 *
 * version 3.02
 * January 10, 2025
*/

/*
###############################################################################
# Copyright (c) U.S. Geological Survey Oregon Water Science Center
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
// Read parameter codes from NwisWeb
//
function viewReport(site_no, coop_site_no, station_nm) {

    closeModal();

    let messages = [];
    if(coop_site_no)  { messages.push(`OWRD ${coop_site_no}`); }
    if(site_no)  { messages.push(`USGS ${site_no}`); }
    if(station_nm)  { messages.push(`Station ${station_nm}`); }

    if(!coop_site_no) {
        message = 'No Water Well Report available';
        openModal(message);
        fadeModal(3000);

        return;
    }

    // Loading message
    //
    message = "Processing information for site " + messages.join(' ');
    openModal(message);

    // Request for site service information
    //
    //
    let countyCode = coop_site_no.substring(0, 4).toUpperCase();
    let countyNum  = parseInt(coop_site_no.substring(4));
    let owrdReport = `https://apps.wrd.state.or.us/apps/misc/vault/vault.aspx?wl_county_code=${countyCode}&wl_nbr=${countyNum}`;

    window.open(owrdReport, "_blank");
}

// Build output
//-------------------------------------------------
var headerLines = [];

headerLines.push('# ---------------------------------- WARNING ----------------------------------------');
headerLines.push('# Some of the data that you have obtained from this U.S. Geological Survey database');
headerLines.push("# may not have received Director's approval. Any such data values are qualified");
headerLines.push('# as provisional and are subject to revision. Provisional data are released on the');
headerLines.push('# condition that neither the USGS nor the United States Government may be held liable');
headerLines.push('# for any damages resulting from its use.');
headerLines.push('#');

// Output data
//
function downloadWellConstructionData(mySiteInfo,
                                      wellConstruction,
                                      myLithologyInfo) {
    console.log("downloadWellConstructionData");
    console.log(myWellConstruction);

    closeModal();

    message = "Preparing well construction information for site " + site_no;
    openModal(message);
    fadeModal(2000)

    // Site information
    //
    agency_cd                  = mySiteInfo.agency_cd;
    site_no                    = mySiteInfo.site_no;
    station_nm                 = mySiteInfo.station_nm;

    // Modify header lines
    //
    headerLines.push('# retrieved: ' + (new Date()).toString())
    headerLines.push('#');
    headerLines.push('# US Geological Survey well construction');
    headerLines.push('#');
    headerLines.push('# Data for the following 1 site(s) are contained in this file');

    // Change header line
    //
    let titleList = [];
    if(agency_cd) { titleList.push(agency_cd); }
    if(site_no) { titleList.push(site_no); }
    if(coop_site_no) { titleList.push(coop_site_no); }
    if(station_nm) { titleList.push(station_nm); }

    headerLines.push('#   Site ' + titleList.join(" "));
    headerLines.push('#');

    // Parse construction output
    //
    if(wellConstruction.gw_cons) {

        headerLines.push('# -----------------------------------------------------------------------------------');
        headerLines.push('#');
        headerLines.push('# The fields in this file include:');
        headerLines.push('# ---------------------------------');
        headerLines.push('# Seal Construction section');
        headerLines.push('# site_no          USGS site number');
        headerLines.push('# seal_ds          Seal description');
        headerLines.push('# seal_depth_va    Depth to bottom of seal');
        headerLines.push('#');

        headerLines.push([
            'site_no',
            'seal_ds',
            'seal_depth_va'
        ].join("\t"));

        let wellRecord = wellConstruction.gw_cons;

        for(let i = 0; i < wellRecord.length; i++) {

            let Record = wellRecord[i];

            headerLines.push([site_no,
                              Record.description,
                              Record.bottom_depth
                             ].join("\t"));

        }
        headerLines.push('#');
        headerLines.push('#');
    }

    // Loop hole construction
    //
    if(wellConstruction.gw_hole) {

        headerLines.push('# Hole Construction section');
        headerLines.push('# site_no          USGS site number');
        headerLines.push('# hole_top_va      Depth to top of this interval');
        headerLines.push('# hole_bottom_va   Depth to bottom of this interval');
        headerLines.push('# hole_dia_va      Diameter of this interval');
        headerLines.push('#');

        headerLines.push([
            'site_no',
            'hole_top_va',
            'hole_bottom_va',
            'hole_dia_va'
        ].join("\t"));

        let wellRecord = wellConstruction.gw_hole;

        for(let i = 0; i < wellRecord.length; i++) {

            let Record = wellRecord[i];

            headerLines.push([site_no,
                              Record.top_depth,
                              Record.bottom_depth,
                              Record.diameter
                             ].join("\t"));

        }
        headerLines.push('#');
        headerLines.push('#');
    }

    // Loop casing construction
    //
    if(wellConstruction.gw_csng) {

        headerLines.push('# Casing Construction section');
        headerLines.push('# site_no          USGS site number');
        headerLines.push('# csng_top_va      Depth to top of this casing interval');
        headerLines.push('# csng_bottom_va   Depth to bottom of this casing interval');
        headerLines.push('# csng_dia_va      Diameter of this casing interval');
        headerLines.push('# csng_material_cd Casing material');
        headerLines.push('#');

        headerLines.push([
            'site_no',
            'csng_top_va',
            'csng_bottom_va',
            'csng_dia_va',
            'csng_material_cd'
        ].join("\t"));

        let wellRecord = wellConstruction.gw_csng;

        for(let i = 0; i < wellRecord.length; i++) {

            let Record = wellRecord[i];

            headerLines.push([site_no,
                              Record.top_depth,
                              Record.bottom_depth,
                              Record.diameter,
                              Record.description
                             ].join("\t"));

        }
        headerLines.push('#');
        headerLines.push('#');
    }

    // Loop openings construction
    //
    if(wellConstruction.gw_open) {

        headerLines.push('# Openings Construction section');
        headerLines.push('# site_no          USGS site number');
        headerLines.push('# open_top_va      Depth to top of this open interval');
        headerLines.push('# open_bottom_va   Depth to bottom of this open interval');
        headerLines.push('# open_dia_va      Diameter of this open interval');
        headerLines.push('# open_material_cd Material in this interval');
        headerLines.push('#');

        headerLines.push([
            'site_no',
            'open_top_va',
            'open_bottom_va',
            'open_dia_va',
            'open_material_cd'
        ].join("\t"));

        let wellRecord = wellConstruction.gw_open;

        for(let i = 0; i < wellRecord.length; i++) {

            let Record = wellRecord[i];

            headerLines.push([site_no,
                              Record.top_depth,
                              Record.bottom_depth,
                              Record.diameter,
                              Record.description
                             ].join("\t"));

        }
        headerLines.push('#');
        headerLines.push('#');
    }

    // Loop geohydrology
    //
    if(myLithologyInfo) {

        headerLines.push('# Well Lithology section');
        headerLines.push('# site_no          USGS site number');
        headerLines.push('# coop_site_no     OWRD well log id');
        headerLines.push('# lith_description Lithology description');
        headerLines.push('# lith_top_va      Depth to top of interval');
        headerLines.push('# lith_bottom_va   Depth to bottom of interval');
        headerLines.push('#');

        headerLines.push([
            'site_no',
            'coop_site_no',
            'lith_description',
            'lith_top_va',
            'lith_bottom_va'
        ].join("\t"));

        for(let i = 0; i < myLithologyInfo.length; i++) {

            let Record = myLithologyInfo[i];

            headerLines.push([site_no,
                              coop_site_no,
                              Record.description,
                              Record.top_depth,
                              Record.bot_depth
                             ].join("\t"));

        }
    }

    // Output
    //
    let myWindow = window.open('', '_blank', '');
    let myData   = headerLines.join("\n");
    myData     += "\n";

    jQuery(myWindow.document.body).html('<pre>' + myData + '</pre>');

    // Change title
    //
    jQuery(myWindow.document).prop("title", "Well Construction Information for Site " + titleList.join(" "));

    closeModal();
}
