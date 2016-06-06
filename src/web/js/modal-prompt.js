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
define(["q"], function(Q) {

  // Allows asynchronous requesting of prompts
  var promptQueue = Q();

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
    if (!options || (typeof options.length !== "number") || (options.length === 0)) {
      throw new Error("Invalid Prompt Options", options);
    }
    this.options = options;
    this.modal = $("#promptModal");
    this.elts = $("#choiceContainer", this.modal);
    this.closeButton = $(".close", this.modal);
    this.submitButton = $(".submit", this.modal);
    this.isCompiled = false;
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
    if (this.deferred !== undefined) {
      throw new Error("Already showing prompt");
    }
    this.deferred = Q.defer();
    this.promise = this.deferred.promise;
    // Use the promise queue to make sure there's no other
    // prompt being shown currently
    promptQueue.then((function(){
      this.closeButton.click(this.onClose.bind(this));
      this.submitButton.click(this.onSubmit.bind(this));
      $(document).click((function(e) {
        // If the prompt is active and the background is clicked,
        // then close.
        if ($(e.target).is(this.modal) && this.deferred) {
          this.onClose(e);
        }
      }).bind(this));
      this.populateModal();
      this.modal.css('display', 'block');
      return this.promise;
    }).bind(this));

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
    this.elts.empty();
  };

  /**
   * Populates the contents of the modal prompt with the
   * options in this prompt.
   */
  Prompt.prototype.populateModal = function() {
    function createElt(option, idx) {
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
          readOnly: true
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
    var optionElts;
    // Cache results
    if (!this.isCompiled) {
      optionElts = this.options.map(createElt);
      this.compiledElts = optionElts;
      this.isCompiled = true;
    } else {
      optionElts = this.compiledElts;
    }
    $("input[type='radio']", optionElts[0]).attr('checked', true);
    this.elts.append(optionElts);
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
    var retval = $("input[type='radio']:checked", this.modal).val();
    this.modal.css('display', 'none');
    this.clearModal();
    this.deferred.resolve(retval);
    delete this.deferred;
    delete this.promise;
  };

  return Prompt;

});
