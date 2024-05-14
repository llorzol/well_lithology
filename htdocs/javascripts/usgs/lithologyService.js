/* Javascript plotting library for jQuery and flot.
 *
 * A JavaScript library to retrieve the lithology information
 * for a site(s).
 *
 * version 3.02
 * January 17, 2024
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

// Functions
//
//----------------------------------------------------

function processOwrdSiteService(myData)
  {
   console.log("processOwrdSiteService");
   console.log(myData);

   // Parse for site information
   //
   var feature_count = myData.feature_count;
   if(feature_count == 1)
     {
      var mySiteRecord = myData.feature_list[0];
      for(var i = 0; i < mySiteFields.length; i++)
         {
          var myColumn            = mySiteFields[i];
          var myValue             = mySiteRecord[myColumn];
          if(myValue) { LithologyInfo[myColumn] = myValue; }
          else { LithologyInfo[myColumn] = null; }
         }

      // Determine altitude accuracy
      //
      LithologyInfo['altitude_accuracy'] = 0;
      if(LithologyInfo['lsd_elevation'])
         {
          var lsd_elevation     = LithologyInfo['lsd_elevation'];
          var lsd_digits        = lsd_elevation.toString().split(".");
          if(lsd_digits.length > 1)
            {
             LithologyInfo['altitude_accuracy'] = lsd_digits[1].length;
            }
         }

      console.log(LithologyInfo);
     }

   // No site information
   //
   else
     {
      // Loading message
      //
      message = "No OWRD site information for site " + coop_site_no;
      openModal(message);
      fadeModal(6000);
     }

   // return information
   //
   return LithologyInfo;
  }

function processLithLookup(myData)
  {
   console.log("processLithLookup");
   console.log(myData);

   lithLookup = myData.lithology;

   return lithLookup;
  }

function processOwrdLithService(myData)
  {
   console.log("processOwrdLithService");
   console.log(myData);

   var ColorHash      = {};

   var max_depth_flag = LithologyInfo.max_depth;
   var max_depth      = 0;

   var myRgbTest      = /^rgb\(0, 0, 0/;
   var myRgbaTest     = /^rgba\(0, 0, 0, 0\)/;

   // Parse for site information
   //
   var feature_count = myData.feature_count;
   if(feature_count > 0)
     {
      var myLithRecords = myData.feature_list;
      for(var i = 0; i < myLithRecords.length; i++)
         {
          var LithRecord = {};
          for(var ii = 0; ii < myLithFields.length; ii++)
             {
              var myColumn            = myLithFields[ii];
              var myValue             = myLithRecords[i][myColumn];
              if(typeof myValue !== "undefined") { LithRecord[myColumn] = myValue; }
              else { LithRecord[myColumn] = null; }
            }

          // Set max depth if needed
          //
          if(! max_depth_flag && typeof LithRecord['end_depth'] !== "undefined")
            {
             max_depth = LithRecord['end_depth'];
            }
          console.log("max_depth " + max_depth + " -> " + LithRecord['end_depth']);

          // Split lithology
          //
          var myLiths = LithRecord['lithology_description'].split(" ");
          console.log("Lithology " + myLiths);

          // Set color
          //
          LithRecord['color'] = '';
          for(var ii = 0; ii < myLiths.length; ii++)
             {
                 var myColor = myLiths[ii];
                 console.log("Color " + myLiths[ii] + " -> " + colorLookup[myLiths[ii]])
                 if(myColor == '&') { continue; }
                 if(!colorLookup[myLiths[ii]])
                    {
                        $('<div class="' + myLiths[ii] + '"></div>').appendTo("body");
                        var myRgb = $('.' + myLiths[ii]).css('background-color');
                        console.log(myColor + ' -> ' + myRgb);
                        var myType = typeof myRgb;
                        console.log('Type -> ' + myType);
                        console.log(myRgbTest.test(myRgb));
                        if(myRgb == 'rgb(0, 0, 0)') { continue; }
                        else if(myRgb == 'rgba(0, 0, 0, 0)') { continue; }
                        else if(typeof myRgb === 'undefined') { continue; }
                        else if(myRgb == 'transparent') { continue; }
                        else
                        {
                            LithRecord['color']  = myColor;
                            colorLookup[myColor] = 1;
                            break;
                        }
                    }
                 else
                    {
                     LithRecord['color']  = myColor;
                     break;
                    }
            }
          console.log("Lith color " + LithRecord['color']);

          // Set lithology
          //
          var myLith        = [];
          LithRecord['svg'] = '000';
          for(var ii = 0; ii < myLiths.length; ii++)
             {
                 console.log("Lith " + myLiths[ii] + " -> " + lithLookup[myLiths[ii]])
                 if(typeof lithLookup[myLiths[ii]] !== "undefined")
                 {
                     console.log(lithLookup[myLiths[ii]])
                     LithRecord['svg'] = lithLookup[myLiths[ii]];
                     if(!myLith.indexOf(myLiths[ii]) > -1)
                     {
                        myLith.push(myLiths[ii]);
                     }
                 }
            }
          LithRecord['lithology'] = myLith.join(" & ");
          console.log("Lithology -> " + LithRecord['lithology']);
          console.log("Lithology lookup -> " + lithLookup[LithRecord['lithology']]);
          console.log(" ");
          if(typeof lithLookup[LithRecord['lithology']] !== "undefined")
            {
             LithRecord['svg'] = lithLookup[LithRecord['lithology']];
            }

          LithologyInfo['WellLithology'].push(LithRecord);

          // Set lithology defintions
          //
          if(!LithologyInfo['Lithology'].indexOf({'lithology': LithRecord['lithology'], 'symbol': LithRecord['svg'] }) > -1)
            {
             LithologyInfo['Lithology'].push({'lithology': LithRecord['lithology'], 'symbol': LithRecord['svg'] })
            }
         }

      // Set max depth if needed
      //
      if(!max_depth_flag)
        {
         LithologyInfo.max_depth = max_depth;
         console.log("max_depth " + max_depth + " -> " + LithRecord['max_depth']);
        }
     }

   // No site information
   //
   else
     {
      // Loading message
      //
      message = "No OWRD lithology information for site " + coop_site_no;
      openModal(message);
      fadeModal(6000);
     }
  }












//
// Not needed below
//

function callLithologyService(coop_site_no)
  {
   console.log("callLithologyService");

   // Loading message
   //
   //message = "Processing lithology information for site " + coop_site_no;
   //openModal(message);

   // Request for site service information
   //
   var column       = "well_logid";
   var request_type = "GET";
   var script_http  = "/cgi-bin/lithology/requestLithologyRecords.py";
   var data_http    = column + "=" + coop_site_no;
      
   var dataType     = "json";
      
   // Web request
   //
   webRequest(request_type, script_http, data_http, dataType, LithologyService);
  }


function parseColor(dataRDB)
  {
   console.log("parseColor");
   //console.log(dataRDB);

    var myRe            = /^#/;
    var lineRe          = /\r?\n/;  
    var delimiter       ='\t';
    var myData          = {};

    var myFields        = [
                           'color',
                           'code',
                           'hex',
                           'rgb'
                          ];

    var indexField      = 'color';

    // Parse in lines
    //
    var fileLines       = dataRDB.split(lineRe);

    // Column names on header line
    //
    while(fileLines.length > 0)
      {
        var fileLine = jQuery.trim(fileLines.shift());
        if(fileLine.length < 1)
          {
            continue;
          }
        if(!myRe.test(fileLine))
          {
            break;
          }
       }
      
    // Check index column name in file
    //
    //console.log(fileLine);
    var Fields = fileLine.split(delimiter);
    //console.log(Fields);
    if(jQuery.inArray(indexField,Fields) < 0)
      {
        var message = "Header line of column names does not contain " + indexField + " column\n";
        message    += "Header line contains " + Fields.join(", ");
        openModal(message);
        fadeModal(2000);
        return false;
      }
    var indexNumber = jQuery.inArray(indexField,Fields)
    var indexColor = jQuery.inArray('color',Fields)
       
    // Format line in header portion [skip]
    //
    var fileLine = jQuery.trim(fileLines.shift());

    // Data lines
    //
    var count = 0;
    while(fileLines.length > 0)
      {
        fileLine = jQuery.trim(fileLines.shift());
        if(myRe.test(fileLine))
          {
            continue;
          }
        if(fileLine.length > 1)
          {
            var Values         = fileLine.split(delimiter);
            var indexValue     = Values[indexNumber];
          
            var Color          = Values[indexColor];
            myData[indexValue] = Color;
            count++;
          }
      }

   colorLookup = myData;
   console.log(colorLookup);

   requestLookup(lithFile, parseLith)

   return;
  }
 
function parseLith(dataRDB)
  {
   console.log("parseLith");
   //console.log(dataRDB);

    var myRe            = /^#/;
    var lineRe          = /\r?\n/;  
    var delimiter       ='\t';
    var myData          = {};

    var myFields        = [
                           'symbol'
                          ];

    var indexField      = 'lithology';

    // Parse in lines
    //
    var fileLines       = dataRDB.split(lineRe);

    // Column names on header line
    //
    while(fileLines.length > 0)
      {
        var fileLine = jQuery.trim(fileLines.shift());
        if(fileLine.length < 1)
          {
            continue;
          }
        if(!myRe.test(fileLine))
          {
            break;
          }
       }
      
    // Check index column name in file
    //
    //console.log(fileLine);
    var Fields = fileLine.split(delimiter);
    //console.log(Fields);
    if(jQuery.inArray(indexField,Fields) < 0)
      {
        var message = "Header line of column names does not contain " + indexField + " column\n";
        message    += "Header line contains " + Fields.join(", ");
        openModal(message);
        fadeModal(2000);
        return false;
      }
    var indexNumber = jQuery.inArray(indexField,Fields)
       
    // Format line in header portion [skip]
    //
    var fileLine = jQuery.trim(fileLines.shift());

    // Data lines
    //
    var count = 0;
    while(fileLines.length > 0)
      {
        fileLine = jQuery.trim(fileLines.shift());
        if(myRe.test(fileLine))
          {
            continue;
          }
        if(fileLine.length > 1)
          {
            var Values        = fileLine.split(delimiter);
            var indexValue    = Values[indexNumber];
          
            for(var i = 0; i < myFields.length; i++)
              {
                var Value = Values[jQuery.inArray(myFields[i],Fields)];
                if(typeof Value === "undefined" || Value.length < 1)
                  {
                    Value = "";
                  }
                if(!myData[indexValue]) { myData[indexValue] = {}; }
                myData[indexValue][myFields[i]] = Value;
              }
            count++;
          }
      }

   lithLookup = myData;
   console.log(lithLookup);

   requestOwrdLithService();

   return;
  }
