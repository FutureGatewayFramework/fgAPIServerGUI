/*
 * FutureGateway APIs helper functions
 *
 * FGAPIs stores information about APIServer connectivity; in particular it stores:
 *   auth_mode - Authorization mode that foresees the following possible values:
 *                 NONE, do no use of any authentication method
 *                 PTV, for PTV service
 *                 BASELINE_TOKEN, when using baseline authentication
 *                 BASELINE_PARAMS, when authenticating using parameters
 */

// Store all FG APIs values
FGAPIs = {
    fg_endpoint: '', //'http://localhost/fgapiserver',
    auth_mode: 'NONE',
    ptv_token: "",
    access_token: "",
    delegated_token: "",
    current_token: "",
    auth_header: "",
    auth_params: "",
    username: "",
    password: "",
    config: "",

    reset: function() {
      this.fg_endpoint = '';
      this.auth_mode = 'NONE';
      this.ptv_token = "";
      this.access_token = "";
      this.delegated_token = "";
      this.current_token = "";
      this.auth_header = "";
      this.auth_params = "";
      this.username = "";
      this.password = "";
      this.config = "";
    },
    setAuth: function() {
        switch(this.auth_mode) {
          case PTV:
            this.auth_header = "Bearer " + this.ptv_token; 
            break;
          case BASELINE_TOKEN:
            this.auth_header = this.current_token;
            break;
          case BASELINE_PARAMS:
            this.auth_params = "username=" + this.username +
                         "&password=" + this.password;
            break;
          case 'NONE':
          default:
            this.auth_header = "";
            this.auth_params = "";
        }
    },
    isAuthParams: function() {
      return this.auth_params.length > 0;
    },
    isAuthHeader() {
      return this.auth_header.length > 0;
    },
    getAuthParams() {
      return this.auth_params;
    },
    getAuthHeader() {
      return this.auth_header;
    }
}

function checkServer(fg_endpoint, successFn, failedFn) {
    FGAPIs.fg_endpoint = fg_endpoint;
    doGet("",
      function(data) {
        FGAPIs.config = data['config'];
        successFn(data);
      },
      function(data) {
        FGAPIs.reset();
        failedFn(data);
      });
}

/*
 * Low level functions handling FG API calls
 */

function initFGRequest(fgrequest) {
        var out_request = fgrequest;
        if(FGAPIs.isAuthParams()) {
            if(out_request.indexOf("?") > 0) {
                out_request += "&" + FGAPIs.getAuthParams();
            } else {
                out_request += "?" + FGAPIs.getAuthParams();
            }
        }
        return out_request;
}

function doGet(url, successFunction, failureFunction) {
    var request_url = FGAPIs.fg_endpoint;
    var request_url = initFGRequest(request_url);
    var headers = {};
    if(FGAPIs.isAuthHeader()) {
      headers["Authorization"] = FGAPIs.getAuthHeader();
    }
    $.ajax({
        type: "GET",
        url: request_url,
        dataType: "json",
        cache: false,
        headers: headers,
        crossDomain: true,
        success: successFunction,
        error: failureFunction
   });
}

/*
function doPost(url, reqData, successFunction, failureFunction) {
    $.ajax({
        type: "POST",
        url: url,
        dataType: "json",
        cache: false,
        data: JSON.stringify(reqData),
        headers: {
            'Authorization': fg_user_info.access_token,
        },
        contentType: 'application/json',
        crossDomain: true,
        success: successFunction,
        error: failureFunction
   });
}

function doDelete(url, successFunction, failureFunction) {
    $.ajax({
        type: "DELETE",
        url: url,
        dataType: "json",
        cache: false,
        headers: {
            'Authorization': fg_user_info.access_token,
        },
        contentType: 'application/json',
        crossDomain: true,
        success: successFunction,
        error: failureFunction
   });
}
*/