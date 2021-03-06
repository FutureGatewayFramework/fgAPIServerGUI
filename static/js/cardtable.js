/*
 * cardtable
 *
 * Create a key_name, key_value table, with editable fields
 *
 * Auhtor: Riccardo Bruno <riccardo.bruno@ct.infn.it>
 */

function cardtable(name, title, text, tabname, data) {
  this.card_icon = '<i class="fas fa-info-circle"></i>';
  this.card_name = name;
  this.card_title = title;
  this.card_text = text;
  this.card_tabname = tabname;
  this.card_data = data;
  this.card_tabheader = true;
  this.card_modified = false;
  this.card_noteditables = [];
  this.action_element = null;
  this.card_colname = 'Name';
  this.card_colvalue = 'Value';
  this.card_code = function() {
    var card_struct = '';
    var card_table = '';
    var card_table_header = '<th>' + this.card_colname + '</th><th>' + this.card_colvalue +'</th>';
    if(Object.keys(this.card_data).length != 0) {
      if(this.card_tabheader != true) {
        card_table_header = '';
      }
      card_table =
        '   <table class="table table-hover" id="' + this.card_tabname + '">' +
        '     <tr>' + card_table_header + '</tr>';
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
  this.setHeaderColumns = function(colname, colvalue) {
    this.card_colname = colname;
    this.card_colvalue = colvalue;
  }
  this.setHeader = function(headerMode) {
    this.card_tabheader = headerMode;
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
      var card_name = this.className.split("_")[0];
      var card_obj = window[card_name];
      var action_function = card_obj.getActionElement();
      if(action_function != null) {
        action_function(card_obj);
      }
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
  this.setActionElement = function(actionElement) {
    this.action_element = actionElement;
  }
  this.getActionElement = function() {
    return this.action_element;
  }
}



