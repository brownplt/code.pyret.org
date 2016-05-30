// Loosely adapted from https://gist.github.com/Daniel15/5994054

/**
 * Creates the Google File Picker API
 */
function FilePicker(options) {
  options = options || {};

  this.dataHandler = options.onSelect;
  this.onLoaded = options.onLoaded || function(){};
  this.onError = options.onError || function(m) { throw new gwrap.GAPIError(m); };
  this.onInternalError = options.onInternalError || this.onError;

  function onPickerLoaded(drive) {
    return function() {
      this.init(drive, google.picker);
      this.onLoaded();
    };
  }

  storageAPI.then((function(drive){
    google.load('picker', '1', { 'callback': onPickerLoaded(drive).bind(this) });
  }).bind(this));
}

FilePicker.prototype.init = function(drive, picker) {
  this.open = this.initOpen(drive, picker);
  // this.openOn does not need initialization
};

FilePicker.prototype.initOpen = function(drive, picker) {

  var validateSelection = (function(sel) {
    if (sel.length === 0) {
      // Should be impossible, since we only run this if the user
      // has picked something (see pickerCallback)
      this.onInternalError("Internal Error (please report to developers): "
                           + "Should be impossible: "
                           + "Picker selection length is zero");
    } else {
      var firstType = sel[0][picker.Document.TYPE];
      // Check that all selected files are of the same type
      sel.forEach((function(f) {
        if (f[picker.Document.TYPE] !== firstType) {
          this.onError("Cannot open files of multiple types "
                       + "(Expected: " + firstType
                       + "; Received: " + f[picker.Document.TYPE]
                       + ")");
        }
      }).bind(this));
      switch (sel[0][picker.Document.TYPE]) {
      case "file": // Pyret file
        break;
      case picker.Type.PHOTO: // Photo
        // Fix photo permissions
        var permissions = {
          'role': 'reader',
          'type': 'anyone',
          'value': 'default',
          'withLink': true
        };
        sel.forEach((function(photo) {
          var fileId = photo[picker.Document.ID];
          gwrap.drive.permissions.insert({
            'fileId': fileId,
            'resource': permissions
          }).catch(this.onInternalError);
        }).bind(this));
        break;
      default:
        this.onError("Cannot open file of unknown type: " + sel[0][picker.Document.TYPE]);
      }
    }
  }).bind(this);

  var pickerCallback = (function(data) {
    if (data[picker.Response.ACTION] == picker.Action.PICKED) {
      var selection = data[picker.Response.DOCUMENTS];
      validateSelection(selection);
      this.dataHandler(selection, picker, drive);
    }
  }).bind(this);

  var showPicker = (function() {
    /**
     * A Picker View which displays Pyret files which users may load.
     */
    var pyretView = new picker.DocsView(picker.ViewId.DOCUMENTS);

    // [Image picker code is based on the Picker code from WeScheme:
    // https://github.com/bootstrapworld/wescheme2012/blob/5b03bac247ac182c356d73fc3e7283ef1086777f/war-src/js/openEditor/editor.js#L571-L659 ]
    /**
     * A Picker View which displays images users may load.
     */
    var imageView = new picker.View(picker.ViewId.DOCS);
    imageView.setMimeTypes("image/png,image/jpeg,image/jpg,image/gif");

    var buildInstance = (function(parentId) {
      pyretView.setParent(parentId);

      this.pickerInstance = new picker.PickerBuilder()
        //.enableFeature(picker.Feature.NAV_HIDDEN)
        .enableFeature(picker.Feature.MULTISELECT_ENABLED)
        .setTitle("Select a Pyret document or an image from Google Drive")
        .addView(pyretView)
        .addView(imageView)
        .setAppId(clientId)
        .setOAuthToken(gapi.auth.getToken().access_token)
        .setCallback(pickerCallback)
        .build();
      this.pickerInstance.setVisible(true);
      $(".picker").css("z-index", 9000);
    }).bind(this);

    drive.getCollectionFolderId().then(buildInstance);
  }).bind(this);

  

  return function() {
    gwrap.withAuth(showPicker);
  };
};

FilePicker.prototype.openOn = function(elt, evt) {
  elt.addEventListener(evt, this.open.bind(this));
};
