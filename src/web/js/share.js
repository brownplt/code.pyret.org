function makeShareAPI(pyretVersion) {

  function makeHoverMenu(triggerElt, menuElt, showOnHover, onShow) {
    var divHover = false;
    var linkHover = false;
    function hovering() {
      return divHover || linkHover;
    }
    function closeIfNotHovering() {
      setTimeout(function() {
        console.log(divHover, linkHover);
        if(!hovering()) {
          menuElt.fadeOut(500);
        }
      }, 500);
    }
    function showIfStillHovering() {
      setTimeout(function() {
        if(linkHover) {
          menuElt.css({
            position: "fixed",
            top: triggerElt.offset().top + triggerElt.outerHeight(),
            left: triggerElt.offset().left,
            "z-index": 12000
          });
          $(document.body).append(menuElt);
          menuElt.fadeIn(250);
          onShow();
        }
      }, 100);
    }
    menuElt.hover(function() {
      divHover = true;
    }, function() {
      divHover = false;
      closeIfNotHovering();
    });
    triggerElt.click(function(e) {
      linkHover = true;
      showIfStillHovering();
    });
    triggerElt.hover(function(e) {
      if(showOnHover) { showIfStillHovering(); }
      linkHover = true;
    }, function() {
      linkHover = false;
      closeIfNotHovering();
    });
    return triggerElt;
  }

  function makeShareLink(originalFile) {
    var link = $("<div>").append($("<button class=blueButton>").text("Share..."));
    link.attr("title", "Create links to share with others, and see previous shared copies you've made.");
    link.tooltip({ position: { my: "right top", of: link } });
    var shareDiv = $("<div>").addClass("share");
    return makeHoverMenu(link, shareDiv, false,
      function() {
        showShares(shareDiv, originalFile);
      });
  }

  function showShares(container, originalFile) {
    container.empty();
    var shares = originalFile.getShares();
    container.text("Loading share info...");
    var displayDone = shares.then(function(sharedInstances) {
      container.empty();
      console.log(sharedInstances);
      var a = $("<a>").text("Share a new copy").attr("href", "javascript:void(0)");
      a.attr("title", "This will make a new copy of the file as you see it now, and create a link that you can share with others.  They will be able to see, run, and make their own copy of your program, but not edit the original.");
      a.tooltip({ position: { my: "right top", of: a } });
      a.click(function() {
        var copy = originalFile.makeShareCopy();
        a.text("Copying...").attr("href", null);
        copy.fail(function(err) {
          console.log("Couldn't make copy: ", err);
          showShares(container, originalFile);
        });
        var copied = copy.then(function(f) {
          container.empty();
          showShares(container, originalFile);
        });
        copied.fail(unexpectedError);
      });
      container.append(a);
      if(sharedInstances.length === 0) {
        var p = $("<p>").text("This file hasn't been shared before.");
        container.append(p);
      }
      else {
        var p = $("<p>").text("This file has been shared before:");
        container.append(p);
        console.log("shared: ", sharedInstances);
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
    var container = $("<div>");
    var textBox = $("<input type='text'>").addClass("auto-highlight");
    container.append(textBox);
    textBox.attr("size", text.length);
    textBox.attr("editable", false);
    textBox.mouseup(function() { $(this).select(); });
    textBox.val(text);
    return textBox;
  }

  function drawShareRow(f) {
    var container = $("<div>").addClass("sharebox");
    var shareUrl = makeShareUrl(f.getUniqueId());
    var showDate = new Date(f.getModifiedTime()).toLocaleString();
    var hoverDate = String(new Date(f.getModifiedTime()));
    container.append($("<label>").text(showDate).attr("alt", hoverDate));
    container.append($("<br>"));
    container.append(autoHighlightBox(shareUrl));
    container.append($("<br>"));
    var importLetter = getImportLetter(f.getName()[0]);
    var importCode = "import shared-gdrive(\"" + f.getName() +
        "\", \"" + f.getUniqueId() + "\") as " + importLetter;
    container.append(autoHighlightBox(importCode));
    return container;
  }

  return {
    makeShareLink: makeShareLink,
    makeHoverMenu: makeHoverMenu,
    makeShareUrl: makeShareUrl
  };

}
