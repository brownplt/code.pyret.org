// Defines storageAPI (as a promise) for others to use
var storageAPIDeferred = Q.defer();
var scriptAPIDeferred = Q.defer();
var storageAPI = storageAPIDeferred.promise;
var scriptAPI = scriptAPIDeferred.promise;
function handleClientLoad(clientId, apiKey) {
  var api = createProgramCollectionAPI(clientId, apiKey, "code.pyret.org", true);
  
  api.then(function(api) {
    storageAPIDeferred.resolve(api);
  });
  api.fail(function(err) {
    storageAPIDeferred.reject(err);
    console.log("Not logged in; proceeding without login info", err);
  });

  var scriptApi = createGAppsAPI(clientId, apiKey, true, appFileId);

  scriptApi.then(function(api) {
    scriptAPIDeferred.resolve(api);
  });
  scriptApi.fail(function(err) {
    scriptAPIDeferred.reject(err);
    console.log("Not logged in; proceeding without login info", err);
  })

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

