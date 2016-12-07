// A sessionStorage cache of localStorage to avoid hitting disk.
// localStorage is made consistent with sessionStorage on page unload.
window.localSettings = function() {

  window.addEventListener("beforeunload", function (event) {
    Object.keys(sessionStorage).forEach(function (key) {
      localStorage.setItem(key, sessionStorage.getItem(key));
    });
  });

  window.addEventListener('storage', function(e) {
    if (e.storageArea === sessionStorage) { return; }
    localStorage.setItem(e.key, e.newValue);
  });

  function change(key, f) {
    window.addEventListener('storage', function(e) {
      if (e.storageArea === localStorage) { return; }
      f(e.oldValue, e.newValue);
    });
  }

  return {
    getItem: function (key) {
      var value = sessionStorage.getItem(key);
      if (!value) {
        value = localStorage.getItem(key);
        if (!!value) { sessionStorage.setItem(key, value); }
      }
      return value;
    },
    setItem: sessionStorage.setItem.bind(sessionStorage),
  };
}();
