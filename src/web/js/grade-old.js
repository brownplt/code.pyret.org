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

  function resetForm() {
    localStorage.clear();
    drawForm();
  }

  function saveForm(form) {
    if (!(localStorage.n > 0)) localStorage.n = 0;
    localStorage.n++;
    localStorage[localStorage.n] = $(form).serialize();
    localStorage["t" + localStorage.n] = new Date;
  }

  function drawForm() {
    if (localStorage.n > 0) {
      $("#pr").html("<option selected disabled>Click to select</option>");
      for (var i = localStorage.n; i > 0; i--) {
        $("#pr").append(
          "<option value=" + i + ">" + localStorage["t" + i] + "</option>");
      }
    }
    else {
      $("#pr").html("<option selected disabled>No prior runs</option>");
    }
  }

  function updateForm() {
    var s = localStorage[$("#pr").val()];
    var form_data = s.split("&");
    $.each(form_data, function(k, v) {
      var data = v.split("=");
      $("#" + data[0]).val(decodeURIComponent(data[1]));
    });
  }

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

  $("#reset").on("click", function(e) {
    resetForm();
  });
  $("#prf").on("submit", function(e) {
    e.preventDefault();
    updateForm();
  });

  function onCPOGradeLoaded(gradeApi) {
    drawForm();
    $("#cfg").on("submit", function(e) {
      e.preventDefault();
      saveForm(this);
      gradeApi.loadAndRenderSubmissions();
    });
  }

})();