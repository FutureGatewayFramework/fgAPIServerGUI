/*
 FGAPIServerGUI javascript
*/

// Store all FG GUI values
FGGUI = {
  fg_endpoint: '',
  fg_checked: false,

  reset: function() {
    this.fg_endpoint = 'http://localhost/fgapiserver';
    this.fg_checked = false;
  }
};

!function(l){
  "use strict";
  l("#checkFGAPIServer").on("click", function() {
    // FG endpoint to check
    var fg_check = $('#fgTestURL').prop('placeholder');
    // Ensure the endpoint finishes with '/'
    fg_check = fg_check.slice(-1)=='/'?fg_check:fg_check + '/';
    // Check the FG endpoint
    if(checkServer(fg_check)) {
      FGUI.fg_checked = true;
      createCookie('fg_endpoint', $('#fgTestURL').prop('placeholder'), 365);
    } else {
      FGUI.fg_checked = false;
    }
    updateInterface();
  }),
  l("#checkFGAPIServer").on('input propertychange paste', function() {
    $('#fgCheckedButton').prop('class', 'btn btn-danger');
    $('#fgCheckedButton').find('i').prop('class', 'fas fa-times');
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

function updateInterface() {
  // Use variable values to determine the correct interface
  if(!FGGUI.fg_checked) {
    $('#loginNav').hide();
    $('#settingsNav').show();
    $('#fgCheckedButton').prop('class', 'btn btn-primary');
    $('#fgCheckedButton').find('i').prop('class', 'fas fa-check')
  } else {
    $('#loginNav').show();
    $('#settingsNav').hide();
    $('#fgCheckedButton').prop('class', 'btn btn-danger');
    $('#fgCheckedButton').find('i').prop('class', 'fas fa-times')
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
    console.log("1st Time");
    FGGUI.reset('http://localhost/fgapiserver');
    FGGUI.checked = false;
  } else {
    console.log("! 1st Time");
    FGGUI.fg_endpoint = fg_endpoint;
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
