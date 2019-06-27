/*
 Cookie utility functions

 Auhtor: Riccardo Bruno <riccardo.bruno@ct.infn.it>
*/

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