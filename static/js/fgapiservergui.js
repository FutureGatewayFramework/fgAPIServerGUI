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

!function(l){
  "use strict";
  // Settings Check Server Button click event
  l("#checkFGAPIServer").on("click", function(e) {
    e.preventDefault();
    // FG endpoint to check
    var fg_check = $('#fgTestURL').prop('placeholder');
    //var fg_check = FGGUI.fg_endpoint;
    console.log("server to test: " + fg_check);
    // Ensure the endpoint finishes with '/'
    fg_check = fg_check.slice(-1)=='/'?fg_check:fg_check + '/';
    // Check the FG endpoint
    checkServer(fg_check,
      function(fgapis) {
        // Save last successfull FG endpoint
        FGGUI.fg_endpoint = fgapis.fg_endpoint;
        FGGUI.fg_checked = true;
        createCookie('fg_endpoint', fgapis.fg_endpoint, 365);
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
                  createCookie('fg_accesstoken', token, 365);
                  updateInterface();
                  console.log('Logged successfully, token: ' + token);
                },
                function() {
                  FGGUI.fg_logged = false;
                  updateInterface();
                  console.log('Logged unsuccessfully');
                });
  })
}(jQuery);

function createCookie(cookieName, cookieValue, daysToExpire) {
  var date = new Date();
  date.setTime(date.getTime()+(daysToExpire*24*60*60*1000));
  document.cookie = cookieName + "=" + cookieValue + "; expires=" + date.toGMTString();
}

function accessCookie(cookieName) {
  var name = cookieName + "=";
  var allCookieArray = document.cookie.split(';');
  for(var i=0; i<allCookieArray.length; i++) {
    var temp = allCookieArray[i].trim();
    if (temp.indexOf(name)==0)
    return temp.substring(name.length,temp.length);
  }
  return "";
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
        '<li class="breadcrumb-item active"><a href="/">Home</li>');
      updateHome();
    break;
    case 'infrastructures':
      $('#breadcumbBar').html(
        '<li class="breadcrumb-item active"><a href="/">Home</li>' +
        '<li class="breadcrumb-item active"><a href="/infrastructures">Infrastructures</li>');
      updateInfrastructures();
    break;
    case 'infrastructure':
      var pages_array = APPSTATE.pageaddr.split('/');
      var infra_id = pages_array[pages_array.length - 1];
      $('#breadcumbBar').html(
        '<li class="breadcrumb-item active"><a href="/">Home</li>' +
        '<li class="breadcrumb-item active"><a href="/infrastructures">Infrastructures</li>' +
        '<li class="breadcrumb-item active"><a href="/infrastructures/'+ infra_id +'">' + infra_id + '</li>');
      updateInfrastructure();
    break;
    case 'applications':
      $('#breadcumbBar').html(
        '<li class="breadcrumb-item active"><a href="/">Home</li>' +
        '<li class="breadcrumb-item active"><a href="/applications">Applications</li>');
      updateApplications();
    break;
    case 'tasks':
      $('#breadcumbBar').html(
        '<li class="breadcrumb-item active"><a href="/">Home</li>' +
        '<li class="breadcrumb-item active"><a href="/tasks">Tasks</li>');
      updateTasks();
    break;
    case 'users':
      $('#breadcumbBar').html(
        '<li class="breadcrumb-item active"><a href="/">Home</li>' +
        '<li class="breadcrumb-item active"><a href="/users">Users</li>');
      updateUsers();
    break;
    case 'groups':
      $('#breadcumbBar').html(
        '<li class="breadcrumb-item active"><a href="/">Home</li>' +
        '<li class="breadcrumb-item active"><a href="/groups">Groups</li>');
       updateGroups();
    break;
    case 'roles':
      $('#breadcumbBar').html(
        '<li class="breadcrumb-item active"><a href="/">Home</li>' +
        '<li class="breadcrumb-item active"><a href="/roles">Roles</li>');
      updateRoles();
    break;
    default:
      console.log("Unhandled page: " + page);
  }
}

// Toggle between Alert and Page content
function setupPageContent() {
  if(FGGUI.fg_logged) {
      $('#pageContent').show()
      $('#alertContent').hide()
  } else {
      $('#pageContent').hide()
      $('#alertContent').show()
  }
}

// Updatgin Home elements
function updateHome() {
  console.log("Handling home page");
  $('#tbl_apiserver').text(FGGUI.fg_endpoint);
  setupPageContent();
}

// Updatign single infrastructure
function updateInfrastructure() {
  // Update breadcumb Infrastructures/Infrastructure (x)
  //$('#breadcumbBar').prepend('ciccio');
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
          $('#pageContent').append(
              '<table class="table table-hover" id="infraTable">' +
              table_header +
              table_rows +
              '</table>');
          for(i=0; i<FGGUI.infrastructures.length; i++) {
            $("#infra_" + FGGUI.infrastructures[i]['id']).on('click', function(e) {
              console.log("clicked infra: " + this.id);
              e.preventDefault();
              window.location = "/infrastructures/" + this.id.split('_')[1];
            });
          }
        } else {
          $('#pageContent').append(
            '<div class="alert alert-primary" role="alert">' +
            'No infrastructures available' +
            '</div>');
        }
        
      },
      function(data) {
      });
  }
  setupPageContent();
}

// Updatgin Applications elements
function updateApplications() {
  console.log("Handling Applications page");
  setupPageContent();
}

// Updatgin Tasks elements
function updateTasks() {
  console.log("Handling Tasks page");
  setupPageContent();
}

// Updatgin Users elements
function updateUsers() {
  console.log("Handling Users page");
  setupPageContent();
}

// Updatgin Groups elements
function updateGroups() {
  console.log("Handling Groups page");
  setupPageContent();
}

// Updatgin Roles elements
function updateRoles() {
  console.log("Handling Roles page");
  setupPageContent();
}

// FGAPIServerGUI initialization
$(document).ready(function() {
  console.log( "ready!" );
  // First of all try to identify if it is the first time the user open the GUI
  // accessing cookies.
  var fg_endpoint = accessCookie('fg_endpoint');
  console.log("fg_endpoint: " + fg_endpoint);
  if(fg_endpoint == "") {
    console.log("1st Time, endpoint: " + fg_endpoint);
    FGGUI.reset(fg_endpoint);
  } else {
    console.log("! 1st Time, endpoint: " + fg_endpoint);
    FGGUI.reset(fg_endpoint);
    checkServer(fg_endpoint,
      function(data) {
        FGGUI.fg_checked = true;
        // Now it is time to check for exising access tokens
        var fg_accesstoken = accessCookie('fg_accesstoken');
        checkToken(fg_endpoint,
                   fg_accesstoken,
                   function(data) {
                     FGGUI.fg_logged = data['token_info']['valid'];
                     FGGUI.fg_accesstoken = fg_accesstoken;
                     updateInterface();
                   },
                   function(data) {
                     FGGUI.fg_logged = false;
                     FGGUI.fg_accesstoken = '';
                     updateInterface();
                   });
      },
      function(data) {
        FGGUI.fg_checked = false;
        updateInterface();
      }
    );
  }
  updateInterface();
});
