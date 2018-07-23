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

    var indentation = 1;
    var indentation_char = "-";
    // packet: {action: String, funName: String, params: List<String>, args: List<Vals>}
    var simpleOnPush = function(packet) {
      console.log(Array(indentation).join(indentation_char) +
        [packet.action, packet.funName, packet.params.toString(), packet.args.toString()].join(" "));
      indentation++;
    }

    // packet: {action: String, retVal: Vals}
    var simpleOnPop = function(packet) {
      indentation--;
      console.log(Array(indentation).join(indentation_char) +
        [packet.action, packet.retVal].join(" "));
    }

    var simpleShowTrace = function() {
      // function to show trace! returns d3 thing? who knows!
      var events = [
        {action: "push", funName: "fib", params: ["i"], args: ["3"]},
        {action: "push", funName: "fib", params: ["i"], args: ["2"]},
        {action: "push", funName: "fib", params: [], args: []},
        {action: "pop", retVal: 1},
        {action: "push", funName: "fib", params: ["i", "j"], args: ["0", "1"]},
        {action: "pop", retVal: 1},
        {action: "pop", retVal: 2},
        {action: "push", funName: "fib", params: ["i"], args: ["1"]},
        {action: "pop", retVal: 1},
        {action: "pop", retVal: 3}];

      var data = {
        name: 'pyret-root',
        children: [],
        parent: null
      };
      var margin = {top: 20, right: 90, bottom: 30, left: 90},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

      // append the svg object to the body of the page
      // appends a 'group' element to 'svg'
      // moves the 'group' element to the top left margin
      var dialog = $("<div>");
      var svg = d3.select(dialog.get(0)).
        append("svg").
        attr("width", width + margin.right + margin.left).
        attr("height", height + margin.top + margin.bottom).
        append("g").
        attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var i = 0, duration = 750, root;

      // declares a tree layout and assigns the size
      var treemap = d3.tree().size([height, width]);

      root = d3.hierarchy(data, function(d) {
        return d.children;
      });
      root.x0 = height / 2;
      root.y0 = 0;
      root.funName = 'Run Pyret';
      update(root);
      var selected = root;

      function update(source) {

        // Assigns the x and y position for the nodes
        var treeData = treemap(root);
        console.log("inside update");
        console.log(source);

        // Compute the new tree layout.
        var nodes = treeData.descendants(),
          links = treeData.descendants().slice(1);

        // Normalize for fixed-depth.
        nodes.forEach(function(d){
          d.y = d.depth * 180
        });

        // ### LINKS

        // Update the links...
        var link = svg.selectAll('line.link').
          data(links, function(d) {
            return d.id;
          });

        // Enter any new links at the parent's previous position.
        var linkEnter = link.enter().
          append('line').
          attr("class", "link").
          attr("stroke-width", 2).
          attr("stroke", 'black').
          attr('x1', function(d) {
            return source.y0;
          }).
          attr('y1', function(d) {
            return source.x0;
          }).
          attr('x2', function(d) {
            return source.y0;
          }).
          attr('y2', function(d) {
            return source.x0;
          });

        var linkUpdate = linkEnter.merge(link);

        linkUpdate.transition().
          duration(duration).
          attr('x1', function(d) {
            return d.parent.y;
          }).
          attr('y1', function(d) {
            return d.parent.x;
          }).
          attr('x2', function(d) {
            return d.y;
          }).
          attr('y2', function(d) {
            return d.x;
          });

        // Transition back to the parent element position
        linkUpdate.transition().
          duration(duration).
          attr('x1', function(d) {
            return d.parent.y;
          }).
          attr('y1', function(d) {
            return d.parent.x;
          }).
          attr('x2', function(d) {
            return d.y;
          }).
          attr('y2', function(d) {
            return d.x;
          });

        // Remove any exiting links
        var linkExit = link.exit().
          transition().
          duration(duration).
          attr('x1', function(d) {
            return source.x;
          }).
          attr('y1', function(d) {
            return source.y;
          }).
          attr('x2', function(d) {
            return source.x;
          }).
          attr('y2', function(d) {
            return source.y;
          }).
          remove();

        // ### CIRCLES

        // Update the nodes...
        var node = svg.selectAll('g.node')
          .data(nodes, function(d) {
            return d.id || (d.id = ++i);
          });

        // Enter any new modes at the parent's previous position.
        var nodeEnter = node.enter().
          append('g').
          attr('class', 'node').
          attr("transform", function(d) {
            return "translate(" + source.y0 + "," + source.x0 + ")";
          });

        // Add Circle for the nodes
        nodeEnter.append('circle').
          attr('class', 'node').
          attr('r', 25).
          style("fill", function(d) {
            return "#0e4677";
          });

        // base of this is adopted from https://bl.ocks.org/mbostock/4339083
        nodeEnter.append("text")
          .attr("x", function(d) { return d.children ? -50 : 30; })
          .attr("dy", ".35em")
          .attr("text-anchor", function(d) { return d.children ? "end" : "start"; })
          .text(function(d) {
            console.log("from inside text thingy");
            console.log(d);
            var t = nodeToText(d);
            console.log(t);
            return t; }); // function name, args, vals
        //.style("fill-opacity", 1e-6);

        var texts = node.selectAll("text").data(nodes, function(d) {
          return d.id || (d.id = ++i);
        });
        texts.text(function(d) {
          var t = nodeToText(d);
          console.log("normal text update");
          console.log(d);
          return t; }); // function name, args, vals

        // Update
        var nodeUpdate = nodeEnter.merge(node);

        // Transition to the proper position for the node
        nodeUpdate.transition().
          duration(duration).
          attr("transform", function(d) {
            return "translate(" + d.y + "," + d.x + ")";
          });

        // Update the node attributes and style
        nodeUpdate.select('circle.node').
          attr('r', 25).
          style("fill", function(d) {
            return "#0e4677";
          }).
          attr('cursor', 'pointer');

        // Remove any exiting nodes
        var nodeExit = node.exit().
          transition().
          duration(duration).
          attr("transform", function(d) {
            return "translate(" + source.y + "," + source.x + ")";
          }).
          remove();

        // On exit reduce the node circles size to 0
        nodeExit.select('circle').attr('r', 0);

        // Store the old positions for transition.
        nodes.forEach(function(d){
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
      return dialog;
    }

    var markDone = function() {
      console.log("done with one trace");
      // this is where would make some
      // state change for when we can clear
      // when start receiving more push/pops
    }

    return runtime.makeJSModuleReturn({
      pushFun: simpleOnPush,
      popFun : simpleOnPop,
      showTrace : simpleShowTrace,
      doneExecutingFun : markDone
    });
  }
})
