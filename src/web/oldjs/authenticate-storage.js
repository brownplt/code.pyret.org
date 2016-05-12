// Defines storageAPI (as a promise) for others to use
var storageAPIDeferred = Q.defer();
var storageAPI = storageAPIDeferred.promise;
function handleClientLoad(clientId, apiKey) {
  var api = createProgramCollectionAPI(clientId, apiKey, "code.pyret.org", true);
  
  api.then(function(api) {
    storageAPIDeferred.resolve(api);
  });
  api.fail(function(err) {
    storageAPIDeferred.reject(err);
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

