define("cpo/cpo-builtin-modules", ["pyret-base/js/type-util"], function(t) {
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
                var dts = m.provides.datatypes;
                if(typeof dts === "object") {
                  return Object.keys(dts).map(function(k) {
                    var shorthands = m.provides.shorthands || {};
                    var expanded = t.expandType(dts[k], t.expandRecord(shorthands, {}));
                    return RUNTIME.makeObject({
                      name: k,
                      typ: t.toPyretType(RUNTIME, expanded)
                    });
                  });
                }
                else {
                  throw new Error("Bad datatype specification: " + String(m.provides.datatypes))
                }
              }
              return [];
            }),
          "get-raw-module-provides":
            F(function() {
              if(typeof m.provides.modules === "object") {
                var mods = m.provides.modules;
                return Object.keys(mods).map(function(k) {
                  return RUNTIME.makeObject({
                    name: k,
                    uri: mods[k].uri
                  });
                });
              }
              else {
                return [];
              }
            }, "get-raw-module-provides"),
          "get-raw-alias-provides":
            F(function() {
              if(m.provides) {
                if(Array.isArray(m.provides.types)) {
                  return m.provides.types;
                }
                else if(typeof m.provides.aliases === "object") {
                  var aliases = m.provides.aliases;
                  return Object.keys(aliases).map(function(k) {
                    var shorthands = m.provides.shorthands || {};
                    var expanded = t.expandType(aliases[k], t.expandRecord(shorthands, {}));

                    return RUNTIME.makeObject({
                      name: k,
                      typ: t.toPyretType(RUNTIME, expanded)
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
                  var vals = m.provides.values;

                  return Object.keys(vals).map(function(k) {
                    var shorthands = m.provides.shorthands || {};
                    var expanded = t.expandType(vals[k], t.expandRecord(shorthands, {}));

                    return RUNTIME.makeObject({
                      name: k,
                      value: t.bindToPyret(RUNTIME, expanded, shorthands)
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
