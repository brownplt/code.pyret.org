$( document ).ready( function() {
  $( "head" ).append('<style id="repl-resize" type="text/css"></style>');
  $( "#repl-resize").text(
  '#handle{ \
    background:-webkit-linear-gradient(left, #ffffff 0%,#B3B3B3 30%,#000000 47%,#000000 53%,#B3B3B3 70%,#ffffff 99%);\
    background:-o-linear-gradient(left, #ffffff 0%,#B3B3B3 30%,#000000 47%,#000000 53%,#B3B3B3 70%,#ffffff 99%);\
    background:-moz-linear-gradient(left, #ffffff 0%,#B3B3B3 30%,#000000 47%,#000000 53%,#B3B3B3 70%,#ffffff 99%);\
    background:linear-gradient(to right, #ffffff 0%,#B3B3B3 30%,#000000 47%,#000000 53%,#B3B3B3 70%,#ffffff 99%);}\
  div.CodeMirror{border-right:none;}');
  $( "#REPL" ).css( "left", "50%");
  $( "#REPL" ).css( "z-index", "9000");
  var editorEvenSplit = true;
  var replHeight = $( "#REPL" ).height();
  $( "#REPL" ).resizable({
    maxHeight: replHeight,
    maxWidth: window.innerWidth - 128,
    minHeight: replHeight,
    minWidth: 100,
    handles: {"w": "#handle"}});

  $( ".ui-resizable-handle").css("cursor", "ew-resize");
  $( ".ui-resizable-w" ).css("height", "calc(100% - 55px)");
  $( ".ui-resizable-w" ).css("top", "55px");
  $( ".ui-resizable-w" ).css("width", "5px");
  $( ".ui-resizable-w" ).css("left", "0px");
  $( ".repl" ).css("padding-left", "10px");

  $( "#REPL" ).on( "resize", leftResize);
  $( "#REPL" ).on( "resize", function() {editorEvenSplit = false;});

  function leftResize(event, ui) {
  var leftWidth = (window.innerWidth - ui.size.width)
    $(".replMain").css("width", leftWidth + "px");
      }

  $( "#REPL" ).on( "resizestop", toPercent);

  var rightResizePct;
  var leftResizePct;
  function toPercent(event, ui) {
    var winWidth = window.innerWidth
    rightResizePct = (ui.size.width / winWidth) * 100
    leftResizePct = 100 - rightResizePct
    setSize(leftResizePct, rightResizePct);
  }

  $(window).on("keydown", function(e) {
    if(e.ctrlKey) {
      if(e.keyCode === 77) { // Ctrl-m
        toggleEditorSize();
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    }
  });
  $(window).on("keypress", function(e) {
    if(e.ctrlKey) {
      if (e.keyCode === 13) {
        e.preventDefault();
      }
    }
  });


  function toggleEditorSize() {
    if(editorEvenSplit) {
      editorEvenSplit = false;
      setSize(leftResizePct, rightResizePct);
    }
    else {
      editorEvenSplit = true;
      setSize("50", "50");
    }
  }


  function setSize(leftPct, rightPct) {
    $( "#REPL" ).css( "width", rightPct + "%");
    $( "#REPL" ).css( "left", leftPct + "%");
    $(".replMain").css("width", leftPct + "%");
  }

  $( window ).resize( function() {
    $( "#REPL" ).resizable( "option", "maxWidth", window.innerWidth - 128);
  });
});
