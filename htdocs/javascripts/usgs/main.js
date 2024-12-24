/**
 * Namespace: Main
 *
 * Main is a JavaScript library to provide a set of functions to manage
 *  the web requests.
 *
 * version 3.33
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

// Prevent jumping to top of page when clicking a href
//
jQuery('.noJump a').click(function(event){
   event.preventDefault();
});

// Hide for now
//
jQuery('#printButton').hide();
jQuery('#viewReport').hide();

// loglevel
//
let myLogger = log.getLogger('myLogger');
//myLogger.setLevel('debug');
myLogger.setLevel('info');

// Global variables
//
var mySiteInfo;
var myLithologyInfo;
var myLithologyLegend;
var myWellConstruction
var myConstructionLegend;
var maxWellDepth;
var maxWellDia;

var usgsSiteInfo;
var usgsLithologyInfo;
var usgsLithologyLegend;
var usgsWellConstruction;
var usgsConstructionLegend;
var usgsLithDepth;
var usgsWellDepth;
var usgsWellDia;

var owrdSiteInfo;
var owrdLithologyInfo;
var owrdWellConstruction;
var owrdConstructionLegend;
var owrdLithDepth;
var owrdWellDepth;
var owrdWellDia;


var aboutFiles     = {
                      "welcome_text" :              "lithology_welcome.txt",
                      "general_instructions_text" : "lithology_Features.txt",
                      "contacts_text" :             "lithology_contacts.txt"
};

// Prepare when the DOM is ready 
//
$(document).ready(function() {
    // Loading message
    //
    myLogger.info("Processing site, lithology, and well construction information ");

    // Insert accordion text
    //
    jQuery.each(aboutFiles, function(keyItem, keyFile) {

      var InfoText = loadText(keyFile);

      jQuery("#" + keyItem).html(InfoText);

    });

    // Process lithology and construction defintions
    //
    myLithologyLookup    = myLithDefs.lithology;
    myConstructionLookup = myConstructionDefs;

    jQuery('#wellBore').text();

    // Current url
    //-------------------------------------------------
    var url     = new URL(window.location.href);
    myLogger.debug("Current Url " + window.location.href);

    // Parse
    //-------------------------------------------------
    coop_site_no = null;
    if(url.searchParams.get("coop_site_no")) {
	coop_site_no = url.searchParams.get("coop_site_no");

        coop_site_no = checkCoopSiteNo(coop_site_no);

        if(!coop_site_no) {
            var message = "Incorrectly formatted OWRD well log ID: ";
            message    += "You must use the OWRD well log ID, which has a four-character county abbrevation ";
            message    += "along with from 1 to 7 padded digit well number.";
            openModal(message);
            fadeModal(2000);

            return;
        }

        // Add OWRD water well report
        //
        jQuery('#viewReport').show();
    }

    // Parse
    //-------------------------------------------------
    site_no = null;
    if(url.searchParams.get("site_no")) {
	site_no = url.searchParams.get("site_no");

	site_no = checkSiteNo(site_no);

	if(!site_no) {
	    var message = "Incorrectly formatted USGS site number: ";
	    message    += "You must use the USGS site numbers, which are a number ";
	    message    += "from 8 to 15 digits long (example 433152121281301). ";
	    openModal(message);
	    fadeModal(2000);

	    return;
	}
    }

    // No site_no nor coop_site_no
    //
    if(!site_no && !coop_site_no) {
	let message = "Provide a USGS site number (a number ";
	message    += " with 8 to 15 digits such as 420733121304001)";
	message    += " and /or a OWRD well log ID (a four-character county abbrevation";
        message    += " along with from 1 to 7 padded digit well number such as KLAM0050623).";
        myLogger.info(message);
	openModal(message);
	fadeModal(4000);

        jQuery('#wellBore').text(message);

	return;
    }

    // Build ajax requests
    //
    message  = `Requesting well lithology and construction information for`;
    if(coop_site_no) { message += ` OWRD ${coop_site_no})`; }
    if(site_no) { message += ` USGS ${site_no}`; }
    openModal(message);
    myLogger.debug(message);

    // Build ajax requests
    //
    let failRequest  = null;
    let webRequests  = [];

    // Request for OWRD site information
    //
    if(coop_site_no) {
        var request_type = "GET";
        var script_http  = 'https://apps.wrd.state.or.us/apps/gw/gw_data_rws/api/' + coop_site_no + '/gw_site_summary/?public_viewable=Y'
        var data_http    = '';
        var dataType     = "json";

        // Web request
        //
        webRequests.push($.ajax( {
            method:   request_type,
            url:      script_http,
            data:     data_http,
            dataType: dataType,
            success: function (myData) {
                //message = `Processed site ${coop_site_no} information`;
                //openModal(message);
                owrdSiteInfo = processOwrdSiteService(myData);
                myLogger.info(`owrdSiteInfo`);
                myLogger.info(owrdSiteInfo);
            },
            error: function (error) {
                message = `Failed to load site ${coop_site_no} information  ${error.status} ${error.statusText}`;
                updateModal(message);
                fadeModal(3000);
                failRequest = message;
            }
        }));

        // Request for OWRD lithology information
        //
        var request_type = "GET";
        var script_http  = 'https://apps.wrd.state.or.us/apps/gw/gw_data_rws/api/' + coop_site_no + '/gw_lithology/'
        var data_http    = '';
        var dataType     = "json";

        // Web request
        //
        webRequests.push($.ajax( {
            method:   request_type,
            url:      script_http,
            data:     data_http,
            dataType: dataType,
            success: function (myData) {
                //message = "Processed OWRD lithology information for site ${coop_site_no}";
                //updateModal(message);
                [owrdLithologyInfo, owrdLithologyLegend, owrdLithDepth] = processOwrdLithService(myData, myLithologyLookup);
                myLogger.info(`owrdLithologyInfo`);
                myLogger.info(owrdLithologyInfo);
                myLogger.info(`owrdLithologyLegend`);
                myLogger.info(owrdLithologyLegend);
                myLogger.info(`owrdLithDepth ${owrdLithDepth}`);
            },
            error: function (error) {
                message = `Failed to load OWRD lithology information for site ${coop_site_no} ${error.status} ${error.statusText}`;
                updateModal(message);
                fadeModal(2000);
                failRequest = message;
            }
        }));

        // Request for OWRD site well construction information
        //
        var request_type = "GET";
        var script_http  = 'https://apps.wrd.state.or.us/apps/gw/gw_data_rws/api/' + coop_site_no + '/gw_construction/'
        var data_http    = '';
        var dataType     = "json";

        // Web request
        //
        webRequests.push($.ajax( {
            method:   request_type,
            url:      script_http,
            data:     data_http,
            dataType: dataType,
            success: function (myData) {
                //message = "Processed OWRD well construction information for site ${coop_site_no}";
                //updateModal(message);
                [owrdWellConstruction, owrdConstructionLegend, owrdWellDepth, owrdWellDia] = processOwrdConstructionService(myData, myConstructionLookup);
                myLogger.info(`owrdWellConstruction`);
                myLogger.info(owrdWellConstruction);
                myLogger.info(owrdConstructionLegend);
                myLogger.info(`owrdWellDepth ${owrdWellDepth} owrdWellDia ${owrdWellDia}`);
            },
            error: function (error) {
                message = `Failed to load OWRD well construction information for site ${coop_site_no} ${error.status} ${error.statusText}`;
                updateModal(message);
                fadeModal(2000);
                failRequest = message;
            }
        }));
    }

    // Request for USGS information
    //
    if(site_no) {
        // Request for USGS site information
        //
        var request_type = "GET";
        var script_http  = `http://127.0.0.1/cgi-bin/lithology/requestUsgsSites.py?site_no=${site_no}`
        var script_http  = `https://waterservices.usgs.gov/nwis/site/?format=rdb&sites=${site_no}&siteOutput=expanded&siteStatus=all`
        var data_http    = '';
        var dataType     = "json";
        var dataType     = "text";

        // Web request
        //
        webRequests.push($.ajax( {
            method:   request_type,
            url:      script_http,
            data:     data_http,
            dataType: dataType,
            success: function (myData) {
                //message = "Processed USGS site construction information for site ${site_no}";
                //updateModal(message);
                usgsSiteInfo = processUsgsSiteService(myData);
                //usgsWellConstruction = myData;
                myLogger.debug(`usgsSiteInfo`);
                myLogger.debug(usgsSiteInfo);
            },
            error: function (error) {
                message = `Failed to load USGS site information for site ${site_no} ${error.status} ${error.statusText}`;
                updateModal(message);
                fadeModal(2000);
                failRequest = message;
            }
        }));
        
        // Request for USGS well construction information
        //
        var request_type = "GET";
        var script_http  = `http://127.0.0.1/cgi-bin/lithology/requestWellConstruction.py?site_no=${site_no}`
        var data_http    = '';
        var dataType     = "json";

        // Web request
        //
        webRequests.push($.ajax( {
            method:   request_type,
            url:      script_http,
            data:     data_http,
            dataType: dataType,
            success: function (myData) {
                //message = "Processed USGS well construction information for site ${site_no}";
                //updateModal(message);
                myLogger.info(`usgsWellConstruction`);
                myLogger.info(myData);
                [usgsWellConstruction, usgsConstructionLegend, usgsWellDepth, usgsWellDia] = processUsgsConstructionService(myData, myConstructionLookup);
                myLogger.info(`done usgsWellConstruction`);
                myLogger.info(usgsWellConstruction);
                myLogger.info(usgsConstructionLegend);
                myLogger.info(usgsWellDepth);
                myLogger.info(usgsWellDia);
            },
            error: function (error) {
                message = `Failed to load USGS well construction information for site ${site_no} ${error.status} ${error.statusText}`;
                updateModal(message);
                fadeModal(2000);
                failRequest = message;
            }
        }));
        
        // Request for USGS geohydrology information
        //
        var request_type = "GET";
        var script_http  = `http://127.0.0.1/cgi-bin/lithology/requestUsgsGeohydrology.py?site_no=${site_no}`
        var data_http    = '';
        var dataType     = "json";

        // Web request
        //
        webRequests.push($.ajax( {
            method:   request_type,
            url:      script_http,
            data:     data_http,
            dataType: dataType,
            success: function (myData) {
                //message = "Processed USGS geohydrology information for site ${site_no}";
                //updateModal(message);
                [usgsLithologyInfo, usgsLithologyLegend, usgsLithDepth] = processUsgsLithService(myData, myLithologyLookup);
                //usgsWellConstruction = myData;
                myLogger.info(`usgsLithologyInfo`);
                myLogger.info(usgsLithologyInfo);
                myLogger.info(usgsLithologyLegend);
                myLogger.info(usgsLithDepth);
            },
            error: function (error) {
                message = `Failed to load USGS geohydrology information for site ${site_no} ${error.status} ${error.statusText}`;
                updateModal(message);
                fadeModal(2000);
                failRequest = message;
            }
        }));
    }

    // Run ajax requests
    //
    $.when.apply($, webRequests).then(function() {

        //closeModal();

        // No site information in OWRD nor USGS
        //
        if(!owrdSiteInfo && !usgsSiteInfo) {
            failRequest = `No site information for`;
            if(coop_site_no) { failRequest += ` OWRD ${coop_site_no}`; }
            if(site_no) { failRequest += ` USGS ${site_no}`; }
        }
                          
        if(failRequest) {
            myLogger.error(`Failed: ${failRequest}`);
            openModal(failRequest);
            fadeModal(2000);
            myLogger.error(failRequest);

            return false;
        }

        // USGS site information over OWRD if available
        // hole_depth_va and well_depth_va
        //
        if(usgsSiteInfo) {
            mySiteInfo = usgsSiteInfo;
            if(mySiteInfo.hole_depth_va) { maxWellDepth = mySiteInfo.hole_depth_va; }
            if(mySiteInfo.well_depth_va && maxWellDepth) {
                if(mySiteInfo.well_depth_va > maxWellDepth) { maxWellDepth = mySiteInfo.well_depth_va; }
            }
            else if(mySiteInfo.well_depth_va) { maxWellDepth = mySiteInfo.well_depth_va; }
        }

        // OWRD site information if available and no USGS
        // hole_depth_va only
        else if(owrdSiteInfo) {
            mySiteInfo = owrdSiteInfo;
            if(mySiteInfo.hole_depth_va) { maxWellDepth = mySiteInfo.hole_depth_va; }
        }

        // OWRD lithology information over USGS if available
        //
        if(owrdLithologyInfo) {
            myLithologyInfo   = owrdLithologyInfo;
            myLithologyLegend = owrdLithologyLegend
            if(!mySiteInfo.hole_depth_va && owrdLithDepth) { mySiteInfo.hole_depth_va = owrdLithDepth; }
            else if(mySiteInfo.hole_depth_va && owrdLithDepth) {
                if(owrdLithDepth > mySiteInfo.hole_depth_va) { mySiteInfo.hole_depth_va = owrdLithDepth; }
            }
        }

        // USGS lithology information if available and no OWRD
        //
        else if(usgsLithologyInfo) {
            myLithologyInfo   = usgsLithologyInfo;
            myLithologyLegend = usgsLithologyLegend
            if(!mySiteInfo.hole_depth_va && usgsLithDepth) { mySiteInfo.hole_depth_va = usgsLithDepth; }
            else if(mySiteInfo.hole_depth_va && usgsLithDepth) {
                if(usgsLithDepth > mySiteInfo.hole_depth_va) { mySiteInfo.hole_depth_va = usgsLithDepth; }
            }
        }

        // USGS construction information over OWRD if available
        //
        if(usgsWellConstruction) {
            myWellConstruction   = usgsWellConstruction;
            myConstructionLegend = usgsConstructionLegend
            if(!mySiteInfo.hole_depth_va && usgsWellDepth) { mySiteInfo.hole_depth_va = usgsWellDepth; }
            else if(mySiteInfo.hole_depth_va && usgsWellDepth) {
                if(usgsWellDepth > mySiteInfo.hole_depth_va) { mySiteInfo.hole_depth_va = usgsWellDepth; }
            }
            
            if(!mySiteInfo.max_dia_va && usgsWellDia) { mySiteInfo.max_dia_va = usgsWellDia; }
            else if(mySiteInfo.max_dia_va && usgsWellDia) {
                if(usgsWellDia > mySiteInfo.max_dia_va) { mySiteInfo.max_dia_va = usgsWellDia; }
            }
        }

        // OWRD construction information if available and no USGS
        //
        else if(owrdWellConstruction) {
            myWellConstruction   = owrdWellConstruction;
            myConstructionLegend = owrdConstructionLegend
            if(!mySiteInfo.hole_depth_va && owrdWellDepth) { mySiteInfo.hole_depth_va = owrdWellDepth; }
            else if(mySiteInfo.hole_depth_va && owrdWellDepth) {
                if(owrdWellDepth > mySiteInfo.hole_depth_va) { mySiteInfo.hole_depth_va = owrdWellDepth; }
            }
            
            if(!mySiteInfo.max_dia_va && owrdWellDia) { mySiteInfo.max_dia_va = owrdWellDia; }
            else if(mySiteInfo.max_dia_va && owrdWellDia) {
                if(owrdWellDia > mySiteInfo.max_dia_va) { mySiteInfo.max_dia_va = owrdWellDia; }
            }
        }

        // Plot well lithology and construction
        //
        plotLithology( [
            mySiteInfo,
            myLithologyInfo,
            myWellConstruction,
            myLithologyLegend,
            myConstructionLegend
        ]);
    });
  });

// Load text
//
function loadText(file_name) 
  {
    var myInfo = "";

    // Check file name
    //
    if(file_name.length < 1)
      {
        var message = "No file specified";
        openModal(message);
        fadeModal(4000);
        return;
      }

    // Load file
    //
    jQuery.ajax( 
                { url: file_name + "?_="+(new Date()).valueOf(),
                  dataType: "text",
                  async: false
                })
      .done(function(data)
            {
              myInfo = data;
            })
      .fail(function() 
            { 
              var message = "No file specified";
              openModal(message);
              fadeModal(4000);
              return;
            });

    return myInfo;
  }
