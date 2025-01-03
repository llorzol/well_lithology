#!/usr/bin/env python
#
###############################################################################
# $Id: wellConstruction.py
#
# Project:  wellConstruction
# Purpose:  Script outputs well construction information from NWIS data records
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
    os.environ['QUERY_STRING'] = 'site_no=422031121400001'

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

program         = "USGS Well Construction Script"
version         = "3.07"
version_date    = "03January2025"

program_args    = []

# =============================================================================
def errorMessage(error_message):

    screen_logger.info(error_message)
    print("Content-type:application/json\n\n")
    print('{ "message": "%s" }' % message)
    sys.exit()

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
table_nmL        =  ['gw_cons', 'gw_hole', 'gw_csng', 'gw_open']

# Read
#
if os.path.exists(well_lookup_file):

    sealDefs, csngDefs, openDefs, geohDefs = jsonDefinitions(well_lookup_file)

else:
    message = "Can not open well definitions file %s" % well_lookup_file
    errorMessage(message)

# Read
#
for file in table_nmL:

    nwis_file = os.path.join("data", "".join([file, "_01.txt"]))
    if os.path.exists(nwis_file):

        # Open file
        #
        nwisInfoD = processNwisFile(nwis_file, site_no)

        if file == "gw_cons":
            consInfoD = nwisInfoD
        elif file == "gw_hole":
            holeInfoD = nwisInfoD
        elif file == "gw_csng":
            csngInfoD = nwisInfoD
        elif file == "gw_open":
            openInfoD = nwisInfoD

    else:
        message = "NWIS file %s does not exist" % nwis_file
        errorMessage(message)

# Prepare output
# -------------------------------------------------
#

# Process seal records
#
sealsL = []
if len(consInfoD) > 0:

    for record in consInfoD:
        seal             = True
        cons_seq_nu      = int(record['cons_seq_nu'])
        cons_src_cd      = record['cons_src_cd']
        seal_cd          = record['seal_cd']

        try:
            seal_depth_va = float(record['seal_depth_va'].strip())
        except:
            seal_depth_va = None

        # Valid record
        #
        recordD                  = {}
        recordD['cons_seq_nu']   = cons_seq_nu
        recordD['seal_depth_va'] = seal_depth_va
        recordD['seal_ds']       = None
        if seal_cd is not None:
            recordD['seal_ds'] = sealDefs[seal_cd]

        sealsL.append(recordD)

# Process hole records
#
holesL = []
if len(holeInfoD) > 0:

    for record in holeInfoD:
        hole           = True
        cons_seq_nu    = int(record['cons_seq_nu'])
        hole_seq_nu    = int(record['hole_seq_nu'])
        try:
            hole_top_va      = float(record['hole_top_va'])
        except:
            hole             = False
        try:
            hole_bottom_va   = float(record['hole_bottom_va'])
        except:
            hole             = False
        try:
            hole_dia_va      = float(record['hole_dia_va'])
        except:
            hole             = False

        # Valid record
        #
        if hole:
            recordD                   = {}
            recordD['cons_seq_nu']    = cons_seq_nu
            recordD['hole_seq_nu']    = hole_seq_nu
            recordD['hole_top_va']    = hole_top_va
            recordD['hole_bottom_va'] = hole_bottom_va
            recordD['hole_dia_va']    = hole_dia_va

            holesL.append(recordD)

# Process casing records
#
csngsL = []
if len(csngInfoD) > 0:

    for record in csngInfoD:
        csng             = True
        cons_seq_nu      = int(record['cons_seq_nu'])
        csng_seq_nu      = int(record['csng_seq_nu'])
        csng_material_cd = record['csng_material_cd']

        try:
            csng_top_va      = float(record['csng_top_va'])
        except:
            csng             = False
        try:
            csng_bottom_va   = float(record['csng_bottom_va'])
        except:
            csng             = False
        try:
            csng_dia_va      = float(record['csng_dia_va'])
        except:
            csng             = False

        # Valid record
        #
        if csng:

            recordD                     = {}
            recordD['cons_seq_nu']      = cons_seq_nu
            recordD['csng_seq_nu']      = csng_seq_nu
            recordD['csng_top_va']      = csng_top_va
            recordD['csng_bottom_va']   = csng_bottom_va
            recordD['csng_dia_va']      = csng_dia_va
            recordD['csng_material_cd'] = csng_material_cd
            recordD['csng_material_ds'] = None
            recordD['csng_material_cl'] = None
            if csng_material_cd is not None:
                recordD['csng_material_ds'] = csngDefs[csng_material_cd]

            csngsL.append(recordD)

            
# Process open interval records
#
opensL = []
if len(openInfoD) > 0:

    for record in openInfoD:
        opens            = True
        cons_seq_nu      = int(record['cons_seq_nu'])
        open_seq_nu      = int(record['open_seq_nu'])
        open_cd          = record['open_cd']
        open_material_cd = record['open_material_cd']

        try:
            open_dia_va      = float(record['open_dia_va'])
        except:
            opens            = False
        try:
            open_top_va      = float(record['open_top_va'])
        except:
            opens            = False
        try:
            open_bottom_va   = float(record['open_bottom_va'])
        except:
            opens            = False

        # Valid record
        #
        if opens:

            recordD                     = {}
            recordD['cons_seq_nu']      = cons_seq_nu
            recordD['open_seq_nu']      = open_seq_nu
            recordD['open_top_va']      = open_top_va
            recordD['open_bottom_va']   = open_bottom_va
            recordD['open_dia_va']      = open_dia_va
            recordD['open_cd']          = open_cd
            recordD['open_ds']          = None
            if open_cd is not None:
                recordD['open_ds'] = openDefs[open_cd]

            opensL.append(recordD)

# Output json
# -------------------------------------------------
#
cnsL  = []
jsonL = []

jsonL.append("{")
jsonL.append('"well_construction":' + '{')

if len(sealsL) > 0:
    SealL = []
    for myRecord in sealsL:
        SealL.append(json.dumps(myRecord))
    cnsL.append('"gw_cons":' + '[' + ",".join(SealL) + ']')
    
if len(holesL) > 0:
    HoleL = []
    for myRecord in holesL:
        HoleL.append(json.dumps(myRecord))
    cnsL.append('"gw_hole":' + '[' + ",".join(HoleL) + ']')

if len(csngsL) > 0:
    CsngL = []
    for myRecord in csngsL:
        CsngL.append(json.dumps(myRecord))
    cnsL.append('"gw_csng":' + '[' + ",".join(CsngL) + ']')

if len(opensL) > 0:
    OpenL = []
    for myRecord in opensL:
        OpenL.append(json.dumps(myRecord))
    cnsL.append('"gw_open":' + '[' + ",".join(OpenL) + ']')

jsonL.append(",".join(cnsL))

jsonL.append('}')
jsonL.append('}')

# Output json
# -------------------------------------------------
#
print("Content-type:application/json\n\n")
print("".join(jsonL))

sys.exit()
