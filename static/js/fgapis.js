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
    fg_endpoint: '', 
    fg_apiver: 'v1.0',
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
    headers: {},

    reset: function(endpoint) {
      this.fg_endpoint = endpoint;
      this.fg_apiver = 'v1.0';
      this.auth_mode = 'NONE';
      this.ptv_token = '';
      this.access_token = '';
      this.delegated_token = '';
      this.current_token = '';
      this.auth_header = '';
      this.auth_params = '';
      this.username = '';
      this.password = '';
      this.config = '';
      this.headers = {};
    },
    setAuth: function(mode) {
        var prev_mode = this.auth_mode;
        this.auth_mode = mode;
        switch(mode) {
          case 'PTV':
            this.auth_header = "Bearer " + this.ptv_token; 
            break;
          case 'BASELINE_TOKEN':
            this.auth_header = this.access_token;
            break;
          case 'BASELINE_PARAMS':
            this.auth_params = "username=" + this.username + "&" +
                               "password=" + this.password;
            break;
          case 'BASELINE_USRNPASS':
            this.auth_header = this.username + ":" +
                               this.password;
            break;
          case 'NONE':
          default:
            this.auth_header = "";
            this.auth_params = "";
        }
        return prev_mode;
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
    },
    setEndPoint(endpoint) {
        var fg_endpoint = endpoint;
        fg_endpoint = fg_endpoint.slice(-1)=='/'?fg_endpoint:fg_endpoint + '/';
        this.fg_endpoint = fg_endpoint;
    }
}

function checkServer(fg_endpoint, successFn, failedFn) {
    FGAPIs.setEndPoint(fg_endpoint);
    var prev_auth_mode = FGAPIs.setAuth('NONE');
    doGet("",
      function(data) {
        FGAPIs.setEndPoint(fg_endpoint);
        FGAPIs.config = data['config'];
        FGAPIs.setAuth(prev_auth_mode);
        successFn(data);
      },
      function(data) {
        FGAPIs.reset('');
        FGAPIs.setAuth(prev_auth_mode);
        failedFn(data);
      });
}

function checkToken(fg_endpoint, fg_token, successFn, failedFn) {
    FGAPIs.setEndPoint(fg_endpoint);
    FGAPIs.access_token = fg_token;
    var prev_auth_mode = FGAPIs.setAuth('BASELINE_TOKEN');
    doGet("auth",
      function(data) {
        FGAPIs.setAuth(prev_auth_mode);
        successFn(data);
      },
      function(data) {
        FGAPIs.access_token = '';
        FGAPIs.setAuth(prev_auth_mode);
        failedFn(data);
      });
}

function loginServer(fg_endpoint, fg_user, fg_password, successFn, failedFn) {
    FGAPIs.setEndPoint(fg_endpoint);
    FGAPIs.username = fg_user;
    FGAPIs.password = Base64.encode(fg_password);
    var prev_auth_mode = FGAPIs.setAuth('BASELINE_USRNPASS');
    doPost("auth",
      {},
      function(data) {
        FGAPIs.token = data['token'];
        console.log("access token: " + FGAPIs.toeken);
        FGAPIs.password = '*******';
        FGAPIs.setAuth(prev_auth_mode);
        successFn(data);
      },
      function(data) {
        FGAPIs.token = '';
        FGAPIs.password = '';
        FGAPIs.setAuth(prev_auth_mode);
        failedFn(data);
      });
}

function loadInfrastructures(fg_endpoint, fg_token, successFn, failedFn) {
  FGAPIs.setEndPoint(fg_endpoint);
    FGAPIs.access_token = fg_token;
    var prev_auth_mode = FGAPIs.setAuth('BASELINE_TOKEN');
    doGet("infrastructures",
      function(data) {
        FGAPIs.setAuth(prev_auth_mode);
        successFn(data);
      },
      function(data) {
        FGAPIs.access_token = '';
        FGAPIs.setAuth(prev_auth_mode);
        failedFn(data);
      });
}

function loadInfrastructure(infra_id, fg_endpoint, fg_token, successFn, failedFn) {
  FGAPIs.setEndPoint(fg_endpoint);
    FGAPIs.access_token = fg_token;
    var prev_auth_mode = FGAPIs.setAuth('BASELINE_TOKEN');
    doGet("infrastructures/" + infra_id,
      function(data) {
        FGAPIs.setAuth(prev_auth_mode);
        successFn(data);
      },
      function(data) {
        FGAPIs.access_token = '';
        FGAPIs.setAuth(prev_auth_mode);
        failedFn(data);
      });
}

function loadApplications(fg_endpoint, fg_token, successFn, failedFn) {
  FGAPIs.setEndPoint(fg_endpoint);
    FGAPIs.access_token = fg_token;
    var prev_auth_mode = FGAPIs.setAuth('BASELINE_TOKEN');
    doGet("applications",
      function(data) {
        FGAPIs.setAuth(prev_auth_mode);
        successFn(data);
      },
      function(data) {
        FGAPIs.access_token = '';
        FGAPIs.setAuth(prev_auth_mode);
        failedFn(data);
      });
}

function loadApplication(app_id, fg_endpoint, fg_token, successFn, failedFn) {
  FGAPIs.setEndPoint(fg_endpoint);
    FGAPIs.access_token = fg_token;
    var prev_auth_mode = FGAPIs.setAuth('BASELINE_TOKEN');
    doGet("applications/" + app_id,
      function(data) {
        FGAPIs.setAuth(prev_auth_mode);
        successFn(data);
      },
      function(data) {
        FGAPIs.access_token = '';
        FGAPIs.setAuth(prev_auth_mode);
        failedFn(data);
      });
}

function loadTasks(fg_endpoint, fg_token, url_opts, successFn, failedFn) {
  FGAPIs.setEndPoint(fg_endpoint);
    FGAPIs.access_token = fg_token;
    var prev_auth_mode = FGAPIs.setAuth('BASELINE_TOKEN');
    doGet("tasks" + url_opts,
      function(data) {
        FGAPIs.setAuth(prev_auth_mode);
        successFn(data);
      },
      function(data) {
        FGAPIs.access_token = '';
        FGAPIs.setAuth(prev_auth_mode);
        failedFn(data);
      });
}

function loadTask(task_id, fg_endpoint, fg_token, url_opts, successFn, failedFn) {
  FGAPIs.setEndPoint(fg_endpoint);
    FGAPIs.access_token = fg_token;
    var prev_auth_mode = FGAPIs.setAuth('BASELINE_TOKEN');
    doGet("tasks/" + task_id + url_opts,
      function(data) {
        FGAPIs.setAuth(prev_auth_mode);
        console.log('task: ' + JSON.stringify(data));
        successFn(data);
      },
      function(data) {
        FGAPIs.access_token = '';
        FGAPIs.setAuth(prev_auth_mode);
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
    var request_url = FGAPIs.fg_endpoint + FGAPIs.fg_apiver + '/' + url;
    request_url = initFGRequest(request_url);
    if(FGAPIs.isAuthHeader()) {
      FGAPIs.headers["Authorization"] = FGAPIs.getAuthHeader();
    }
    console.log("GET: " + request_url);
    console.log("GET headers: " + JSON.stringify(FGAPIs.headers));
    $.ajax({
        type: "GET",
        url: request_url,
        dataType: "json",
        cache: false,
        headers: FGAPIs.headers,
        crossDomain: true,
        success: function(data) {
          console.log("GET success:" + JSON.stringify(FGAPIs.data));
          successFunction(data);
        },
        error: function(data) {
          console.log("GET failure:" + JSON.stringify(FGAPIs.data));
          failureFunction(data);
        }
   });
}

function doPost(url, reqData, successFunction, failureFunction) {
    var request_url = FGAPIs.fg_endpoint + FGAPIs.fg_apiver + '/'  + url;
    request_url = initFGRequest(request_url);
    if(FGAPIs.isAuthHeader()) {
      FGAPIs.headers["Authorization"] = FGAPIs.getAuthHeader();
    }
    console.log("POST: " + request_url);
    console.log("headers: " + JSON.stringify(FGAPIs.headers));
    $.ajax({
        type: "POST",
        url: request_url,
        dataType: "json",
        cache: false,
        data: JSON.stringify(reqData),
        headers: FGAPIs.headers,
        contentType: 'application/json',
        crossDomain: true,
        success: successFunction,
        error: failureFunction
   });
}

function doDelete(url, successFunction, failureFunction) {
    var request_url = FGAPIs.fg_endpoint + FGAPIs.fg_apiver + '/' + url;
    request_url = initFGRequest(request_url);
    var headers = {};
    if(FGAPIs.isAuthHeader()) {
      headers["Authorization"] = FGAPIs.getAuthHeader();
    }
    console.log("DELETE: " + request_url);
    console.log("headers: " + JSON.stringify(FGAPIs.headers));
    $.ajax({
        type: "DELETE",
        url: request_url,
        dataType: "json",
        cache: false,
        headers: FGAPIs.headers,
        contentType: 'application/json',
        crossDomain: true,
        success: successFunction,
        error: failureFunction
   });
}
