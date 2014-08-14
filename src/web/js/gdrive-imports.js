define(["q", "js/eval-lib"], function(Q, evalLib) {
  function makeDriveImporter(storageAPI) {
    return {
      // ModuleLoadResult = Promise<{ name: String, ast: Program } U "loaded">
      // Runtime x String -> ModuleLoadResult
      getMyDriveImport: function(runtime, filename) {
        // TODO(joe): what happens if initially not logged in?
        return storageAPI.then(function(storage) {
          var api = storage.api;
          var returnP = Q.defer();
          var filesP = api.getFileByName(filename).then(function(files) {
            if(files.length === 0) {
              runtime.ffi.throwMessageException("Could not find module with name " + filename);
            }
            if(files.length > 1) {
              runtime.ffi.throwMessageException("There were multiple files with name " + filename);
            }
            return files;
          });
          filesP.fail(function(err) { returnP.reject(err); });

          var fullname = "@gdrive-" + filename;

          var contentsP = filesP.then(function(files) { return files[0].getContents(); });
          contentsP.then(function(contents) {
            evalLib.runParsePyret(runtime, contents, { name: fullname }, function(result) {
              if(runtime.isFailureResult(result)) { returnP.reject(result); }
              else {
                returnP.resolve({ ast: result.result, name: fullname });
              }
            });
          });
          return returnP.promise;
        });
      },
      // Runtime x String x Array<String> -> ModuleLoadResult
      getSharedDriveImport: function(runtime, filename, id) {

      }
    };
  }
  return {
    makeDriveImporter: makeDriveImporter
  }
});
