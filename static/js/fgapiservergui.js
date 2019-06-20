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

var indexContent = 
'  <!-- fgAPIServerGUI info -->' +
'    <div class="card" id="cardGenerid">' +
'      <div class="card-header">' +
'        <h6><i class="fas fa-info-circle"></i> APIServerGUI</h6>' +
'      </div>' +
'      <div class="card-body">' +
'       <table class="table">' +
'        <tr><td>Node</td><td>' + APPSTATE.gui_node + '</td></tr>' +
'         <tr><td>Platform</td><td>' + APPSTATE.gui_platform + '</td></tr>' +
'         <tr><td>Python version</td><td>' + APPSTATE.python_ver + '</td></tr>' +
'       </table>' +
'      </div>' +
'    <!--' +
'    <div class="card-footer text-muted">' +
'    </div>' +
'    -->' +
'    </div>' +
'' +
'    <br/>' +
'' +
'    <!-- fgAPIServer info -->' +
'    <div class="card" id="cardGenerid">' +
'      <div class="card-header">' +
'        <h6><i class="fas fa-info-circle"></i> APIServer</h6>' +
'      </div>' +
'      <div class="card-body">' +
'        <table class="table">' +
'          <tr><td>Endpoint</td><td id="tbl_apiserver">' + APPSTATE.apiserver + '</td></tr>' +
'          <tr><td>MySQL version</td><td>' + APPSTATE.mysqlver + '</td></tr>' +
'          <tr><td>DB Version</td><td>' + APPSTATE.dbver + '</td></tr>' +
'          <tr><td>Last update</td><td>' + APPSTATE.dbdate + '</td></tr>' +
'        </table>' +
'        <!--' +
'        </div>' +
'        <div class="card-footer text-muted">' +
'        </div>' +
'        -->' +
'      </div>' +
'    </div>';

var infraContent = 
'  <!-- Infrastructure -->' +
'    <div class="card" id="cardInfra">' +
'      <div class="card-header">' +
'        <h6><i class="fas fa-info-circle"></i> Infrastructure</h6>' +
'      </div>' +
'      <div class="card-body">' +
'       <table class="table table-hover" id="tableInfra">' +
'        <tr><th>Name</th><th>Value</th></tr>' +
'       </table>' +
'      </div>' +
'    <!--' +
'    <div class="card-footer text-muted">' +
'    </div>' +
'    -->' +
'    </div>' +
'' +
'    <br/>' +
'' +
'    <!-- Infrastructure parameters -->' +
'    <div class="card" id="cardInfraParams">' +
'      <div class="card-header">' +
'        <h6><i class="fas fa-info-circle"></i> Infrastructure parameters</h6>' +
'      </div>' +
'      <div class="card-body">' +
'        <table class="table table-hover" id="tableInfraParams">' +
'          <tr><th>Name</td><th>Value</th></tr>' +
'        </table>' +
'        <!--' +
'        </div>' +
'        <div class="card-footer text-muted">' +
'        </div>' +
'        -->' +
'      </div>' +
'    </div>';


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


function createCookie(name,value,days,path) {
    if(days) {
        var date = new Date();
        date.setTime(date.getTime() + (24 * 60 * 60 * 1000 * days));
        var expires = "expires=" + date.toGMTString();
    } else {
        var expires = "";
    }
    if(path == null) {
      path = '/';
    }
    var cookie_entry = name + "=" + value + "; " + expires + "; path=" + path;
    console.log("Setting cookie: " + cookie_entry);
    document.cookie = cookie_entry;
}

function accessCookie(cookieName) {
  var name = cookieName + "=";
  var allCookieArray = document.cookie.split(';');
  for(var i  =0; i < allCookieArray.length; i++) {
    var temp = allCookieArray[i].trim();
    if (temp.indexOf(name) == 0)
    return temp.substring(name.length, temp.length);
  }
  return "";
}

function eraseCookie(name) {
    createCookie(name,"",-1);
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

// Updatgin Home elements
function updateHome() {
  console.log("Handling home page");
  if(!FGGUI.fg_checked) {
    $('#pageContent').html('');
    $('#pageContent').html(checkAlert);
    return;
  }
  if(FGGUI.fg_logged) {
    $('#pageContent').html(indexContent);
    $('#tbl_apiserver').text(FGGUI.fg_endpoint);
  } else {
    $('#pageContent').html('');
    $('#pageContent').html(loginAlert);
  }
}

// Updatign single infrastructure
function updateInfrastructure() {
  if(FGGUI.fg_logged) {
    FGGUI.fg_modfied=false;
    FGGUI.fg_data={};
    FGGUI.mod_data={};
    var infra_id = $('#breadcumbBar').find('li').last().text();
    loadInfrastructure(
      infra_id,
      FGGUI.fg_endpoint,
      FGGUI.fg_accesstoken,
      function(data) {
        console.log(JSON.stringify(data));
        $('#pageContent').html(infraContent);
        var table_rows =
          '<tr id="infraName"><td>Name</td><td><div class="row_data" edit_type="click" col_name="infra_name">' + data['name'] + '</div></td></tr>' +
          '<tr id="infraDesc"><td>Description</td><td><div class="row_data" edit_type="click" col_name="infra_desc">' + data['description'] + '</div></td></tr>' +
          '<tr><td>Creation</td><td>' + data['date'] + '</td></tr>' +
          '<tr id="infraEnabled"><td>Enabled</td><td><div class="row_data" edit_type="click" col_name="infra_enabled">' + data['enabled'] + '</div></td></tr>';
        FGGUI.fg_data['infra_name'] = data['name'];
        FGGUI.fg_data['infra_desc'] = data['description'];
        FGGUI.fg_data['infra_enabled'] = data['enabled'];
        $('#tableInfra tr:last').after(table_rows);
        $("#infraName").on('click', function(e) {
          e.preventDefault();
          console.log("clicked infra field: " + this.id);
        });
         $("#infraDesc").on('click', function(e) {
          e.preventDefault();
          console.log("clicked infra field: " + this.id);
        });
        $("#infraEnabled").on('click', function(e) {
          e.preventDefault();
          console.log("clicked infra field: " + this.id);
        });
        table_rows = '';
        for(i=0; i<data['parameters'].length; i++) {
          var param = data['parameters'][i];
          table_rows +=
            '<tr id="param_'+ param['name'] + '">' +
            '<td>' + param['name'] +'</td>' +
            '<td><div class="row_data" edit_type="click" col_name="param_' + param['name'] + '">' + param['value'] +'</div></td>' +
            '</tr>';
          FGGUI.fg_data['param_' +  param['name']] = param['value'];
        }
        FGGUI.mod_data = Object.assign({}, FGGUI.fg_data);
        $('#tableInfraParams tr:last').after(table_rows);
        $(document).on('click', '.row_data', function(e) {
          e.preventDefault(); 
          //make div editable
          $(this).closest('div').attr('contenteditable', 'true');
          //add bg css
          $(this).addClass('bg-warning').css('padding','0px');
          $(this).focus();
          FGGUI.fg_currfield = $(this).text();
        });
        $(document).on('focusout', '.row_data', function(e) {
          e.preventDefault();
          var row_id = $(this).closest('tr').attr('row_id'); 
          var row_div = $(this);
          $(this).removeClass('bg-warning');
          $(this).css('padding','');
          var col_name = row_div.attr('col_name'); 
          var col_val = row_div.html();
          console.log(col_name + ' = ' + col_val);
          FGGUI.mod_data[col_name] = col_val;
          // Check if any change happened
          FGGUI.fg_modfied = false;
          for (var key in FGGUI.fg_data) {
            var v1 = FGGUI.fg_data[key];
            var v2 = FGGUI.mod_data[key];
            if(v1 != v2) {
              FGGUI.fg_modfied = true;
            } else {
              FGGUI.mod_data[key] = FGGUI.fg_data[key];
            }
          }
        });
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
        // Save last successfull FG endpoint
        console.log("infrastructures: " + JSON.stringify(data));
        FGGUI['infrastructures'] = data['infrastructures'];
        if(FGGUI.infrastructures.length > 0) {
          var table_header = 
            '<tr>' +
            '<th>Id</th>' +
            '<th>Name</th>' +
            '<th>Enabled</th>' +
            '<th>Virtual</th>' +
            '</tr>';
          var table_rows = '';
          for(i=0; i<FGGUI.infrastructures.length; i++) {
            console.log(FGGUI.infrastructures[i]);
              table_rows +=
              '<tr id="infra_'+ FGGUI.infrastructures[i]['id'] + '">' +
              '<td>' + FGGUI.infrastructures[i]['id'] +'</td>' +
              '<td>' + FGGUI.infrastructures[i]['name'] +'</td>' +
              '<td>' + FGGUI.infrastructures[i]['enabled'] +'</td>' +
              '<td>' + FGGUI.infrastructures[i]['virtual'] +'</td>' +
              '</tr>';
          }
          $('#pageContent').html(
              '<table class="table table-hover" id="infraTable">' +
              table_header +
              table_rows +
              '</table>');
          for(i=0; i<FGGUI.infrastructures.length; i++) {
            $("#infra_" + FGGUI.infrastructures[i]['id']).on('click', function(e) {
              console.log("clicked infra: " + this.id);
              e.preventDefault();
              window.location = APPSTATE.url_prefix + '/infrastructures/' + this.id.split('_')[1];
            });
          }
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
    $('#pageContent').append('Applications');
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

// FGAPIServerGUI initialization
$(document).ready(function() {
  console.log( "ready!" );
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
