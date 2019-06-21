/*
 * cardtable
 *
 * Create a key_name, key_value table, with editable fields
 */

function cardtable(name, title, text, tabname, data) {
  this.card_icon = '<i class="fas fa-info-circle"></i>';
  this.card_name = name;
  this.card_title = title;
  this.card_text = text;
  this.card_tabname = tabname;
  this.card_data = data;
  this.card_modified = false;
  this.card_noteditables = [];
  this.card_code = function() {
    var card_struct = '';
    if(Object.keys(this.card_data).length != 0) {
      card_table =
        '   <table class="table table-hover" id="' + this.card_tabname + '">' +
        '    <tr><th>Name</th><th>Value</th></tr>' +
        '   </table>';
    } else {
      card_table =
        '<div class="alert alert-primary" role="alert" id="alertContent">' +
        title + ' not available' +
        '</div>';
    }
    return '<div class="card" id="' + this.card_name + '">' +
           '  <div class="card-header">' +
           '    <h6>' + this.card_icon + ' ' + this.card_title + '</h6>' +
           '  </div>' +
           '  <div class="card-body">' + this.card_text +
           '  ' + card_table +
           '  </div>' +
           '<!--' +
           '  <div class="card-footer text-muted">' +
           '  </div>' +
           '-->' +
           '</div>';
  }
  this.notEditables = function() {
    return this.card_noteditables;
  }
  this.notEditableKey = function(key) {
    var not_editables = this.notEditables();
    for(var i=0; i<not_editables.length; i++) {
      if(key == not_editables[i]) {
          return true;
      }
    }
    return false;
  }
  this.render = function(renderAt) {
    $(renderAt).append(this.card_code());
    var card_tablerows = '';
    for (var key in this.card_data) {
      var div_class = this.card_tabname + '_row_data';
      if(this.notEditableKey(key)) {
        div_class = "font-weight-light";
      }
      card_tablerows += 
        '<tr id="row_' + this.card_tabname + '_' + key +'">' + 
        '  <td>'+ key + '</td>' + 
        '  <td><div class="' + div_class + '"' +
        '           edit_type="click"' +
        '           id="' + this.card_tabname + '_' + key + '">' +
               this.card_data[key] +
        '      </div></td></tr>';
    }
    $('#'+ this.card_tabname +' tr:last').after(card_tablerows);
    // Value cell editable handlers
    $('.' + this.card_tabname + '_row_data').on('click', function(e) {
      e.preventDefault();
      $(this).closest('div').attr('contenteditable', 'true');
      $(this).addClass('bg-warning').css('padding','0px');
      $(this).focus();
    });
    $('.' + this.card_tabname + '_row_data').on('focusout', function(e) {
      e.preventDefault();
      $(this).removeClass('bg-warning');
      $(this).css('padding','');
      /*
      var row_id = $(this).closest('tr').attr('row_id');
      var row_div = $(this);
      var key_name = row_div.attr('key_name');
      var key_value = row_div.text();
      console.log(key_name + '=' + key_value);
      */
    });
  }
  this.setIcon = function(icon) {
    this.card_icon = icon;
  }
  this.setNotEditables = function(notEditables) {
    this.card_noteditables = notEditables;
  }
  this.isModified = function() {
    this.card_modified = false;
    for (var key in this.card_data) {
      var v1 = '' + this.card_data[key];
      var v2 = $('#' + this.card_tabname + '_' + key).text().trim();
      console.log('\''+v1+'\''+'?'+'\''+v2+'\'');
      if(v1 != v2) {
        console.log('\''+v1+'\''+'!= '+'\''+v2+'\'');
        this.card_modified = true;
      }
    }
    return this.card_modified;
  }
}



