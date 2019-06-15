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

import logging
import logging.config
from futuregatewayapis import FutureGatewayAPIs
from fgapiservergui_config import fg_config
from fgapiservergui_tools import\
    check_db_ver,\
    check_db_reg
from flask import Flask
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
__update__ = '2019-06-15 00:25:22'

# Create root logger object and configure logger
logging.config.fileConfig(fg_config['logging_conf'])

#
# The fgAPIServerDaemon starts here
#

# Get database object and check the DB
check_db_ver()

# Server registration and configuration from fgdb
check_db_reg(fg_config)


# Create root logger object and configure logger
logging.config.fileConfig('logging.conf')


app = Flask(__name__)
fgAPIs = FutureGatewayAPIs(
    'http://localhost/fgapiserver',
    'v1.0',
    'futuregateway',
    'futuregateway')

webapp = {
    'fgapis': fgAPIs,
    'name': 'fgAPIServerGUI',
    'logged': False,
    'configured': False,
    'user': None,
    'apiserver': 'http://localhost/fgapiserver',
    'page': None
}


@app.route('/')
def index():
    logging.debug('Called index')
    webapp['page'] = 'Dashboard'
    return render_template('index.html', webapp=webapp)


if __name__ == '__main__':
    logging.debug('Starting app in stand-alone mode (debug)')
    app.run(debug=True)
