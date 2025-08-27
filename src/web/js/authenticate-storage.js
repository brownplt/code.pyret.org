// Defines storageAPI (as a promise) for others to use
var storageAPIDeferred = Q.defer();
var sheetsAPIDeferred = Q.defer();
window.storageAPI = storageAPIDeferred.promise;
window.sheetsAPI = sheetsAPIDeferred.promise;

window.handleClientLoad = function handleClientLoad(apiKey, publicOnly) {
  if(!window.gapi || !window.gapi.client) {
    storageAPIDeferred.reject("no gapi.client");
    sheetsAPIDeferred.reject("no gapi.client");
    console.log("Not logged in; proceeding without login info");
    return;
  }
  gapi.client.setApiKey(apiKey);
  var api = createProgramCollectionAPI("code.pyret.org", true, publicOnly);

  api.then(function(api) {
    storageAPIDeferred.resolve(api);
    var sheetsApi = createSheetsAPI(true);
    sheetsApi.then(function(sheetsAPI) {
      sheetsAPIDeferred.resolve(sheetsAPI);
    });
    sheetsApi.fail(function(err) {
      sheetsAPIDeferred.reject(err);
    });
  });
  api.fail(function(err) {
    storageAPIDeferred.reject(err);
    sheetsAPIDeferred.reject(err);
    console.log("Not logged in; proceeding without login info", err);
  });
}
