/**
 * File to handle visualizing function calls.
 * For now, just `console.log`'s function calls
 * and returns, but eventually will integrate d3
 * and display windows.
 * Looking at https://stackoverflow.com/questions/21727202/append-dom-element-to-the-d3
 * http://www.d3noob.org/2013/01/how-to-rotate-text-labels-for-x-axis-of.html
 * https://stackoverflow.com/questions/36639755/d3-tree-layout-to-display-text-on-mouse-hover-over-links
 * or this one? (2018-09-13): http://bl.ocks.org/WilliamQLiu/76ae20060e19bf42d774
 * TODO's
- filter out equal-always and similar builtins (ask if unsure)
- breadth-first: have interaction undo rather than current exposed undo
- infinite functions
- logging
- data printing
 */
({
  requires: [],
  nativeRequires: ["d3"],
  provides: {},
  theModule: function (runtime, _n, _u, d3) {
    "use strict";
    var events = [];

    var data = {
      name: 'pyret-root',
      children: [],
      masterChildren: [],
      parent: null,
      lineage: [],
      id: -1,
    };
    var done = false;

    // ### DATA MODEL END

    // Set the dimensions and margins of the diagram
    var margin = { top: 20, right: 90, bottom: 30, left: 90 },
      width = 1874 - margin.left - margin.right,
      height = 875 - margin.top - margin.bottom;

    // what happens to later dialogs? clicking button multiple times doesn't work
    var dialog = $("<div>");

    var defaultID = 3;
    var i = defaultID, duration = 750, root;

    // declares a tree layout and assigns the size
    var tree = d3.layout.tree()
      .size([$(document).width(), $(document).height()]);
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
    root.funName = 'Trace';
    var selected = root;

    var console_trace = false;
    var indentation = 1;
    var indentation_char = "-";
    var debug = false;

    var rawEvents = [];

    var simpleOnPush = function (packet) {
      if (debug) {
        rawEvents.push(packet);
        console.log(packet);
      }
      if (done) {
        done = false;
        // and empty events
        events = [];
        rawEvents = [];
        root.masterChildren = [];
      }
      var newPacket = Object.assign({}, packet);
      newPacket.funName = packetToFunName(newPacket);
      if (!blacklistedFunctions.includes(newPacket.funName)) {
        if (console_trace) {
          console.log(Array(indentation).join(indentation_char) +
            [newPacket.action, newPacket.funName, newPacket.args.toString()].join(" "));
          indentation++;
        }
        events.push(newPacket);
        simpleAction(newPacket);
      }
      else {
        if (debug) {
          console.log("packet excluded");
        }
      }
    }

    var check_block_funname = "run checks";

    // look at made functions in runtimeNamespaceBindings (pyret-lang/src/js/base/runtime.js)
    var blacklistedFunctions = [
      "_plus", "trace-value", "current-checker", "results",
      "_times", "_minus", "_divide",
      "_lessthan", "_greaterthan", "_greaterequal", "_lessequal",
      "equal-always", "num-max", "num-sqr", "num-sqrt",
      "getMaker1", /*"check-is",*/ "run-checks", check_block_funname,
      "raw-array-to-list",
      "p-map", "string-equal",
      "make0", "make1", "make2", "make3", "make4", "make5",
    ];

    var anonymousFunction = "<anonymous function>";

    var packetToFunName = function (packet) {
      /*
      maybe take in entire packet? that way can look at args,
      or return to see if name, dict contains name, etc.
       */
      var name = packet.funName.name;
      if (name === anonymousFunction)
        return lambda;
      else
        return name;
    }

    // packet: {action: String, retVal: Vals}
    var simpleOnPop = function (packet) {
      if (debug) {
        rawEvents.push(packet);
        console.log(packet);
      }
      if (done) {
        done = false;
        // and empty events
        events = [];
        root.masterChildren = [];
      }
      var newPacket = Object.assign({}, packet);
      newPacket.funName = packetToFunName(newPacket);
      if (!blacklistedFunctions.includes(newPacket.funName)) {
        if (console_trace) {
          indentation--;
          console.log(Array(indentation).join(indentation_char) +
            [newPacket.action, newPacket.funName, newPacket.retVal].join(" "));
        }
        events.push(newPacket);
        simpleAction(newPacket);
      }
      else {
        if (debug) {
          console.log("packet excluded");
        }
      }
    }

    var simpleAction = function (eventList) {
      var action = eventList.action;
      if (action === "push") {
        var funName = eventList.funName;
        var argList = eventList.args;
        //creates New OBJECT
        var newNodeObj = {
          masterChildren: [],
          finished: false, // could use returnValue, but that is switched around
        };
        var newNode = newNodeObj;
        newNode.depth = selected.depth + 1;
        newNode.parent = selected;
        newNode.lineage = selected.lineage.concat([selected]);
        newNode.id = ++i;
        // add function name, params, and args
        newNode.funName = funName;
        newNode.args = argList;

        if (!selected.masterChildren) {
          selected.masterChildren = [];
        }

        selected.masterChildren.push(newNode);
        // update(selected);
        selected = newNode;
      }
      else if (action === "pop") {
        // then we make selected our parent
        // and we update this one with a return
        if (selected === root) {
          console.log("HELP!");
          console.log(eventList);
        }
        // check here to see if funnames are the same
        if (selected.funName != eventList.funName) {
          console.log("function names don't match");
          console.log(selected.funName);
          console.log(eventList.funName);
        }
        var returnValue = eventList.retVal;
        selected.returnValue = returnValue;
        selected._returnValue = null;
        selected.finished = true;
        // update(selected);

        selected = selected.parent;
      }
      else {
        console.log("what");
        console.log(eventList);
      }
    };

    function hasChildren(n) {
      return n.masterChildren.length > 0
    }

    function isBalanced(events) {
      var counter = 0;
      for (var event in events) {
        var event = events[event];
        switch (event.action) {
          case "push":
            counter++;
            break;
          case "pop":
            counter--;
            break;
          default:
            console.log("what!");
        }
        // check to see if number is less than zero
        if (counter < 0) {
          console.log("more pop's than pushes!");
          return false;
        }
      }
      if (counter > 0) {
        console.log("more pushes than pops!");
        return false;
      }
      else
        return true;
    }

    function getSequence(events) {
      var ret = [];
      var stack = [];
      var firstIndex = -1;

      for (var event in events) {
        var event = events[event];
        var name = event.funName;
        switch (event.action) {
          case "push":
            stack.push({ push: name });
            break;
          case "pop":
            var last = stack.pop();
            if (last == undefined) {
              console.log("trying to pop with " + name);
              break;
            }
            last.pop = name;
            if (last.pop != last.push && firstIndex == -1) {
              firstIndex = ret.length;
            }
            ret.push(last);
            break;
          default:
            console.log("what!");
            console.log(event);
            break;
        }
      }

      return [ret, firstIndex];
    }

    function isTest(arg) {
      return getTestName(arg) ? true : false
    }

    function getTestName(arg) {
      if (arg.dict) {
        return arg.dict.name ? true : false;
      }
      else {
        return false;
      }
    }

    function isCheckBlock(packet) {
      // assumes that we are already
      switch (packet.action) {
        case "push":
          return packet.args.every(isTest);
        case "pop":
          // check retVal
          if (packet.retVal && packet.retVal.dict && packet.retVal.dict.first)
            return isTest(packet.retVal.dict.first);
          else return false;
      }
    }

    function tree_dimensions(events) {
      function tree_to_widths(events) {
        var ret = [1];
        var index = 0;
        events.forEach(function (e) {
          switch (e.action) {
            case "push":
              index++;
              if (index >= ret.length) {
                ret.push(0);
              }
              ret[index]++;
              break;
            case "pop":
              index--;
              break;
          }
        });
        return ret;
      }
      var widths = tree_to_widths(events);
      return { width: widths.reduce((acc, cur) => Math.max(acc, cur), -1), height: widths.length };
    }
    // should compare this with the size of the window?
    // worth seeing what it does without min
    function tree_size(width, height) {
      return { width: (width + 1) * 100, height: (height + 1) * 80 };
    }

    function serializeNode(n) {
      var children = n.children;
      return {
        funName: n.funName,
        args: n.args,
        depth: n.depth,
        finished: n.finished,
        returnValue: n.returnValue,
        _returnValue: n._returnValue,
        numVisibleChildren: children ? children.length : 0,
        numTotalChildren: n.masterChildren.length,
      }
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
        .attr("transform", function (_d) { return "translate(" + source.x0 + "," + source.y0 + ")"; })
        .on("click", click)
        .on("mouseover", function (d) { logger.log("mouseOver", { navigationMode: navMode, node: serializeNode(d) }) })
        .on("mouseout", function (d) { logger.log("mouseOut", { navigationMode: navMode, node: serializeNode(d) }) });

      nodeEnter.append("circle")
        .attr("r", 1e-6)
        .style("fill", getNodeColor);

      nodeEnter.append("text")
        .attr("x", 10)
        .attr("dy", ".35em")
        .attr("text-anchor", "start")
        .attr("transform", "rotate(-15)")
        .text(function (d) { return nodeToText(d); })
        .style("fill-opacity", 1e-6);

      nodeEnter.append("svg:title")
        .text(nodeToFullText);

      var titles = node.selectAll("title").data(nodes, function (d) {
        return d.id || (d.id = ++i);
      });
      titles.text(nodeToFullText);
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
        .style("fill", getNodeColor);

      nodeUpdate.select("text")
        .style("fill-opacity", 1);

      // Transition exiting nodes to the parent's new position.
      var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function (_d) { return "translate(" + source.x + "," + source.y + ")"; })
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
        .attr("d", function (_d) {
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
        .attr("d", function (_d) {
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

    function getNodeColor(n) {
      return n.finished ?
        (hasChildren(n) ? "lightsteelblue" : "fff") :
        "tomato";
    }

    function nodeToText(n) {
      if (is_checkblock(n))
        return check_to_string(n);
      else if (root === n) {
        return "Trace"
      }
      else
        return createText(n.funName, n.args, n.returnValue);
    }

    function nodeToFullText(n) {
      if (is_checkblock(n))
        return check_to_string(n);
      else if (root === n) {
        return "Trace"
      }
      else
        return createFullText(n.funName, n.args, n.returnValue);
    }

    // will need to update this for no params, multiple params, etc
    function createText(funName, funArgs, funRet) {
      return funName + "(" + paramText(funArgs) + ")→" + valueToConstructor(funRet);
    }

    function createFullText(funName, funArgs, funRet) {
      return funName + "(\n" + paramFullText(funArgs) + ")→\n" + valueToString(funRet);
    }

    // look into zip for javascript for multi-params
    // taking invariant that funParams and funArgs are same length
    function paramText(funArgs) {
      if (funArgs) {
        return funArgs.map(valueToConstructor).join(", ");
      }
      else {
        return "";
      }
    }
    function paramFullText(funArgs) {
      if (funArgs) {
        return funArgs.map(function (x) { return "  " + valueToString(x, "  ", 2); }).join(",\n");
      }
      else {
        return "";
      }
    }
    var unknown = "_";
    function dataToString(d, indentation, increment) {
      var name = d["$name"] || d["name"];
      if (name) {
        if (has_fieldnames(d)) {
          // check to see if composite object by looking at constructor
          var fieldNames = d.$constructor.$fieldNames;
          return name + (fieldNames ? (
            "(\n" + fieldNames.map(function (f) {
              return indentation +
                f + ": " + valueToString(d.dict[f], indentation, increment)
            }).join(",\n") + ")"
          ) : "");
        }
        else return name;
      }
      else {
        return unknown;
      }
    }
    function has_fieldnames(d) {
      return d && d.$constructor && d.$constructor.$fieldNames;
    }

    // found in pyret/src/arr/trove/checker.arr
    var check_methods = ["check-is", "check-is-cause", "check-is-roughly",
      "check-is-roughly-cause", "check-is-not", "check-is-not-cause",
      "check-is-refinement", "check-is-refinement-cause",
      "check-is-not-refinement", "check-is-not-refinement-cause",
      "check-satisfies-delayed", "check-satisfies-delayed-cause",
      "check-satisfies-not-delayed", "check-satisfies-not-delayed-cause",
      "check-satisfies", "check-satisfies-not",
      "check-raises-str", "check-raises-str-cause",
      "check-raises-other-str", "check-raises-other-str-cause",
      "check-raises-not", "check-raises-not-cause",
      "check-raises-satisfies", "check-raises-satisfies-cause",
      "check-raises-violates", "check-raises-violates-cause"];

    function is_builtin(d) {
      var loc = d.$loc;
      if (loc) {
        return loc[0].substring(0, 7) === "builtin";
      }
      else return false;
    }

    function dataToList(d) {
      var ret = [];
      function aux(d, acc) {
        if (isEmptyList(d))
          return acc;
        else {
          // add first to acc
          acc.push(valueToString(d.dict.first, 0, 0));
          // and recur on rest
          aux(d.dict.rest, acc);
        }
      }
      aux(d, ret);
      return ret;
    }

    function formatListLikePyret(l) {
      if (l.length > 0)
        return "[list: " + l.join(", ") + "]";
      else
        return "empty";
    }

    function isEmptyList(d) {
      return d && is_builtin(d) && d.$name === "empty";
    }

    function isList(d) {
      // TODO: also check to see if this is an empty node!
      return /* empty or */ isEmptyList(d) ||
  /* link */ d.dict && d.dict.first && d.dict.rest;
    }

    function is_checkblock(d) {
      // check for name, then check arguments!; some way to see if builtin?
      if (d.args && d.args.length > 0) {
        var name = d.funName;
        var args = d.args;
        var builtin = is_builtin(args[args.length - 1]);
        return builtin && check_methods.includes(name);
      }
      else return false;
    }

    function check_to_string(d) {
      // TODO: add (done) when test is done
      return "test at L" + getTestLineNumber(d) + getDepthFirstDone(d);
    }

    // { "action": "push", "funName": { "name": "check-is" }, "args": [{ "name": "<anonymous function>" }, { "name": "<anonymous function>" }, { "dict": { "source": "definitions://", "start-line": 4, "start-column": 2, "start-char": 27, "end-line": 4, "end-column": 11, "end-char": 36 }, "brands": { "$brandSrcloc30": true, "$brandsrcloc32": true } }] },
    function getTestLineNumber(d) {
      return d.args[d.args.length - 1].dict["start-line"];
    }

    function getDepthFirstDone(d) {
      if (navMode === "depth") {
        if (d.returnValue) {
          return " (done)";
        }
        else return "";
      }
      else
        return "";
    }

    // TODO: want to check in here to see if it has any fields
    function valueToConstructor(val) {
      switch (typeof (val)) {
        case "number":
        case "boolean":
          return val;
        case "string":
          return "\"" + val + "\"";
        default:
          // if PObject, print name, if C, I don't know what to do...
          if (val) {
            if (is_fraction(val)) {
              return fraction_to_string(val);
            }
            if (is_checkblock(val)) {
              return check_to_string(val);
            }
            if (isList(val)) {
              if (isEmptyList(val)) {
                return "empty";
              }
              else {
                return "[list:..]";
              }
            }
            var ret = val.$name ? val.$name : val.name ? val.name : unknown;
            if (ret == unknown) {
              if (isTest(val)) {
                return getTestName(val);
              }
              else {
              }
            }
            if (ret === anonymousFunction)
              return lambda;
            if (has_fieldnames(val))
              ret += "(...)";
            return ret;
          }
          else return unknown;
      }
    }
    var lambda = "λ";
    function valueToString(val, indentation, increment) {
      indentation = indentation || "";
      increment = increment || 2;
      switch (typeof (val)) {
        case "number":
        case "boolean":
          return val;
        case "string":
          return "\"" + val + "\"";
        default:
          // console.log(val);
          // if PObject, print name, if C, I don't know what to do...
          if (val) {
            if (is_fraction(val)) {
              return fraction_to_string(val);
            }
            else if (isList(val))
              return formatListLikePyret(dataToList(val));
            else {
              var ret = dataToString(val, indentation + " ".repeat(increment), increment);
              if (ret == unknown) {
                if (isTest(val)) {
                  return getTestName(val);
                }
                else {
                  /* console.log("string's val: ");
                  console.log(val);*/
                }
              }
              if (ret === anonymousFunction)
                return lambda;
              return ret;
            }
          }
          else return unknown;
      }
    }

    var navOptions = [
      { text: 'Breadth-first', val: 'breadth' },
      { text: 'Depth-first', val: 'depth' },
      { text: 'All', val: 'all' },
    ];
    var navMode = navOptions[0].val;
    // for breadth-first, keeps track of nodes to expand
    var toExpand = [];
    // keeps track of clicks and next arrows.
    // should start with one -> and root as expanded since we expand root
    var interactions = [{ effect: "show", affectedParents: [root], toExpand: [root] }];
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

    var simpleShowTrace = function () {
      // what happens if we don't reset root?
      logger.log("showTrace", { navigationMode: navMode });
      resetRoot();
      resetBreadthFirst();
      resetDepthFirst();
      // maybe clone this? would only pay creating once
      dialog = $('<div>', {
        style: 'position: static', //'left: 0px; top: -500px',
      });
      var detached = d3.select(dialog.get(0)).append('div');
      var panel = detached.append('div').style({
        top: '20px',
        left: width + margin.left + margin.right + 10 + 'px',
      }),
        controller = panel.append('div').style({
          top: '70px',
          position: 'fixed',
        });

      controller = $(controller.node());
      var sel = $('<select>').on('change', function () {
        switch (navMode) {
          case "all": break;
          case "depth": resetDepthFirst(); break;
          case "breadth": resetBreadthFirst(); break;
        }
        var oldNavMode = navMode;
        navMode = this.value; /* and reset data at this point */

        switch (navMode) {
          case "all": prepareAll(nextButton, backButton); break;
          case "depth": prepareDepth(nextButton, backButton); break;
          case "breadth": prepareBreadth(nextButton, backButton); break;
        }
        logger.log("changedNavigationMode", { old: oldNavMode, new: navMode });
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
      }).addClass('xMinGo d3btn').click(function () {
        logger.log("tracerBackArrow", { navigationMode: navMode });
        switch (navMode) {
          case "all":
            break;
          case "depth":
            backDF(backButton, nextButton);
            break;
          // TODO: here
          case "breadth":
            backBF(backButton, nextButton);
            break;
        }
      });
      controller.append(backButton);
      var nextButton = $('<button/>', {
        text: '⇨',
        style: 'left: 140px; top: 70px',
        id: 'nextStep',
      }).addClass('xMaxGo d3btn').click(function () {
        logger.log("tracerForwardArrow", { navigationMode: navMode });
        switch (navMode) {
          case "all":
            break;
          case "depth":
            // else, could make next button disabled?
            nextDF(backButton, nextButton);
            break;
          // TODO: here
          case "breadth":
            nextBF(backButton, nextButton);
            break;
        }
      });
      controller.append(nextButton);

      var dimensions = tree_dimensions(events);
      var svg_dimensions = tree_size(dimensions.width, dimensions.height);
      svg = d3.select(dialog.get(0)).
        append("svg").
        // make this match the size of the dialog window!
        attr("width", Math.max($(document).width(), svg_dimensions.width)).
        attr("height", Math.max($(document).height(), svg_dimensions.height)).
        append("g").
        attr("transform", "translate(" + 0 + "," + margin.top + ")");

      console.log(dimensions);
      logger.log("callgraphMaxDimensions", { dimensions: dimensions });

      root.finished = childrenFinished(root.masterChildren);

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
      if (debug) {
        var balanced = isBalanced(events);
        console.log(rawEvents);
        if (!balanced) {
          // go and find where mismatch happens
          var result = getSequence(events);
          var sequence = result[0];
          var index = result[1];
          console.log(index);
          console.log(sequence);
        }
      }
      update(root);
      return dialog;
    }

    function toDetailedObject(e) {
      return {
        action: e.action,
        funName: e.funName,
        retVal: e.retVal,
        args: e.args,
        name: e.name,
        $name: e.$name,
        dict: e.dict,
        brands: e.brands,
        $loc: e.$loc,
      };
    }

    function childrenFinished(children) {
      return children.every(function (c) { return c.finished; });
    }

    function backDF(backButton, nextButton) {
      nextButton.attr("disabled", false);
      var previousEvent = dfDoneEvents.pop();
      var previousCurrent = undoAction(dfCurrent, previousEvent);
      update(dfCurrent);
      dfCurrent = previousCurrent;
      dfPendingEvents.unshift(previousEvent);
      // after going back one, check to see if doneEvents is empty
      backButton.attr("disabled", dfDoneEvents.length < 1);
    }

    function nextDF(backButton, nextButton) {
      backButton.attr("disabled", false);
      var nextEvent = dfPendingEvents.shift();
      var nextCurrent = nextAction(dfCurrent, nextEvent);
      update(dfCurrent);
      dfCurrent = nextCurrent;
      dfDoneEvents.push(nextEvent);
      nextButton.attr("disabled", dfPendingEvents.length < 1);
    }

    function backBF(backButton, nextButton) {
      nextButton.attr("disabled", false);
      // after dispaying previous, check to see if root is only one in toExpand
      /**
       * Get the last interaction and undo it
       * If it was a click, then switch the visibility of that node's children
       * If it was an arrow (note can only be a forward arrow)
       * then switch visibilities of the expanded nodes in that
       */
      var lastAction = interactions.pop();
      toExpand = lastAction.toExpand;
      var affected = lastAction.affectedParents;
      switch (lastAction.effect) {
        case "show":
          // hide these affected nodes
          affected.forEach(function (c) { hideYaKids(c); update(c); });
          break;
        case "hide":
          // show these affected nodes
          affected.forEach(function (c) { showYaKids(c); update(c); });
          break;
      }

      backButton.attr("disabled", toExpand.includes(root));
    }

    function nextBF(backButton, nextButton) {
      backButton.attr("disabled", false);
      // add children of toExpand to toExpand
      var action = { effect: "show", affectedParents: toExpand, toExpand: toExpand };
      interactions.push(action);
      var nextExpand = [];
      for (var i in toExpand) {
        var cur = toExpand[i];
        showYaKids(cur);
        update(cur);
        if (cur.children)
          nextExpand = nextExpand.concat(cur.children);
      }
      toExpand = nextExpand;
      nextButton.attr("disabled", toExpand.length < 1);
    }

    function resetChildren(n) {
      if (!n.children) n.children = [];
      if (!n._children) n._children = [];
      n.children = n.masterChildren.slice(0, n.masterChildren.length);
      n._children = n.children.length > 0 ? [] : null;
      for (var i in n.children) {
        resetChildren(n.children[i]);
      }
    }
    function resetReturnValues(n) {
      if (n.returnValue === null) {
        n.returnValue = n._returnValue;
        n._returnValue = null;
      }
      for (var i in n.masterChildren) {
        resetReturnValues(n.masterChildren[i]);
      }
    }
    function resetRoot() {
      i = defaultID;
      root.children = [];
      root._children = [];
      root.id = -1;
      selected = root;
    }
    function resetBreadthFirst() {
      // go over all nodes, set children correctly
      resetChildren(root);
      interactions = [{ effect: "show", affectedParents: [root], toExpand: [root] }];
    }
    function resetDepthFirst() {
      // go over all nodes, set returnValue and children correctly
      dfCurrent = null;
      // only do this if in breadth, since needless copying
      dfPendingEvents = events.slice(0, events.length);
      dfDoneEvents = [dfPendingEvents.shift()];
      resetChildren(root);
      resetReturnValues(root);
    }
    function prepareAll(nextButton, backButton) {
      resetChildren(root);
      nextButton.attr("disabled", true);
      backButton.attr("disabled", true);
    }
    function prepareBreadth(nextButton, backButton) {
      toExpand = root.children.filter(function (c) { return hasChildren(c); });
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

    // Toggle children on click, but only in all and breadth-first mode
    // TODO: here
    function click(d) {
      logger.log("clickedNode", { navigationMode: navMode, node: serializeNode(d) });
      switch (navMode) {
        case "all":
          switchKids(d);
          update(d);
          break;
        case "breadth":
          var result = switchKids(d);
          var action = result.effect;
          var affected = result.affected;
          var interAction = { effect: action, toExpand: toExpand.slice(0, toExpand.length), affectedParents: affected };
          update(d);
          switch (action) {
            case "hide":
              // should remove children of result of switchKids, no?
              affected.forEach(function (a) { a._children.forEach(function (c) { removeElement(toExpand, c); }); });
              toExpand.push(d);
              break;
            case "show":
              // then need to add kids to toExpand and remove d
              var newToExpands = [];
              d.children.forEach(function (c) {
                newToExpands.push(c);
              });
              toExpand = toExpand.concat(newToExpands);
              removeElement(toExpand, d);
              break;
            case "leaf":
              break;
          }
          interactions.push(interAction);
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

    /**
     * Returns effect and kids affected.
     */
    function switchKids(n) {
      if (n.children) {
        var affected = hideChildren(n);
        return { effect: "hide", affected: affected };
      } else if (n._children) {
        var affected = showYaKids(n);
        return { effect: "show", affected: affected };
      } else {
        return { effect: "leaf", affected: [] };
      }
    }
    function hideYaKids(n, checked) {
      var exchange = checked || (n.masterChildren.length > 0);
      if (exchange) {
        n._children = n.masterChildren.slice(0, n.masterChildren.length);
        n.children = [];
      }
      return [n];
    }
    function showYaKids(n) {
      if (n._children && n._children.length > 0) {
        n.children = n.masterChildren;
        n._children = [];
      }
      return [n];
    }

    function hideYaReturn(n) {
      n._returnValue = n.returnValue;
      n.returnValue = null;
    }

    function hideChildren(n) {
      if (n.children && n.children.length > 0) {
        var affected = [n];
        for (var childIndex in n.children) {
          affected = affected.concat(hideChildren(n.children[childIndex]));
        }
        hideYaKids(n);
        return affected;

      } else {
        return [];
      }
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
        case "pop":
          var previousN = n.children[n.children.length - 1];
          previousN._returnValue = previousN.returnValue;
          previousN.returnValue = null;
          return previousN;
      }
    }

    function is_fraction(p) {
      if (p.n && p.d)
        return typeof (p.n) === "number" && typeof (p.d) === "number";
      else
        return false;
    }

    function fraction_to_string(f) {
      return f.n + "/" + f.d;
    }

    return runtime.makeJSModuleReturn({
      pushFun: simpleOnPush,
      popFun: simpleOnPop,
      showTrace: simpleShowTrace,
      doneExecutingFun: markDone
    });
  }
})
