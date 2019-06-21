/*
 * cardtable
 *
 * Create a key_name, key_value table, with editable fields
 */

function infotable(name, columns, datarows, rowclickfn) {
  this.info_name = name;
  this.info_modified = false;
  this.info_columns = columns;
  this.info_datarows = datarows;
  this.info_noteditablecols = [];
  this.info_rowclickfunction = rowclickfn;
  this.info_code = function() {
    return '<table class="table table-hover" id="' + this.info_name + '">' +
           '  <thead>' +
           '  ' + this.renderColumns() +
           '  </thead>' +
           '  <tbody>' +
           '  ' + this.renderRows() +
           '  </tbody>' +
           '</table>';
  }
  this.getRowClickFunction = function() {
    return this.info_rowclickfunction;
  }
  this.setRowClickFunction = function(clickfn) {
    this.info_rowclickfunction = clickfn;
  }
  this.notEditableCols = function() {
    return this.info_noteditablecols;
  }
  this.notEditableCol = function(column) {
    var not_editable_cols = this.notEditableCols();
    for(var i=0; i<not_editable_cols.length; i++) {
      if(column == not_editable_cols[i]) {
          return true;
      }
    }
    return false;
  }
  this.setNotEditableCols = function(notEditableCols) {
    this.info_noteditablecols = notEditableCols;
  }
  this.renderColumns = function() {
    var columns = '';
    for(var i=0; i<this.info_columns.length; i++) {
      columns += '<th>' + this.info_columns[i] + '</th>';
    }
    return '<tr>' +
           columns +
           '</tr>';
  }
  this.renderRows = function() {
    var rows = '';
    for(var i=0; i<this.info_datarows.length; i++) {
      var row_cols = '';
      var row = this.info_datarows[i];
      var new_row = [];
      if(!Array.isArray(row)) {
        // Transform the row into an array of given columns values
        for(var j=0; j<this.info_columns.length; j++) {
          new_row.push(row[this.info_columns[j]]);
        }
        row = new_row;
      }
      for(var j=0; j<this.info_columns.length; j++) {
        var div_class = ''+ i + '_' + j + '_' + this.info_columns[j];
        if(this.notEditableCol(this.info_columns[j])) {
          div_class = "font-weight-light";
        }
        row_cols += '<td id="' + i + '_ ' + j + '_' + this.info_columns[j] + '"> ' +
                    '<div class="' + div_class + '">' +
                    '  ' + new_row[j] +
                    '</div></td>';
      }
      rows += '<tr id="' + i + '_' + this.info_name + '">' + row_cols + '</tr>';
    }
    return rows;
  }
  this.render = function(renderAt) {
    $(renderAt).append(this.info_code());
    for(var i=0; i<this.info_datarows.length; i++) {
      // Handle rowclick
      var rowclickfn = this.getRowClickFunction();
      $('#' +  i + '_' + this.info_name).on('click', rowclickfn);
      // Handle editable columns
      for(var j=0; j<this.info_columns.length; j++) {
        $('.' + i + '_' + j + '_' + this.info_columns[j]).on('click', function(e) {
          e.preventDefault();
          $(this).closest('div').attr('contenteditable', 'true');
          $(this).addClass('bg-warning').css('padding','0px');
          $(this).focus();
        });
        $('.' + i + '_' + j + '_' + this.info_columns[j]).on('focusout', function(e) {
          e.preventDefault();
          $(this).removeClass('bg-warning');
          $(this).css('padding','');
        });
      }
    }
  }
}


  /*
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
      
      //var row_id = $(this).closest('tr').attr('row_id');
      //var row_div = $(this);
      //var key_name = row_div.attr('key_name');
      //var key_value = row_div.text();
      //console.log(key_name + '=' + key_value);
      
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
  */




