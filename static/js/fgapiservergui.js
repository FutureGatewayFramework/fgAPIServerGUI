/*
 FGAPIServerGUI javascript
*/

// Store all FG GUI values
FGGUI = {
  fg_endpoint: '',
  fg_checked: false,
  fg_logged: false,

  reset: function(endpoint) {
    this.fg_endpoint = endpoint;
    this.fg_checked = false;
    this.fg_logged = false;
  }
};

!function(l){
  "use strict";
  // Settings Check Server Button click event
  l("#checkFGAPIServer").on("click", function() {
    // FG endpoint to check
    var fg_check = $('#fgTestURL').prop('placeholder');
    //var fg_check = FGGUI.fg_endpoint;
    console.log("server to test: " + fg_check);
    // Ensure the endpoint finishes with '/'
    fg_check = fg_check.slice(-1)=='/'?fg_check:fg_check + '/';
    // Check the FG endpoint
    checkServer(fg_check,
      function(data) {
        FGGUI.fg_checked = true;
        // Save last successfull FG endpoint
        createCookie('fg_endpoint', $('#fgTestURL').prop('placeholder'), 365);
        updateInterface();
      },
      function(data) {
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
    //$('#loginNav').hide();
    //$('#settingsNav').show();
    $('#fgCheckedButton').prop('class', 'btn btn-primary');
    $('#fgCheckedButton').find('i').prop('class', 'fas fa-check');
    $('#settingsNavIco').prop('class', 'badge badge-primary');
    $('#settingsNavIcoImg').prop('class', 'fas fa-check');
    $('#loginNav').show();
  } else {
    //$('#loginNav').show();
    //$('#settingsNav').hide();
    $('#fgCheckedButton').prop('class', 'btn btn-danger');
    $('#fgCheckedButton').find('i').prop('class', 'fas fa-times');
    $('#settingsNavIco').prop('class', 'badge badge-danger');
    $('#settingsNavIcoImg').prop('class', 'fas fa-times');
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
}

// FGAPIServerGUI initialization
$(document).ready(function() {
  console.log( "ready!" );
  // First of all try to identify if it is the first time the user open the GUI
  // accessing cookies.
  var fg_endpoint = accessCookie('fg_endpoint');
  console.log("fg_endpoint: " + fg_endpoint);
  if(fg_endpoint == "") {
    fg_endpoint = $('#fgTestURL').prop('placeholder');
    console.log("1st Time, endpoint: " + fg_endpoint);
    FGGUI.reset(fg_endpoint);
  } else {
    console.log("! 1st Time, endpoint: " + fg_endpoint);
    FGGUI.reset(fg_endpoint);
    checkServer(fg_endpoint,
      function(data) {
        FGGUI.fg_checked = true;
        updateInterface();
      },
      function(data) {
        FGGUI.fg_checked = false;
        updateInterface();
      }
    );
  }
});
