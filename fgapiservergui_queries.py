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
from fgapiservergui_config import fg_config
from fgapiservergui_db import fgapisrv_db
import MySQLdb

"""
  GridEngine APIServerDaemon database
"""
__author__ = 'Riccardo Bruno'
__copyright__ = '2019'
__license__ = 'Apache'
__version__ = 'v0.0.0'
__maintainer__ = 'Riccardo Bruno'
__email__ = 'riccardo.bruno@ct.infn.it'
__status__ = 'devel'
__update__ = '2019-06-18 14:46:39'


# Logging
logger = logging.getLogger(__name__)


class fgQueries:
    """
    Class to execute SQL queries on FutureGateway database
    """

    # This flag disable any class activity
    activation_flag = True

    def __init__(self):
        if(fgapisrv_db.test() is not True):
            self.activation_flag = False

    def is_enabled(self):
        return self.activation_flag

    def init_query(self, **kwargs):
        """
            Initialize query

            Initialize a query using a configurable set of input parameters

            :param sql_safe: True for BEGIN/END transaction in the middle of
                             the given query execution
            :param sql: The SQL query to execute. It may contain %s arguments
                        to execute parametric queries. In this case the option
                        'sql_data' is mandatory
            :param sql_data: A tuple containing values of the given parametric
                             query
            :param sql_fields: A tuple conatining the query (SELECT) column
                               names. In this case each record will be a
                               dictionary in the form of:
                                 {'column_name': 'column_value', ...}
            :return query_info: query information dictionary
        """
        query_info = {
            'sql_safe': False,
            'sql': '',
            'sql_data': (),
            'sql_fields': (),
            'sql_result': {},
            'err_flag': False,
            'err_msg': '',
        }
        # Process the argument list overriding default empty values
        for key, value in kwargs.items():
            if key not in query_info:
                loggin.warning('Unespected parameter: \'%s\'' % key)
            query_info[key] = value
        return query_info

    def do_query(self, query_info):
        """
            This call executes a given query as described by the query info
            object.

            :return: Return the same query_info object enriched with query
                     results
        """
        sql = query_info.get('sql', '')
        sql_data = query_info.get('sql_data', ())
        if(sql == ''):
            logging.error("Empty query in query info")
            return None

        db = None
        cursor = None
        safe_transaction = False
        try:
            db = fgapisrv_db.connect(query_info.get('sql_safe', False))
            cursor = db.cursor()
            logging.debug(sql % sql_data)
            cursor.execute(sql, sql_data)
            sql_results = []
            for record in cursor:
                sql_result = {}
                if len(query_info['sql_fields']) > 0:
                    i = 0
                    for key in query_info['sql_fields']:
                        sql_result[key] = record[i]
                        i += 1
                else:
                    sql_result = record
                sql_results.append(sql_result)
            query_info['sql_result'] = sql_results
            query_info['err_flag'] = False
            query_info['err_msg'] = ''
            logging.debug("Query success: %s " % sql_results)
        except MySQLdb.Error as e:
            fgapisrv_db.catch_db_error(e, db, safe_transaction)
            query_info['err_flag'] = fgapisrv_db.err_flag
            query_info['err_msg'] = fgapisrv_db.err_msg
            raise fgQueriesError(fgapisrv_db.err_msg, query_info)
        finally:
            fgapisrv_db.close_db(db, cursor, safe_transaction)
        return query_info


class fgQueriesError(Exception):
    def __init__(self, message, query_info):
        # Call the base class constructor with the parameters it needs
        super(fgQueriesError, self).__init__(message)


# FutureGateway database queries object
fg_queries = fgQueries()
if fg_queries is None:
    logging.error("No FutureGateway queries object retrieved")
