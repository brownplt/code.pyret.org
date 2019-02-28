window.localFileSaveAPI = function createProgramCollectionAPI(baseCollection) {
  function DriveError(err) {
    this.err = err;
  }

  function createAPI(baseCollection) {

    var api = {

      /* Gets directory path */
      getCollectionLink: function() {
        return baseCollection.then(function(bc) {
          return "https://drive.google.com/drive/u/0/folders/" + bc.id;
        });
      },
      /* Probably don't need this -- might want to generate unique ID's */
      getCollectionFolderId: function() {
        return baseCollection.then(function(bc) { return bc.id; });
      },

      /* Probably don't need this -- might want to generate unique ID's */
      getFileById: function(id) {
        return drive.files.get({fileId: id}).then(fileBuilder);
      },

      /* Achieved through a file picker */
      getFileByName: function(name) {
        return this.getAllFiles().then(function(files) {
          return files.filter(function(f) { return f.getName() === name; });
        });
      },

      /* Probably don't need this */
      getCachedFileByName: function(name) {
        return this.getCachedFiles().then(function(files) {
          return files.filter(function(f) { return f.getName() === name; });
        });
      },

      /* Probably don't need this */
      getSharedFileById: function(id) {
        var fromDrive = drive.files.get({fileId: id}, true).then(function(googFileObject) {
          return makeSharedFile(googFileObject, true);
        });
        var fromServer = fromDrive.fail(function() {
          return Q($.get("/shared-file", {
            sharedProgramId: id
          })).then(function(googlishFileObject) {
            return makeSharedFile(googlishFileObject, false);
          });
        });
        var result = Q.any([fromDrive, fromServer]);
        result.then(function(r) {
          console.log("Got result for shared file: ", r);
        }, function(r) {
          console.log("Got failure: ", r);
        });
        return result;
      },

      /* Returns a list of files in the current directory ? */
      getFiles: function(c) {
        return c.then(function(bc) {
          return drive.files.list({ q: "trashed=false and '" + bc.id + "' in parents" })
            .then(function(filesResult) {
              if(!filesResult.items) { return []; }
              return filesResult.items.map(fileBuilder);
            });
        });
      },

      /* Probably don't need this */
      getCachedFiles: function() {
        return this.getFiles(cacheCollection);
      },
      getAllFiles: function() {
        return this.getFiles(baseCollection);
      },

      /* Read contents of an existing file into the editor - used in open event*/
      getFileContents: function(cm) {
        var fs = require('fs'); // Load the File System to execute our common tasks (CRUD)

        var app = require('electron').remote;
        var dialog = app.dialog;

        var name = Q.defer();
        var d = Q.defer();
        const a = [];

        dialog.showOpenDialog((fileNames) => {
          if(fileNames === undefined){
              console.log("No file selected");
              return;
          }

          fs.readFile(fileNames[0], 'utf-8', (err, data) => {
              if(err){
                  alert("An error ocurred reading the file :" + err.message);
                  return;
              }
              console.log(fileNames[0]);
              console.log(data);
              d.resolve(data);
              name.resolve(fileNames[0]);

          });
        });
        a.push(name.promise);
        a.push(d.promise);
        return Promise.all(a);
      },

      autoSave: function(fileName, contents){
        // THIS IS ALL TEMPORARY -- NEED TO MOVE THIS INTO A FUNCTION
        var fs = require('fs'); // Load the File System to execute our common tasks (CRUD)
        fs.writeFile(fileName, contents, (err) => {
            if(err){
                alert("An error ocurred creating the file "+ err.message)
            }

            alert("The file has been succesfully saved");
        });
      },

      /* Gives the user a dialog window to save a file with the given contents */
      createFile: function(contents) {
        // THIS IS ALL TEMPORARY -- NEED TO MOVE THIS INTO A FUNCTION
        var fs = require('fs'); // Load the File System to execute our common tasks (CRUD)
        var name = Q.defer();
        var app = require('electron').remote;
        var dialog = app.dialog;
        // Or with ECMAScript 6
        //const {dialog} = require('electron').remote;


        dialog.showSaveDialog((fileName) => {
          if (fileName === undefined){
              console.log("You didn't save the file");
              return;
          }

          // fileName is a string that contains the path and filename created in the save file dialog.
          fs.writeFile(fileName, contents, (err) => {
              if(err){
                  alert("An error ocurred creating the file "+ err.message)
              }
              console.log(fileName);
              name.resolve(fileName);
              // return(fileName);
              // alert("The file has been succesfully saved");
          });
        });
        // console.log("name is: ");
        // console.log(name);
        return name.promise;
      },

      checkLogin: function() {
        return collection.then(function() { return true; });
      }
    };

    // var shareCollection = findOrCreateDirectory(collectionName + ".shared");
    // var cacheCollection = findOrCreateCacheDirectory(collectionName + ".compiled");

    return {
      api: api,
      collection: baseCollection,
      programToSave : undefined
    };
  }

  function findOrCreateDirectory(name) {
    var q = "('me' in owners) and trashed=false and title='" + name + "' and "+
        "mimeType='" + FOLDER_MIME + "'";
    var filesReq = drive.files.list({
      q: q
    });
    var collection = filesReq.then(function(files) {
      if(files.items && files.items.length > 0) {
        return files.items[0];
      }
      else {
        var dir = drive.files.insert({
          resource: {
            mimeType: FOLDER_MIME,
            title: name
          }
        });
        return dir;
      }
    });
    return collection;
  }

  function findOrCreateCacheDirectory() {
    return findOrCreateDirectory(collectionName + ".compiled");
  }

  function initialize(collection) {
    return createAPI(collection);
  }

  return initialize(baseCollection)
}
