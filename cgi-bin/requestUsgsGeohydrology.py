#!/usr/bin/env python
#
###############################################################################
# $Id: requestUsgsGeoh.py
#
# Project:  wellConstruction
# Purpose:  Script outputs Geohydrology information from NWIS data records
#            in JSON format.
# 
# Author:   Leonard Orzol <llorzol@usgs.gov>
#
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

import os, sys, string, re

import csv

import json

# Set up logging
#
import logging

# -- Set logging file
#
# Create screen handler
#
screen_logger = logging.getLogger()
formatter     = logging.Formatter(fmt='%(message)s')
console       = logging.StreamHandler()
console.setFormatter(formatter)
screen_logger.addHandler(console)
screen_logger.setLevel(logging.INFO)

# Import modules for CGI handling
#
from urllib.parse import urlparse, parse_qs

# Parse the Query String
#
params = {}

HardWired = None
#HardWired = 1

if HardWired is not None:
    #os.environ['QUERY_STRING'] = 'site_no=420358121280001'
    #os.environ['QUERY_STRING'] = 'site_no=414903121234001'
    #os.environ['QUERY_STRING'] = 'site_no=430508119582001'
    #os.environ['QUERY_STRING'] = 'site_no=434124119270901'
    #os.environ['QUERY_STRING'] = 'site_no=432822119011501'
    #os.environ['QUERY_STRING'] = 'site_no=431357118582301'
    #os.environ['QUERY_STRING'] = 'site_no=452335122564301'
    #os.environ['QUERY_STRING'] = 'site_no=453705119513901'
    #os.environ['QUERY_STRING'] = 'site_no=415947121243401'
    os.environ['QUERY_STRING'] = 'site_no=445301123054901'

if 'QUERY_STRING' in os.environ:
    queryString = os.environ['QUERY_STRING']

    queryStringD = parse_qs(queryString, encoding='utf-8')

    myParmsL = [
        'site_no'
    ]

    for myParm in myParmsL:
        myItems = re.escape(queryStringD.get(myParm, [''])[0]).split(',')
        if len(myItems) > 1:
            params[myParm] = re.escape(queryStringD.get(myParm, [''])[0])
        else:
            params[myParm] = re.escape(myItems[0])

if 'site_no' in params:
    site_no = params['site_no']
else:
    message = "Requires a NWIS site number"
    print("Content-type:application/json\n\n")
    print('{ "message": "%s" }' % message)
    sys.exit()
    
# ------------------------------------------------------------
# -- Set
# ------------------------------------------------------------
debug           = False

program         = "USGS Geohydrology Script"
version         = "3.01"
version_date    = "23December2024"

program_args    = []

# =============================================================================
def errorMessage(error_message):

    screen_logger.info(error_message)
    print("Content-type:application/json\n\n")
    print('{ "message": "%s" }' % message)
    sys.exit()

# =============================================================================
def processAqfrCodes (aqfr_lookup_file):

    aqfrInfoD   = {}

    # Create a CSV reader object and remove comment header lines
    #
    try:
        with open(aqfr_lookup_file, "r") as fh:
            csv_reader = csv.DictReader(filter(lambda row: row[0]!='#', fh), delimiter='\t')
            for tempD in csv_reader:
                aqfr_cd = tempD['aqfr_cd']
                aqfr_nm = tempD['aqfr_nm']

                aqfrInfoD[aqfr_cd] = aqfr_nm

    except FileNotFoundError:
        message = 'File %s not found' % aqfr_lookup_file
        errorMessage(message)
    except PermissionError:
        message = 'No permission to access file %s' % aqfr_lookup_file
        errorMessage(message)
    except Exception as e:
        message = 'An error occurred: %s' % e
        errorMessage(message)

    # Error
    #
    if len(aqfrInfoD) < 1:
        message = 'No aquifer definitions loaded from file %s' % aqfr_lookup_file
        errorMessage(message)        

    return aqfrInfoD

# =============================================================================
def jsonDefinitions (well_lookup_file):

    jsonD = {}
    
    # Read json file
    #
    try:
        with open(well_lookup_file, "r") as fh:
            jsonD = json.load(fh)
            sealD = jsonD['seal_cd']['Codes']
            csngD = jsonD['csng_material_cd']['Codes']
            openD = jsonD['open_cd']['Codes']
            geohD = jsonD['lith_cd']['Codes']
    except FileNotFoundError:
        message = 'File %s not found' % well_lookup_file
        errorMessage(message)
    except PermissionError:
        message = 'No permission to access file %s' % well_lookup_file
        errorMessage(message)
    except Exception as e:
        message = 'An error occurred: %s' % e
        errorMessage(message)

    # Error
    #
    if len(jsonD) < 1:
        message = 'No well construction definitions loaded from file %s' % well_lookup_file
        errorMessage(message)

    return sealD, csngD, openD, geohD

# =============================================================================

def processNwisFile (nwisFile, site_no):

    keyColumn = 'site_no'
    siteInfoL   = []
    siteFlag    = False

    # Create a CSV reader object and remove comment header lines
    #
    try:
        with open(nwisFile, "r") as fh:
            csv_reader = csv.DictReader(filter(lambda row: row[0]!='#', fh), delimiter='\t')

            # Loop through file
            #
            for tempD in csv_reader:

                # Check for sites with no valid location
                #
                if tempD[keyColumn] == site_no:
                    # Set empty value to None
                    #
                    for key, value in tempD.items():
                        if len(value) < 1:
                            tempD[key] = None

                    siteInfoL.append(tempD)
                    siteFlag = True

                else:
                    if siteFlag:
                        break
                    
    except FileNotFoundError:
        message = 'File %s not found' % nwisFile
        errorMessage(message)
    except PermissionError:
        message = 'No permission to access file %s' % nwisFile
        errorMessage(message)
    except Exception as e:
        message = 'An error occurred: %s' % e
        errorMessage(message)

    return siteInfoL

# =============================================================================

# ----------------------------------------------------------------------
# -- Main program
# ----------------------------------------------------------------------
well_lookup_file = "data/well_construction_lookup.json"
aqfr_lookup_file = "data/aqfr_cd_query.txt"

# Read
#
if os.path.exists(well_lookup_file):

    sealDefs, csngDefs, openDefs, geohDefs = jsonDefinitions(well_lookup_file)

else:
    message = "Can not open well definitions file %s" % well_lookup_file
    errorMessage(message)

# Read
#
if os.path.exists(aqfr_lookup_file):

    # Open file
    #
    aqfrInfoD = processAqfrCodes(aqfr_lookup_file)

else:
    message = "Can not open NWIS aquifer definitions file %s" % aqfr_lookup_file
    errorMessage(message)

# Read
#
nwis_file = os.path.join("data", "gw_geoh_01.txt")
if os.path.exists(nwis_file):

    # Open file
    #
    geohInfoD = processNwisFile(nwis_file, site_no)

else:
    message = "NWIS file %s does not exist" % nwis_file
    errorMessage(message)

# Prepare geohydrology output
# -------------------------------------------------
#

# Process geohydrology records
#
geohsL = []
if len(geohInfoD) > 0:

    for record in geohInfoD:
        geoh             = True
        geoh_seq_nu      = int(record['geoh_seq_nu'])
        lith_cd          = record['lith_cd']
        lith_top_va      = record['lith_top_va']
        lith_bottom_va   = record['lith_bottom_va']
        lith_unit_cd     = record['lith_unit_cd']
        lith_ds          = record['lith_ds']

        try:
            lith_top_va = float(record['lith_top_va'])
        except:
            lith_top_va = None
        try:
            lith_bottom_va = float(record['lith_bottom_va'])
        except:
            lith_bottom_va = None

        # Valid record
        #
        recordD                   = {}
        recordD['geoh_seq_nu']    = geoh_seq_nu
        recordD['lith_top_va']    = lith_top_va
        recordD['lith_bottom_va'] = lith_bottom_va
        recordD['lith_cd']        = lith_cd
        recordD['lith_unit_cd']   = lith_unit_cd
        if lith_cd is not None:
            recordD['lith_ds'] = geohDefs[lith_cd]
        if lith_unit_cd is not None :
            recordD['lith_unit_ds'] = aqfrInfoD[lith_unit_cd]

        geohsL.append(recordD)

# Output json
# -------------------------------------------------
#
cnsL  = []
jsonL = []

jsonL.append("{")

if len(geohsL) > 0:
    GeolL = []
    for myRecord in geohsL:
        GeolL.append(json.dumps(myRecord))
    cnsL.append('"gw_geoh":' + '[' + ",".join(GeolL) + ']')

jsonL.append(",".join(cnsL))

jsonL.append('}')

# Output json
# -------------------------------------------------
#
print("Content-type:application/json\n\n")
print("".join(jsonL))

sys.exit()
