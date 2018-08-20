/**
 * File to handle visualizing function calls.
 * For now, just `console.log`'s function calls
 * and returns, but eventually will integrate d3
 * and display windows.
 * Looking at http://d3indepth.com/layouts/
 * and https://stackoverflow.com/questions/21727202/append-dom-element-to-the-d3
 */
({
  requires: [],
  nativeRequires: ["d3"],
  provides: {},
  theModule: function(runtime, n, u, d3) {

    var events = [];

    var data = {
      name: 'pyret-root',
      children: [],
      parent: null
    };
    var done = false;

    // ### DATA MODEL END

    // Set the dimensions and margins of the diagram
    var margin = {top: 20, right: 90, bottom: 30, left: 90},
      width = 1874 - margin.left - margin.right,
      height = 875 - margin.top - margin.bottom;

    // what happens to later dialogs? clicking button multiple times doesn't work
    var dialog = $("<div>");

    var i = 0, duration = 750, root;

    // declares a tree layout and assigns the size
    var tree = d3.layout.tree()
      .size([height, width]);
    var diagonal = d3.svg.diagonal()
      .projection(function(d) { return [d.x, d.y]; });

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
    root.funName = 'Run Pyret';
    var selected = root;

    var console_trace = false;
    var indentation = 1;
    var indentation_char = "-";
    // packet: {action: String, funName: String, params: List<String>, args: List<Vals>}
    var simpleOnPush = function(packet) {
      if (done) {
        done = false;
        // and empty events
        events = [];
      }
      if (console_trace) {
        console.log(Array(indentation).join(indentation_char) +
          [packet.action, packet.funName, packet.params.toString(), packet.args.toString()].join(" "));
        indentation++;
      }
      events.push(packet);
    }

    // packet: {action: String, retVal: Vals}
    var simpleOnPop = function(packet) {
      if (done) {
        done = false;
        // and empty events
        events = [];
      }
      if (console_trace) {
        indentation--;
        console.log(Array(indentation).join(indentation_char) +
          [packet.action, packet.retVal].join(" "));
      }
      events.push(packet);
    }

    var simpleAction = function(eventList) {
      var action = eventList.action;
      if (action === "push") {
        var funName = eventList.funName;
        var paramList = eventList.params;
        var argList = eventList.args;
        //creates New OBJECT
        var newNodeObj = {
          type: 'resource-delete',
          name: new Date().getTime(),
          attributes: [],
          children: []
        };
        newNode = newNodeObj;
        newNode.depth = selected.depth + 1;
        newNode.parent = selected;
        newNode.id = ++i;
        // add function name, params, and args
        newNode.funName = funName;
        newNode.params = paramList;
        newNode.args = argList;

        if(!selected.data) {
          selected.data = {};
          selected.data.children = [];
        }
        if(!selected.children){
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
        update(selected);

        selected = selected.parent;
      }
      else {
        console.log("what");
        console.log(eventList);
      }
    }
    function update(source) {

      // Compute the new tree layout.
      var nodes = tree.nodes(root).reverse(),
        links = tree.links(nodes);

      // Normalize for fixed-depth.
      nodes.forEach(function(d) { d.y = d.depth * 90; });

      // Update the nodes…
      var node = svg.selectAll("g.node")
        .data(nodes, function(d) { return d.id || (d.id = ++i); });

      // Enter any new nodes at the parent's previous position.
      var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + source.x0 + "," + source.y0 + ")"; })
        .on("click", click);

      nodeEnter.append("circle")
        .attr("r", 1e-6)
        .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

      nodeEnter.append("text")
        .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
        .attr("dy", ".35em")
        .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
        .text(function(d) { return nodeToText(d); })
        .style("fill-opacity", 1e-6);

      var texts = node.selectAll("text").data(nodes, function(d) {
        return d.id || (d.id = ++i);
      });
      texts.text(function(d) { return nodeToText(d);});

      // Transition nodes to their new position.
      var nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

      nodeUpdate.select("circle")
        .attr("r", 4.5)
        .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

      nodeUpdate.select("text")
        .style("fill-opacity", 1);

      // Transition exiting nodes to the parent's new position.
      var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + source.x + "," + source.y + ")"; })
        .remove();

      nodeExit.select("circle")
        .attr("r", 1e-6);

      nodeExit.select("text")
        .style("fill-opacity", 1e-6);

      // Update the links…
      var link = svg.selectAll("path.link")
        .data(links, function(d) { return d.target.id; });

      // Enter any new links at the parent's previous position.
      link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", function(d) {
          var o = {x: source.x0, y: source.y0};
          return diagonal({source: o, target: o});
        });

      // Transition links to their new position.
      link.transition()
        .duration(duration)
        .attr("d", diagonal);

      // Transition exiting nodes to the parent's new position.
      link.exit().transition()
        .duration(duration)
        .attr("d", function(d) {
          var o = {x: source.x, y: source.y};
          return diagonal({source: o, target: o});
        })
        .remove();

      // Stash the old positions for transition.
      nodes.forEach(function(d) {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    }

    function nodeToText(n) {
      return createText(n.funName, n.params, n.args, n.returnValue);
    }

    // will need to update this for no params, multiple params, etc
    function createText(funName, funParams, funArgs, funRet) {
      return funName + "(" + paramText(funParams, funArgs) + ") →" + (funRet || "☐");
    }

    // look into zip for javascript for multi-params
    // taking invariant that funParams and funArgs are same length
    function paramText(funParams, funArgs) {
      if (funParams) {
        var zipped = funParams.map(function(element, index) {
          return element + "=" + funArgs[index];
        });
        if (zipped.length > 0) {
          return zipped.reduce((acc, curr) => acc + "," + curr);
        }
        else {
          return zipped.reduce((acc, curr) => acc + curr, "");
        }
      }
      else {
        return "";
      }
    }

    var simpleShowTrace = function() {
      i = 1;
      root.children = null;
      root._children = null;
      root.id = 0;
      // maybe clone this? would only pay creating once
      console.log("eventList length: " + events.length);
      dialog = $('<div>');
      // copied from plot-lib
      detached = d3.select(dialog.get(0)).append('div');
        panel = detached.append('div').style({
          top: '20px',
          left: width + margin.left + margin.right + 10 + 'px',
        }),
        controller = panel.append('div').style({
          top: '60px',
        }),
        controller.append('div').style({
          top: '180px',
          left: '50px',
          'font-size': '18px',
          width: '200px'
        }).text('Number of Samples:');

      controller = $(controller.node());

      var xMinC = $('<input/>', {
        type: 'text',
        placeholder: 'x-min',
        style: 'left: 0px; top: 70px',
      }).attr('size', '8');
      var xMaxC = $('<input/>', {
        type: 'text',
        placeholder: 'x-max',
        style: 'left: 180px; top: 70px',
      }).attr('size', '8');
      var yMinC = $('<input/>', {
        type: 'text',
        placeholder: 'y-min',
        style: 'left: 90px; top: 140px',
      }).attr('size', '8');
      var yMaxC = $('<input/>', {
        type: 'text',
        placeholder: 'y-max',
        style: 'left: 90px; top: 0px',
      }).attr('size', '8');
      var numSamplesC = $('<input/>', {
        type: 'text',
        placeholder: 'num-samples',
        style: 'left: 90px; top: 210px',
      }).attr('size', '8');

      controller
        .append(xMinC)
        .append(xMaxC)
        .append(yMinC)
        .append(yMaxC)
      .append(numSamplesC);

      svg = d3.select(dialog.get(0)).
        append("svg").
        // make this match the size of the dialog window!
        attr("width", width + margin.right + margin.left).
        attr("height", height + margin.top + margin.bottom).
        append("g").
        attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      for (event in events) {
        simpleAction(events[event])
      }
      return dialog;
    }

    var markDone = function() {
      // this is where would make some
      // state change for when we can clear
      // when start receiving more push/pops
      done = true;
    }

    function click(d) {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
      update(d);
    }

    return runtime.makeJSModuleReturn({
      pushFun: simpleOnPush,
      popFun : simpleOnPop,
      showTrace : simpleShowTrace,
      doneExecutingFun : markDone
    });
  }
})
