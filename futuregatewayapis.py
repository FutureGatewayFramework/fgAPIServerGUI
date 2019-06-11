#!/bin/env python
import os
import base64
import logging

# Custom logger
_log = logging.getLogger(__name__)


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
        else:
            pass

    def isAuthParams(self):
        return self.authParams.len() > 0

    def isAuthHeader(self):
        return self.authHeader.len() > 0

    def getAuthParams(self):
        return self.authParams

    def getAuthHeader(self):
        return self.authHeader


class FutureGatewayAPIs():
    """
    FutureGatewayAPIs Constructor
    """
    fgBaseUrl = 'localhost'
    fgAPIVersion = 'v1.0'
    fgUser = 'futuregateway'
    fgPassword = 'futuregateway'
    fgB64Password = None
    ptvToken = None
    baselineToken = None
    errFlag = None
    errMessage = None
    errRequest = None
    LS = os.linesep

    AuthModes = (
        'NONE', 'NONE',                      # No authentication at all
        'PTV', 'PTV',                        # Heder: 'Authorization: Bearer <token>'
        'BASELINE_TOKEN', 'BASELINE_TOKEN',  # Header: 'Authorization: <token>'
        'BASELINE_PARAMS', 'BASELINE_PARAMS' # Parameters: username=<user>&password=<password>
    )
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
        #self.fgB64Password = base64.b64encode(self.fgPassword)
        self.ptvToken = ''
        self.baselineToken = ''
        self.errFlag = ''
        #_log.debug('Created FutureGatewayAPIs: \'' + self + '\'')
        print(self)

    def __str__(self):
        """
        Represent this class and its status
        """
        return "Base URL: " + str(self.fgBaseUrl) + self.LS +\
               "API Version: " + str(self.fgAPIVersion) + self.LS +\
               "User: " + str(self.fgUser) + self.LS +\
               "Password: " + str(self.fgPassword) + self.LS +\
               "PasswordB64Encoded: " + str(self.fgB64Password) + self.LS +\
               "PTV Token: " + str(self.ptvToken) + self.LS +\
               "Baseline Token: " + str(self.baselineToken) + self.LS +\
               "Authentication mode: " + str(self.currentAuth) + self.LS +\
               "Error" + self.LS +\
               "  Flag: " + str(self.errFlag) + self.LS +\
               "  Request: " + str(self.errRequest) + self.LS +\
               "  Message: " + str(self.errMessage) + self.LS

    def __repr__(self):
        """
        Print out this class and its status
        """
        print(self)

    def setAuthMode(self, mode):
        """
        Verify if the server responds and check APIs version match
        """
        _log.debug("setAuthMode(%s)" % mode)
        self.currentAuth = mode

    def checkServer(self):
        """
        Set a new baselineToken with the given accessToken
        this method is useful to switch between user and
        delegated tokens
        """
        _log.debug("checkServer")
        json = doGet("");
        return not self.errFlag

    def setBaselineToken(self, accessToken):
        _log.debug("setBaselineToken(%s)" % accessToken)
        self.baselineToken = accessToken

    def setPTVToken(self, ptvToken):
        """
        Set PTV token
        """
        _log.debug("setPTVToken(%s)" % ptvToken)
        self.ptvToken = ptvToken

    def getAccessToken(self, username, userdel):
        """
        Get user baseline access token, if a delegated user is specified
        the method returns the delegated token and class member baselineToken 
        will be updated accordingly
        """
        _log.debug("getAccessToken(%s, %s)" % (username, userdel))
        # Endpoint auth/ is the only one requiring BASELINE_PARAMS credentials
        # Current Auth value will be switched to this mode during this method
        # Previous authentication mode will be restored to its original value
        # after method execution
        prevAuth = self.currentAuth
        self.currentAuth = AuthModes['BASELINE_PARAMS']
        self.baselineToken = ''
        delegatedUserParam = ''
        if userdel is not None and userdel.length() > 0:
            delegatedUserParam = "?user=" + userdel;
        json = doGet("auth" + delegatedUserParam);
        if(not self.errFlag):
            if userdel is not None and userdel.length() > 0:
                self.baselineToken = json.get('delegated_token', None)
            else:
                self.baselineToken = json.get('token', None)
            if self.baselineToken.length() == 0:
                self.errFlag = true;
                self.errMessage = "Empty token retrieved for user: '" + username + "'";
        self.currentAuth = prevAuth;
        _log.debug("baselineToken: '" + self.baselineToken + "'");
        return self.baselineToken;

    def userExists(self, username):
        """
        Verify if the specified user exists
        """
        _log.debug('userExists(%s)' % username)
        jsonResult = doGet('users/' + username)
        return not this.errFlag and jsonResult.get('name',None) == username

    def createUser(self,
                   name,
                   firstName,
                   lastName,
                   mail,
                   institute):
        """
        Create a FutureGateway user
        """
        _log.debug("createUser(%s, %s, %s, %s, %s)"
                   % (name, firstName, lastName, mail, institute));
        jsonData = {'name': name,
                    'first_name': firstName,
                    'last_name': lastName,
                    'mail': mail,
                    'institute': institute}
        _log.debug('jsonData: \'' + jsonData + '\'')
        try:
            jsonResult = doPost('users', jsonData)
        except Exception as e:
            errFlag = true;
            errMessage = "Unable to create json object from json data: '" + jsonData + "'"
            _log.error(errMessage + LS + e)
        return not self.errFlag


    def doGet(self, endpoint):
        jsonResult = ''
        authParams = AuthParams(self.currentAuth, self)


if __name__ == '__main__':
    fgAPIs = FutureGatewayAPIs()
    authParams = AuthParams('NONE', fgAPIs)
