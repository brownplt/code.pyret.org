(function() {

  function loadScriptUrl(url) {
    var scriptTag = document.createElement('script');
    scriptTag.src = url;
    scriptTag.type = "text/javascript";
    document.body.appendChild(scriptTag);
  }

  loadScriptUrl('/js/cpo-grade.jarr');

  var startTime = new Date().getTime();
  function checkIfLoaded() {
    if (window.CPOGRADE) {
      onCPOGradeLoaded(window.CPOGRADE);
    } else if (new Date().getTime() - startTime > 30000) {
      console.error("Timed out while waiting for runtime to load :(");
    } else {
      window.setTimeout(checkIfLoaded, 250);
    }
  }
  window.setTimeout(checkIfLoaded, 250);

  $(document).on("mouseover", ".tooltip", function() {
    var title = $(this).attr("title");
    $(this).data("tipText", title).removeAttr("title");
    $("<p class=\"tt\"></p>")
    .text(title)
    .appendTo("body")
    .fadeIn(0);
  });

  $(document).on("mouseout", ".tooltip", function () {
    $(this).attr("title", $(this).data("tipText"));
    $(".tt").remove();
  });

  $(document).on("mousemove", ".tooltip", function(e) {
    var x = e.pageX;
    var y = e.pageY;
    $(".tt").css({ top: y, left: x });
  });

  function onCPOGradeLoaded(gradeApi) {
    gradeApi.drawForm();
    $("#load").on("click", function(e) {
      e.preventDefault();
      gradeApi.saveForm(e);
      gradeApi.loadAndRenderSubmissions(e);
    });
    $("#cfg").on("submit", function(e) {
      e.preventDefault();
    });

    $("#reset").on("click", gradeApi.resetForm);
    $("#prf").on("submit", gradeApi.updateForm);
  }

})();