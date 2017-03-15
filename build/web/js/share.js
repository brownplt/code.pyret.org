window.makeShareAPI = function makeShareAPI(pyretVersion) {

  function makeHoverMenu(triggerElt, menuElt, showOnHover, onShow) {
    var divHover = false;
    var linkHover = false;
    var showing = false;
    function hovering() {
      return divHover || linkHover;
    }
    function closeIfNotHovering() {
      setTimeout(function() {
        if(!hovering()) {
          menuElt.fadeOut(500);
        }
      }, 500);
    }
    function show() {
      if(!showing) {
        menuElt.css({
          position: "fixed",
          top: triggerElt.offset().top + triggerElt.outerHeight(),
          left: triggerElt.offset().left,
          "z-index": 10000
        });
        $(document.body).append(menuElt);
        menuElt.fadeIn(250);
        showing = true;
        setTimeout(function() {
          $(document).on("click", hide);
        }, 0);
        onShow();
      }
    }
    var hide = function() {
      showing = false;
      menuElt.fadeOut(100);
      $(document).off("click", hide);
    };
    menuElt.on("click", function(evt) {
      evt.stopPropagation();
    });
    triggerElt.on("click", function(e) {
      if(!showing) { show(); e.stopPropagation(); }
      else { hide(); }
    });
    return triggerElt;
  }

  function makeShareLink(originalFile) {
    //console.log('doing makeShareLink ' + originalFile);
    var link = $("<div>").append($("<button class=blueButton>").text("Publish..."));
    var shareDiv = $("<div>").addClass("share");
    return makeHoverMenu(link, shareDiv, false,
      function() {
        showShares(shareDiv, originalFile);
      });
  }

  function showShares(container, originalFile) {
    //console.log('doing showShares ' + JSON.stringify(originalFile));
    container.empty();
    //var shares = originalFile.getShares();
    //var shares = originalFile.then(function(f) { return f.getShares(); });
    var originalFilePromiseP = false;
    if (!originalFile.getShares) {
      //console.log('originalFile is probly a promise');
      originalFilePromiseP = true;
    }
    var shares;
    if (originalFilePromiseP) {
      shares = originalFile.then(function(f) { return f.getShares(); });
    } else {
      shares = originalFile.getShares();
    }
    container.text("Loading share info...");
    var displayDone = shares.then(function(sharedInstances) {
      container.empty();
      console.log(sharedInstances);
      var a = $("<a>").text("Publish a new copy").attr("href", "javascript:void(0)");
      a.click(function() {
        //var copy = originalFile.makeShareCopy();
        /*
        var copy = originalFile.then(function(f) {
          //console.log('showShares > originalFile.then', 'calling makeShareCopy');
          return f.makeShareCopy();
        });
        */
        var copy;
        if (originalFilePromiseP) {
          copy = originalFile.then(function(f) {
            return f.makeShareCopy();
          });
        } else {
          copy = originalFile.makeShareCopy();
        }
        a.text("Copying...").attr("href", null);
        copy.fail(function(err) {
          console.log("Couldn't make copy: ", err);
          showShares(container, originalFile);
        });
        var copied = copy.then(function(f) {
          //console.log('copied xxx');
          container.empty();
          showShares(container, originalFile);
        });
        copied.fail(function(err) {
          console.error("Unexpected error in copying file: ", err);
        });
      });
      container.append(a);
      if(sharedInstances.length === 0) {
        var p = $("<p>").text("This file hasn't been published before.");
        container.append(p);
      }
      else {
        var p = $("<p>").text("This file has been published before:");
        container.append(p);
        sharedInstances.forEach(function(shareFile) {
          container.append(drawShareRow(shareFile));
        });
      }
    });
    displayDone.fail(function(err) {
      console.error("Failed to get shares: ", err);
    });
  }

  function makeShareUrl(id) {
    var localShareUrl = "/editor#share=" + id;
    if(pyretVersion !== "") {
      localShareUrl += "&v=" + pyretVersion;
    }
    return window.location.origin + localShareUrl;
  }

  function getImportLetter(letter) {
    var maybeUpcase = letter.toUpperCase();
    var isUppercaseAlpha = !!/[A-Z]/.exec(maybeUpcase);
    if(isUppercaseAlpha) {
      return maybeUpcase;
    }
    else {
      return "M";
    }
  }

  function autoHighlightBox(text) {
    var textBox = $("<input type='text'>").addClass("auto-highlight");
    textBox.attr("size", text.length);
    textBox.attr("editable", false);
    textBox.on("focus", function() { $(this).select(); });
    textBox.on("mouseup", function() { $(this).select(); });
    textBox.val(text);
    return textBox;
  }

  function getLanguage() {
    if(typeof navigator !== "undefined") {
      return navigator.language || "en-US"; // Biased towards USA
    }
    else {
      return "en-US";
    }
  }

  var dateOptions = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric"
  };

  function drawShareRow(f) {
    var container = $("<div>").addClass("sharebox");
    var shareUrl = makeShareUrl(f.getUniqueId());
    var displayDate = new Date(f.getModifiedTime()).toLocaleString(getLanguage, dateOptions);
    var hoverDate = String(new Date(f.getModifiedTime()));
    container.append($("<label>").text(displayDate).attr("alt", hoverDate));
    var shareLink = $("<a href='javascript:void()'>").text("(Share Link)").addClass("copy-link");
    var importLink = $("<a href='javascript:void()'>").text("(Import Code)").addClass("copy-link");
    container.append(shareLink);
    container.append(importLink);
    function showCopyText(title, text) {
      var linkDiv = $("<div>").css({"z-index": 15000});
      linkDiv.dialog({
        title: title,
        modal: true,
			  overlay : { opacity: 0.5, background: 'black'},
        width : "70%",
        height : "auto",
        closeOnEscape : true
      });
      var box = autoHighlightBox(text);
      linkDiv.append(box);
      box.focus();
    }
    shareLink.click(function() {
      showCopyText("Copy Share Link", shareUrl);
    });

    var importLetter = getImportLetter(f.getName()[0]);
    var importCode = "import shared-gdrive(\"" + f.getName() +
        "\", \"" + f.getUniqueId() + "\") as " + importLetter;
    importLink.click(function() {
      showCopyText("Copy Import Code", importCode);
    });
    return container;
  }

  return {
    makeShareLink: makeShareLink,
    makeHoverMenu: makeHoverMenu,
    makeShareUrl: makeShareUrl
  };

}
