window.logger = {};

var ConsoleBackend = function() {
  this.log = function() {
    console.log.apply(console, arguments);
  };
};

var DummyBackend = function () {
  this.log = function(_, __){};
};

var AJAXBackend = function (url) {
  this.log = function (name, obj) {
    var request = new XMLHttpRequest();
    request.open("POST", url, true);
    request.send(JSON.stringify(obj));
  }
}

var IndexedDBBackend = function() {
  var db = new Dexie('CPO');

  db.version(1).stores({
    events: 'CPO_eventName, CPO_eventTime, CPO_windowID, CPO_localID, CPO_sessionID'
  });

  db.open();

  this.log = function(obj) {
    db.events.add(obj);
  };
};

var logger = (function(backend) {
  function guid() {
    var array = new Uint32Array(6);
    window.crypto.getRandomValues(array);
    var str = "";
    for(var i = 0; i < array.length; i++) {
      str = str.concat(array[i].toString(36));
    }
    return str;
  }

  /* Tab, Session, and Browser Identifiers */
  var identifiers = (function(){
    var _identifiers = {};
    
    function storedID(storage, type) {
      var id = storage.getItem(type);
      if (id === null || id === "") {
        id = _identifiers[type] || guid();
        _identifiers[type] = id;
        storage.setItem(type, id);
      }
      return id;
    }
    
    return {
      get localID () {
        return _identifiers['lid'] || storedID(localStorage, 'lid');
      },
      get sessionID () {
        return _identifiers['sid'] || storedID(sessionStorage, 'sid');
      },
      get windowID () {
        _identifiers['tid'] = _identifiers['tid'] || guid();
        return _identifiers['tid'];
      }
    };
  })();
  
  function log(name, obj) {
    if(!(obj instanceof Object))
      obj = {};
    obj.meta = [  Date.now()
                , name
                , identifiers.windowID
                , identifiers.sessionID
                , identifiers.localID
                , "{{GIT_REV}}"
                , "{{GIT_BRANCH}}"];
    backend.log(name, obj);
  }
  
  var isDetailed = localSettings.getItem('log-detailed') == 'true';

  return {
    guid  : guid,
    log   : log,
    get isDetailed () {
      var nowIsDetailed = localSettings.getItem('log-detailed') == 'true';
      if (isDetailed != nowIsDetailed) {
        log('LOG_DETAIL_CHANGED',{detailed: nowIsDetailed});
        isDetailed = nowIsDetailed;
      }
      return nowIsDetailed;
    }
  };
})({{#LOG_URL}}new AJAXBackend("{{&LOG_URL}}"){{/LOG_URL}}{{^LOG_URL}}new DummyBackend(){{/LOG_URL}});


CodeMirror.defineOption('logging', false, 
  function (cm, new_value) {
    if (new_value != true)
      return;
    if(!cm.CPO_editorID)
      cm.CPO_editorID = logger.guid();
    logger.log('cm_init', {CPO_editorID: cm.CPO_editorID});
    cm.on("change", function(cm, change) {
      if(logger.isDetailed) {
        change.CPO_editorID = cm.CPO_editorID;
        logger.log('cm_change', change);
      }
    });
    cm.on("focus", function(cm) {
      if(logger.isDetailed) {
        logger.log('cm_focus', {CPO_editorID: cm.CPO_editorID});
      }
    });
    cm.on("blur", function(cm) {
      if(logger.isDetailed) {
        logger.log('cm_blur',  {CPO_editorID: cm.CPO_editorID});
      }
    });
  });

// Log the loading of the logger (near the begining of page load)  
logger.log('load');

// Log page unload
window.addEventListener('unload', function(event) {
  logger.log('unload');
});

// Log tab/window visibility change (kinda unreliable)
document.addEventListener("visibilitychange", function() {
  logger.log('pagevis', {visibility: document.visibilityState});
});
