#!/usr/bin/env python
# Copyright (c) 2015:
# Istituto Nazionale di Fisica Nucleare (INFN), Italy
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


#
# fgapiserver_queries - Provide queries for fgapiserver tests
#

__author__ = 'Riccardo Bruno'
__copyright__ = '2019'
__license__ = 'Apache'
__version__ = 'v0.0.0'
__maintainer__ = 'Riccardo Bruno'
__email__ = 'riccardo.bruno@ct.infn.it'
__status__ = 'devel'
__update__ = '2019-05-03 17:04:36'


fgapiservergui_queries_queries = [
    {'id': 0,
     'query': 'SELECT VERSION();',
     'result': [['test_version', ], ]},
    {'id': 1,
     'query': ('select uuid, creation, last_access, enabled, cfg_hash '
               'from srv_registry;'),
     'result': [['test_uuid1', '1/1/1970', '1/1/1970', 'true', 'test_hash1'],
                ['test_uuid2', '1/1/1970', '1/1/1970', 'true', 'test_hash2'], ]},
    {'id': 2,
      'query': ('select id, name, first_name, last_name, institute, mail '
                'from fg_user where name=\'%s\';'),
      'result': [[1, 'futuregateway', 'futuregateway', 'futuregateway',
                 'infn', 'futuregateway@futuregateway'], ]},
]

# fgapiserver tests queries
queries = [
    {'category': 'fgapiservergui_queries',
     'statements': fgapiservergui_queries_queries}]
