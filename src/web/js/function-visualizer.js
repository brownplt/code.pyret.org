/**
 * File to handle visualizing function calls.
 * For now, just `console.log`'s function calls
 * and returns, but eventually will integrate d3
 * and display windows.
 * Looking at http://d3indepth.com/layouts/
 * and https://stackoverflow.com/questions/21727202/append-dom-element-to-the-d3
 * http://www.d3noob.org/2013/01/how-to-rotate-text-labels-for-x-axis-of.html
 * https://stackoverflow.com/questions/36639755/d3-tree-layout-to-display-text-on-mouse-hover-over-links
 * TODO's
- filter out equal-always and similar builtins (ask if unsure)
- get text not to overlap
  - possible issue with margin/svg width?
  - or nodesize?
  - display text on hover?
  - angle this text?
- keep controls floating on top so always visible
- get margins/svg dimensions working so shows entire trace
- breadth-first: have depth-based expansion rather than current exposed expansion
- get rid of "Run pyret"
  - just track the expansion from the last expression
  -> can't do this! if last expansion contains function expression as argument,
     will need to execute this, and this is a sibling to the last expression
 */
({
  requires: [],
  nativeRequires: ["d3"],
  provides: {},
  theModule: function (runtime, n, u, d3) {
    "use strict";
    var events = [];

    var data = {
      name: 'pyret-root',
      children: [],
      parent: null,
      lineage: [],
    };
    var done = false;

    // ### DATA MODEL END

    // Set the dimensions and margins of the diagram
    var margin = { top: 20, right: 90, bottom: 30, left: 90 },
      width = 1874 - margin.left - margin.right,
      height = 875 - margin.top - margin.bottom;

    // what happens to later dialogs? clicking button multiple times doesn't work
    var dialog = $("<div>");

    var i = 0, duration = 750, root;

    // declares a tree layout and assigns the size
    var tree = d3.layout.tree()
      .size([height, width]);
    var diagonal = d3.svg.diagonal()
      .projection(function (d) { return [d.x, d.y]; });

    // append the svg object to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select(dialog.get(0))
      .append("svg")
      .attr("width", width + margin.right + margin.left)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    root = data;
    root.x0 = width / 2;
    root.y0 = 0;
    root.funName = 'Trace and run';
    var selected = root;

    var console_trace = false;
    var indentation = 1;
    var indentation_char = "-";
    // packet: {action: String, funName: String, params: List<String>, args: List<Vals>}
    var simpleOnPush = function (packet) {
      if (done) {
        done = false;
        // and empty events
        events = [];
      }
      packet.funName = funNameToString(packet.funName);
      if (!blacklistedFunctions.includes(packet.funName)) {
        if (console_trace) {
          console.log(Array(indentation).join(indentation_char) +
            [packet.action, packet.funName, packet.args.toString()].join(" "));
          indentation++;
        }
        events.push(packet);
      }
    }

    // look at made functions in runtimeNamespaceBindings (pyret-lang/src/js/base/runtime.js)
    var blacklistedFunctions = [
      "_plus", "trace-value", "current-checker", "results",
      "_times", "_minus", "_divide",
      "_lessthan", "_greaterthan", "_greaterequal", "_lessequal",
      "getMaker1", "check-is", "run-checks",
      "raw-array-to-list",
      "p-map",
    ];

    var funNameToString = function (funName) {
      return funName.name;
    }

    // packet: {action: String, retVal: Vals}
    var simpleOnPop = function (packet) {
      if (done) {
        done = false;
        // and empty events
        events = [];
      }
      if (!blacklistedFunctions.includes(funNameToString(packet.funName))) {
        if (console_trace) {
          indentation--;
          console.log(Array(indentation).join(indentation_char) +
            [packet.action, packet.funName, packet.retVal].join(" "));
        }
        events.push(packet);
      }
    }

    var simpleAction = function (eventList) {
      var action = eventList.action;
      if (action === "push") {
        var funName = eventList.funName;
        var argList = eventList.args;
        //creates New OBJECT
        var newNodeObj = {
          type: 'resource-delete',
          name: new Date().getTime(),
          attributes: [],
          children: []
        };
        var newNode = newNodeObj;
        newNode.depth = selected.depth + 1;
        newNode.parent = selected;
        newNode.lineage = selected.lineage.concat([selected]);
        newNode.id = ++i;
        // add function name, params, and args
        newNode.funName = funName;
        newNode.args = argList;

        if (!selected.data) {
          selected.data = {};
          selected.data.children = [];
        }
        if (!selected.children) {
          selected.children = [];
        }

        selected.children.push(newNode);
        selected.data.children.push(newNode.data);
        update(selected);
        selected = newNode;
      }
      else if (action === "pop") {
        // then we make selected our parent
        // and we update this one with a return
        var returnValue = eventList.retVal;
        selected.returnValue = returnValue;
        selected._returnValue = null;
        update(selected);

        selected = selected.parent;
      }
      else {
        console.log("what");
        console.log(eventList);
      }
    }
    function hasChildren(n) {
      return (n.children ? n.children.length : 0) +
        (n._children ? n._children.length : 0) > 0
    }
    function update(source) {

      // Compute the new tree layout.
      var nodes = tree.nodes(root).reverse(),
        links = tree.links(nodes);

      // Normalize for fixed-depth.
      nodes.forEach(function (d) { d.y = d.depth * 90; });

      // Update the nodes…
      var node = svg.selectAll("g.node")
        .data(nodes, function (d) { return d.id || (d.id = ++i); });

      // Enter any new nodes at the parent's previous position.
      var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function (d) { return "translate(" + source.x0 + "," + source.y0 + ")"; })
        .on("click", click);

      nodeEnter.append("circle")
        .attr("r", 1e-6)
        .style("fill", function (d) { return d._children ? "lightsteelblue" : "#fff"; });

      nodeEnter.append("text")
        .attr("x", function (d) { return d.children || d._children ? -10 : 10; })
        .attr("dy", ".35em")
        .attr("text-anchor", function (d) { return d.children || d._children ? "end" : "start"; })
        .text(function (d) { return nodeToText(d); })
        .style("fill-opacity", 1e-6);

      var texts = node.selectAll("text").data(nodes, function (d) {
        return d.id || (d.id = ++i);
      });
      texts.text(function (d) { return nodeToText(d); });

      // Transition nodes to their new position.
      var nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });

      nodeUpdate.select("circle")
        .attr("r", 4.5)
        .style("fill", function (d) { return d._children ? "lightsteelblue" : "#fff"; });

      nodeUpdate.select("text")
        .style("fill-opacity", 1);

      // Transition exiting nodes to the parent's new position.
      var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function (d) { return "translate(" + source.x + "," + source.y + ")"; })
        .remove();

      nodeExit.select("circle")
        .attr("r", 1e-6);

      nodeExit.select("text")
        .style("fill-opacity", 1e-6);

      // Update the links…
      var link = svg.selectAll("path.link")
        .data(links, function (d) { return d.target.id; });

      // Enter any new links at the parent's previous position.
      link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", function (d) {
          var o = { x: source.x0, y: source.y0 };
          return diagonal({ source: o, target: o });
        });

      // Transition links to their new position.
      link.transition()
        .duration(duration)
        .attr("d", diagonal);

      // Transition exiting nodes to the parent's new position.
      link.exit().transition()
        .duration(duration)
        .attr("d", function (d) {
          var o = { x: source.x, y: source.y };
          return diagonal({ source: o, target: o });
        })
        .remove();

      // Stash the old positions for transition.
      nodes.forEach(function (d) {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    }

    function nodeToText(n) {
      return createText(n.funName, n.args, n.returnValue);
    }

    // will need to update this for no params, multiple params, etc
    function createText(funName, funArgs, funRet) {
      return funName + "(" + paramText(funArgs) + ") →" + valueToString(funRet);
    }

    // look into zip for javascript for multi-params
    // taking invariant that funParams and funArgs are same length
    function paramText(funArgs) {
      if (funArgs) {
        return funArgs.map(valueToString).join(", ");
      }
      else {
        return "";
      }
    }
    var unknown = "☐";
    function valueToString(val) {
      switch (typeof (val)) {
        case "number":
        case "boolean":
          return val;
        case "string":
          return "\"" + val + "\"";
        default:
          console.log(val);
          // if PObject, print name, if C, I don't know what to do...
          return (val && val["$name"]) ? val["$name"] : unknown;
      }
    }
    var navOptions = [
      { text: 'Depth-first', val: 'depth' },
      { text: 'Breadth-first', val: 'breadth' },
      { text: 'All', val: 'all' },
    ];
    var navMode = navOptions[0].val;
    // for breadth-first, keeps track of nodes to expand
    var toExpand = [];
    var leaves = [];
    var dfCurrent = null;
    // TODO: only do this if in breadth, since needless copying
    var dfPendingEvents = events.slice(0, events.length);
    var dfDoneEvents = [dfPendingEvents.shift()];
    function uniquifyList(l) {
      var found = [];
      for (var index in l)
        if (!found.includes(l[index]))
          found.push(l[index]);
      return found;
    }
    function raiseList(l) {
      var ret = l;
      for (var elemIndex in l) {
        var elem = l[elemIndex];
        for (var retIndex in ret) {
          var curr = ret[retIndex];
          if (curr.lineage.includes(elem)) {
            // then remove elem from ret and break to next elemIndex
            removeElement(ret, curr);
            break; // go to next elemIndex
          }
        }
      }
      return ret;
    }
    function resetChildren(n) {
      if (!n.children) n.children = [];
      if (!n._children) n._children = [];
      n.children = n.children.concat(n._children);
      n._children = n.children.length > 0 ? [] : null;
      for (var i in n.children) {
        resetChildren(n.children[i]);
      }
    }
    function resetReturnValues(n) {
      if (!n.returnValue) {
        n.returnValue = n._returnValue;
        n._returnValue = null;
      }
      for (var i in n.children) {
        resetReturnValues(n.children[i]);
      }
    }
    function resetRoot() {
      i = 1;
      root.children = [];
      root._children = [];
      root.id = 0;
    }
    function resetBreadthFirst() {
      // go over all nodes, set children correctly
      toExpand = [];
      leaves = [];
      resetChildren(root);
      root._children = [];
    }
    function resetDepthFirst() {
      // go over all nodes, set returnValue and children correctly
      dfCurrent = null;
      // only do this if in breadth, since needless copying
      if (navMode === "depth") {
        dfPendingEvents = events.slice(0, events.length);
        dfDoneEvents = [dfPendingEvents.shift()];
      }
      resetChildren(root);
      root._children = [];
      resetReturnValues(root);
    }

    var simpleShowTrace = function () {
      resetRoot();
      resetBreadthFirst();
      resetDepthFirst();
      // maybe clone this? would only pay creating once
      console.log("eventList length: " + events.length);
      dialog = $('<div>', {
        style: 'position: static', //'left: 0px; top: -500px',
      });
      var detached = d3.select(dialog.get(0)).append('div');
      var panel = detached.append('div').style({
        top: '20px',
        left: width + margin.left + margin.right + 10 + 'px',
      }),
        controller = panel.append('div').style({
          top: '60px',
        });

      controller = $(controller.node());
      var sel = $('<select>').on('change', function () {
        switch (navMode) {
          case "all": break;
          case "depth": resetDepthFirst(); break;
          case "breadth": resetBreadthFirst(); break;
        }
        navMode = this.value; /* and reset data at this point */

        switch (navMode) {
          case "all": prepareAll(nextButton, backButton); break;
          case "depth": prepareDepth(nextButton, backButton); break;
          case "breadth": prepareBreadth(nextButton, backButton); break;
        }
        update(root);
      });
      controller.append(sel);
      $(navOptions).each(function () {
        var option = $("<option>").attr('value', this.val).text(this.text);
        if (this.val === navMode)
          option.prop('selected', true);
        sel.append(option);
      });
      var backButton = $('<button/>', {
        text: '⇦',
        style: 'left: 100px; top: 70px',
        disabled: false,
        id: 'previousStep',
      }).addClass('xMinGo d3btn').click(function () { // TODO: change the class of these buttons?
        /*
         * breadth previous:
         * map toExpand to parents, then remove duplicate elements
         * 
         * depth previous:
         * cycle back done to pending and remove action too for that node and update current
        */
        switch (navMode) {
          case "all":
            break;
          case "depth":
            nextButton.attr("disabled", false);
            var previousEvent = dfDoneEvents.pop();
            var previousCurrent = undoAction(dfCurrent, previousEvent);
            update(dfCurrent);
            dfCurrent = previousCurrent;
            dfPendingEvents.unshift(previousEvent);
            // after going back one, check to see if doneEvents is empty
            backButton.attr("disabled", dfDoneEvents.length < 1);
            break;
          case "breadth":
            nextButton.attr("disabled", false);
            // after dispaying previous, check to see if root is only one in toExpand
            var previousExpand = leaves.concat(toExpand).map(function (n) { return n.parent });
            previousExpand = uniquifyList(previousExpand);
            previousExpand = raiseList(previousExpand);
            // maybe this should actually be hideChildren due to leaves
            previousExpand.forEach(function (cur) { hideChildren(cur); update(cur); });
            leaves = [];
            // maybe need to filter this to see if including children
            toExpand = previousExpand;
            backButton.attr("disabled", toExpand.includes(root));
            break;
        }
      });
      controller.append(backButton);
      var nextButton = $('<button/>', {
        text: '⇨',
        style: 'left: 140px; top: 70px',
        id: 'nextStep',
      }).addClass('xMaxGo d3btn').click(function () {
        switch (navMode) {
          case "all":
            break;
          case "depth":
            backButton.attr("disabled", false);
            var nextEvent = dfPendingEvents.shift();
            var nextCurrent = nextAction(dfCurrent, nextEvent);
            update(dfCurrent);
            dfCurrent = nextCurrent;
            dfDoneEvents.push(nextEvent);
            nextButton.attr("disabled", dfPendingEvents.length < 1);
            // else, could make next button disabled?
            break;
          case "breadth":
            backButton.attr("disabled", false);
            // add children of toExpand to toExpand
            var nextExpand = [];
            for (var i in toExpand) {
              var cur = toExpand[i];
              showYaKids(cur);
              update(cur);
              if (cur.children)
                nextExpand = nextExpand.concat(cur.children);
            }
            leaves = leaves.concat(nextExpand.filter(function (n) { return (!n.children || n.children.length === 0) && (!n._children || n._children.length === 0) }));
            leaves.forEach(function (l) { removeElement(nextExpand, l); });
            toExpand = nextExpand;
            nextButton.attr("disabled", toExpand.length < 1);
            break;
        }
      });
      controller.append(nextButton);

      svg = d3.select(dialog.get(0)).
        append("svg").
        // make this match the size of the dialog window!
        attr("width", "auto").
        attr("height", "auto").
        append("g").
        attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      for (var event in events) {
        simpleAction(events[event])
      }
      switch (navMode) {
        case "all":
          prepareAll(nextButton, backButton);
          break;
        case "breadth":
          prepareBreadth(nextButton, backButton);
          break;
        case "depth":
          prepareDepth(nextButton, backButton);
          break;
      }
      update(root);
      return dialog;
    }
    function prepareAll(nextButton, backButton) {
      resetChildren(root);
      nextButton.attr("disabled", true);
      backButton.attr("disabled", true);
    }
    function prepareBreadth(nextButton, backButton) {
      toExpand = root.children;
      leaves = []; // possible that a root's child is a leaf though!
      // only have children of root expanded
      for (var childIndex in root.children) {
        var n = root.children[childIndex];
        hideChildren(n);
      }
      backButton.attr("disabled", toExpand.includes(root));
      nextButton.attr("disabled", toExpand.length < 1);
    }
    function prepareDepth(nextButton, backButton) {
      // have only first child of root visible and retval hidden
      hideReturns(root);
      hideChildren(root);
      var first = root._children.shift();
      root.children.push(first);
      dfCurrent = first;
      backButton.attr("disabled", dfDoneEvents.length < 1);
      nextButton.attr("disabled", dfPendingEvents.length < 1);
    }
    var markDone = function () {
      // this is where would make some
      // state change for when we can clear
      // when start receiving more push/pops
      done = true;
    }

    function click(d) {
      switch (navMode) {
        case "all":
          switchKids(d);
          update(d);
          break;
        case "breadth":
          var action = switchKids(d);
          update(d);
          switch (action) {
            case "hide":
              unexpandKids(toExpand, d);
              break;
            case "show":
              // then need to add kids to toExpand and remove d
              var newLeaves = [];
              var newToExpands = [];
              d.children.forEach(function (c) {
                if (hasChildren(c)) {
                  newToExpands.push(c);
                }
                else {
                  newLeaves.push(c);
                }
              })
              toExpand = toExpand.concat(newToExpands);
              leaves = leaves.concat(newLeaves);
              break;
            case "leaf":
              break;
          }
          // todo: check to see if hid or showed kids, update toExpand appropriately
          break;
        case "depth":
          return;
      }
    }
    /**
     * for some clicked node,
     * remove its children from the list (toExpand)
     * and add this node to be expanded instead.
     */
    function unexpandKids(l, n) {
      // happens after children switched, so ._children now
      var children = n._children;
      for (var i in children) {
        removeElement(l, children[i]);
      }
      l.push(n);
    }

    function removeElement(l, e) {
      var index = l.indexOf(e);
      if (index > -1) {
        l.splice(index, 1);
      }
    }

    function switchKids(n) {
      if (n.children) {
        hideChildren(n);
        return "hide";
      } else if (n._children) {
        showYaKids(n);
        return "show";
      } else {
        return "leaf";
      }
    }
    function hideYaKids(n, checked) {
      var exchange = checked || (n.children && n.children.length > 0);
      if (exchange) {
        n._children = n.children;
        n.children = [];
      }
    }
    function showYaKids(n) {
      if (n._children && n._children.length > 0) {
        n.children = n._children;
        n._children = [];
      }
    }

    function hideYaReturn(n) {
      n._returnValue = n.returnValue;
      n.returnValue = null;
    }

    function hideChildren(n) {
      for (var childIndex in n.children) {
        hideChildren(n.children[childIndex]);
      }
      hideYaKids(n);
    }

    function hideReturns(n) {
      for (var childIndex in n.children) {
        hideReturns(n.children[childIndex]);
      }
      hideYaReturn(n);
    }

    function nextAction(n, e) {
      var action = e.action;
      switch (action) {
        case "push":
          var nk = n._children.shift();
          if (!n.children)
            n.children = [];
          n.children.push(nk);
          return nk;
        case "pop":
          n.returnValue = n._returnValue;
          n._returnValue = null;
          return n.parent;
      }
    }

    function undoAction(n, e) {
      var action = e.action;
      switch (action) {
        case "push":
          var previousN = n.parent;
          previousN._children.unshift(previousN.children.pop());
          return previousN;
          break;
        case "pop":
          var previousN = n.children[n.children.length - 1];
          previousN._returnValue = previousN.returnValue;
          previousN.returnValue = null;
          return previousN;
          break;
      }
    }

    return runtime.makeJSModuleReturn({
      pushFun: simpleOnPush,
      popFun: simpleOnPop,
      showTrace: simpleShowTrace,
      doneExecutingFun: markDone
    });
  }
})
