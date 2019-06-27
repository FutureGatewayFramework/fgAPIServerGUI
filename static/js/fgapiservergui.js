/*
 FGAPIServerGUI javascript

 This code mainly provides these two functionalities.

 The !function(l) {} part handles menu and gadget defined inside the base.html
 template.
 The $(document).ready(function() at the bottom is responsible of the whole
 dynamic aspect of the page (almost 100% of the page is dynamically generated).

 Dynamic content uses three important elements

  infotabe
  cadttable
  actiontable

infotable is the responsible to present multicolumn values where each column
can be set editable or not.

cardtable is responsible to present values in the form of key-value, it can
understand if a value has been changed or not

actiontable is the responsible to present the following actions: 'reload',
'save' and 'delete' actions. This component takes as input cardtable elements
and assign to it a given set of function each responsible (in the order): 
reload, save and delete activity. This element is not yet linked with infotable

Auhtor: Riccardo Bruno <riccardo.bruno@ct.infn.it>
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
}

// Updatign single infrastructure
function updateInfrastructure() {
  var infra_id = $('#breadcumbBar').find('li').last().text();
  loadInfrastructure(
    infra_id,
    FGGUI.fg_endpoint,
    FGGUI.fg_accesstoken,
    function(data) {
      // Information
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
      // Parameters
      var paramsData = {}
      var parameters = data['parameters'];
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
}

// Updating Infrastructure elements
function updateInfrastructures() {
  console.log("Handling Infrastructures page");
  // Check the FG endpoint
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
}

function trimLastSlash(s) {
  return s[s.length-1]=='/'?s.substr(0,x.length-1):s;
}

function ReloadApplication() {
  var app_id = $('#breadcumbBar').find('li').last().text();
  console.log("Reload application having id: " + app_id);
  location.reload();
}

function SaveApplication() {
  var app_id = $('#breadcumbBar').find('li').last().text();
  console.log("Save application having id: " + app_id);
}

function DeleteApplication() {
  var app_id = $('#breadcumbBar').find('li').last().text();
  console.log("Delete application having id: " + app_id);
}

// Updatign single application
function updateApplication() {
  console.log('app logged');
  var app_id = $('#breadcumbBar').find('li').last().text();
  loadApplication(
    app_id,
    FGGUI.fg_endpoint,
    FGGUI.fg_accesstoken,
    function(data) {
      // Information
      var infoData = {};
      infoData['name'] = data['name'];
      infoData['description'] = data['description'];
      infoData['outcome'] = data['outcome'];
      infoData['enabled'] = data['enabled'];
      //infoData['date'] = data['date'];
      cardInfo = new cardtable('cardInfo', 'Information', '', 'cardInfo', infoData);
      //cardInfo.setNotEditables(['date']);
      cardInfo.render('#pageContent');
      $('#pageContent').append('<br/>');
      // Parameters
      var paramsData = {};
      parameters = data['parameters'];
      for(var i=0; i<parameters.length; i++) {
        paramsData[parameters[i]['name']] = parameters[i]['value'];
      }
      cardParams = new cardtable('cardParams', 'Parameters', '', 'cardParams', paramsData);
      cardParams.setIcon('<i class="fas fa-list-ul"></i>');
      cardParams.render('#pageContent');
      $('#pageContent').append('<br/>');
      // Files
      var filesData = {};
      files = data['files'];
      var fileNames = [];
      for(var i=0; i<files.length; i++) {
        var file_endpoint = trimLastSlash(files[i]['url']);
        filesData[files[i]['name']] =
          '<a href="' + APPSTATE.url_prefix + '/' + file_endpoint + '&token=' + FGAPIs.access_token + '&lpath=' + APPSTATE.fg_appsdir + '"><i class="fas fa-file-download"></i></a>';
        fileNames.push(files[i]['name']);
      }
      fileParams = new cardtable('fileParams', 'Files', '', 'fileParams', filesData);
      fileParams.setIcon('<i class="fas fa-folder"></i>');
      fileParams.setNotEditables(fileNames);
      fileParams.setHeader(false);
      fileParams.render('#pageContent');
      $('#pageContent').append('<br/>');
      // Infrastructures
      var infraData = {}
      var infrastructures = data['infrastructures'];
      for(var i=0; i<infrastructures.length; i++) {
        infraData['' + (1+i)] = infrastructures[i];
      }
      cardInfras = new cardtable('cardInfras', 'Infrastructures', '', 'cardInfras', infraData);
      cardInfras.setIcon('<i class="fas fa-network-wired"></i>');
      cardInfras.render('#pageContent');
      $('#pageContent').append('<br/>');
      // Actions
      var inputCards = [cardInfo, cardParams, cardInfras];
      var actionFunctions = [ReloadApplication, SaveApplication, DeleteApplication];
      actionTable = new actiontable("actions", "Actions", "", inputCards, actionFunctions);
      actionTable.render('#pageContent');
      for(var i=0; i<inputCards.length; i++) {
        inputCards[i].setActionElement(function(cardTable){
          if(cardTable.isModified()) {
            actionTable.enableReload();
            actionTable.enableSave();
          } else {
            actionTable.disableReload();
            actionTable.disableSave();
          }
        });
      }
    },
    function(data) {
      $('#pageContent').html(
        '<div class="alert alert-primary" role="alert">' +
        'Unable to load application information having id: ' + app_id +
        '</div>');
    });
}



// Updatgin Applications elements
function updateApplications() {
  console.log("Handling Applications page");
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
}

// Updating single task
function updateTask() {
  console.log('task logged');
  var task_id = $('#breadcumbBar').find('li').last().text();
  loadTask(
    task_id,
    FGGUI.fg_endpoint,
    FGGUI.fg_accesstoken,
    '?user=*',
    function(data) {
      // Generic info
      var infoData = {};
      infoData['status'] = data['status'];
      infoData['description'] = data['description'];
      infoData['creation'] = data['creation'];
      infoData['iosandbox'] = data['iosandbox'];
      infoData['application'] = data['application'];
      infoData['user'] = data['user'];
      cardInfo = new cardtable('cardInfo', 'Information', '', 'cardInfo', infoData);
      cardInfo.setNotEditables(['id', 'status', 'creation', 'application']);
      cardInfo.render('#pageContent');
      $('#pageContent').append('<br/>');
      var argsData = {};
      args = data['arguments'];
      for(var i=0; i<args.length; i++) {
        argsData['' + (1 + i)] = args[i];
      }
      cardArgs = new cardtable('cardArgs', 'Arguments', '', 'cardArgs', argsData);
      cardArgs.setIcon('<i class="fas fa-list-ul"></i>');
      var notEditableCols=[];
      for(var i=0; i<args.length; i++) {
        notEditableCols.push(''+(1+i));
      }
      cardArgs.setNotEditables(notEditableCols);
      cardArgs.render('#pageContent');
      $('#pageContent').append('<br/>');
      var inputFilesData = {};
      input_files = data['input_files'];
      // input files
      var fileNames = [];
      for(var i=0; i<input_files.length; i++) {
        var file_endpoint = trimLastSlash(input_files[i]['url']);
        inputFilesData[input_files[i]['name']] =
          '<a href="' + APPSTATE.url_prefix + '/' + file_endpoint + '&token=' + FGAPIs.access_token + '"><i class="fas fa-file-download"></i></a>';
        fileNames.push(input_files[i]['name']);
      }
      inputFileParams = new cardtable('inputFileParams', 'Input files', '', 'inputFileParams', inputFilesData);
      inputFileParams.setIcon('<i class="fas fa-file-import"></i>');
      inputFileParams.setNotEditables(fileNames);
      inputFileParams.setHeader(false);
      inputFileParams.render('#pageContent');
      $('#pageContent').append('<br/>');
      // output files
      var outputFilesData = {};
      output_files = data['output_files'];
      var fileNames = [];
      for(var i=0; i<output_files.length; i++) {
        var file_endpoint = trimLastSlash(output_files[i]['url']);
        outputFilesData[output_files[i]['name']] =
          '<a href="' + APPSTATE.url_prefix + '/' + file_endpoint + '&token=' + FGAPIs.access_token + '"><i class="fas fa-file-download"></i></a>';
        fileNames.push(output_files[i]['name']);
      }
      outputFileParams = new cardtable('outputFileParams', 'Output files', '', 'outputFileParams', outputFilesData);
      outputFileParams.setIcon('<i class="fas fa-file-export"></i>');
      outputFileParams.setNotEditables(fileNames);
      outputFileParams.setHeader(false);
      outputFileParams.render('#pageContent');
      $('#pageContent').append('<br/>');
      // runtime data
      var runtTimeData = {};
      runtime_data = data['runtime_data'];
      for(var i=0; i<runtime_data.length; i++) {
        runtTimeData[runtime_data[i]['data_name']] =
          '<a href="#" data-toggle="popover" title="description" data-content="' + runtime_data[i]['data_desc'] + '">' + runtime_data[i]['data_name'] +'</a>';
      }
      outputFileParams = new cardtable('runtTimeData', 'Runtime data', '', 'runtTimeData', runtTimeData);
      outputFileParams.setIcon('<i class="fas fa-database"></i>');
      outputFileParams.setNotEditables(fileNames);
      outputFileParams.setHeader(false);
      outputFileParams.render('#pageContent');
    },
    function(data) {
      $('#pageContent').html(
        '<div class="alert alert-primary" role="alert">' +
        'Unable to load runtime data for task having id: ' +task_id +
        '</div>');
    });
}

// Updatgin Tasks elements
function updateTasks() {
  console.log("Handling Tasks page");
  loadTasks(
  FGGUI.fg_endpoint,
  FGGUI.fg_accesstoken,
  '?user=*',
  function(data) {
    FGGUI['tasks'] = data['tasks'];
    if(FGGUI.tasks.length > 0) {
      rowclickfn = function(o) {
        var row_index =  o.currentTarget.rowIndex;
        var task_id = $('#' + (row_index-1) + '_' + 'tasks').find('div').html().trim();
        window.location = APPSTATE.url_prefix + '/tasks/' + task_id;
      }
      var tasksRows = data['tasks'];
      var tasksCols = ['id', 'status', 'description', 'application'];
      tasksTable = new infotable('tasks', tasksCols, tasksRows, rowclickfn);
      tasksTable.setNotEditableCols(tasksCols);
      tasksTable.render('#pageContent');
    } else {
      $('#pageContent').html(
        '<div class="alert alert-primary" role="alert">' +
        'No tasks available' +
        '</div>');
    }
  },
  function(data) {
    $('#pageContent').append(
      '<div class="alert alert-danger" role="alert">' +
      'Unable to recover tasks, please check your user rights or authorization configuration' +
      '</div>');
    });
}

// Updatgin Users elements
function updateUsers() {
  console.log("Handling Users page");
}

// Updatgin Groups elements
function updateGroups() {
  console.log("Handling Groups page");
}

// Updatgin Roles elements
function updateRoles() {
  console.log("Handling Roles page");
}

// Not accessible page
function notAccessiblePage() {
  console.log("Handling not accessible page");
  $('#pageContent').html(
    '<div class="alert alert-danger" role="alert" id="unaccessibleContent">' +
    '<p>The requested content is not available, please check you have the necessary rights to perform this operation.</p>' +
    '<p>Go back to the <a href="{{ app_state.url_prefix }}/">home</a> page.</p>' +
    '</div>');
}

// Use variable values to determine the correct interface
function updateInterface() {

  // Set fg_endpoint into the dialog box text control
  $('#fgTestURL').prop('placeholder', FGGUI.fg_endpoint);
  $('#searchForm').hide();


if(FGGUI.fg_checked) {
    $('#loginNavIco').prop('class', 'badge badge-danger');
    $('#loginNavIcoImg').prop('class', 'fas fa-times');
    $('#pageContent').html('');
    $('#pageContent').append(loginAlert);
    $('#fgCheckedButton').prop('class', 'btn btn-primary');
    $('#fgCheckedButton').find('i').prop('class', 'fas fa-check');
    $('#settingsNavIco').prop('class', 'badge badge-primary');
    $('#settingsNavIcoImg').prop('class', 'fas fa-check');
    $('#loginNav').show();
    if(FGGUI.fg_logged) {
      $('#loginNavIco').prop('class', 'badge badge-primary');
      $('#loginNavIcoImg').prop('class', 'fas fa-check');
      $('#alertContent').hide();
    } else {
      return;
    }
  } else {
    $('#pageContent').html('');
    $('#pageContent').append(checkAlert);
    $('#fgCheckedButton').prop('class', 'btn btn-danger');
    $('#fgCheckedButton').find('i').prop('class', 'fas fa-times');
    $('#settingsNavIco').prop('class', 'badge badge-danger');
    $('#settingsNavIcoImg').prop('class', 'fas fa-times');
    $('#loginNav').hide();
    return;
  }

  // Get rendered page
  var page = APPSTATE.page;

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
    case 'application':
      var pages_array = APPSTATE.pageaddr.split('/');
      var app_id = pages_array[pages_array.length - 1];
      $('#breadcumbBar').html(
        '<li class="breadcrumb-item active"><a href="' + APPSTATE.url_prefix + '/">Home</li>' +
        '<li class="breadcrumb-item active"><a href="' + APPSTATE.url_prefix + '/applications">Applications</li>' +
        '<li class="breadcrumb-item active"><a href="' + APPSTATE.url_prefix + '/applications/'+ app_id +'">' + app_id + '</li>');
      updateApplication();
    break;
    case 'tasks':
      $('#breadcumbBar').html(
        '<li class="breadcrumb-item active"><a href="' + APPSTATE.url_prefix + '/">Home</li>' +
        '<li class="breadcrumb-item active"><a href="' + APPSTATE.url_prefix + '/tasks">Tasks</li>');
      updateTasks();
    break;
    case 'task':
      var pages_array = APPSTATE.pageaddr.split('/');
      var task_id = pages_array[pages_array.length - 1];
      $('#breadcumbBar').html(
        '<li class="breadcrumb-item active"><a href="' + APPSTATE.url_prefix + '/">Home</li>' +
        '<li class="breadcrumb-item active"><a href="' + APPSTATE.url_prefix + '/tasks">Tasks</li>' +
        '<li class="breadcrumb-item active"><a href="' + APPSTATE.url_prefix + '/tasks/'+ task_id +'">' + task_id + '</li>');
      updateTask();
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
    case 'notaccessible':
      $('#breadcumbBar').html(
      '<li class="breadcrumb-item active"><a href="' + APPSTATE.url_prefix + '/">Home</li>');
      notAccessiblePage();
    break;
    default:
      $('#breadcumbBar').html(
        '<li class="breadcrumb-item active"><a href="' + APPSTATE.url_prefix + '/">Home</li>');
      console.log("Unhandled page: " + page);
      return;
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
