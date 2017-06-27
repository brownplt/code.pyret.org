({
  requires: [],
  nativeRequires: [],
  provides: {},
  theModule: function(runtime, _, uri) {
    /*
    - submit button
    - more hint button
    - check if correct
    - congrats, go to the next page button
     */
     function afterRun(answer){
       console.log("in afterRun");
       var returnAnswer = $("<span>");
       returnAnswer.text(answer);
       $("#instruction").append(returnAnswer);
     }
    return runtime.makeJSModuleReturn({
      afterRun: afterRun
    });
  }
})
