#!/usr/bin/env python
# -*- coding: utf-8 -*-
# Copyright (c) 2015:
# Istituto Nazionale di Fisica Nucleare (INFN), Italy
#
# See http://www.infn.it  for details on the copyrigh holder
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import sys
import logging
import logging.config
from futuregatewayapis import FutureGatewayAPIs
from fgapiservergui_db import fgapisrv_db
from fgapiservergui_config import fg_config
from fgapiservergui_tools import\
    check_db_ver,\
    check_db_reg,\
    check_db_queries
from fgapiservergui_queries import fg_queries, fgQueriesError
from flask import Flask, request
from flask import render_template

"""
  FutureGateway fgAPIServerGUI
"""
__author__ = 'Riccardo Bruno'
__copyright__ = '2019'
__license__ = 'Apache'
__version__ = 'v0.0.0'
__maintainer__ = 'Riccardo Bruno'
__email__ = 'riccardo.bruno@ct.infn.it'
__status__ = 'devel'
__update__ = '2019-06-16 09:23:51'

# Create root logger object and configure logger
logging.config.fileConfig(fg_config['logging_conf'])

#
# The fgAPIServerDaemon starts here
#

# Get database object and check the DB
check_db_ver()


# Server registration and configuration from fgdb
check_db_reg(fg_config)


# Database queries object ckeck
check_db_queries()

# Create root logger object and configure logger
logging.config.fileConfig('logging.conf')


# Futuregateway python APIs object
fgAPIs = FutureGatewayAPIs(
    fg_config['apiserver'],
    fg_config['fgapiver'],
    fg_config['fgapiserver_user'],
    fg_config['fgapiserver_password'])

# Generate application state object
app_state = {
    'fgapis': fgAPIs,
    'name': fg_config['service_name'],
    'logged': False,
    'configured': False,
    'user': fg_config['fgapiserver_user'],
    'password': fg_config['fgapiserver_password'],
    'apiserver': fg_config['apiserver'],
    'page': None,
    'dbver': '',
    'err_flag': False,
    'err_msg': False,
    'remote_addr': ''
}

# Create Flask app
app = Flask(__name__)


# Main page showing the dashboard
@app.route('/')
def index():
    logging.debug('page: /')
    # Remote addr
    app_state['remote_addr'] = request.remote_addr
    # Start queries sequence
    app_state['err_flag'] = False
    try:
        # Get running MySQL version
        query_info = fg_queries.init_query(sql='SELECT VERSION()')
        query_info = fg_queries.do_query(query_info)
        app_state['dbver'] = query_info['sql_result'][0][0]
    except fgQueriesError as e:
        app_state['err_flag'] = True
        app_state['err_msg'] = query_info['err_msg']
    # Set page name
    app_state['page'] = 'Dashboard'
    return render_template('index.html', app_state=app_state)


# Executing in standalone mode (debug)
if __name__ == '__main__':
    logging.debug('Starting %s in stand-alone mode (debug)'
                  % fg_config['service_name'])
    app.run(debug=True)
    sys.exit(0)
