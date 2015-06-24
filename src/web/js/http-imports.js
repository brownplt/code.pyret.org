define(["q", "js/secure-loader"], function(Q, loader) {
  function getHttpImport(runtime, url) {
    var promise = Q.defer();
    var fetch = $.ajax("/jsProxy?" + url);
    fetch.then(function(result) {
      var loaded = loader.goodIdea(runtime, "@js-http/" + url, result);
      loaded.then(function(_) {
        promise.resolve({code: "", name: "skip"});
      });
      loaded.fail(function(err) {
        promise.reject(err);
      });
    });
    fetch.fail(function(err) {
      promise.reject("Failed to fetch " + url);
    });
    return promise.promise;
  }
  return {
    getHttpImport: getHttpImport
  };
});
