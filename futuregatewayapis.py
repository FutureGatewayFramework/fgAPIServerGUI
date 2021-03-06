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

import os
import base64
import logging
import requests
import json

__author__ = 'Riccardo Bruno'
__copyright__ = '2019'
__license__ = 'Apache'
__version__ = 'v0.0.0'
__maintainer__ = 'Riccardo Bruno'
__email__ = 'riccardo.bruno@ct.infn.it'
__status__ = 'devel'
__update__ = '2019-06-24 17:00:59'

# Custom logger
logger = logging.getLogger(__name__)


class AuthParams():
    """
    Class to manage authorization parameters or authorization headers
    """
    authHeader = ''
    authParams = ''

    def __init__(self, authMode, fgAPIs):
        if authMode == fgAPIs.AuthModes['NONE']:
            pass
        elif authMode == fgAPIs.AuthModes['PTV']:
            self.authHeader = "Bearer " + fgAPIs.ptvToken
        elif authMode == fgAPIs.AuthModes['BASELINE_TOKEN']:
            self.authHeader = fgAPIs.baselineToken
        elif authMode == fgAPIs.AuthModes['BASELINE_PARAMS']:
            self.authParams = "username=" + fgAPIs.fgUser +\
                              "&password=" + fgAPIs.fgB64Password
        elif authMode == fgAPIs.AuthModes['BASELINE_USRNPASS']:
            self.authHeader = fgAPIs.fgUser + ':' + fgAPIs.fgB64Password
        else:
            pass

    def isAuthParams(self):
        return len(self.authParams) > 0

    def isAuthHeader(self):
        return len(self.authHeader) > 0

    def getAuthParams(self):
        return self.authParams

    def getAuthHeader(self):
        return self.authHeader


class FutureGatewayAPIs():
    """
    FutureGatewayAPIs Constructor
    """
    fgBaseUrl = 'http://localhost/fgapiserver'
    fgAPIVersion = 'v1.0'
    fgUser = 'futuregateway'
    fgPassword = 'futuregateway'
    fgB64Password = None
    ptvToken = None
    baselineToken = None
    errFlag = False
    errMessage = None
    errRequest = None
    LS = os.linesep

    # Authorization modes available
    #
    # NONE              - No authentication at all
    # PTV               - Header: 'Authorization: Bearer <token>'
    # BASELINE_TOKEN    - Heder:  'Authorization: <token>'
    # BASELINE_USRNPASS - Header: 'Authorization: user:password'
    # BASELINE_PARAMS   - Params: username=<user>&password=<password>
    #
    AuthModes = {
        'NONE': 'NONE',
        'PTV': 'PTV',
        'BASELINE_TOKEN': 'BASELINE_TOKEN',
        'BASELINE_PARAMS': 'BASELINE_PARAMS',
        'BASELINE_USRNPASS': 'BASELINE_USRNPASS'
    }
    currentAuth = 'NONE'

    def __init__(self, *args, **dargs):
        if(len(args) > 0):
            self.fgBaseUrl = args[0]
            self.fgAPIVersion = args[1]
            self.fgUser = args[2]
            self.fgPassword = args[3]
        if(dargs is not None):
            self.fgBaseUrl = dargs.get('base_url', self.fgBaseUrl)
            self.fgAPIVersion = dargs.get('api_version', self.fgAPIVersion)
            self.fgUser = dargs.get('fg_user', self.fgUser)
            self.fgPassword = dargs.get('fg_password', self.fgPassword)
        self.fgB64Password = base64.b64encode(self.fgPassword.encode("utf-8"))
        self.ptvToken = ''
        self.baselineToken = ''
        self.errFlag = False
        logging.debug('Created FutureGatewayAPIs: \'%s\'' % self)

    def __str__(self):
        """
        Represent this class and its status
        """
        return "" +\
            "Base URL: '" +\
            str(self.fgBaseUrl) + "'" + self.LS +\
            "API Version: '" +\
            str(self.fgAPIVersion) + "'" + self.LS +\
            "User: '" +\
            str(self.fgUser) + "'" + self.LS +\
            "Password: '" +\
            str(self.fgPassword) + "'" + self.LS +\
            "PasswordB64Encoded: '" +\
            str(self.fgB64Password) + "'" + self.LS +\
            "PTV Token: '" +\
            str(self.ptvToken) + "'" + self.LS +\
            "Baseline Token: '" +\
            str(self.baselineToken) + "'" + self.LS +\
            "Authentication mode: '" +\
            str(self.currentAuth) + "'" + self.LS +\
            "Error" + self.LS +\
            "  Flag: '" + str(self.errFlag) + "'" + self.LS +\
            "  Request: '" + str(self.errRequest) + "'" + self.LS +\
            "  Message: '" + str(self.errMessage) + "'" + self.LS

    def __repr__(self):
        """
        Print out this class and its status
        """
        print(self)

    def setAuthMode(self, mode):
        """
        Verify if the server responds and check APIs version match
        """
        logging.debug("setAuthMode(%s)" % mode)
        self.currentAuth = mode

    def checkServer(self):
        """
        Set a new baselineToken with the given accessToken
        this method is useful to switch between user and
        delegated tokens
        """
        logging.debug("checkServer")
        json = self.doGet("")
        return not self.errFlag

    def setBaselineToken(self, accessToken):
        logging.debug("setBaselineToken(%s)" % accessToken)
        self.baselineToken = accessToken

    def setPTVToken(self, ptvToken):
        """
        Set PTV token
        """
        logging.debug("setPTVToken(%s)" % ptvToken)
        self.ptvToken = ptvToken

    def getAccessToken(self, username, userdel):
        """
        Get user baseline access token, if a delegated user is specified
        the method returns the delegated token and class member baselineToken
        will be updated accordingly
        """
        logging.debug("getAccessToken(%s, %s)" % (username, userdel))
        # Endpoint auth/ is the only one requiring BASELINE_PARAMS credentials
        # Current Auth value will be switched to this mode during this method
        # Previous authentication mode will be restored to its original value
        # after method execution
        prevAuth = self.currentAuth
        self.currentAuth = self.AuthModes['BASELINE_PARAMS']
        self.baselineToken = ''
        delegatedUserParam = ''
        if userdel is not None and len(userdel) > 0:
            delegatedUserParam = "?user=" + userdel
        json = self.doGet("auth" + delegatedUserParam)
        if(not self.errFlag):
            if userdel is not None and len(userdel) > 0:
                self.baselineToken = json.get('delegated_token', None)
            else:
                self.baselineToken = json.get('token', None)
            if len(self.baselineToken) == 0:
                self.errFlag = True
                self.errMessage = "Empty token retrieved for user: '" +\
                                  username + "'"
        self.currentAuth = prevAuth
        logging.debug("baselineToken: '" + self.baselineToken + "'")
        return self.baselineToken

    def userExists(self, username):
        """
        Verify if the specified user exists
        """
        logging.debug('userExists(%s)' % username)
        jsonResult = self.doGet('users/' + username)
        return not self.errFlag and jsonResult.get('name', None) == username

    def checkToken(self, token):
        """
        Return true if the given token is valid
        """
        prevAuth = self.currentAuth
        self.currentAuth = self.AuthModes['BASELINE_TOKEN']
        self.baselineToken = token
        json = self.doGet("auth")
        logging.debug("Token: '%s' = %s" % (token, json))
        try:
            token_info = json.get('token_info', {})
            checkValue = token_info['valid']
        except KeyError:
            checkValue = False
        return checkValue

    def createUser(self,
                   name,
                   firstName,
                   lastName,
                   mail,
                   institute):
        """
        Create a FutureGateway user
        """
        logging.debug("createUser(%s, %s, %s, %s, %s)"
                      % (name, firstName, lastName, mail, institute))
        data = {'first_name': firstName,
                'last_name': lastName,
                'mail': mail,
                'institute': institute}
        logging.debug('jsonData: %s' % data)
        jsonResult = self.doPost('users/%s' % name, data)
        if self.errFlag is True:
            errMessage = ("Unable to create json object from json data: '%s'"
                          % jsonData)
            logging.error(self.errMessage)
        return not self.errFlag

    def addUserGroups(self, userName, userGroups):
        """
        Add a given list of groups to a given user
        """
        logging.debug("addUserGroups")
        data = {'groups': userGroups}
        logging.debug("jsonData: '" + jsonData + "'")
        jsonResult = self.doPost("users/" + userName + "/groups", data)
        if self.errFlag is True:
            errMessage = "Unable to add groups: '%s'" % (userGroups, userName)
        return not self.errFlag

    def deleteUserGroups(self, userName, userGroups):
        """
        Delete a given list of groups to a given user
        """
        logging.debug("removeUserGroups")
        data = {'groups': userGroups}
        logging.debug("jsonData: '" + jsonData + "'")
        jsonResult = self.doDelete("users/" + userName + "/groups", data)
        if self.errFlag is True:
            errMessage = ("Unable to remove groups: '%s' to user: '%s'"
                          % (userGroups, userName))
            logging.error(errMessage)
        return not self.errFlag

    def getUserGroups(self, userName):
        """
        Return the list groups assigned to a specified user
        """
        logging.debug("getUserGroups")
        jsonResult = self.doGet("users/" + userName + "/groups")
        if jsonResult is not None:
            groups = jsonResult.get("groups", None)
        return groups

    def userHasGroup(self, userName, groupName):
        """
        Return true if the specified user has the specified group
        """
        logging.debug("userHasGroup")
        groups = self.getUserGroups(userName)
        if(groups != null):
            for group in groups:
                if group['name'] == groupName:
                    return True
        return False

    def setError(self, request, errorDetail):
        self.errFlag = True
        self.errMessage = errorDetail
        self.errRequest = request

    def initFGRequest(self, endpoint, authParams):
        """
        Perform common operations before intitating a FutureGateway API request
        """
        textRequest = ''
        # Reset err variables
        self.errFlag = False
        self.errMessage = ""
        self.errRequest = textRequest =\
            self.fgBaseUrl + "/" +\
            self.fgAPIVersion + "/" + endpoint
        if(authParams.isAuthParams()):
            try:
                textRequest.index("?")
                textRequest += "&" + authParams.getAuthParams()
            except ValueError:
                textRequest += "?" + authParams.getAuthParams()
        logging.debug("Request: '" + textRequest + "'")
        return textRequest

    def doGet(self, endpoint):
        """
        Perform a GET request to a given futuregateway API endpoint
        """
        jsonResult = ''
        authParams = AuthParams(self.currentAuth, self)
        fgTextRequest = self.initFGRequest(endpoint, authParams)
        logging.debug("GET (request: %s)" % fgTextRequest)
        # Prepare and execute the GET request
        headers = {'Cache-Control': 'no-cache'}
        if(authParams.isAuthHeader() is True):
            headers['Authorization'] = authParams.getAuthHeader()
            logging.debug("Authorization: " + authParams.getAuthHeader())
        try:
            r = requests.get(url=fgTextRequest,
                             headers=headers)
            jsonResult = r.json()
        except requests.exceptions.RequestException as e:
            self.setError(fgTextRequest, e)
        logging.debug("GET (result: '%s')" % jsonResult)
        return jsonResult

    def doPost(self, endpoint, data):
        """
        Perform a POST request to a given futuregateway API endpoint
        """
        jsonResult = ''
        authParams = AuthParams(self.currentAuth, self)
        fgTextRequest = self.initFGRequest(endpoint, authParams)
        logging.debug("POST (request: %s)" % fgTextRequest)
        # Prepare and execute the GET request
        headers = {'Cache-Control': 'no-cache',
                   'Content-Type': 'application/json; charset=UTF-8'}
        if(authParams.isAuthHeader() is True):
            headers['Authorization'] = authParams.getAuthHeader()
            logging.debug("Authorization: " + authParams.getAuthHeader())
        try:
            r = requests.post(url=fgTextRequest,
                              headers=headers,
                              data=json.dumps(data))
            print("POST", fgTextRequest, headers, json.dumps(data), r.text)
            jsonResult = r.json()
        except requests.exceptions.RequestException as e:
            self.setError(fgTextRequest, e)
        logging.debug("POST (result: '%s')" % jsonResult)
        return jsonResult

    def doDelete(self, endpoint, data):
        """
        Perform a DELETE request to a given futuregateway API endpoint
        """
        jsonResult = ''
        authParams = AuthParams(self.currentAuth, self)
        fgTextRequest = self.initFGRequest(endpoint, authParams)
        logging.debug("DELETE (request: %s)" % fgTextRequest)
        # Prepare and execute the GET request
        headers = {'Cache-Control': 'no-cache',
                   'Content-Type': 'application/json; charset=UTF-8'}
        if(authParams.isAuthHeader() is True):
            headers['Authorization'] = authParams.getAuthHeader()
            logging.debug("Authorization: " + authParams.getAuthHeader())
        try:
            r = requests.delete(url=fgTextRequest,
                                headers=headers,
                                data=json.dumps(data))
            jsonResult = r.json()
        except requests.exceptions.RequestException as e:
            self.setError(fgTextRequest, e)
        logging.debug("DELETE (result: '%s')" % jsonResult)
        return jsonResult


if __name__ == '__main__':
    fgBaseUrl = 'http://localhost/fgapiserver'
    fgAPIVer = 'v1.0'
    fgUser = 'futuregateway'
    fgPassword = 'futuregateway'
    fgAPIs = FutureGatewayAPIs(
        fgBaseUrl,
        fgAPIVer,
        fgUser,
        fgPassword)
    authParams = AuthParams('NONE', fgAPIs)
    checkResult = fgAPIs.checkServer()
    print("Server at: %s, is connecting: %s"
          % (fgAPIs.errRequest, checkResult))
    suAccessToken = fgAPIs.getAccessToken(fgUser, None)
    print("SU access token: %s" % suAccessToken)
    fgAPIs.setAuthMode(fgAPIs.AuthModes['BASELINE_TOKEN'])

    # Portal user case
    # Pay attention when a new user is provided providing an exiting mail
    # address, it will cause an http 500
    screenName = 'portalUser'
    firstName = 'portalUserFirstName'
    lastName = 'portalUserLastName'
    emailAddress = 'portal@user.mail.address'

    userExists = fgAPIs.userExists(screenName)
    print("User: '%s' exists is: %s" % (screenName, userExists))
    if not userExists:
        fgAPIs.createUser(screenName,
                          firstName,
                          lastName,
                          emailAddress,
                          "")
        # Check if the inserted user now exists
        userExists = fgAPIs.userExists(screenName)
        print("Now user: '%s' exists is: %s" % (screenName, userExists))

    if userExists:
        delegatedAccessToken = fgAPIs.getAccessToken(fgUser, screenName)
        print("User '%s' access token: %s" % (fgUser, delegatedAccessToken))
