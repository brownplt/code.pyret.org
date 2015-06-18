define(["q", "js/secure-loader", "js/runtime-util"], function(q, loader, util) {
  return util.definePyretModule(
    "gdrive-sheets",
    [],
    {
      values: ["load-sheet-raw"],
      types: []
    },
    function(runtime, namespace) {
      function loadSheetRaw(name) {
        if (arguments.length !== 1) { var $a=new Array(arguments.length); for (var $i=0;$i<arguments.length;$i++) { $a[$i]=arguments[$i]; } throw runtime.ffi.throwArityErrorC(['load-sheet-raw'], 1, $a); }      
        console.log("LoadSheetRaw says: " + name);
        return runtime.makeString(name + name);
      }
      var F = runtime.makeFunction;
      var O = runtime.makeObject;
      return O({
        "provide-plus-types": O({
          types: {},
          values: O({
            "load-sheet-raw": F(loadSheetRaw)
          })
        }),
        "answer": runtime.nothing
      });
    });
});
