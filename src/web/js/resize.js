$( document ).ready( function() {
  $( "head" ).append('<style id="repl-resize" type="text/css"></style>');
  var replHeight = $( "#REPL" ).height();
  $( "#REPL" ).resizable({
    maxHeight: replHeight,
    maxWidth: window.innerWidth - 128,
    minHeight: replHeight,
    minWidth: 100,
    handles: "w"});

  $( "#REPL" ).on( "resize", leftResize);

  function leftResize(event, ui) {
    $( "#repl-resize" ).text(
      ".replMain{width:" + (window.innerWidth - ui.size.width) + "px;}"
    );}

  $( "#REPL" ).on( "resizestop", toPercent);

  function toPercent(event, ui) {
    var winWidth = window.innerWidth
    var rightWidthPct = (ui.size.width / winWidth) * 100
    var leftWidthPct = 100 - rightWidthPct
    $( "#REPL" ).css( "width", rightWidthPct + "%");
    $( "#REPL" ).css( "left", "auto");
    $( "#repl-resize" ).text( ".replMain{width:" + leftWidthPct + "%;}");}
  });

$( window ).resize( function() {
    $( "#REPL" ).resizable( "option", "maxWidth", window.innerWidth - 128);
  });
