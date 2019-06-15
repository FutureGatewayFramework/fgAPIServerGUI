#!/usr/bin/env python
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

import unittest
from fgapiservergui_queries import fg_queries
import hashlib
import os

__author__ = 'Riccardo Bruno'
__copyright__ = '2019'
__license__ = 'Apache'
__version__ = 'v0.0.0'
__maintainer__ = 'Riccardo Bruno'
__email__ = 'riccardo.bruno@ct.infn.it'
__status__ = 'devel'
__update__ = '2019-06-15 16:06:25'

# FGTESTS_STOPATFAIL environment controls the execution
# of the tests, if defined, it stops test execution as
# soon as the first test error occurs
stop_at_fail = os.getenv('FGTESTS_STOPATFAIL') is not None


class TestfgAPIServerGUI_Queries(unittest.TestCase):

    @staticmethod
    def banner(test_name):
        print("")
        print("------------------------------------------------")
        print(" Testing: %s" % test_name)
        print("------------------------------------------------")

    @staticmethod
    def md5sum(filename, blocksize=65536):
        hash_value = hashlib.md5()
        with open(filename, "rb") as f:
            for block in iter(lambda: f.read(blocksize), b""):
                hash_value.update(block)
        return hash_value.hexdigest()

    @staticmethod
    def md5sum_str(string):
        return hashlib.md5(string).hexdigest()

    #
    # Queries
    #

    def test_not_null(self):
        self.banner("Testing query object is not null")
        assert fg_queries is not None

    def test_activation(self):
        self.banner("Activated flag")
        self.assertEqual(True, fg_queries.is_enabled())

    def test_simple_query(self):
        sql = 'SELECT VERSION();'
        self.banner("Testing simple query '%s'" % sql)
        query_info = {'sql_safe': False,
                      'sql': sql,
                      'sql_data': (),
                      'sql_fields': (),
                      'sql_result': {},
                      'err_flag': False,
                      'err_msg': '', }
        query_info = fg_queries.do_query(query_info)
        self.assertEqual(query_info['err_flag'], False)


if __name__ == '__main__':
    print("----------------------------------")
    print("Starting unit tests ...")
    print("----------------------------------")
    unittest.main(failfast=stop_at_fail)
    print("Tests completed")
