({
  requires: [
  ],
  nativeRequires: [
  ],
  provides: {},
  theModule: function(runtime, _, uri) {
    function storeDefinitions(item) {
      this.lastDefinitions = item;
    }
    function getDefinitions() {
      return this.lastDefinitions;
    }
    function advanceDups(backward) {
      var thisItem;
      while (this.pointer >= 0 && this.pointer < this.items.length) {
        thisItem = this.items[this.pointer];
        if (thisItem.dup) {
          if (backward) this.pointer++;
          else this.pointer--;
        } else break;
      }
    }
    function loadItem() {
      var thisCode = this.items[this.pointer].code;
      this.CPO.sayAndForget(thisCode);
      this.CM.setValue(thisCode);
      this.CM.refresh();
    }
    function addToHistory(newItem) {
      var prev = this.items[0];
      if (prev && prev.code === newItem.code) {
        newItem.dup = true;
      }
      this.items.unshift(newItem);
      this.pointer = -1;
    }
    function saveCurrentInteractionIfNecessary() {
      if (this.pointer === -1) {
        this.current = this.CM.getValue();
      }
    }
    function prevItem() {
      this.saveCurrentInteractionIfNecessary();
      if (this.pointer < this.items.length - 1) {
        this.pointer++;
        this.advanceDups(true);
        if (this.pointer === this.items.length) {
          this.pointer--;
        } else {
          this.loadItem();
        }
      }
    }
    function nextItem() {
      if (this.pointer >= 1) {
        this.pointer--;
        this.advanceDups(false);
        this.loadItem();
      }
      else if (this.pointer === 0) {
        this.CM.setValue(this.current);
        this.CM.refresh();
        this.pointer--;
      }
      else {
        // intentional no-op if pointer at -1
      }
    }
    function getHistory(n) {
      var historySize = this.items.length;
      if (n > historySize) { return null; }
      return this.items[n - 1];
    }
    function size() {
      return this.items.length;
    }
    function setToEnd() {
      this.pointer = -1;
    }
    function ReplHistory(CM, CPO) {
      this.CM = CM;
      this.CPO = CPO;
      this.items = [];
      this.pointer = -1;
      this.current = "";
      this.lastDefinitions = null;
    }
    ReplHistory.prototype = {
      saveCurrentInteractionIfNecessary: saveCurrentInteractionIfNecessary,
      loadItem: loadItem,
      advanceDups: advanceDups,
      addToHistory: addToHistory,
      nextItem: nextItem,
      prevItem: prevItem,
      getHistory: getHistory,
      size: size,
      setToEnd: setToEnd,
      storeDefinitions: storeDefinitions,
      getDefinitions: getDefinitions
    };

    function makeReplHistory(CM, CPO) {
      return new ReplHistory(CM, CPO);
    }

    return runtime.makeJSModuleReturn({
      makeReplHistory: makeReplHistory
    });

  }
})
