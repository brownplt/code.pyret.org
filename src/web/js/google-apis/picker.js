// Loosely adapted from https://gist.github.com/Daniel15/5994054

/**
 * Creates the Google File Picker API
 */
function FilePicker(options) {
  options = options || {};
  this.options = options;

  this.dataHandler = options.onSelect;
  this.onLoaded = options.onLoaded || function(){};
  this.onError = options.onError || function(m) {
    console.error(m);
    throw new gwrap.GAPIError(m);
  };
  this.onInternalError = options.onInternalError || this.onError;
  this.raisedError = false;

  function onPickerLoaded() {
    this.init(google.picker);
    this.onLoaded();
  }

  // Wrapped for dependency-ordering, although that might be unneeded.
  storageAPI.then((function(){
    gapi.load('picker', { 'callback': onPickerLoaded.bind(this) });
  }).bind(this));
}

FilePicker.prototype.init = function(picker) {
  this.open = this.initOpen(picker);
  // this.openOn does not need initialization
};

FilePicker.prototype.initOpen = function(picker) {

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
        sel.forEach((function(photo) {
          var fileId = photo[picker.Document.ID];
          Q($.ajax({
            url: "/share-image",
            method: "post",
            data: {
              fileId: fileId
            }
          })).fail(this.onInternalError);
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
      storageAPI.then((function(drive) {
        this.dataHandler(selection, picker, drive);
      }).bind(this));
    }
  }).bind(this);

  /*
    views are defined below; they can be
      "pyretView" – show Pyret files
      "imageView" – show the whole drive, selecting for image files

    The client provides a list of appropriate views
  */
  var showPicker = (function(drive, views, title) {
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

    var allViews = {
      imageView: imageView,
      pyretView: pyretView
    }

    var buildInstance = (function(parentId) {
      pyretView.setParent(parentId);

      var pickerBuilder = new picker.PickerBuilder()
        //.enableFeature(picker.Feature.NAV_HIDDEN)
        .enableFeature(picker.Feature.MULTISELECT_ENABLED)
        .setTitle(title);
      
      for(var i = 0; i < views.length; i += 1) {
        pickerBuilder.addView(allViews[views[i]]);
      }

      this.pickerInstance = pickerBuilder
        .setOAuthToken(gapi.auth.getToken().access_token)
        .setDeveloperKey(apiKey)
        .setAppId(appId)
        .setCallback(pickerCallback)
        .build();

      this.pickerInstance.setVisible(true);
      $(".picker").css("z-index", 9000);
      var hidePicker = function(e) {
        if(e.which === 27) {
          $(".picker").remove();
          $(document).unbind("keydown", hidePicker);
        }
      };
      $(document).on("keydown", hidePicker);
    }).bind(this);

    return drive.getCollectionFolderId().then(buildInstance);
  }).bind(this);

  

  return (function() {
    this.raisedError = false;
    var views = this.options.views || [];
    var title = this.options.title || "Select a file";
    return storageAPI.then(function(drive) {
      return gwrap.withAuth(function() {return showPicker(drive, views, title); });
    })
      .catch((function(err) {
        if (this.raisedError) {
          throw err; // <- result from this.onError or this.onInternalError
        } else if (err && err.message) {
          this.onInternalError(err.message);
        } else {
          this.onInternalError(err);
        }
      }).bind(this));
  }).bind(this);
};

FilePicker.prototype.openOn = function(elt, evt) {
  elt.addEventListener(evt, this.open.bind(this));
};
