// Defines storageAPI (as a promise) for others to use
var storageAPIDeferred = Q.defer();
var storageAPI = storageAPIDeferred.promise;
function handleClientLoad() {
  var api = createProgramCollectionAPI("code.pyret.org", null, null);
  
  api.then(function(api) {
    $(".loginOnly").show();
    storageAPIDeferred.resolve(api);
  });
  api.fail(function(err) {
    storageAPIDeferred.reject(api);
    console.log("Not logged in; proceeding without login info", err);
  });
}
