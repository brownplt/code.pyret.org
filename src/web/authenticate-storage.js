// Defines storageAPI (as a promise) for others to use
var storageAPIDeferred = Q.defer();
var storageAPI = storageAPIDeferred.promise;
function handleClientLoad() {
  function refresh() {
    return Q($.ajax("/getAccessToken"));
  }
  var getAccess = Q($.ajax("/getAccessToken"));
  var api = getAccess.then(function(data) {
    return createProgramCollectionAPI("code.pyret.org", data.access_token, refresh)
  });
  
  storageAPI
  api.then(function(api) {
    $(".loginOnly").show();
    storageAPIDeferred.resolve(api);
  });
  api.fail(function(err) {
    console.log("Not logged in; proceeding without login info", err);
  });
}
