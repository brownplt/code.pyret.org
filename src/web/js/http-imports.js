define(["q", "js/secure-loader"], function(Q, loader) {
  function getHttpImport(runtime, name, id) {
    var promise = Q.defer();
    var fetch = $.ajax("/gdrive-js-proxy?" + id);
    fetch.then(function(result) {
      var loaded = loader.goodIdea(runtime, "@gdrive-js/" + name + "/" + id, result);
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
