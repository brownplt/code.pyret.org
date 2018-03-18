({
  requires: [
  ],
  nativeRequires: [
  ],
  provides: {},
  theModule: function(runtime, _, uri) {

    function autoCorrect(instance, changeObj, cm){
      $('.notificationArea .autoCorrect').remove();
      curlyQuotes(instance, changeObj, cm);
      enDash(instance, changeObj, cm);
    }

    function enDash(instance, changeObj, cm){
      endashbool = false;
      if((changeObj.origin == "paste")){
          var newText = jQuery.map(changeObj.text, function(str, i) {
            endashbool = endashbool || (str.search(/[\u2013]/g) > -1);
            str = str.replace(/\u2013/g, "-")
            return str;
          });
        if(endashbool){
          autoCorrectUndo("Invalid Dash (en dash) converted", changeObj.text, changeObj.from, cm);
          changeObj.update(undefined, undefined, newText);
        }
      }
    }

    function curlyQuotes(instance, changeObj, cm){
      curlybool = false;
      if((changeObj.origin == "paste")){
          var newText = jQuery.map(changeObj.text, function(str, i) {
            curlybool = curlybool || (str.search(/[\u2018\u2019\u201C\u201D]/g) > -1);
            str = str.replace(/\u201D/g, "\"")
            str = str.replace(/\u201C/g, "\"")
            str = str.replace(/\u2019/g, "\'")
            str = str.replace(/\u2018/g, "\'")
            return str;
          });
        if(curlybool){
          autoCorrectUndo("Curly quotes converted", changeObj.text, changeObj.from, cm);
          changeObj.update(undefined, undefined, newText);
        }
      }
    }

    function autoCorrectUndo(message, oldText, from, cm){
      var lineN = oldText.length - 1
      var to = {line: from.line + lineN, ch: from.ch + oldText[lineN].length}
      console.log(from, to);
      var container = $('<div>').addClass("autoCorrect")
      var msg = $("<span>").addClass("autoCorrect-msg").text(message);
      var button = $("<span>").addClass("autoCorrect-button").text("Click to Undo");
      container.append(msg).append(button);
      container.click(function(){
        cm.replaceRange(oldText, from, to);
        console.log("oldtext, from, to", oldText)
        console.log(from, to);
      });
      $(".notificationArea").prepend(container);
      container.delay(15000).fadeOut(3000);
    }

    return runtime.makeJSModuleReturn({
      autoCorrect: autoCorrect

    });
  }
})