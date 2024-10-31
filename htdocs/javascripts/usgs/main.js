/**
 * Namespace: Main
 *
 * Main is a JavaScript library to provide a set of functions to manage
 *  the web requests.
 *
 * version 3.18
 * October 13, 2024
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

// Log4js
//
let myLogger = new Log4js.getLogger("consoleTest");
myLogger.setLevel(Log4js.Level.DEBUG);
//myLogger.setLevel(Log4js.Level.INFO);
let consoleAppender = new Log4js.ConsoleAppender(true);
myLogger.addAppender(consoleAppender);

// Global variables
//
var LithologyInfo = {};
var indexField    = "coop_site_no";
var myLithFields  = [
                     'site_number',
                     'start_depth',
                     'end_depth',
                     'lithology',
                     'lithology_description',
                     'color',
                     'water_bearing_zone',
                     'water_bearing_zone_water_level'
                    ];

var mySiteFields  = [
                     'aquifer',
                     'aquifer_description',
                     'latitude_dec',
                     'longitude_dec',
                     'lsd_elevation',
                     'elevation_datum',
                     'max_depth',
                     'observation_status',
                     'other_identity_id',
                     'primary_use',
                     'state_observation_well_nbr',
                     'usgs_pls_notation_display',
                     'water_level_count',
                     'y_max',
                     'y_min'
                    ];

for(var i = 0; i < mySiteFields.length; i++)
   {
    var myColumn            = mySiteFields[i];
    LithologyInfo[myColumn] = null;
   }

LithologyInfo['WellLithology'] = [];
LithologyInfo['Lithology']     = [];
LithologyInfo['Color']         = [];

var myColumn      = 'gw_logid';

var colorFile     = 'color_lookup.txt';
var colorLookup   = {};
var lookupFile    = 'lithology_lookup.json';
var lithLookup    = {};

var delimiter        = '\t';

var gw_logid;
var coop_site_no;
var station_nm;
var latitude;
var longitude;
var lsdelev;
var lsdaccuracy;
var lsdelevdatum;

var aboutFiles     = {
                      "welcome_text" :              "lithology_welcome.txt",
                      "general_instructions_text" : "lithology_Features.txt",
                      "contacts_text" :             "lithology_contacts.txt"
};

// Prepare when the DOM is ready 
//
$(document).ready(function() 
  {
    // Loading message
    //
    message = "Processing lithology information ";
    openModal(message);
    console.log(message);

    // Insert accordion text
    //
    jQuery.each(aboutFiles, function(keyItem, keyFile) {

      var InfoText = loadText(keyFile);

      jQuery("#" + keyItem).html(InfoText);

    });

    // Current url
    //-------------------------------------------------
    var url     = new URL(window.location.href);
    //console.log("Current Url " + window.location.href);

    // Parse
    //-------------------------------------------------
    coop_site_no = url.searchParams.get("coop_site_no");

    coop_site_no = checkCoopSiteNo(coop_site_no);

    if(!coop_site_no)
    {
      var message = "Incorrectly formatted OWRD well log ID: ";
      message    += "You must use the OWRD well log ID, which has a four-character county abbrevation ";
      message    += "along with from 1 to 7 padded digit well number.";
      openModal(message);
      fadeModal(2000);

      return;
    }

    // Build ajax requests
    //
    console.log("Requesting OWRD site and lithology information for " + coop_site_no);

    var county_nm  = coop_site_no.slice(0,4);
    var pad        = "0000000";
    var county_no  = coop_site_no.slice(5).trim();

    gw_logid       = county_nm + (pad + county_no).slice(-pad.length);

    // Build ajax requests
    //
    var webRequests  = [];

    // Request for site information
    //
    var request_type = "GET";
    var script_http  = 'https://apps.wrd.state.or.us/apps/gw/gw_data_rws/api/' + gw_logid + '/gw_site_summary/?public_viewable=Y'
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
        message = "Processed site information";
        openModal(message);
        fadeModal(2000);
        LithologyInfo = processOwrdSiteService(myData);
        //console.log(`mySiteData ${mySiteData}`);
      },
      error: function (error) {
        message = `Failed to load site information ${error}`;
        openModal(message);
        fadeModal(2000);
        return false;
      }
    }));

    // Request for lithology lookup information
    //
    var request_type = "GET";
    var script_http  = 'data/' + lookupFile
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
        message = "Processed lithology lookup information";
        openModal(message);
        fadeModal(2000);
        lithLookup = processLithLookup(myData);
        //console.log(`mySiteData ${mySiteData}`);
      },
      error: function (error) {
        message = `Failed to load lithology lookup information ${error}`;
        openModal(message);
        fadeModal(2000);
        return false;
      }
    }));

    // Request for site lithology information
    //
    var request_type = "GET";
    var script_http  = 'https://apps.wrd.state.or.us/apps/gw/gw_data_rws/api/' + gw_logid + '/gw_lithology/'
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
        message = "Processed site lithology information";
        openModal(message);
        fadeModal(2000);
        processOwrdLithService(myData);
        //console.log(`mySiteData ${mySiteData}`);
      },
      error: function (error) {
        message = `Failed to load site lithology information ${error}`;
        openModal(message);
        fadeModal(2000);
        return false;
      }
    }));

    // Run ajax requests
    //
    $.when.apply($, webRequests).then(function() {

      fadeModal(2000);

      plotLithology(LithologyInfo);
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
