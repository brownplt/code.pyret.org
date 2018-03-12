({
  requires: [
  ],
  nativeRequires: [
  ],
  provides: {},
  theModule: function(runtime, _, uri) {

    function curlyQuotes(instance, changeObj, cm){
      $('.notificationArea .curlyQ').remove();
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
          curlyQUndo(changeObj.text, changeObj.from, cm);
          changeObj.update(undefined, undefined, newText);
        }
      }
    }

    function curlyQUndo(oldText, from, cm){
      var lineN = oldText.length - 1
      var to = {line: from.line + lineN, ch: from.ch + oldText[lineN].length}
      console.log(from, to);
      message = "Curly quotes converted"
      var container = $('<div>').addClass("curlyQ")
      var msg = $("<span>").addClass("curlyQ-msg").text(message);
      var button = $("<span>").addClass("curlyQ-button").text("Click to Undo");
      container.append(msg).append(button);
      container.click(function(){
        cm.replaceRange(oldText, from, to);
      });
      $(".notificationArea").prepend(container);
      container.delay(15000).fadeOut(3000);
    }

    return runtime.makeJSModuleReturn({
      curlyQuotes: curlyQuotes
      
    });
  }
})