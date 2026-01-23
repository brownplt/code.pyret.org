({
  requires: [
  ],
  nativeRequires: [
  ],
  provides: {},
  theModule: function(runtime, _, uri) {

    function autoCorrect(instance, changeObj, cm){
      $('.notificationArea .autoCorrect').remove();
      var originalText = changeObj.text
      var curlyq = change([[/\u201D/g, "\""],
                            [/\u201C/g, "\""],
                            [/\u2019/g, "\'"],
                            [/\u2018/g, "\'"],
                            [/\u2026/g, "..."],
                            [/\u200b/g, ""]], changeObj, cm);
      var endash = change([[/\u2013/g, "-"]], changeObj, cm);
      if (curlyq && endash) {
        autoCorrectUndo("Curly Quotes and Invalid Dash (en dash) converted", originalText, changeObj.from, cm);
      }
      else if (curlyq) {
        autoCorrectUndo("Curly Quotes converted", originalText, changeObj.from, cm);
      }
      else if (endash) {
        autoCorrectUndo("Invalid Dash (en dash) converted", originalText, changeObj.from, cm);
      }
    }

    function change(pairs, changeObj, cm){
      changed = false;
      if(changeObj.origin == "paste"){
        var newText = jQuery.map(changeObj.text, function(str, i) {
            var newStr = str;
            for(var i = 0; i < pairs.length; ++i) {
              newStr = newStr.replace(pairs[i][0], pairs[i][1]);
            }
            changed = changed || (newStr !== str);
            return newStr;
          });
        if (changed) {
          changeObj.update(undefined, undefined, newText);
        }
      }
      return changed;
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
      });
      $(".notificationArea").prepend(container);
      container.delay(15000).fadeOut(3000);
    }

    return runtime.makeJSModuleReturn({
      autoCorrect: autoCorrect

    });
  }
})