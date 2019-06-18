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
import uuid
import socket
import logging
import logging.config
from fgapiservergui_config import fg_config
from fgapiservergui_db import\
    get_db,\
    fgapisrv_db
from fgapiservergui_queries import\
    fg_queries


"""
  FutureGateway APIServer tools
"""

__author__ = 'Riccardo Bruno'
__copyright__ = '2019'
__license__ = 'Apache'
__version__ = 'v0.0.0'
__maintainer__ = 'Riccardo Bruno'
__email__ = 'riccardo.bruno@ct.infn.it'
__status__ = 'devel'
__update__ = '2019-06-18 10:46:49'

# Logging
logger = logging.getLogger(__name__)

#
# Tooling functions commonly used by fgapiserber_ source codes
#


def check_db_ver():
    """
    Database version check

    :return: This function will check the database connectivity, set the
             fgapisrv_db global variable and terminate with error if the
             database schema version is not aligned with the version
             required by the code; see fgapisrv_dbver in configuration file
    """

    if fgapisrv_db is None:
        msg = "Unable to connect to the database!"
        logging.error(msg)
        print(msg)
        sys.exit(1)
    else:
        # getDBVersion
        db_ver = fgapisrv_db.get_db_version()
        conf_db_ver = fg_config['dbver']
        if conf_db_ver is None or \
           conf_db_ver == '' or \
           conf_db_ver != db_ver:
            msg = ("Current database version '%s' is not compatible "
                   "with this version of the API server front-end; "
                   "version %s is required.\n"
                   "It is suggested to update your database applying "
                   "new available patches."
                   % (db_ver, conf_db_ver))
            logging.error(msg)
            sys.exit(1)
    logging.debug("Check database version passed")
    return db_ver


def srv_uuid():
    """
    Service UUID

    :return: This function returns the service UUID calculated
             using the server' hostname
    """

    # UUID from hostname/IP
    return uuid.uuid3(uuid.NAMESPACE_DNS, socket.gethostname())

#
# Envconfig DB config  and registry functions
#


def check_db_reg(config):
    """
    Running server registration check

    :return: This fucntion checks if this running server has been registered
             into the database. If the registration is not yet done, the
             registration will be performeded and the current configuration
             registered. If the server has been registered return the
             configuration saved froms the previous registration.
    """

    # Retrieve the service UUID
    fgapisrv_uuid = srv_uuid()
    if not fgapisrv_db.is_srv_reg(str(fgapisrv_uuid)):
        # The service is not registered
        # Register the service and its configuration variables taken from
        # the configuration file and overwritten by environment variables
        logging.debug("Server has uuid: '%s' and it results not yet registered"
                      % fgapisrv_uuid)
        fgapisrv_db.srv_register(str(fgapisrv_uuid), config)
        db_state = fgapisrv_db.get_state()
        if db_state[0] != 0:
            msg = ("Unable to register service under uuid: '%s'"
                   % fgapisrv_uuid)
            logging.error(msg)
            sys.exit(1)
    else:
        # Registered service checks for database configuration
        logging.debug("Service with uuid: '%s' is already registered"
                      % fgapisrv_uuid)


def update_db_config(config):
    """
        Update given configuration with registered service configuration

        :return: When this function is called the service is already registered
                 and passed configuration values are compared with database
                 settings that will have highest priority. Returned value
                 will be the setting extracted from the DB if enabled.
    """

    # Retrieve the service UUID
    fgapisrv_uuid = srv_uuid()
    db_config = fgapisrv_db.srv_config(str(fgapisrv_uuid))
    for key in config.keys():
        if config[key] != db_config[key]:
            logging.debug("DB configuration overload: conf(%s)='%s'<-'%s'"
                          % (key, config[key], db_config[key]))
            config[key] = db_config[key]
    return config


def check_db_queries():
    """
        Running server registration check on database queries object

        :return: This function does not return any value, it just cjecks that
                 fgQueries object is activated
    """

    if(fg_queries is None or fg_queries.is_enabled() is not True):
        msg = "Database queries class is not acrivated"
        logging.error(msg)
        sys.exit(1)
