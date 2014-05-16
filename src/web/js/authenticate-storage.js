// Defines storageAPI (as a promise) for others to use
var storageAPIDeferred = Q.defer();
var storageAPI = storageAPIDeferred.promise;
function handleClientLoad(clientId) {
  var api = createProgramCollectionAPI(clientId, "code.pyret.org", true);
  
  api.then(function(api) {
    storageAPIDeferred.resolve(api);
  });
  api.fail(function(err) {
    storageAPIDeferred.reject(err);
    console.log("Not logged in; proceeding without login info", err);
  });
}
