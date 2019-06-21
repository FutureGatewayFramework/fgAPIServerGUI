/*
 FGAPIServerGUI javascript
*/

// Store all FG GUI values
FGGUI = {
  fg_endpoint: '',
  fg_username: '',
  fg_password: '',
  fg_accesstoken: '',
  fg_checked: false,
  fg_logged: false,

  reset: function(endpoint) {
    this.fg_endpoint = endpoint;
    this.fg_username = '';
    this.fg_password = '';
    this.fg_accesstoken = '';
    this.fg_checked = false;
    this.fg_logged = false;
  }
};

var loginAlert =
      '<div class="alert alert-primary" role="alert" id="alertContent">' +
      'Page content is not available until you <a href="#loginModal" data-toggle="modal" data-target="#loginModal">Login</a>' +
      '</div>';

var checkAlert =
      '<div class="alert alert-primary" role="alert" id="alertContent">' +
      'Page content is not available until you <a href="#attachModal" data-toggle="modal" data-target="#attachModal">Check</a> the APIServer' +
      '</div>';

!function(l){
  "use strict";
  // Settings Check Server Button click event
  l("#checkFGAPIServer").on("click", function(e) {
    e.preventDefault();
    // FG endpoint to check
    var fg_url = $('#fgTestURL').val();
    console.log("server to test: " + fg_url);
    // Ensure the endpoint finishes with '/'
    fg_url = fg_url.slice(-1)=='/'?fg_url:fg_url + '/';
    // Check the FG endpoint
    checkServer(fg_url,
      function(data) {
        // Save last successfull FG endpoint
        FGGUI.fg_endpoint = FGAPIs.fg_endpoint;
        FGGUI.fg_checked = true;
        createCookie('fg_endpoint', FGGUI.fg_endpoint , 365);
        updateInterface();
      },
      function(o) {
        FGGUI.fg_checked = false;
        updateInterface();
      }
    );
  }),
  // Settings Check Server change on FG server URL
  l("#fgTestURL").on('input propertychange paste', function() {
    var fg_check = this.value;
    $('#fgTestURL').attr('placeholder', fg_check);
    FGGUI.reset(fg_check);
    FGAPIs.reset(fg_check);
    updateInterface();
  }),
  l("#togglePasswordView").on('click', function() {
    if($('#fgPassword').attr('type') == 'password') {
      $('#fgPassword').attr('type','text');
      $('#togglePasswordView').find('i').attr('class','fas fa-eye-slash');
    } else {
      $('#fgPassword').attr('type','password');
      $('#togglePasswordView').find('i').attr('class','fas fa-eye');
    }
  }),
  l("#logSubmitButton").on('click', function(e) {
    e.preventDefault();
    loginServer(FGGUI.fg_endpoint,
                $('#fgUsername').val(),
                $('#fgPassword').val(),
                function(data) {
                  var token = data.token;
                  FGGUI.fg_logged = true;
                  FGGUI.fg_accesstoken = token;
                  // Save last successfull FG access token
                  eraseCookie('fg_accesstoken');
                  createCookie('fg_accesstoken', token, 365);
                  console.log('Logged successfully, token: ' + token);
                  updateInterface();
                },
                function() {
                  FGGUI.fg_logged = false;
                  console.log('Logged unsuccessfully');
                  eraseCookie('fg_accesstoken');
                  updateInterface();
                });
  }),
  l("#logoutSubmitButton").on('click', function(e) {
    FGGUI.fg_logged = false;
    eraseCookie('fg_accesstoken');
    updateInterface();
  }),
  l("#detachSubmitButton").on('click', function(e) {
    FGGUI.fg_logged = false;
    FGGUI.fg_checked = false;
    eraseCookie('fg_accesstoken');
    eraseCookie('fg_endpoint');
    updateInterface();
  })
}(jQuery);


// Updatgin Home elements
function updateHome() {
  console.log("Handling home page");
  if(!FGGUI.fg_checked) {
    $('#pageContent').html('');
    $('#pageContent').html(checkAlert);
    return;
  }
  if(FGGUI.fg_logged) {
    var guiData = {};
    guiData['Node'] = APPSTATE.gui_node;
    guiData['Platform'] = APPSTATE.gui_platform;
    guiData['Python version'] = APPSTATE.python_ver;
    cardGui = new cardtable('guiInfo', 'Information', '', 'guiInfo', guiData);
    cardGui.setNotEditables(['Node', 'Platform', 'Python version']);
    cardGui.render('#pageContent');
    $('#pageContent').append('<br/>');
    var apisData = {};
    apisData['Endpoint'] = APPSTATE.apiserver;
    apisData['MySQL version'] = APPSTATE.mysqlver;
    apisData['DB Version'] = APPSTATE.dbver;
    apisData['Last update'] =  APPSTATE.dbdate;
    cardApis = new cardtable('apisInfo', 'API Server Information', '', 'apisInfo', apisData);
    cardApis.setNotEditables(['Endpoint', 'MySQL version', 'DB Version', 'Last update']);
    cardApis.render('#pageContent');
    $('#tbl_apiserver').text(FGGUI.fg_endpoint);
  } else {
    $('#pageContent').html('');
    $('#pageContent').html(loginAlert);
  }
}

// Updatign single infrastructure
function updateInfrastructure() {
  if(FGGUI.fg_logged) {
    var infra_id = $('#breadcumbBar').find('li').last().text();
    loadInfrastructure(
      infra_id,
      FGGUI.fg_endpoint,
      FGGUI.fg_accesstoken,
      function(data) {
        var infoData = {};
        infoData['name'] = data['name'];
        infoData['description'] = data['description'];
        infoData['virtual'] = data['virtual'];
        infoData['enabled'] = data['enabled'];
        infoData['date'] = data['date'];
        cardInfo = new cardtable('cardInfo', 'Information', '', 'cardInfo', infoData);
        cardInfo.setNotEditables(['date']);
        cardInfo.render('#pageContent');
        $('#pageContent').append('<br/>');
        var paramsData = {}
        parameters = data['parameters'];
        for(var i=0; i<parameters.length; i++) {
          paramsData[parameters[i]['name']] = parameters[i]['value'];
        }
        cardParams = new cardtable('cardParams', 'Parameters', '', 'cardParams', paramsData);
        cardParams.setIcon('<i class="fas fa-list-ul"></i>');
        cardParams.render('#pageContent');
      },
      function(data) {
        $('#pageContent').html(
          '<div class="alert alert-primary" role="alert">' +
          'Unable to load infrastructure information having id: ' + infra_id +
          '</div>');
      });
  } else if(FGGUI.fg_checked) {
    $('#pageContent').html(loginAlert);
  } else {
    $('#pageContent').html(checkAlert);
  }
}

// Updating Infrastructure elements
function updateInfrastructures() {
  console.log("Handling Infrastructures page");
  // Check the FG endpoint
  if(FGGUI.fg_logged) {
    loadInfrastructures(
      FGGUI.fg_endpoint,
      FGGUI.fg_accesstoken,
      function(data) {
        FGGUI['infrastructures'] = data['infrastructures'];
        if(FGGUI.infrastructures.length > 0) {
          rowclickfn = function(o) {
            var row_index =  o.currentTarget.rowIndex;
            var infra_id = $('#' + (row_index-1) + '_' + 'infrastructures').find('div').html().trim();
            window.location = APPSTATE.url_prefix + '/infrastructures/' + infra_id;
          }
          var infraRows = data['infrastructures'];
          var infraCols = ['id', 'name', 'enabled', 'virtual'];
          infraTable = new infotable('infrastructures', infraCols, infraRows, rowclickfn);
          infraTable.setNotEditableCols(infraCols);
          infraTable.render('#pageContent');
        } else {
          $('#pageContent').html(
            '<div class="alert alert-primary" role="alert">' +
            'No infrastructures available' +
            '</div>');
        }
      },
      function(data) {
        $('#pageContent').append(
          '<div class="alert alert-danger" role="alert">' +
          'Unable to recover infrastructures, please check your user rights or authorization configuration' +
          '</div>');
        });
  } else if(FGGUI.fg_checked) {
    $('#pageContent').html('');
    $('#pageContent').html(loginAlert);
  } else {
    $('#pageContent').html('');
    $('#pageContent').html(checkAlert);
  }
}

// Updatgin Applications elements
function updateApplications() {
  console.log("Handling Applications page");
  if(FGGUI.fg_logged) {
    loadApplications(
      FGGUI.fg_endpoint,
      FGGUI.fg_accesstoken,
      function(data) {
        FGGUI['applications'] = data['applications'];
        if(FGGUI.applications.length > 0) {
          rowclickfn = function(o) {
            var row_index =  o.currentTarget.rowIndex;
            var app_id = $('#' + (row_index-1) + '_' + 'applications').find('div').html().trim();
            window.location = APPSTATE.url_prefix + '/applications/' + app_id;
          }
          var appsRows = data['applications'];
          var appsCols = ['id', 'name', 'outcome', 'enabled'];
          appsTable = new infotable('applications', appsCols, appsRows, rowclickfn);
          appsTable.setNotEditableCols(appsCols);
          appsTable.render('#pageContent');
        } else {
          $('#pageContent').html(
            '<div class="alert alert-primary" role="alert">' +
            'No infrastructures available' +
            '</div>');
        }
      },
      function(data) {
        $('#pageContent').append(
          '<div class="alert alert-danger" role="alert">' +
          'Unable to recover infrastructures, please check your user rights or authorization configuration' +
          '</div>');
        });
  } else if(FGGUI.fg_checked) {
    $('#pageContent').html('');
    $('#pageContent').append(loginAlert);
  } else {
    $('#pageContent').html('');
    $('#pageContent').append(checkAlert);
  }
}

// Updatgin Tasks elements
function updateTasks() {
  console.log("Handling Tasks page");
  if(FGGUI.fg_logged) {
    $('#pageContent').append('Tasks');
  } else if(FGGUI.fg_checked) {
    $('#pageContent').html('');
    $('#pageContent').append(loginAlert);
  } else {
    $('#pageContent').html('');
    $('#pageContent').append(checkAlert);
  }
}

// Updatgin Users elements
function updateUsers() {
  console.log("Handling Users page");
  if(FGGUI.fg_logged) {
    $('#pageContent').append('Users');
  } else if(FGGUI.fg_checked) {
    $('#pageContent').html('');
    $('#pageContent').append(loginAlert);
  } else {
    $('#pageContent').html('');
    $('#pageContent').append(checkAlert);
  }
}

// Updatgin Groups elements
function updateGroups() {
  console.log("Handling Groups page");
  if(FGGUI.fg_logged) {
    $('#pageContent').append('groups');
  } else if(FGGUI.fg_checked) {
    $('#pageContent').html('');
    $('#pageContent').append(loginAlert);
  } else {
    $('#pageContent').html('');
    $('#pageContent').append(checkAlert);
  }
}

// Updatgin Roles elements
function updateRoles() {
  console.log("Handling Roles page");
  if(FGGUI.fg_logged) {
    $('#pageContent').append('roles');
  } else if(FGGUI.fg_checked) {
    $('#pageContent').html('');
    $('#pageContent').append(loginAlert);
  } else {
    $('#pageContent').html('');
    $('#pageContent').append(checkAlert);
  }
}

// Use variable values to determine the correct interface
function updateInterface() {
  // FGAPI Server checked flag
  if(FGGUI.fg_checked) {
    $('#fgCheckedButton').prop('class', 'btn btn-primary');
    $('#fgCheckedButton').find('i').prop('class', 'fas fa-check');
    $('#settingsNavIco').prop('class', 'badge badge-primary');
    $('#settingsNavIcoImg').prop('class', 'fas fa-check');
    $('#loginNav').show();
  } else {
    $('#fgCheckedButton').prop('class', 'btn btn-danger');
    $('#fgCheckedButton').find('i').prop('class', 'fas fa-times');
    $('#settingsNavIco').prop('class', 'badge badge-danger');
    $('#settingsNavIcoImg').prop('class', 'fas fa-times');
    $('#loginNav').hide();
  }
  // FGAPI Logged user flag
  if(FGGUI.fg_logged) {
    $('#loginNavIco').prop('class', 'badge badge-primary');
    $('#loginNavIcoImg').prop('class', 'fas fa-check');
  } else {
    $('#loginNavIco').prop('class', 'badge badge-danger');
    $('#loginNavIcoImg').prop('class', 'fas fa-times');
  }

  $('#fgTestURL').prop('placeholder', FGGUI.fg_endpoint);
  $('#searchForm').hide();

  // Get rendered page
  page = APPSTATE.page;

  // Page specific composition
  console.log("Page from breadcumBar: " + page);
  switch(page.toLocaleLowerCase()) {
    case 'home':
      $('#breadcumbBar').html(
        '<li class="breadcrumb-item active"><a href="' + APPSTATE.url_prefix + '/">Home</li>');
      updateHome();
    break;
    case 'infrastructures':
      $('#breadcumbBar').html(
        '<li class="breadcrumb-item active"><a href="' + APPSTATE.url_prefix + '/">Home</li>' +
        '<li class="breadcrumb-item active"><a href="' + APPSTATE.url_prefix + '/infrastructures">Infrastructures</li>');
      updateInfrastructures();
    break;
    case 'infrastructure':
      var pages_array = APPSTATE.pageaddr.split('/');
      var infra_id = pages_array[pages_array.length - 1];
      $('#breadcumbBar').html(
        '<li class="breadcrumb-item active"><a href="' + APPSTATE.url_prefix + '/">Home</li>' +
        '<li class="breadcrumb-item active"><a href="' + APPSTATE.url_prefix + '/infrastructures">Infrastructures</li>' +
        '<li class="breadcrumb-item active"><a href="' + APPSTATE.url_prefix + '/infrastructures/'+ infra_id +'">' + infra_id + '</li>');
      updateInfrastructure();
    break;
    case 'applications':
      $('#breadcumbBar').html(
        '<li class="breadcrumb-item active"><a href="' + APPSTATE.url_prefix + '/">Home</li>' +
        '<li class="breadcrumb-item active"><a href="' + APPSTATE.url_prefix + '/applications">Applications</li>');
      updateApplications();
    break;
    case 'tasks':
      $('#breadcumbBar').html(
        '<li class="breadcrumb-item active"><a href="' + APPSTATE.url_prefix + '/">Home</li>' +
        '<li class="breadcrumb-item active"><a href="' + APPSTATE.url_prefix + '/tasks">Tasks</li>');
      updateTasks();
    break;
    case 'users':
      $('#breadcumbBar').html(
        '<li class="breadcrumb-item active"><a href="' + APPSTATE.url_prefix + '/">Home</li>' +
        '<li class="breadcrumb-item active"><a href="' + APPSTATE.url_prefix + '/users">Users</li>');
      updateUsers();
    break;
    case 'groups':
      $('#breadcumbBar').html(
        '<li class="breadcrumb-item active"><a href="' + APPSTATE.url_prefix + '/">Home</li>' +
        '<li class="breadcrumb-item active"><a href="' + APPSTATE.url_prefix + '/groups">Groups</li>');
       updateGroups();
    break;
    case 'roles':
      $('#breadcumbBar').html(
        '<li class="breadcrumb-item active"><a href="' + APPSTATE.url_prefix + '/">Home</li>' +
        '<li class="breadcrumb-item active"><a href="' + APPSTATE.url_prefix + '/roles">Roles</li>');
      updateRoles();
    break;
    default:
      console.log("Unhandled page: " + page);
  }
}

// FGAPIServerGUI initialization
$(document).ready(function() {
  // First of all try to identify if it is the first time the user open the GUI
  // accessing cookies.
  var fg_endpoint = accessCookie('fg_endpoint');
  console.log("fg_endpoint: " + fg_endpoint);
  if(fg_endpoint == "") {
    console.log("1st Time, endpoint: " + APPSTATE.apiserver);
    FGGUI.reset(fg_endpoint);
    updateInterface();
  } else {
    console.log("! 1st Time, endpoint: " + fg_endpoint);
    FGGUI.reset(fg_endpoint);
    checkServer(fg_endpoint,
      function(data) {
        FGGUI.fg_checked = true;
        // Now it is time to check for exising access tokens
        var fg_accesstoken = accessCookie('fg_accesstoken');
        console.log('checking token: ' + fg_accesstoken);
        if(fg_accesstoken != '') {
          checkToken(fg_endpoint,
                     fg_accesstoken,
                     function(data) {
                       console.log(JSON.stringify(data['token_info']));
                       createCookie('fg_accesstoken', fg_accesstoken , 365);
                       FGGUI.fg_logged = data['token_info']['valid'];
                       FGGUI.fg_accesstoken = fg_accesstoken;
                       updateInterface();
                     },
                     function(data) {
                       FGGUI.fg_logged = false;
                       FGGUI.fg_accesstoken = '';
                       updateInterface();
                     });
        } else {
          FGGUI.fg_logged = false;
          FGGUI.fg_accesstoken = '';
          updateInterface();
        }
      },
      function(data) {
        FGGUI.fg_checked = false;
        updateInterface();
      }
    );
  }
});
