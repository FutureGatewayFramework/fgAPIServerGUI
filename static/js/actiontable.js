/*
 * cardtable
 *
 * Create a key_name, key_value table, with editable fields
 */

function actiontable(name, title, text, controlList, controlFunctions) {
  this.action_name = name;
  this.action_title = title;
  this.action_text = text;
  this.action_ctrl_list = controlList;
  this.action_ctrl_functions = controlFunctions;
  this.card_code = function() {
    var card_table =
      '<table class="table" id="' + this.action_name + '">' +
      '  <tr>' + 
      '    <td id="reload"><button id="reloadButton" class="button btn-primary"><i class="fas fa-redo"></i></button></td>' +
      '    <td id="save"><button id="saveButton" class="button btn-warning"><i class="fas fa-check"></i></button></td>' +
      '    <td id="delete"><button id="deleteButton" class="button btn-danger"><i class="fas fa-trash-alt"></i></button></td>' +
      '  </tr>' +
      '</table>';
    return '<div class="card" id="' + this.action_name + '">' +
           '  <div class="card-header">' +
           '    <h6>' + this.action_title + '</h6>' +
           '  </div>' +
           '  <div class="card-body">' + this.action_text +
           '  ' + card_table +
           '  </div>' +
           '<!--' +
           '  <div class="card-footer text-muted">' +
           '  </div>' +
           '-->' +
           '</div>';
  }
  this.disableReload = function() {
    $('#reloadButton').attr('disabled',true);
    $('#reloadButton').attr('class','button btn-basic');
  }
  this.disableSave = function() {
    $('#saveButton').attr('disabled',true);
    $('#saveButton').attr('class','button btn-basic');
  }
  this.disableDelete = function() {
    $('#deleteButton').attr('disabled',true);
    $('#deleteButton').attr('class','button btn-basic');
  }
  this.disableAll = function() {
    this.disableReload();
    this.disableSave();
    this.disableDelete();
  }
  this.enableReload = function() {
    $('#reloadButton').attr('disabled',false);
    $('#reloadButton').attr('class','button btn-primary');
  }
  this.enableSave = function() {
    $('#saveButton').attr('disabled',false);
    $('#saveButton').attr('class','button btn-warning');
  }
  this.enableDelete = function() {
    $('#deleteButton').attr('disabled',false);
    $('#deleteButton').attr('class','button btn-danger');
  }
  this.enableAll = function() {
    this.enableReload();
    this.enableSave();
    this.enableDelete();
  }
  this.render = function(renderAt) {
    $(renderAt).append(this.card_code());
    this.disableAll();
    this.enableDelete();
    // Now assign a function for each action
    $('#reloadButton').on('click', this.action_ctrl_functions[0]);
    $('#saveButton').on('click', this.action_ctrl_functions[1]);
    $('#deleteButton').on('click', this.action_ctrl_functions[2]);
  }
}



