// Defines storageAPI (as a promise) for others to use
var storageAPIDeferred = Q.defer();
var sheetsAPIDeferred = Q.defer();
window.storageAPI = storageAPIDeferred.promise;
window.sheetsAPI = sheetsAPIDeferred.promise;

window.handleClientLoad = function handleClientLoad(clientId, apiKey) {
  console.log('doing handleClientLoad');
  gapi.client.setApiKey(apiKey);
  var api = createProgramCollectionAPI("code.pyret.org", true);

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
  define("gdrive-credentials", [], function() {
    var thisApiKey = apiKey;
    return {
      getCredentials: function() {
        return {
          apiKey: thisApiKey
        };
      },
      setCredentials: function(apiKey) {
        thisApiKey = apiKey;
      }
    };
  });
}
