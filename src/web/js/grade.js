function loadScriptUrl(url) {
  var scriptTag = document.createElement('script');
  scriptTag.src = url;
  scriptTag.type = "text/javascript";
  document.body.appendChild(scriptTag);
}

loadScriptUrl('/js/cpo-grade.jarr');

drawForm();
$("#load").on("click", function(e) {
  e.preventDefault();
  saveForm(e);
  loadAndRenderSubmissions(e);
});

$("#reset").on("click", resetForm);
$("#prf").on("submit", updateForm);


$(document)
    .on("mouseover", ".tooltip", function() {
      var title = $(this).attr("title");
      $(this).data("tipText", title).removeAttr("title");
      $("<p class=\"tt\"></p>")
      .text(title)
      .appendTo("body")
      .fadeIn(0);
    })
    .on("mouseout", ".tooltip", function () {
        $(this).attr("title", $(this).data("tipText"));
        $(".tt").remove();
    })
    .on("mousemove", ".tooltip", function(e) {
        var x = e.pageX;
        var y = e.pageY;
        $(".tt").css({ top: y, left: x });
    });