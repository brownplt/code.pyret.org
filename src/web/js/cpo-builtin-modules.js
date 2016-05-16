define(["pyret-base/js/type-util"], function(t) {
  // Set via callback
  var staticModules = {};
  var savedRealm = {};

  function getBuiltinLoadableName(RUNTIME, name) {
    var uri = "builtin://" + name;
    return getBuiltinLoadable(RUNTIME, uri);
  }

  function getBuiltinLoadable(RUNTIME, uri) {
    var F = RUNTIME.makeFunction;
    if(!staticModules[uri]) {
      return false;
    }
    else {
      var m = staticModules[uri];
      return RUNTIME.makeObject({
          "get-raw-dependencies":
            F(function() {
              if(m.requires) {
                return m.requires.map(function(m) {
                  if(!m["import-type"]) {
                    m["import-type"] = "dependency";
                  }
                  return RUNTIME.makeObject(m);
                });
              } else {
                return [];
              }
            }),
          "get-raw-native-modules":
            F(function() {
              if(Array.isArray(m.nativeRequires)) {
                return m.nativeRequires.map(RUNTIME.makeString);
              } else {
                return [];
              }
            }),
          "get-raw-datatype-provides":
            F(function() {
              if(m.provides && m.provides.datatypes) {
                if(Array.isArray(m.provides.datatypes)) {
                  return m.provides.datatypes;
                }
                else if(typeof m.provides.datatypes === "object") {
                  return Object.keys(m.provides.datatypes).map(function(k) {
                    return RUNTIME.makeObject({
                      name: k,
                      typ: t.toPyret(RUNTIME, m.provides.datatypes[k])
                    });
                  });
                }
              }
              return [];
            }),
          "get-raw-alias-provides":
            F(function() {
              if(m.provides) {
                if(Array.isArray(m.provides.types)) {
                  return m.provides.types;
                }
                else if(typeof m.provides.aliases === "object") {
                  return Object.keys(m.provides.aliases).map(function(k) {
                    return RUNTIME.makeObject({
                      name: k,
                      typ: t.toPyret(RUNTIME, m.provides.aliases[k])
                    });
                  });
                }
              }
              return [];
            }),
          "get-raw-value-provides":
            F(function() {
              if(m.provides) {
                if(Array.isArray(m.provides.values)) {
                  return m.provides.values;
                }
                else if(typeof m.provides.values === "object") {
                  return Object.keys(m.provides.values).map(function(k) {
                    return RUNTIME.makeObject({
                      name: k,
                      typ: t.toPyret(RUNTIME, m.provides.values[k])
                    });
                  });
                }
              }
              return [];
            }),
          "get-raw-compiled":
            F(function() {
              // NOTE(joe): this omits theModule for now
              return JSON.stringify(m);
            })
        });
    }
  }

  return {
    setRealm: function(realm) {
      savedRealm = realm;
    },
    getRealm: function() {
      return savedRealm;
    },
    setStaticModules: function(sms) {
      staticModules = sms;
    },
    getBuiltinLoadable: getBuiltinLoadable,
    getBuiltinLoadableName: getBuiltinLoadableName
  };

});
