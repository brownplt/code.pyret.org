/**
 * Module for managing modal prompt instances.
 * NOTE: This module is currently limited in a number
 *       of ways. For one, it only allows radio
 *       input options. Additionally, it hard-codes in
 *       a number of other behaviors which are specific
 *       to the image import style prompt (for which
 *       this module was written).
 *       If desired, this module may be made more
 *       general-purpose in the future, but, for now,
 *       be aware of these limitations.
 */
define("cpo/modal-prompt", ["q"], function(Q) {

  function autoHighlightBox(text) {
    var textBox = $("<input type='text'>").addClass("auto-highlight");
    textBox.attr("readonly", "readonly");
    textBox.on("focus", function() { $(this).select(); });
    textBox.on("mouseup", function() { $(this).select(); });
    textBox.val(text);
    return textBox;


  }

  // Allows asynchronous requesting of prompts
  var promptQueue = Q();
  var styles = [
    "radio", "tiles", "text", "copyText", "confirm", "ctxDropdown"
  ];

  window.modals = [];

  /**
   * Represents an option to present the user
   * @typedef {Object} ModalOption
   * @property {string} message - The message to show the user which
               describes this option
   * @property {string} value - The value to return if this option is chosen
   * @property {string} [example] - A code snippet to show with this option
   */

  /**
   * Constructor for modal prompts.
   * @param {ModalOption[]} options - The options to present the user
   */
  function Prompt(options) {
    window.modals.push(this);
    if (!options ||
        (styles.indexOf(options.style) === -1) ||
        !options.options ||
        (typeof options.options.length !== "number") || (options.options.length === 0)) {
      throw new Error("Invalid Prompt Options", options);
    }
    this.options = options;
    this.modal = $("#promptModal");
    if (this.options.style === "radio") {
      this.elts = $($.parseHTML("<table></table>")).addClass("choiceContainer");
    } else if (this.options.style === "text") {
      this.elts = $("<div>").addClass("choiceContainer");
    } else if (this.options.style === "copyText") {
      this.elts = $("<div>").addClass("choiceContainer");
    } else if (this.options.style === "confirm") {
      this.elts = $("<div>").addClass("choiceContainer");
    } else if (this.options.style === "ctxDropdown") {
      this.elts = $("<div>").addClass("choiceContainer");
    } else {
      this.elts = $($.parseHTML("<div></div>")).addClass("choiceContainer");
    }
    this.title = $(".modal-header > h3", this.modal);
    this.modalContent = $(".modal-content", this.modal);
    this.closeButton = $(".close", this.modal);
    this.submitButton = $(".submit", this.modal);
    if(this.options.submitText) {
      this.submitButton.text(this.options.submitText);
    }
    else {
      this.submitButton.text("Submit");
    }
    if(this.options.cancelText) {
      this.closeButton.text(this.options.cancelText);
    }
    else {
      this.closeButton.text("Cancel");
    }
    this.modalContent.toggleClass("narrow", !!this.options.narrow);

    this.isCompiled = false;
    this.deferred = Q.defer();
    this.promise = this.deferred.promise;
  }

  /**
   * Type for handlers of responses from modal prompts
   * @callback promptCallback
   * @param {string} resp - The response from the user
   */

  /**
   * Shows this prompt to the user (will wait until any active
   * prompts have finished)
   * @param {promptCallback} [callback] - Optional callback which is passed the
   *        result of the prompt
   * @returns A promise resolving to either the result of `callback`, if provided,
   *          or the result of the prompt, otherwise.
   */
  Prompt.prototype.show = function(callback) {
    // Use the promise queue to make sure there's no other
    // prompt being shown currently
    if (this.options.hideSubmit) {
      this.submitButton.hide();
    } else {
      this.submitButton.show();
    }
    this.closeButton.click(this.onClose.bind(this));
    this.submitButton.click(this.onSubmit.bind(this));
    var docClick = (function(e) {
      // If the prompt is active and the background is clicked,
      // then close.
      if ($(e.target).is(this.modal) && this.deferred) {
        this.onClose(e);
        $(document).off("click", docClick);
      }
    }).bind(this);
    $(document).click(docClick);
    var docKeydown = (function(e) {
      if (e.key === "Escape") {
        this.onClose(e);
        $(document).off("keydown", docKeydown);
      }
    }).bind(this);
    $(document).keydown(docKeydown);
    this.title.text(this.options.title);
    this.populateModal();
    this.modal.css('display', 'block');
    $(":input:enabled:visible:first", this.modal).focus().select()

    if (callback) {
      return this.promise.then(callback);
    } else {
      return this.promise;
    }
  };


  /**
   * Clears the contents of the modal prompt.
   */
  Prompt.prototype.clearModal = function() {
    this.submitButton.off();
    this.closeButton.off();
    this.elts.empty();
  };
  
  /**
   * Populates the contents of the modal prompt with the
   * options in this prompt.
   */
  Prompt.prototype.populateModal = function() {
    function createRadioElt(option, idx) {
      var elt = $($.parseHTML("<input name=\"pyret-modal\" type=\"radio\">"));
      var id = "r" + idx.toString();
      var label = $($.parseHTML("<label for=\"" + id + "\"></label>"));
      elt.attr("id", id);
      elt.attr("value", option.value);
      label.text(option.message);
      var eltContainer = $($.parseHTML("<td class=\"pyret-modal-option-radio\"></td>"));
      eltContainer.append(elt);
      var labelContainer = $($.parseHTML("<td class=\"pyret-modal-option-message\"></td>"));
      labelContainer.append(label);
      var container = $($.parseHTML("<tr class=\"pyret-modal-option\"></tr>"));
      container.append(eltContainer);
      container.append(labelContainer);
      if (option.example) {
        var example = $($.parseHTML("<div></div>"));
        var cm = CodeMirror(example[0], {
          value: option.example,
          mode: 'pyret',
          lineNumbers: false,
          readOnly: "nocursor" // this makes it readOnly & not focusable as a form input
        });
        setTimeout(function(){
          cm.refresh();
        }, 1);
        var exampleContainer = $($.parseHTML("<td class=\"pyret-modal-option-example\"></td>"));
        exampleContainer.append(example);
        container.append(exampleContainer);
      }
      
      return container;
    }
    function createTileElt(option, idx) {
      var elt = $($.parseHTML("<button name=\"pyret-modal\" class=\"tile\"></button>"));
      elt.attr("id", "t" + idx.toString());
      elt.append($("<b>").text(option.message))
        .append($("<p>").text(option.details));
      for (var evt in option.on)
        elt.on(evt, option.on[evt]);
      return elt;
    }

    function createTextElt(option) {
      var elt = $("<div class=\"pyret-modal-text\">");
      const input = $("<input id='modal-prompt-text' type='text'>").val(option.defaultValue);
      if(option.drawElement) {
        elt.append(option.drawElement(input));
      }
      else {
        elt.append($("<label for='modal-prompt-text'>").addClass("textLabel").text(option.message));
        elt.append(input);
      }
      return elt;
    }

    function createCopyTextElt(option) {
      var elt = $("<div>");
      elt.append($("<p>").addClass("textLabel").text(option.message));
      if(option.text) {
        var box = autoHighlightBox(option.text);
  //      elt.append($("<span>").text("(" + option.details + ")"));
        elt.append(box);
        box.focus();
      }
      return elt;
    }

    function createConfirmElt(option) {
      return $("<p>").text(option.message);
    }

    function createContextDropdown(option) {
      let whitelist = process.env.WHITELISTED_CTXS.split(", ");
      // let dropdown_contents = whitelist.map(
      //   (ctx) => (<li><a className="dropdown-item" href="#"><code>{ctx}</code></a></li>)
      // );

      const modal_template = document.querySelector("#ctx-modal-template");
      const drop_template = document.querySelector("#dropdown-template");
      const drop_clone = drop_template.content.firstElementChild.cloneNode(true);
      const modal_clone = modal_template.content.firstElementChild.cloneNode(true);

      $("#modal-dropdown-placeholder", modal_clone).append(drop_clone);

      const item_template = document.querySelector("#dropdown-menu-item-template");

      const to_fill = $(".dropdown-menu", modal_clone);
      const dropdown_items = whitelist.map(ctx => {
        const item_clone = $(item_template.content.firstElementChild.cloneNode(true));
        const item_code = $("a code", item_clone);
        item_code.text(ctx);
        return item_clone;
      });

      // console.log(dropdown_items);
      to_fill.append(dropdown_items);
      // console.log(modal_clone);

      // console.log(clone);
      // console.log(drop_template);
      // console.log($(".dropdown-toggle", clone)[0]);
      // bindDropdown($(".dropdown-toggle", clone)[0]);

      bindDropdown(modal_clone);

      $("#whitelisted-radio", modal_clone).on("click", () => {
        $("#manual-ctx-text-input", modal_clone).hide();
        $(".dropdown", modal_clone).show();
      });
      $("#manual-radio", modal_clone).on("click", () => {
        $("#manual-ctx-text-input", modal_clone).show();
        $(".dropdown", modal_clone).hide();
      });
      $(".dropdown-menu__link", modal_clone).on("click", (evt) => {
        // console.log(evt.target);
        // console.log($("code", evt.target));
        $("#current-whitelist-ctx", modal_clone).text(evt.target.innerText);
      });
      $("#current-whitelist-ctx", modal_clone).text(process.env.DEFAULT_CTX);


      // $("#mo")
      
      // function value() {
      //   var man = $("#manual-radio");
      //   var pre = $("#whitelisted-radio");
      //   // console.log(man[0].checked);
      //   if (man[0].checked) {
      //     return $("#ctx-input", modal_clone).val().trim();
      //   } else {
      //     return $("#current-whitelist-ctx", modal_clone).text().trim();
      //   }
      // }

      return modal_clone;
    }

    var that = this;

    function createElt(option, i) {
      if(that.options.style === "radio") {
        return createRadioElt(option, i);
      }
      else if(that.options.style === "tiles") {
        return createTileElt(option, i);
      }
      else if(that.options.style === "text") {
        return createTextElt(option);
      }
      else if(that.options.style === "copyText") {
        return createCopyTextElt(option);
      }
      else if(that.options.style === "confirm") {
        return createConfirmElt(option);
      }
      else if(that.options.style === "ctxDropdown"){
        return createContextDropdown(option);
      }
    }

    var optionElts;
    // Cache results
//    if (true) {
      optionElts = this.options.options.map(createElt);
//      this.compiledElts = optionElts;
//      this.isCompiled = true;
//    } else {
//      optionElts = this.compiledElts;
//    }

    // Really not sure why this line was here, but I don't want my choice of "checked" overridden for ctxDropdown
    if (this.options.style !== "ctxDropdown") {
      $("input[type='radio']", optionElts[0]).attr('checked', true);
    }
    this.elts.append(optionElts);
    $(".modal-body", this.modal).empty().append(this.elts);
  };

  /**
   * Handler which is called when the user does not select anything
   */
  Prompt.prototype.onClose = function(e) {
    this.modal.css('display', 'none');
    this.clearModal();
    this.deferred.resolve(null);
    delete this.deferred;
    delete this.promise;
  };

  /**
   * Handler which is called when the user presses "submit"
   */
  Prompt.prototype.onSubmit = function(e) {
    if(this.options.style === "radio") {
      var retval = $("input[type='radio']:checked", this.modal).val();
    }
    else if(this.options.style === "text") {
      var retval = $("input[type='text']", this.modal).val();
    }
    else if(this.options.style === "copyText") {
      var retval = true;
    }
    else if(this.options.style === "confirm") {
      var retval = true;
    }
    else if(this.options.style === "ctxDropdown") {
      var retval;

      if ($("#manual-radio").prop("checked")) {
        retval = $("#ctx-input").val().trim();
      } else {
        retval = $("#current-whitelist-ctx").text().trim();
      }
    }
    else {
      var retval = true; // Just return true if they clicked submit
    }
    this.modal.css('display', 'none');
    this.clearModal();
    this.deferred.resolve(retval);
    delete this.deferred;
    delete this.promise;
  };

  return Prompt;

});

