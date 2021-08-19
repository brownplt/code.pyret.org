window.makeShareAPI = function makeShareAPI(pyretVersion) {

  var showingNeedingHidden = [];
  function hideAllHovers() {
    showingNeedingHidden.forEach(function(hideIt) {
      hideIt();
    });
  }
  /*
  function makeHoverMenu(triggerElt, menuElt, showOnHover, onShow) {
    var divHover = false;
    var linkHover = false;
    var showing = false;
    function hovering() {
      return divHover || linkHover;
    }
    function show() {
      if(!showing) {
        hideAllHovers();
        menuElt.css({
          position: "fixed",
          top: triggerElt.offset().top + triggerElt.outerHeight(),
          left: triggerElt.offset().left,
          "z-index": 10000
        });
        //$(document.body).append(menuElt);
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
    showingNeedingHidden.push(hide);
    menuElt.on("click", function(evt) {
      evt.stopPropagation();
    });
    triggerElt.on("click", function(e) {
      //console.log('triggerElt clicked');
      if(!showing) { show(); e.stopPropagation();
        //menuElt.find('div').find('a').attr('tabIndex', -1);
        //menuElt.find('div').find('input').attr('tabIndex', -1);
        //menuElt.find('div.disabled').find('a').attr('tabIndex', -1);
        //console.log('set filemenu submenu tabindex to 0');
      }
      else { hide();
        //menuElt.find('a').attr('tabIndex', -1);
        //menuElt.find('input').attr('tabIndex', -1);
        //console.log('set filemenu submenu tabindex to -1');
      }
    });
    return triggerElt;
  }
  */

  $(".menuButton a").click(hideAllHovers);

  function makeShareLink(originalFile) {
    var link = $('<button aria-label="Publish, F9" aria-describedby="mhelp-menus mhelp-activate mhelp-escape" class="focusable blueButton" role="menuitem" tabindex="-1">').text("Publish");
    var shareDiv = $("<div>").addClass("share");
    link.click(function() { showShares(shareDiv, originalFile); });
    return link;
  }

  function showShares(container, originalFile) {
    function showNewSharePrompt() {
      var newShare = new modalPrompt({
        title: "Publish this file",
        style: "confirm",
        submitText: "Publish",
        narrow: true,
        options: [
          {
            message: "This program has not been shared before.  Publishing it by clicking below will make a new copy of the file that you can share with anyone you like.  They will be able to see your code and run your program."
          }
        ]
      });
      newShare.show().then(function(confirmed) {
        if(confirmed === true) {
          window.CPO.save().then(function(p) {
            // TODO: this message may not be visible enough and there can be a
            // lengthy delay between the first dialog closing and the next one
            // opening. Might want to leave modal open with a spinner...
            window.stickMessage("Copying...");
            var copy = p.makeShareCopy();
            copy.fail(function(err) {
              window.flashError("Couldn't copy the file for sharing.");
              //showshares(container, originalfile);
            });
            copy.then(function(f) {
              window.flashMessage("File published successfully");
              return showShares(container, originalFile);
            });
          });
        }
      })
      .fail(function(err) {
        console.error("Error showing the share dialog", err);
      });
    }
    function showExistingSharePrompt(instances) {
      var f = instances[0];
      var shareUrl = makeShareUrl(f.getUniqueId());
      var importLetter = getImportLetter(f.getName()[0]);
      var importCode = "import shared-gdrive(\"" + f.getName() +
          "\", \"" + f.getUniqueId() + "\") as " + importLetter;
      var reshare = new modalPrompt({
        title: "Share or update the published copy",
        style: "copyText",
        submitText: "Update",
        options: [
          {
            message: "You can copy the link below to share the most recently published version with others.",
            text: shareUrl
          },
          {
            message: "You can copy the code below to use the published version as a library.",
            text: importCode
          },
          {
            message: "You can also click Update below to copy the current version to the published version, or click Close to exit this window."
          }
        ]
      });
      reshare.show(function(republish) {
        if(republish) {
          window.CPO.save().then(function(p) {
            window.stickMessage("Republishing file...");
            p.getContents().then(function(contents) {
              var saved = instances[0].save(contents, false);
              saved.fail(function(err) {
                window.flashError("Couldn't publish the file.");
              });
              saved.then(function(f) {
                window.flashMessage("Published program updated.")
              });
            })
            .fail(function() {
              window.flashError("Couldn't get the file contents for publishing");
            });
          });
        }
        else {
          // do nothing, user clicked "cancel", so just let the window close
        }
      });
    }
    var shares = originalFile.getShares();
    shares.then(function(sharedInstances) {
      if(sharedInstances.length === 0) {
        showNewSharePrompt();
      }
      else {
        showExistingSharePrompt(sharedInstances);
      }
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
    //makeHoverMenu: makeHoverMenu,
    makeShareUrl: makeShareUrl
  };

}
