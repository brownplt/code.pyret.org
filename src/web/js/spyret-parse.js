define(["./wescheme-support.js", 'js/js-numbers'], function(sup, jsnums) {

  var types = sup.types
  var Vector = sup.Vector

  // extracted from wescheme's compiler-calc.js

  //var jsnums = sup.jsnums
  // Input 0
  // Input 1
  plt = {};
  plt.compiler = {};

  /*
     TODO
     - have modulePathResolver return the proper name!
   */

  //////////////////////////////////////////////////////////////////////////////
  /////////////////// COMMON FUNCTIONS AND STRUCTURES //////////////////////////
  //////////////// used by multiple phases of the compiler/////////////////////

  (function () {
    'use strict';

    var unimplementedException = function(str){
      this.str = str;
    }

    /**************************************************************************
     *
     *    CONVERT LOCAL COMPILER ERRORS INTO WESCHEME ERRORS
     *
     **************************************************************************/
    // encode the msg and location as a JSON error
    function throwError(msg, loc, errorClass) {
      loc.source = loc.source || "<unknown>"; // FIXME -- we should have the source populated
      // rewrite a ColoredPart to match the format expected by the runtime
      function rewritePart(part){
        if(typeof(part) === 'string'){
          return part;
        } else if(part instanceof symbolExpr){
          return '["span", [["class", "SchemeValue-Symbol"]], '+part.val+']';
          return part.val;
        } else if(part.location !== undefined){
          return {text: part.text, type: 'ColoredPart', loc: part.location.toString()
              , toString: function(){return part.text;}};
        } else if(part.locations !== undefined){
          return {text: part.text, type: 'MultiPart', solid: part.solid
              , locs: part.locations.map(function(l){return l.toString()})
              , toString: function(){return part.text;}};
        }
      }

      msg.args = msg.args.map(rewritePart);

      var json = {type: "moby-failure"
        , "dom-message": ["span"
        ,[["class", "Error"]]
        ,["span"
        , [["class", (errorClass || "Message")]]].concat(
      (errorClass? [["span"
        , [["class", "Error.reason"]]
        , msg.toString()]
        , ["span", [["class", ((errorClass || "message")
      +((errorClass === "Error-GenericReadError")?
        ".locations"
          :".otherLocations"))]]]]
            : msg.args.map(function(x){return x.toString();})))
        ,["br", [], ""]
        ,["span"
        , [["class", "Error.location"]]
        , ["span"
        , [["class", "location-reference"]
        , ["style", "display:none"]]
        , ["span", [["class", "location-offset"]], (loc.startChar+1).toString()]
        , ["span", [["class", "location-line"]]  , loc.startRow.toString()]
        , ["span", [["class", "location-column"]], loc.startCol.toString()]
        , ["span", [["class", "location-span"]]  , loc.span.toString()]
        , ["span", [["class", "location-id"]]    , loc.source.toString()]
        ]
        ]
        ]
        , "structured-error": JSON.stringify({message: (errorClass? false : msg.args), location: loc.toString() })
      };
      throw JSON.stringify(json);
    }

    // couple = pair
    function couple(first, second) {
      this.first = first;
      this.second = second;
      this.toString = function(){
        return "("+this.first.toString() +" "+this.second.toString()+")";
      };
    };

    /**************************************************************************
     *
     *    AST Nodes
     *
     **************************************************************************/

    // Inheritance from pg 168: Javascript, the Definitive Guide.
    var heir = function(p) {
      var f = function() {};
      f.prototype = p;
      return new f();
    };

    // all Programs, by default, print out their values
    // anything that behaves differently must provide their own toString() function
    var Program = function() {
      // -> String
      this.toString = function(){ return this.val.toString(); };
      // every Program has a location, but it's initialized to null
      this.location = null;
    };

    // Function definition
    function defFunc(name, args, body, stx) {
      Program.call(this);
      this.name = name;
      this.args = args;
      this.body = body;
      this.stx  = stx;
      this.toString = function(){
        return "(define ("+this.name.toString()+" "+this.args.join(" ")+")\n    "+this.body.toString()+")";
      };
    };
    defFunc.prototype = heir(Program.prototype);

    // Variable definition
    function defVar(name, expr, stx) {
      Program.call(this);
      this.name = name;
      this.expr = expr;
      this.stx  = stx;
      this.toString = function(){
        return "(define "+this.name.toString()+" "+this.expr.toString()+")";
      };
    };
    defVar.prototype = heir(Program.prototype);

    // Multi-Variable definition
    function defVars(names, expr, stx) {
      Program.call(this);
      this.names  = names;
      this.expr   = expr;
      this.stx    = stx;
      this.toString = function(){
        return "(define-values ("+this.names.join(" ")+") "+this.expr.toString()+")";
      };
    };
    defVars.prototype = heir(Program.prototype);

    // Structure definition
    function defStruct(name, fields, stx) {
      Program.call(this);
      this.name   = name;
      this.fields = fields;
      this.stx    = stx;
      this.toString = function(){
        return "(define-struct "+this.name.toString()+" ("+this.fields.toString()+"))";
      };
    };
    defStruct.prototype = heir(Program.prototype);

    // Begin expression
    function beginExpr(exprs, stx) {
      Program.call(this);
      this.exprs  = exprs;
      this.stx    = stx;
      this.toString = function(){
        return "(begin "+this.exprs.join(" ")+")";
      };
    };
    beginExpr.prototype = heir(Program.prototype);

    // Lambda expression
    function lambdaExpr(args, body, stx) {
      Program.call(this);
      this.args = args;
      this.body = body;
      this.stx  = stx;
      this.toString = function(){
        return "(lambda ("+this.args.join(" ")+") "+this.body.toString()+")";
      };
    };
    lambdaExpr.prototype = heir(Program.prototype);

    // Local expression
    function localExpr(defs, body, stx) {
      Program.call(this);
      this.defs = defs;
      this.body = body;
      this.stx  = stx;
      this.toString = function(){
        return "(local ("+this.defs.toString()+") "+this.body.toString()+")";
      };
    };
    localExpr.prototype = heir(Program.prototype);

    // Letrec expression
    function letrecExpr(bindings, body, stx) {
      this.bindings = bindings;
      this.body     = body;
      this.stx      = stx;
      this.toString = function(){
        return "(letrec ("+this.bindings.toString()+") ("+this.body.toString()+"))";
      };
    };

    // Let expression
    function letExpr(bindings, body, stx) {
      this.bindings = bindings;
      this.body     = body;
      this.stx      = stx;
      this.toString = function(){
        return "(let ("+this.bindings.toString()+") ("+this.body.toString()+"))";
      };
    };

    // Let* expressions
    function letStarExpr(bindings, body, stx) {
      this.bindings = bindings;
      this.body     = body;
      this.stx      = stx;
      this.toString = function(){
        return "(let* ("+this.bindings.toString()+") ("+this.body.toString()+"))";
      };
    };

    // cond expression
    function condExpr(clauses, stx) {
      this.clauses  = clauses;
      this.stx      = stx;
      this.toString = function(){
        return "(cond\n    "+this.clauses.join("\n    ")+")";
      };
    };

    // Case expression
    function caseExpr(expr, clauses, stx) {
      Program.call(this);
      this.expr     = expr;
      this.clauses  = clauses;
      this.stx      = stx;
      this.toString = function(){
        return "(case "+this.expr.toString()+"\n    "+this.clauses.join("\n    ")+")";
      };
    };
    caseExpr.prototype = heir(Program.prototype);

    // and expression
    function andExpr(exprs, stx) {
      this.exprs  = exprs;
      this.stx    = stx;
      this.toString = function(){ return "(and "+this.exprs.join(" ")+")"; };
    };

    // or expression
    function orExpr(exprs, stx) {
      this.exprs  = exprs;
      this.stx    = stx;
      this.toString = function(){ return "(or "+this.exprs.toString()+")"; };
    };

    // application expression
    function callExpr(func, args, stx) {
      Program.call(this);
      this.func   = func;
      this.args   = args;
      this.stx    = stx;
      this.toString = function(){
        return "("+[this.func].concat(this.args).join(" ")+")";
      };
    };
    callExpr.prototype = heir(Program.prototype);

    // if expression
    function ifExpr(predicate, consequence, alternative, stx) {
      Program.call(this);
      this.predicate = predicate;
      this.consequence = consequence;
      this.alternative = alternative;
      this.stx = stx;
      this.toString = function(){
        return "(if "+this.predicate.toString()+" "+this.consequence.toString()+" "+this.alternative.toString()+")";
      };
    };
    ifExpr.prototype = heir(Program.prototype);

    // when/unless expression
    function whenUnlessExpr(predicate, exprs, stx) {
      Program.call(this);
      this.predicate = predicate;
      this.exprs = exprs;
      this.stx = stx;
      this.toString = function(){
        return "("+this.stx[0]+" "+this.predicate.toString()+" "+this.exprs.toString()+")";
      };
    };
    whenUnlessExpr.prototype = heir(Program.prototype);

    // symbol expression (ID)
    function symbolExpr(val, stx) {
      Program.call(this);
      this.val = val;
      this.stx = stx;
    };
    symbolExpr.prototype = heir(Program.prototype);

    // Literal values (String, Char, Number, Vector)
    function literal(val) {
      Program.call(this);
      this.val = val;
      this.toString = function(){
        // racket prints booleans using #t and #f
        if(this.val===true) return "#t";
        if(this.val===false) return "#f";
        // racket prints special chars using their names
        if(this.val instanceof Char){
          var c = this.val.val;
          return c === '\b' ? '#\\backspace' :
            c === '\t' ? '#\\tab' :
            c === '\n' ? '#\\newline' :
            c === ' '  ? '#\\space' :
            c === '\v' ? '#\\vtab' :
            /* else */  this.val.toWrittenString();
        }
        return types.toWrittenString(this.val);
      }
    };
    literal.prototype = heir(Program.prototype);

    Vector.prototype.toString = Vector.prototype.toWrittenString = function(){
      var filtered = this.elts.filter(function(e){return e!==undefined;}),
        last = filtered[filtered.length-1];
      return "#("+this.elts.map(function(elt){return elt===undefined? last : elt;})+")";
    }

    // quoted expression
    function quotedExpr(val) {
      Program.call(this);
      this.val = val;
      this.toString = function() {
        function quoteLikePairP(v) {
          return v instanceof Array
          && v.length === 2
          && v[0] instanceof symbolExpr
          && (    v[0].val === 'quasiquote'
            || v[0].val === 'quote'
              || v[0].val === 'unquote'
                || v[0].val === 'unquote-splicing'
             ) }
             function shortName(lexeme) {
               var s = lexeme.val
               return s === 'quasiquote' ? "`" :
                 s === 'quote' ? "'" :
                 s === 'unquote' ? "," :
                 s === 'unquote-splicing' ? ",@" :
                 (function () { throw "impossible quote-like string" })()
             }
             function elementToString(v) {
               if (quoteLikePairP(v)) {
                 return shortName(v[0]).concat(elementToString(v[1]))
               } else if (v instanceof Array) {
                 return v.reduce(function (acc, x) { return acc.concat(elementToString(x)) }, "(").concat(")")
               } else {
                 return v.toString()
               }
             }

             return "'"+elementToString(this.val)
      }
    };
    quotedExpr.prototype = heir(Program.prototype);

    // unquoted expression
    function unquotedExpr(val) {
      Program.call(this);
      this.val = val;
      this.toString = function(){ return ","+this.val.toString(); };
    };
    unquotedExpr.prototype = heir(Program.prototype);

    // quasiquoted expression
    function quasiquotedExpr(val) {
      Program.call(this);
      this.val = val;
      this.toString = function(){
        if(this.val instanceof Array) return "`("+this.val.toString()+")";
        else return "`"+this.val.toString();
      };
    };
    quasiquotedExpr.prototype = heir(Program.prototype);

    // unquote-splicing
    function unquoteSplice(val) {
      Program.call(this);
      this.val = val;
      this.toString = function(){ return ",@"+this.val.toString();};
    };
    unquoteSplice.prototype = heir(Program.prototype);

    // require expression
    function requireExpr(spec, stx) {
      Program.call(this);
      this.spec = spec;
      this.stx  = stx;
      this.toString = function(){ return "(require "+this.spec.toString()+")"; };
    };
    requireExpr.prototype = heir(Program.prototype);

    // provide expression
    function provideStatement(clauses, stx) {
      Program.call(this);
      this.clauses  = clauses;
      this.stx      = stx;
      this.toString = function(){ return "(provide "+this.clauses.toString()+")" };
    };
    provideStatement.prototype = heir(Program.prototype);

    // Unsupported structure (allows us to generate parser errors ahead of "unsupported" errors)
    function unsupportedExpr(val, errorMsg, errorSpan) {
      Program.call(this);
      this.val = val;
      this.errorMsg = errorMsg;
      this.errorSpan = errorSpan; // when throwing an error, we use a different span from the actual sexp span
      this.toString = function(){ return this.val.toString() };
    };
    unsupportedExpr.prototype = heir(Program.prototype);

    function isExpression(node){
      return !(   (node instanceof defVar)
        || (node instanceof defVars)
          || (node instanceof defStruct)
            || (node instanceof defFunc)
              || (node instanceof provideStatement)
                || (node instanceof unsupportedExpr)
                  || (node instanceof requireExpr));
    }

    function isDefinition(node){
      return (node instanceof defVar)
        || (node instanceof defVars)
          || (node instanceof defStruct)
            || (node instanceof defFunc);
    }

    /**************************************************************************
     *
     *    STRUCTURES NEEDED BY THE COMPILER
     *
     **************************************************************************/

    // moduleBinding: records an id and its associated JS implementation.
    function moduleBinding(name, bindings){
      this.name     = name;
      this.bindings = bindings;
    }

    // constantBinding: records an id and its associated JS implementation.
    function constantBinding(name, moduleSource, permissions, loc){
      this.name = name;
      this.moduleSource = moduleSource;
      this.permissions = permissions;
      this.loc = loc;
      this.toString = function(){return this.name;};
      return this;
    }

    // functionBinding: try to record more information about the toplevel-bound function
    function functionBinding(name, moduleSource, minArity, isVarArity, permissions, isCps, loc){
      this.name = name;
      this.moduleSource = moduleSource;
      this.minArity = minArity;
      this.isVarArity = isVarArity;
      this.permissions = permissions;
      this.isCps = isCps;
      this.loc = loc;
      this.toString = function(){return this.name;};
      return this;
    }

    // structBinding: A binding to a structure.
    // structBinding : symbol, ?, (listof symbol), symbol, symbol, (listof symbol) (listof symbol) (listof permission), location -> Binding
    function structBinding(name, moduleSource, fields, constructor,
                           predicate, accessors, mutators, permissions, loc){
                             this.name = name;
                             this.moduleSource = moduleSource;
                             this.fields = fields;
                             this.constructor = constructor;
                             this.predicate = predicate;
                             this.accessors = accessors;
                             this.mutators = mutators;
                             this.permissions = permissions;
                             this.loc = loc;
                             this.toString = function(){return this.name;};
                             return this;
                           }

                           var makeHash = types.makeLowLevelEqHash;
                           plt.compiler.keywords = ["cond", "else", "let", "case", "let*", "letrec", "quote",
                             "quasiquote", "unquote","unquote-splicing","local","begin",
                           "if","or","and","when","unless","lambda","λ","define",
                           "define-struct", "define-values"];

                           // ENVIRONMENT STRUCTS ////////////////////////////////////////////////////////////////
                           // Representation of the stack environment of the mzscheme vm, so we know where
                           // things live.
                           function env(bindings){
                             var that = this;
                             this.bindings = bindings || makeHash();

                             // lookup : Symbol -> (or/c binding false)
                             this.lookup = function(id){
                               return (this.bindings.containsKey(id))? this.bindings.get(id) : false;
                             };

                             // peek: Number -> env
                             this.peek = function(depth){
                               return (depth==0)?                  this
                                 :  (this instanceof emptyEnv)?  "IMPOSSIBLE - peeked at an emptyEnv!"
                                 /* else */                   : this.parent.peek(depth-1);
                             };

                             // contains?: symbol -> boolean
                             this.contains = function(name){
                               return this.lookup(name) !== false;
                             };

                             // keys : -> (listof symbol)
                             this.keys = this.bindings.keys;

                             // extend: binding -> env
                             this.extend = function(binding){
                               this.bindings.put(binding.name, binding);
                               return new plt.compiler.env(this.bindings);
                             };

                             // extendFunction : symbol (or/c string false) number boolean? Loc -> env
                             // Extends the environment with a new function binding
                             this.extendFunction = function(id, moduleSource, minArity, isVarArity, loc){
                               return this.extend(new functionBinding(id, moduleSource, minArity, isVarArity, [], false, loc));
                             };

                             // extendConstant : string (modulePath || false) Loc -> env
                             this.extendConstant = function(id, moduleSource, loc){
                               return this.extend(new constantBinding(id, moduleSource, [], loc));
                             };

                             // lookup_context: identifier -> (binding | false)
                             // Lookup an identifier, taking into account the context of the identifier.  If it has no existing
                             // context, look at the given env. In either case, either return a binding, or false.
                             this.lookup_context = function(id){
                               if(id.context instanceof env){
                                 return id.context.contains(id)? id.context.lookup(id) : false;
                               } else {
                                 return that.contains(id)? that.lookup(id) : false;
                               }
                             };

                             // traverse rthe bindings of the module
                             this.extendEnv_moduleBinding = function(module){
                               return module.bindings.reduceRight(function(env, binding){ return env.extend(binding);}, this);
                             };

                             this.toString = function(){
                               return this.bindings.values().reduce(function(s, b){
                                 return s+"\n  |---"+b.name;}, "");
                             };
                           }

                           // sub-classes of env
                           function emptyEnv(){
                             env.call(this);
                             this.lookup = function(name, depth){ return new plt.compiler.unboundStackReference(name); };
                           }
                           emptyEnv.prototype = heir(env.prototype);

                           function unnamedEnv(parent){
                             env.call(this);
                             this.parent = parent;
                             this.lookup = function(name, depth){ return this.parent.lookup(name, depth+1); };
                           }
                           unnamedEnv.prototype = heir(env.prototype);

                           function localEnv(name, boxed, parent){
                             env.call(this);
                             this.name   = name;
                             this.boxed  = boxed;
                             this.parent = parent;
                             this.lookup = function(name, depth){
                               return (name===this.name)? new plt.compiler.localStackReference(name, this.boxed, depth)
                                 : this.parent.lookup(name, depth+1);
                             };
                           }
                           localEnv.prototype = heir(env.prototype);

                           function globalEnv(names, boxed, parent){
                             env.call(this);
                             this.names  = names;
                             this.boxed  = boxed;
                             this.parent = parent;
                             var that = this;
                             this.lookup = function(name, depth){
                               var pos = this.names.indexOf(name);
                               return (pos > -1)? new plt.compiler.globalStackReference(name, depth, pos)
                                 : this.parent.lookup(name, depth+1);
                             };
                           }
                           globalEnv.prototype = heir(env.prototype);

                           // PINFO STRUCTS ////////////////////////////////////////////////////////////////
                           var defaultCurrentModulePath = "";

                           // default-module-resolver: symbol -> (module-binding | false)
                           // loop through known modules and see if we know this name
                           plt.compiler.defaultModuleResolver = function(name){
                             for(var i=0; i<plt.compiler.knownModules.length; i++){
                               if(plt.compiler.knownModules[i].name === name) return plt.compiler.knownModules[i];
                             }
                             return false;
                           }

                           // Compute the edit distance between the two given strings
                           // from http://en.wikibooks.org/wiki/Algorithm_Implementation/Strings/Levenshtein_distance
                           function levenshteinDistance(a, b) {
                             if(a.length === 0) return b.length;
                             if(b.length === 0) return a.length;

                             var matrix = [];

                             // increment along the first column of each row
                             for(var i = 0; i <= b.length; i++){ matrix[i] = [i]; }

                             // increment each column in the first row
                             for(var j = 0; j <= a.length; j++){ matrix[0][j] = j; }

                             // Fill in the rest of the matrix
                             for(i = 1; i <= b.length; i++){
                               for(j = 1; j <= a.length; j++){
                                 if(b.charAt(i-1) == a.charAt(j-1)){
                                   matrix[i][j] = matrix[i-1][j-1];
                                 } else {
                                   matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                                                           Math.min(matrix[i][j-1] + 1, // insertion
                                                                    matrix[i-1][j] + 1)); // deletion
                                 }
                               }
                             }
                             return matrix[b.length][a.length];
                           };

                           // moduleGuess: symbol -> symbol
                           // loop through known modules and make best suggestion for a given name
                           plt.compiler.moduleGuess = function(wrongName){
                             return plt.compiler.knownModules.reduce(function(best, module){
                               var dist = levenshteinDistance(module.name, wrongName);
                               return (dist < best.distance)? {name: module.name, distance: dist} : best;
                             }, {name: wrongName, distance: 5});
                           }

                           // default-module-path-resolver: module-path module-path -> module-name
                           // Provides a default module resolver.
                           plt.compiler.defaultModulePathResolver = function(path, parentPath){
                             /*    var name = (path instanceof symbolExpr)? path : modulePathJoin(parentPath, path)),
                                   moduleName = knownModules.reduceRight(function(name, km){
                                   return (km.source === modulePathJoin(parentPath, path))? km.name : name;}
                                   , name);
                                 */
                             // anything of the form wescheme/w+, or that has a known collection AND module
                             var parts = path.toString().split("/"),
                               collectionName = parts[0],
                               moduleName = parts.slice(1).join();
                             return ((plt.compiler.knownCollections.indexOf(collectionName) > -1)
                                     && plt.compiler.defaultModuleResolver(path.toString()))
                                       || /^wescheme\/\w+$/.exec(path);
                           }

                           // pinfo (program-info) is the "world" structure for the compilers;
                           // it captures the information we get from analyzing and compiling
                           // the program, and also maintains some auxillary structures.
                           function pinfo(env, modules, usedBindingsHash, freeVariables, gensymCounter,
                                          providedNames,definedNames, sharedExpressions,
                                          withLocationEmits, allowRedefinition,
                                          moduleResolver, modulePathResolver, currentModulePath,
                                          declaredPermissions){
                                            this.env = env || new emptyEnv();                       // env
                                            this.modules = modules || [];                           // (listof module-binding)
                                            this.usedBindingsHash = usedBindingsHash || makeHash(); // (hashof symbol binding)
                                            this.freeVariables = freeVariables || [];               // (listof symbol)
                                            this.gensymCounter = gensymCounter || 0;                // number
                                            this.providedNames = providedNames || makeHash();       // (hashof symbol provide-binding)
                                            this.definedNames  = definedNames  || makeHash();       // (hashof symbol binding)

                                            this.sharedExpressions = sharedExpressions || makeHash();// (hashof expression labeled-translation)
                                            // Maintains a mapping between expressions and a labeled translation.  Acts
                                            // as a symbol table to avoid duplicate construction of common literal values.

                                            this.withLocationEmits = withLocationEmits || true;     // boolean
                                            // If true, the compiler emits calls to plt.Kernel.setLastLoc to maintain
                                            // source position during evaluation.

                                            this.allowRedefinition = allowRedefinition || false;     // boolean
                                            // If true, redefinition of a value that's already defined will not raise an error.

                                            // For the module system.
                                            // (module-name -> (module-binding | false))
                                            this.moduleResolver = moduleResolver || plt.compiler.defaultModuleResolver;
                                            // (string module-path -> module-name)
                                            this.modulePathResolver = modulePathResolver || plt.compiler.defaultModulePathResolver;
                                            // module-path
                                            this.currentModulePath = currentModulePath || defaultCurrentModulePath;

                                            this.declaredPermissions = declaredPermissions || [];   // (listof (listof symbol any/c))

                                            /////////////////////////////////////////////////
                                            // functions for manipulating pinfo objects
                                            this.isRedefinition = function(name){ return this.env.lookup(name); };

                                            // usedBindings: -> (listof binding)
                                            // Returns the list of used bindings computed from the program analysis.
                                            this.usedBindings =  this.usedBindingsHash.values;

                                            this.accumulateDeclaredPermission = function(name, permission){
                                              this.declaredPermissions = [[name, permission]].concat(this.declaredPermissions);
                                              return this;
                                            };

                                            this.accumulateSharedExpression = function(expression, translation){
                                              var labeledTranslation = makeLabeledTranslation(this.gensymCounter, translation);
                                              this.sharedExpressions.put(labeledTranslation, expression);
                                              return this;
                                            };

                                            // accumulateDefinedBinding: binding loc -> pinfo
                                            // Adds a new defined binding to a pinfo's set.
                                            this.accumulateDefinedBinding = function(binding, loc){
                                              if(plt.compiler.keywords.indexOf(binding.name) > -1){
                                                throwError(new types.Message([new types.ColoredPart(binding.name, binding.loc),
                                                                             ": this is a reserved keyword and cannot be used"+
                                                                               " as a variable or function name"])
                   ,binding.loc);
                                              } else if(!this.allowRedefinition && this.isRedefinition(binding.name)){
                                                var prevBinding = this.env.lookup(binding.name);
                                                if(prevBinding.loc){
                                                  throwError(new types.Message([new types.ColoredPart(binding.name, binding.loc),
                                                                               ": this name has a ",
                                                                               new types.ColoredPart("previous definition", prevBinding.loc),
                                                                               " and cannot be re-defined"])
                     ,binding.loc);

                                                } else {
                                                  throwError(new types.Message([new types.ColoredPart(binding.name, binding.loc),
                                                                               ": this name has a ",
                                                                               "previous definition",
                                                                               " and cannot be re-defined"])
                     ,binding.loc);

                                                }
                                              } else {
                                                this.env.extend(binding);
                                                this.definedNames.put(binding.name, binding);
                                                return this;
                                              }
                                            };

                                            // accumulateBindings: (listof binding) Loc -> pinfo
                                            // Adds a list of defined bindings to the pinfo's set.
                                            this.accumulateDefinedBindings = function(bindings, loc){
                                              var that = this;
                                              bindings.forEach(function(b){that.accumulateDefinedBinding(b, loc);});
                                              return this;
                                            };

                                            // accumuldateModuleBindings: (listof binding) -> pinfo
                                            // Adds a list of module-imported bindings to the pinfo's known set of bindings, without
                                            // including them within the set of defined names.
                                            this.accumulateModuleBindings = function(bindings){
                                              var that = this;
                                              bindings.forEach(function(b){that.env.extend(b);});
                                              return this;
                                            };

                                            // accumulateModule: module-binding -> pinfo
                                            // Adds a module to the pinfo's set.
                                            this.accumulateModule = function(module){
                                              this.modules = [module].concat(this.modules);
                                              return this;
                                            };

                                            // accumulateBindingUse: binding -> pinfo
                                            // Adds a binding's use to a pinfo's set, if it has not already been used as a global
                                            // This qualifier allows a fn argument to shadow a global, without removing it from the environment
                                            this.accumulateBindingUse = function(binding){
                                              var alreadyExists = this.usedBindingsHash.get(binding.name);
                                              // if it's a module binding, don't replace it with a different kind of binding
                                              if(!(alreadyExists && alreadyExists.moduleSource)) this.usedBindingsHash.put(binding.name, binding);
                                              return this;
                                            };

                                            // accumulateFreeVariableUse: symbol -> pinfo
                                            // Mark a free variable usage.
                                            this.accumulateFreeVariableUse = function(sym){
                                              this.freeVariables = ((this.freeVariables.indexOf(sym) > -1)?
                                                                    this.freeVariables : [sym].concat(this.freeVariables));
                                              return this;
                                            };

                                            // gensym: symbol -> [pinfo, symbol]
                                            // Generates a unique symbol
                                            this.gensym = function(label){
                                              return [this, new symbolExpr(label+this.gensymCounter++)];
                                            };

                                            // permissions: -> (listof permission)
                                            // Given a pinfo, collect the list of permissions.
                                            this.permissions = function(){
                                              // onlyUnique : v, idx, arr -> arr with unique elts
                                              // from http://stackoverflow.com/questions/1960473/unique-values-in-an-array
                                              function onlyUnique(value, index, self) { return self.indexOf(value) === index; }
                                              // if it's a function or constant binding, add its permissions to the list
                                              function reducePermissions(permissions, b){
                                                return (((b instanceof functionBinding) || (b instanceof constantBinding))
                                                        && (b.permissions.length > 0))?
                                                          permissions.concat(b.permissions) : permissions;
                                              }
                                              return this.usedBindings().reduce(reducePermissions, []).filter(onlyUnique);
                                            }

                                            // getExposedBindings:  -> (listof binding)
                                            // Extract the list of the defined bindings that are exposed by provide.
                                            this.getExposedBindings = function(){
                                              var that = this;
                                              // lookupProvideBindingInDefinitionBindings: provide-binding compiled-program -> (listof binding)
                                              // Lookup the provided bindings.
                                              function lookupProvideBindingInDefinitionBindings(provideBinding){
                                                // if it's not defined, throw an error
                                                if(!that.definedNames.containsKey(provideBinding.symbl)){
                                                  throwError(new types.Message(["provided-name-not-defined: ", provideBinding.symbl]));
                                                }
                                                // if it IS defined, let's examine it and make sure it is what it claims to be
                                                var binding = checkBindingCompatibility(binding, that.definedNames.get(provideBinding.symbl));

                                                // ref: symbol -> binding
                                                // Lookup the binding, given the symbolic identifier.
                                                function ref(id){ return that.definedNames.get(id); }

                                                // if it's a struct provide, return a list containing the constructor and predicate,
                                                // along with all the accessor and mutator functions
                                                if(provideBinding instanceof plt.compiler.provideBindingStructId){
                                                  return [ref(binding.constructor), ref(binding.predicate)].concat(
                                                    binding.accessors.map(ref), binding.mutators.map(ref));
                                                } else {
                                                  return [binding];
                                                }
                                              }

                                              // decorateWithPermissions: binding -> binding
                                              // THIS IS A HACK according to Danny's original sources...not sure why
                                              function decorateWithPermissions(binding){
                                                var bindingEntry = function(entry){return entry[0]===binding.name;},
                                                  filteredPermissions = that.declaredPermissions.filter(bindingEntry);
                                                binding.permissions = filteredPermissions.map(function(p){return p[1];});
                                                return binding;
                                              }

                                              // Make sure that if the provide says "struct-out ...", that the exported binding
                                              // is really a structure.
                                              function checkBindingCompatibility(binding, exportedBinding){
                                                if(  (binding instanceof plt.compiler.provideBindingStructId)
                                                   && (!(exportedBinding instanceof structBinding))){
                                                     throwError(new types.Message(["provided-structure-not-structure: ", exportedBinding.symbl]));
                                                   } else {
                                                     return exportedBinding;
                                                   }
                                              }

                                              // for each provide binding, ensure it's defined and then decorate with permissions
                                              // concat all the permissions and bindings together, and return
                                              bindings = bindings.reduce(function(acc, b){ return acc.concat(lookupProvideBindingInDefinitionBindings(b)); }, []);
                                              return bindings.map(decorateWithPermissions);
                                            };

                                            this.toString = function(){
                                              var s = "pinfo-------------";
                                              s+= "\n**env****: "+this.env.toString();
                                              s+= "\n**modules**: "+this.modules.join(",");
                                              s+= "\n**used bindings**: "+this.usedBindings();
                                              s+= "\n**free variables**: "+this.freeVariables.join(",");
                                              s+= "\n**gensym counter**: "+this.gensymCounter;
                                              s+= "\n**provided names**: "+this.providedNames.values();
                                              s+= "\n**defined names**: "+this.definedNames.values();
                                              s+= "\n**permissions**: "+this.permissions();
                                              return s;
                                            };
                                          }

                                          // getBasePinfo: symbol -> pinfo
                                          // Returns a pinfo that knows the base definitions. Language can be one of the following:
                                          // 'base
                                          // 'moby
                                          function getBasePinfo(language){
                                            // fixme: use the language to limit what symbols get in the toplevel.
                                            var baseConstantsEnv = ["null", "empty", "true"//effect:do-nothing
                                              , "false", "eof", "pi", "e","js-undefined"
                                              , "js-null"].reduce(function(env, id){
                                            return env.extendConstant(id.toString(), '"moby/toplevel"', false)
                                              }, new emptyEnv());

                                              var pinfo = new plt.compiler.pinfo(),
                                                topLevelEnv = plt.compiler.topLevelModules.reduceRight(function(env, mod){
                                                return env.extendEnv_moduleBinding(mod);
                                              }, baseConstantsEnv);
                                              if(language === "moby"){
                                                pinfo.env = topLevelEnv.extendEnv_moduleBinding(mobyModuleBinding);
                                              } else if(language === "base"){
                                                pinfo.env = topLevelEnv;
                                              }
                                              return pinfo;
                                          }

                                          plt.compiler.throwError    = throwError;

                                          plt.compiler.Program       = Program;
                                          plt.compiler.couple        = couple;
                                          plt.compiler.defFunc       = defFunc;
                                          plt.compiler.defVar        = defVar;
                                          plt.compiler.defVars       = defVars;
                                          plt.compiler.defStruct     = defStruct;
                                          plt.compiler.beginExpr     = beginExpr;
                                          plt.compiler.lambdaExpr    = lambdaExpr;
                                          plt.compiler.localExpr     = localExpr;
                                          plt.compiler.letrecExpr    = letrecExpr;
                                          plt.compiler.letExpr       = letExpr;
                                          plt.compiler.letStarExpr   = letStarExpr;
                                          plt.compiler.condExpr      = condExpr;
                                          plt.compiler.caseExpr      = caseExpr;
                                          plt.compiler.andExpr       = andExpr;
                                          plt.compiler.orExpr        = orExpr;
                                          plt.compiler.callExpr      = callExpr;
                                          plt.compiler.ifExpr        = ifExpr;
                                          plt.compiler.whenUnlessExpr= whenUnlessExpr;
                                          plt.compiler.symbolExpr    = symbolExpr;
                                          plt.compiler.literal       = literal;
                                          plt.compiler.quotedExpr    = quotedExpr;
                                          plt.compiler.unquotedExpr  = unquotedExpr;
                                          plt.compiler.quasiquotedExpr=quasiquotedExpr;
                                          plt.compiler.unquoteSplice = unquoteSplice;
                                          plt.compiler.requireExpr   = requireExpr;
                                          plt.compiler.provideStatement = provideStatement;
                                          plt.compiler.unsupportedExpr= unsupportedExpr;

                                          plt.compiler.pinfo       = pinfo;
                                          plt.compiler.getBasePinfo= getBasePinfo;
                                          plt.compiler.isExpression= isExpression;
                                          plt.compiler.isDefinition= isDefinition;
                                          plt.compiler.env         = env;
                                          plt.compiler.emptyEnv    = emptyEnv;
                                          plt.compiler.localEnv    = localEnv;
                                          plt.compiler.globalEnv   = globalEnv;
                                          plt.compiler.moduleBinding  = moduleBinding;
                                          plt.compiler.functionBinding  = functionBinding;
                                          plt.compiler.constantBinding  = constantBinding;
                                          plt.compiler.structBinding  = structBinding;
                                          plt.compiler.unnamedEnv  = unnamedEnv;
  })();

  // Input 2

  /*

     Follows WeScheme's current implementation of Advanced Student
     http://docs.racket-lang.org/htdp-langs/advanced.html

     NOT SUPPORTED BY MOBY, WESCHEME, OR THIS COMPILER: define-datatype, begin0, set!, time, delay, shared, recur,
     match, check-member-of, check-range, (require planet), byetstrings (#"Apple"),
     regexps (#rx or #px), hashtables (#hash), graphs (#1=100 #1# #1#), #reader and #lang

     TODO
     - JSLint
     - convert Location structs to use those from the Pyret lexer
   */

  //////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////// LEXER OBJECT //////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  // Parse a program into SExps
  //
  // A SExp is either:
  // - Literal x Location
  // - symbolExpr x Location
  // - [ListOf SExp] x Location
  //
  // A Literal is either:
  // - types.<number>
  // - types.string
  // - types.char
  // - types.vector

  /////////////////////
  /*      Data       */
  /////////////////////

  (function () {
    'use strict';

    // import frequently-used bindings
    var literal         = plt.compiler.literal;
    var symbolExpr      = plt.compiler.symbolExpr;
    var unsupportedExpr = plt.compiler.unsupportedExpr;
    var throwError      = plt.compiler.throwError;

    // a collection of common RegExps
    var leftListDelims  = /[(\u005B\u007B]/,
      rightListDelims = /[)\u005D\u007D]/,
      matchUntilDelim = /^[^(\u005B\u007B)\u005D\u007D\s]+/,
      quotes          = /[\'`,]/,
      hex2            = new RegExp("^([0-9a-f]{1,2})", "i"),
      hex4            = new RegExp("^([0-9a-f]{1,4})", "i"),
      hex6            = new RegExp("^([0-9a-f]{1,6})", "i"),
      hex8            = new RegExp("^([0-9a-f]{1,8})", "i"),
      oct3            = new RegExp("^([0-7]{1,3})", "i");

    // the delimiters encountered so far, line and column, and case-sensitivity
    var delims, line, column, startCol, startRow, source, caseSensitiveSymbols, i;
    // UGLY HACK to track index if an error occurs. We should remove this if we can make i entirely stateful
    var endOfError;

    // the location struct
    // endCol and endRow are included for pyret error location
    var Location = function(startCol, startRow, startChar, span, theSource){
      this.startCol   = startCol;   // starting index into the line
      this.startRow   = startRow;   // starting line # (1-index)
      this.startChar  = startChar;  // ch index of lexeme start, from beginning
      this.span       = span;       // num chrs between lexeme start and end
      this.source     = theSource || source; // [OPTIONAL] id of the containing DOM element

      this.endCol     = column;     // ending index into the line
      this.endRow     = line;       // ending index into the line
      this.endChar    = startChar+span;      // ch index of lexeme end, from beginning

      this.start      = function(){ return new Location("", "", this.startChar, 1); };
      this.end        = function(){ return new Location("", "", this.startChar+this.span-1, 1); };
      this.toString   = function(){
        return "Loc("+this.startCol+", "+this.startRow+", "+(this.startChar+1)+","+this.span+")";
      };
      this.toVector = function(){
        return new types.vector(['"'+this.source+'"' // add quotes to the source, since it's a str (not a symbol)
                                ,this.startChar+1
                                ,this.startRow
                                ,this.startCol
                                ,this.span]);
      };
      this.toString = function(){
        return {line: this.startRow.toString(), id: this.source, span: this.span.toString(),
          offset: (this.startChar+1).toString(), column: this.startCol.toString()};
      };
    };

    /////////////////////
    /* Utility Methods */
    /////////////////////

    // some important string methods
    function isWhiteSpace(str) {
      return (/\s/).test(str);
    }

    // determines if a character string is in one of the three sets of delimiters
    function isDelim(x) {
      return x === '(' || x === ')'
        ||   x === '[' || x === ']'
          ||   x === '{' || x === '}';
    }

    // this is returned when a comment is read
    function Comment(txt) {this.txt = txt;}

    // determines if the character is valid as a part of a symbol
    function isValidSymbolCharP(x) {
      return !isDelim(x) && !isWhiteSpace(x)
      && x !== '"' && x !== ',' && x !== "'"
      && x !== '`' && x !== ';';
    }

    // determines if they are matching delimiter pairs
    // ie ( and ) [ and ] { and }
    function matchingDelims(x, y) {
      return (x === '(' && y === ')')
        ||   (x === '[' && y === ']')
          ||   (x === '{' && y === '}');
    }

    // gets the matching delim given the other delim in a pair
    function otherDelim(x) {
      return  x === '(' ? ')' :
        x === '[' ? ']' :
        x === '{' ? '}' :
        x === ')' ? '(' :
        x === ']' ? '[' :
        x === '}' ? '{' :
        /* else */ throwError(new types.Message(["otherDelim: Unknown delimiter: ", x]));
    }

    // reads through whitespace
    function chewWhiteSpace(str, i) {
      var p;
      if(i < str.length) {
        p = str.charAt(i);
        while (isWhiteSpace(p) && i < str.length) {
          // increment column/line counters
          if(p==="\n"){ line++; column = 0;}
          else { column++; }
          p = str.charAt(++i);
        }
      }
      return i;
    }

    //Array.prototype.toString = function () {return this.join(" "); };

    function sexpToString(sexp) {
      return (sexp instanceof Array)? "(" + sexp.map(sexpToString).join(" ") + ")"
        : sexp.toString();
    }

    /////////////////////
    /* Primary Methods */
    /////////////////////

    // readProg : String String -> SExp
    // reads multiple sexps encoded into this string and converts them to a SExp
    // datum
    function readProg(str, strSource) {
      var i = 0; startCol = column = 0; startRow = line = 1, // initialize all position indices
        caseSensitiveSymbols = true;                // initialize case sensitivity
      source = strSource || "<definitions>";
      var sexp, sexps = [];
      delims = [];
      // get rid of any whitespace at the start of the string
      i = chewWhiteSpace(str, 0);
      while(i < str.length) {
        sexp = readSExpByIndex(str, i);
        if(!(sexp instanceof Comment)) { sexps.push(sexp); }
        i = chewWhiteSpace(str, sexp.location.startChar+sexp.location.span);
      }
      sexps.location = new Location(startCol, startRow, 0, i, source);
      return sexps;
    }

    // readSSFile : String String -> SExp
    // removes the first three lines of the string that contain DrScheme meta data
    function readSSFile(str, strSource) {
      var i = 0; startCol = column = 0; startRow = line = 1, // initialize all position indices
        caseSensitiveSymbols = true;                // initialize case sensitivity
      source = strSource || "<definitions>";
      var crs = 0;

      while(i < str.length && crs < 3) {
        if(str.charAt(i++) === "\n") { crs++; }
      }

      var sexp, sexps = [];
      delims = [];
      while(i < str.length) {
        sexp = readSExpByIndex(str, i);
        if(!(sexp instanceof Comment)) { sexps.push(sexp); }
        i = chewWhiteSpace(str, sexp.location.startChar+sexp.location.span);
      }
      return sexps;
    }

    // readSExp : String String -> SExp
    // reads the first sexp encoded in this string and converts it to a SExp datum
    function readSExp(str, source) {
      delims = [];
      var sexp = readSExpByIndex(str, 0);
      return sexp instanceof Comment ? null : sexp;
    }

    // readSExpByIndex : String Number -> SExp
    // reads a sexp encoded as a string starting at the i'th character and converts
    // it to a SExp datum
    function readSExpByIndex(str, i) {
      startCol = column; startRow = line; var iStart = i;
      i = chewWhiteSpace(str, i);
      var p = str.charAt(i);
      if(i >= str.length) {
        endOfError = i; // remember where we are, so readList can pick up reading
        throwError(new types.Message([source , ":"
                                      , startRow.toString(), ":"
                                      , (startCol-1).toString()
                                      , ": read: (found end-of-file)"])
                   ,new Location(startCol-1, startRow, i-2, 2) // back up the startChar before #;, make the span include only those 2
                   ,"Error-GenericReadError");
      }
      var sexp = rightListDelims.test(p) ?
        throwError(new types.Message(["read: expected a ", otherDelim(p), " to open "
                                                , new types.ColoredPart(p, new Location(column, startRow, iStart, 1))])
                              ,new Location(column, startRow, iStart, 1)) :
                            leftListDelims.test(p) ? readList(str, i) :
                            p === '"'                  ? readString(str, i) :
                            p === '#'                  ? readPoundSExp(str, i) :
                            p === ';'                  ? readLineComment(str, i) :
                            quotes.test(p)             ? readQuote(str, i) :
                            /* else */                   readSymbolOrNumber(str, i);
                              return sexp;
    }

    // readList : String Number -> SExp
    // reads a list encoded in this string with the left delimiter at index i
    function readList(str, i) {
      var startCol=column, startRow=line, iStart=i, innerError=false,
        errorLocation = new Location(startCol, startRow, iStart, 1),
        openingDelim = str.charAt(i++),
        dot1Idx=false, dot2Idx = false; // indices of the dot operator
      column++; // move forward to count the closing delimeter
      var sexp, list = [];
      delims.push(openingDelim);
      i = chewWhiteSpace(str, i);

      // read a single list item
      // To allow optimization in v8, this function is broken out into its own (named) function
      // see http://www.html5rocks.com/en/tutorials/speed/v8/#toc-topic-compilation
      function readListItem(str, i, list){
        var sexp = readSExpByIndex(str, i);       // read the next s-exp
        i = sexp.location.end().startChar+1;         // move i to the character at the end of the sexp
        // if it's a dot, treat it as a cons
        if(sexp instanceof symbolExpr && sexp.val == '.'){
          if(dot2Idx){
            var msg = new types.Message(["A syntax list may have only 2 `.'s"]);
            throwError(msg, list[dot1Idx].location);
          }
          dot2Idx = dot1Idx? list.length : false; // if we've seen dot1, save this idx to dot2Idx
          dot1Idx = dot1Idx || list.length;       // if we haven't seen dot1, save this idx to dot1Idx
        }
        if(!(sexp instanceof Comment)){            // if it's not a comment, add it to the list
          sexp.parent = list;                     // set this list as it's parent
          list.push(sexp);                        // and add the sexp to the list
        }
        return i;
      }

      // if we have one dot, splice the element at that idx into the list
      // if we have two dots, move the element they surround to the front
      // throw errors for everything else
      function processDots(list, dot1Idx, dot2Idx){
        // if the dot is the first element in the list, throw an error
        if(dot1Idx === 0){
          var msg = new types.Message(["A `.' cannot be the first element in a syntax list"]);
          throwError(msg, list[dot1Idx].location);
        }
        // if a dot is the last element in the list, throw an error
        if(dot1Idx===(list.length-1) || dot2Idx===(list.length-1)){
          var msg = new types.Message(["A `.' cannot be the last element in a syntax list"]);
          throwError(msg, list[dot2Idx||dot1Idx].location);
        }

        // assuming they are legal, if there are two dots in legal places...
        if(dot2Idx){
          // if they are not surrounding a single element, throw an error
          if(dot2Idx - dot1Idx !== 2){
            var msg = new types.Message(["Two `.'s may only surround one syntax item"]);
            throwError(msg, list[dot2Idx].location);
            // if they are, move that element to the front of the list and remove the dots
          } else {
            return list.slice(dot1Idx+1,dot1Idx+2).concat(list.slice(0, dot1Idx), list.slice(dot2Idx+1));
          }
        }
        // okay, we know there's just one dot, so the next element had better be a list AND the last element of the outer list
        if(!(list[dot1Idx+1] instanceof Array)){
          var msg = new types.Message(["A `.' must be followed by a syntax list, but found "
            , new types.ColoredPart("something else", list[dot1Idx+1].location)])
          throwError(msg, list[dot1Idx+1].location);
        }
        if(list.length > dot1Idx+2){
          var msg = new types.Message(["A `.' followed by a syntax list must be followed by a closing delimeter, but found "
            , new types.ColoredPart("something else", list[dot1Idx+2].location)])
          throwError(msg, list[dot1Idx+1].location);
          // splice that element into the list, removing the dots
        } else {
          return list.slice(0,dot1Idx).concat(list[dot1Idx+1],list.slice(dot1Idx+2));
        }
      }

      // if we see an error while reading a listItem
      function handleError(e){
        // Some errors we throw immediately, without reading the rest of the list...
        if(/expected a .+ to (close|open)/.exec(e)   // brace or dot errors
          || /unexpected/.exec(e)                   // unexpected delimiter
            || /syntax list/.exec(e)                  // improper use of .
              || /bad syntax/.exec(e)                   // bad syntax
                || /bad character constant/.exec(e)       // bad character constant
          ){
            throw e;
          } else {
            // when we reconstruct the location from an error, we use Racket-style fieldnames, for historical reasons
            var eLoc = JSON.parse(JSON.parse(e)["structured-error"]).location;
            errorLocation = new Location(Number(eLoc.column), Number(eLoc.line),
                                         Number(eLoc.offset)-1, Number(eLoc.span));
            i = endOfError;// keep reading from the last error location
            innerError = e;
          }
          return i;
      }

      // read forward until we see a closing delim, saving the last known-good location
      while (i < str.length && !rightListDelims.test(str.charAt(i))) {
        // check for newlines
        if(str.charAt(i) === "\n"){ line++; column = 0;}
        try  { i = readListItem(str, i, list); }  // read a list item, hopefully without error
        catch (e){ var i = handleError(e);   }        // try to keep reading from endOfError...
        // move reader to the next token
        i = chewWhiteSpace(str, i);
      }
      // if we reached the end of an otherwise-successful list but there's no closing delim...
      if(i >= str.length) {
        var msg = new types.Message(["read: expected a ", otherDelim(openingDelim),
                                    " to close ",
        new types.ColoredPart(openingDelim.toString(),
                              new Location(startCol, startRow, iStart, 1))
        ]);
        // throw an error
        throwError(msg, errorLocation);
      }
      // if we reached the end of an otherwise-successful list and it's the wrong closing delim...
      if(!matchingDelims(openingDelim, str.charAt(i))) {
        var msg = new types.Message(["read: expected a ", otherDelim(openingDelim),
                                    " to close ",
        new types.ColoredPart(openingDelim.toString(),
                              new Location(startCol, startRow, iStart, 1)),
                              " but found a ",
                              new types.ColoredPart(str.charAt(i).toString(),
                                                    new Location(column, line, i, 1))
        ]);
        throwError(msg, new Location(column, line, i, 1));
      }

      column++; i++;  // move forward to count the closing delimeter
      // if an error occured within the list, set endOfError to the end, and throw it
      if(innerError){ endOfError = i; throw innerError; }

      // deal with dots, if they exist
      if(dot1Idx || dot2Idx) list = processDots(list, dot1Idx, dot2Idx);
      list.location = new Location(startCol, startRow, iStart, i-iStart);
      return list;
    }

    // readString : String Number -> SExp
    // reads a string encoded in this string with the leftmost quotation mark
    // at index i
    function readString(str, i) {
      var startCol = column, startRow = line, iStart = i;
      // greedily match to the end of the string, before examining escape sequences
      var closedString = /^\"[^\"]*(\\\"[^\"]*)*[^\\]\"|\"\"/.test(str.slice(i)),
        greedy = /^\"[^\"]*(\\"[^\"]*)*/.exec(str.slice(iStart))[0];
                            i++; column++; // skip over the opening quotation mark char
                              // it's a valid string, so let's make sure it's got proper escape sequences
                              var chr, datum = "";
                              while(i < str.length && str.charAt(i) !== '"') {
                                chr = str.charAt(i++);
                                // track line/char values while we scan
                                if(chr === "\n"){ line++; column = 0;}
                                else { column++; }
                                if(chr === '\\') {
                                  column++; // move the column forward to skip over the escape character
                                  chr = str.charAt(i++);
                                  if(i >= str.length) break; // if there's nothing there, break out
                                  switch(true){
                                    case /a/.test(chr)  : chr = '\u0007'; break;
                                    case /b/.test(chr)  : chr = '\b'; break;
                                    case /t/.test(chr)  : chr = '\t'; break;
                                    case /n/.test(chr)  : chr = '\n'; break;
                                    case /v/.test(chr)  : chr = '\v'; break;
                                    case /f/.test(chr)  : chr = '\f'; break;
                                    case /r/.test(chr)  : chr = '\r'; break;
                                    case /e/.test(chr)  : chr = '\u0027'; break;
                                    case /\n/.test(chr) : chr = '';   break; // newlines disappear
                                    case /[\"\'\\]/.test(chr)  : break;
                                    // if it's a charCode symbol, match with a regexp and move i forward
                                    case /[xuU]/.test(chr):
                                      var regexp = chr === "x"? hex2
                                        :chr === "u"? hex4
                                        /* else */   : hex8;
                                        if(!regexp.test(str.slice(i))){
                                          // remember where we are, so readList can pick up reading
                                          endOfError = iStart+greedy.length+1;
                                          throwError(new types.Message([source, ":" , startRow.toString(), ":", startCol.toString()
                                              , ": read: no hex digit following \\"+chr+" in string"])
                           , new Location(startCol, startRow, iStart, i-iStart+1)
                           , "Error-GenericReadError");
                                        }
                                        var match = regexp.exec(str.slice(i))[1];
                                        chr = String.fromCharCode(parseInt(match, 16));
                                        i += match.length; column += match.length;
                                        break;
                                        case oct3.test(str.slice(i-1)) :
                                          var match = oct3.exec(str.slice(i-1))[1];
                                        chr = String.fromCharCode(parseInt(match, 8));
                                        i += match.length-1; column += match.length-1;
                                        break;
                                        default   :
                                          // remember where we are, so readList can pick up reading
                                          endOfError = iStart+greedy.length+1;
                                        throwError(new types.Message([source, ":"
                                              , startRow.toString(), ":"
                                              , startCol.toString()
                                              , ": read: unknown escape sequence \\" +chr+" in string"])
                           , new Location(startCol, startRow, iStart, i-iStart)
                           , "Error-GenericReadError");
                                  }
                                }
                                datum += chr;
                              }

                              // if the next char after iStart+openquote+greedy isn't a closing quote, it's an unclosed string
                              if(!closedString) {
                                endOfError = iStart+greedy.length; // remember where we are, so readList can pick up reading
                                throwError(new types.Message([source, ":"
                                      , startRow.toString(), ":"
                                      , startCol.toString()
                                      , ": read: expected a closing \'\"\'"])
                   , new Location(startCol, startRow, iStart, 1)
                   , "Error-GenericReadError");
                              }
                              var strng = new literal(new types.string(datum));
                              i++; column++; // move forward to include the ending quote
                              strng.location = new Location(startCol, startRow, iStart, i-iStart);
                              return strng;
    }

    // readPoundSExp : String Number -> SExp
    // based on http://docs.racket-lang.org/reference/reader.html#%28part._default-readtable-dispatch%29
    // NOTE: bytestrings, regexps, hashtables, graphs, reader and lang extensions are not supported
    function readPoundSExp(str, i) {
      var startCol = column, startRow = line, iStart = i, datum;
      i++; column++; // skip over the pound sign
      // construct an unsupported error string
      var unsupportedError;

      // throwUnsupportedError : ErrorString token -> Error
      function throwUnsupportedError(errorStr, token){
        var msg = new types.Message([source, ":", line.toString()
          , ":", (column-1).toString()
          , errorStr]);
        throwError(msg
                   , new Location(startCol, startRow, iStart, token.length+1)
                   , "Error-GenericReadError");
      }

      if(i < str.length) {
        var p = str.charAt(i).toLowerCase();
        // fl and fx Vectors, structs, and hashtables are not supported
        var unsupportedMatch = new RegExp("^(((fl|fx|s|hash|hasheq)[\[\(\{])|((rx|px)\#{0,1}\"))", 'g'),
                                          unsupportedTest = unsupportedMatch.exec(str.slice(i));
        // Reader or Language Extensions are not allowed
        var badExtensionMatch = /^(!(?!\/)|reader|lang[\s]{0,1})/,
          badExtensionTest = badExtensionMatch.exec(str.slice(i));
        // Case sensitivity flags ARE allowed
        var caseSensitiveMatch = new RegExp("^(c|C)(i|I|s|S)"),
          caseSensitiveTest = caseSensitiveMatch.exec(str.slice(i));
        // Vector literals ARE allowed
        var vectorMatch = new RegExp("^([0-9]*)[\[\(\{]", 'g'),
                                     vectorTest = vectorMatch.exec(str.slice(i));
        if(unsupportedTest && unsupportedTest[0].length > 0){
          var sexp = readSExpByIndex(str, i+unsupportedTest[0].length-1),
            kind, span = unsupportedTest[0].length, // save different error strings and spans
            base = unsupportedTest[0].replace(/[\(\[\{\"|#\"]/g, '');
          switch(base){
            case "fl":    kind = "flvectors"; break;
            case "fx":    kind = "fxvectors"; break;
            case "s":     kind = "structs";   break;
            case "hash":
              case "hasheq":kind = "hashtables"; break;
            case "px":
              case "rx":    kind = "regular expressions"; break;
            default: throw "IMPOSSIBLE: unsupportedMatch captured something it shouldn't: "+base;
          }
          var error = new types.Message([source, ":", line.toString(), ":", "0"
            , ": read-syntax: literal "+ kind + " not allowed"]);
          datum = new unsupportedExpr(sexp, error, span);
          datum.location = new Location(startCol, startRow, iStart, unsupportedTest[0].length+sexp.location.span);
          return datum;
        } else if(badExtensionTest && badExtensionTest[0].length > 0){
          throwUnsupportedError(": read: #" + badExtensionTest[0].trim()
                                + " not enabled in the current context"
                                  , badExtensionTest[0]);
        } else if(caseSensitiveTest && caseSensitiveTest[0].length > 0){
          caseSensitiveSymbols = (caseSensitiveTest[0].toLowerCase() === "cs");
          i+=2; column+=2;
          return readSExpByIndex(str, i);
        } else if(vectorTest && vectorTest[0].length > 0){
          var size = (vectorTest[1])? parseInt(vectorTest[1]) : "",    // do we have a size string?
            sizeChars = size.toString().length;                     // how long is the size string?
          i+=sizeChars; column+=sizeChars           // start reading after the vectorsize was specified
          var elts = readList(str, i),
            len = size===""? elts.length : parseInt(vectorTest[1]);  // set the size to a number
          // test vector size
          if(elts.length > len){
            var msg = new types.Message(["read: vector length "+len+" is too small, ",
                                        elts.length+" value" + ((elts.length>1)? "s" : ""),
            " provided"]);
            throwError(msg, new Location(startCol, startRow, iStart, vectorTest[0].length));
          }

          i+=elts.location.span;
          datum = new literal(new Vector(len, elts));
          datum.location = new Location(startCol, startRow, iStart, i-iStart);
          return datum;
        } else {
          // match every valid (or *almost-valid*) sequence of characters, or the empty string
          var poundChunk = new RegExp("^(hasheq|hash|fl|fx|\\d+|[tfeibdox]|\\<\\<|[\\\\\\\"\\%\\:\\&\\|\\;\\!\\`\\,\\']|)", 'i'),
            chunk = poundChunk.exec(str.slice(i))[0],
            // match the next character
            nextChar = str.charAt(i+chunk.length);
          // grab the first non-whitespace character
          var p = chunk.charAt(0).toLowerCase();
          switch(p){
            // CHARACTERS
            case '\\': datum = readChar(str, i-1);
            i+= datum.location.span-1; break;
            // BYTE-STRINGS (unsupported)
            case '"': throwUnsupportedError(": byte strings are not supported in WeScheme", "#\"");
            // SYMBOLS
            case '%': datum = readSymbolOrNumber(str, i);
            datum.val = '#'+datum.val;
            i+= datum.location.span; break;
            // KEYWORDS (lex to a symbol, then strip out the contents)
            case ':': datum = readSymbolOrNumber(str, i-1);
            var error = new types.Message([source, ":", line.toString(), ":", "0"
              , ": read-syntax: Keyword internment is not supported in WeScheme"]);
            datum = new unsupportedExpr(datum.val, error, datum.location.span);
            i+= datum.val.length-1;
            break;
            // BOXES
            case '&': column++;
            sexp = readSExpByIndex(str, i+1);
            var boxCall = new symbolExpr("box"),
              datum = [boxCall, sexp];
            i+= sexp.location.span+1;
            boxCall.location = new Location(startCol, startRow, iStart, i-iStart);
            break;
            // BLOCK COMMENTS
            case '|': i--;
            datum = readBlockComment(str, i);
            i+= datum.location.span+1; break;
            // SEXP COMMENTS
            case ';': datum = readSExpComment(str, i+1);
            i+= datum.location.span+1; break;
            // LINE COMMENTS
            case '!': datum = readLineComment(str, i-1);
            i+= datum.location.span; break;
            // SYNTAX QUOTES, UNQUOTES, AND QUASIQUOTES
            case '`':
              case ',':
              case '\'': datum = readQuote(str, i);
            datum.location.startChar--; datum.location.span++; // expand the datum to include leading '#'
            endOfError = i+datum.location.span;
            var msg = new types.Message([source, ":", startRow.toString()
              , ":", (column-1).toString()
              , " read: WeScheme does not support the '#"+p+"' notation for "
              , (p===","? "unsyntax" : p==="'"? "syntax" : "quasisyntax")]);
            throwError(msg, datum.location);
            break;
            // STRINGS
            case '<<': datum = readString(str, i-1);
            i+= datum.location.span; break;
            // NUMBERS
            case 'e':  // exact
              case 'i':  // inexact
              case 'b':  // binary
              case 'o':  // octal
              case 'd':  // decimal
              case 'x':  // hexadecimal
              column--; //  back up the column one char
            datum = readSymbolOrNumber(str, i-1);
            i+= datum.location.span-1; break;
            // BOOLEANS
            case 't':  // true
              case 'f':  // false
              if(!matchUntilDelim.exec(nextChar)){ // if there's no other chars aside from space or delims...
              datum = new literal(p==='t');      // create a Boolean literal
              i++; column++;                     // move i/col ahead by the char
              break;
            }
            default:
              endOfError = i; // remember where we are, so readList can pick up reading
            var msg = new types.Message([source, ":", line.toString()
              , ":", (column-1).toString()
              , ": read: bad syntax `#", (chunk+nextChar),"'"]);
            throwError(msg
                        , new Location(startCol, startRow, iStart, (chunk+nextChar).length+1)
                        , "Error-GenericReadError");
          }
        }
        // only reached if # is the end of the string...
        } else {
          endOfError = i; // remember where we are, so readList can pick up reading
          throwError(new types.Message([source, ":", line.toString()
                                     , ":" , (column-1).toString()
                                     , ": read: bad syntax `#'"])
                  , new Location(startCol, startRow, iStart, i-iStart)
                  , "Error-GenericReadError");
        }
        datum.location = new Location(startCol, startRow, iStart, i-iStart);
        return datum;
        }

        // readChar : String Number -> types.char
        // reads a character encoded in the string and returns a representative datum
        // see http://docs.racket-lang.org/reference/reader.html#%28part._parse-character%29
        function readChar(str, i) {
          var startCol = column, startRow = line, iStart = i;
          i+=2;  column++; // skip over the #\\
          var datum = "", isFirstChar=true, regexp;

          // read until we hit the end of the string, another char, or whitespace when it's not the first char
          while(i < str.length && (str.slice(i,i+2) !== "#\\")
                && !(!isFirstChar && (isWhiteSpace(str.charAt(i)) || isDelim(str.charAt(i))) )) {
                  isFirstChar = false;
                  column++;
                  datum += str.charAt(i++);
                }

                // a special char is one of the following, as long as the next char is not alphabetic
                // unlike DrRacket, there is no JS equivalent for nul, null, page and rubout
                var special = new RegExp("(backspace|tab|newline|space|vtab)[^a-zA-Z]*", "i"),
                  match = special.exec(datum);
                // check for special chars
                if(special.test(datum)){
                  datum = datum === 'backspace'? '\b' :
                    datum === 'tab' ?     '\t' :
                    datum === 'newline' ? '\n' :
                    datum === 'space' ?   ' ' :
                    datum === 'vtab' ?    '\v' :
                    "Impossible: unknown special char was matched by special char!";
                  i = iStart + 2 + match[1].length; // set the reader to the end of the char

                  // octal charCodes
                } else if(/^[0-9].*/.test(datum)                       // if it starts with a number...
                                        && oct3.test(datum)                         // it had better have some octal digits..
                                      && (oct3.exec(datum)[0]===datum)            // in fact, all of them should be octal..
                                      && (parseInt(oct3.exec(datum)[0], 8) < 256) // and less than 256...
                                      && (parseInt(oct3.exec(datum)[0], 8) > 31)  // and greater than 31,
                         ) {
                           var match = /[0-7]+/.exec(datum)[0];
                           datum = String.fromCharCode(parseInt(match, 8));
                           i = iStart + 2 + match.length; // set the reader to the end of the char

                           // check for hex4 or hex6
                         } else if( /[uU]/.test(datum)                          // if it declares itself to be hexidecimal...
                                   && (regexp=datum.charAt(0)==="u"? hex4:hex6) // and we have a regexp for it...
                                 && regexp.test(datum.slice(1))               // and it's a valid hex code for that regexp...
                                  ){
                                    var match = regexp.exec(datum.slice(1))[0];
                                    column += (match.length-datum.length)+1; // adjust column if only a subset of the datum matched
                                    datum = String.fromCharCode(parseInt(match, 16));
                                    i = iStart + 3 + match.length; // fast-forward past (1) hash, (2) backslash, (3) u and (4) number
                                    // check for a single character, or a character that is NOT followed by a unicode-alphabetic character
                                  } else if (datum.length===1 || /[^\u00C0-\u1FFF\u2C00-\uD7FF\w]$/.test(datum.charAt(1))) {
                                    datum = datum.charAt(0);
                                    i = iStart + 3; // fast-forward past (1) hash, (2) backslash and (3) single char
                                  } else {
                                    throwError(new types.Message([source , ":" , startRow.toString(), ":", (startCol-1).toString(),
                                                                 ": read: bad character constant: #\\",datum]),
                                                                 new Location(startCol-1, startRow, iStart, i-iStart),
                                                                 "Error-GenericReadError");
                                  }
                                  var chr = new literal(new types['char'](datum));
                                  chr.location = new Location(startCol, startRow, iStart, i-iStart);
                                  return chr;
        }

        // readBlockComment : String Number -> Atom
        // reads a multiline comment
        function readBlockComment(str, i) {
          var startCol = column, startRow = line, iStart = i;
          i+=2; column+=2; // skip over the #|
          var txt = "";
          while(i+1 < str.length && !(str.charAt(i) === '|' && str.charAt(i+1) === '#')) {
            // check for newlines
            if(str.charAt(i) === "\n"){ line++; column = 0;}
            txt+=str.charAt(i);
            i++; column++;  // move ahead
          }
          if(i+1 >= str.length) {
            throwError(new types.Message(["read: Unexpected EOF when reading a multiline comment"])
                   ,new Location(startCol, startRow, iStart, i-iStart));
          }
          i++; column++; // hop over '|#'
          var comment = new Comment(txt);
          comment.location = new Location(startCol, startRow, iStart, i-iStart);
          return comment;
        }

        // readSExpComment : String Number -> Atom
        // reads exactly one SExp and ignores it entirely
        function readSExpComment(str, i) {
          var startCol = column++, startRow = line, iStart = i, nextSExp;
          // keep reading s-exprs while...
          while((i = chewWhiteSpace(str, i)) &&           // there's whitespace to chew
                (i+1<str.length) &&                         // we're not out of string
                  (nextSExp = readSExpByIndex(str, i)) &&   // there's an s-expr to be read
                    (nextSExp instanceof Comment)){            // and it's not a comment
            i = nextSExp.location.endChar;
          }

          // if we're done reading, make sure we didn't read past the end of the file
          if(i+1 >= str.length) {
            endOfError = i; // remember where we are, so readList can pick up reading
            throwError(new types.Message([source , ":" , startRow.toString(), ":", (startCol-1).toString()
                                      , ": read: expected a commented-out element for `#;' (found end-of-file)"])
                   ,new Location(startCol-1, startRow, i-2, 2) // back up the startChar before #;, make the span include only those 2
                   ,"Error-GenericReadError");
          }
          // if we're here, then we read a proper s-expr
          var atom = new Comment("("+nextSExp.toString()+")");
          i = nextSExp.location.endChar;
          atom.location = new Location(startCol, startRow, iStart, i-iStart);
          return atom;
        }

        // readLineComment : String Number -> Atom
        // reads a single line comment
        function readLineComment(str, i) {
          var startCol = column, startRow = line, iStart = i;
          i++; column++; // skip over the ;
          var txt = "";
          while(i < str.length && str.charAt(i) !== '\n') {
            // track column values while we scan
            txt+=str.charAt(i); column++; i++;
          }
          if(i > str.length) {
            endOfError = i; // remember where we are, so readList can pick up reading
            throwError(new types.Message(["read: Unexpected EOF when reading a line comment"]),
                       new Location(startCol, startRow, iStart, i-iStart));
          }
          var atom = new Comment(txt);
          atom.location = new Location(startCol, startRow, iStart, i+1-iStart);
          // at the end of the line, reset line/col values
          line++; column = 0;
          return atom;
        }

        // readQuote : String Number -> SExp
        // reads a quote, quasiquote, or unquote encoded as a string
        // NOT OPTIMIZED BY V8, due to presence of try/catch
        function readQuote(str, i) {
          var startCol = column, startRow = line, iStart = i, nextSExp;
          var p = str.charAt(i);
          var symbol = p == "'" ? new symbolExpr("quote") :
            p == "`" ? new symbolExpr("quasiquote") :
            /* else */  "";
          function eofError(i){
            endOfError = i+1; // remember where we are, so readList can pick up reading
            var action = p == "'" ? " quoting " :
              p == "`" ? " quasiquoting " :
              p == "," ? " unquoting " :
              p == ",@" ? " unquoting " :
              /* else */  "";
            throwError(new types.Message([source, ":", startRow.toString(), ":", startCol.toString()
                                      , ": read: expected an element for" + action, p
                                      , " (found end-of-file)"])
                   , new Location(startCol, startRow, iStart, p.length)
                   , "Error-GenericReadError");
          }
          if(i+1 >= str.length) { eofError(i); }
          i++; column++; // read forward one char
          if(p == ',') {
            if(str.charAt(i) == '@') {
              i++; column++; p+='@'; // read forward one char, and add @ to the option
              symbol = new symbolExpr("unquote-splicing");
            } else {
              symbol = new symbolExpr("unquote");
            }
          }

          symbol.location = new Location(column-1, startRow, iStart, i - iStart);

          // read the next non-comment sexp
          while(!nextSExp || (nextSExp instanceof Comment)){
            i = chewWhiteSpace(str, i);
            try{nextSExp = readSExpByIndex(str, i);}
            catch(e){
              // if it's the end of file, throw a special EOF for quoting
              if(/read\: \(found end-of-file\)/.test(e)) eofError(i);
              var unexpected = /expected a .* to open \",\"(.)\"/.exec(e);
              if(unexpected){
                endOfError = i+1; // remember where we are, so readList can pick up reading
                throwError(new types.Message([source, ":", line.toString(), ":", column.toString()
                                          , ": read: unexpected `" + unexpected[1] + "'"])
                       , new Location(column, line, i, 1)
                       , "Error-GenericReadError");
              }
              throw e;
            }
            i = nextSExp.location.end().startChar+1;
          }
          var quotedSexp = [symbol, nextSExp],
            quotedSpan = (nextSExp.location.end().startChar+1) - iStart;

          quotedSexp.location = new Location(startCol, startRow, iStart, quotedSpan);
          return quotedSexp;
        }

        // readSymbolOrNumber : String Number -> symbolExpr | types.Number
        // NOT OPTIMIZED BY V8, due to presence of try/catch
        function readSymbolOrNumber(str, i){
          var startCol = column, startRow = line, iStart = i;
          // match anything consisting of stuff between two |bars|, **OR**
          // non-whitespace characters that do not include:  ( ) { } [ ] , ' ` | \\ " ;
          var symOrNum = new RegExp("(\\|(.|\\n)*\\||\\\\(.|\\n)|[^\\(\\)\\{\\}\\[\\]\\,\\'\\`\\s\\\"\\;])+", 'mg');
          var chunk = symOrNum.exec(str.slice(i))[0];
          // if there's an unescaped backslash at the end, throw an error
          var trailingEscs = /\.*\\+$/.exec(chunk);
          if(trailingEscs && (trailingEscs[0].length%2 > 0)){
            i = str.length; // jump to the end of the string
            endOfError = i; // remember where we are, so readList can pick up reading
            throwError(new types.Message([source, ":", line.toString(), ":", startCol.toString(),
                                         ": read: EOF following `\\' in symbol"])
                       ,new Location(startCol, startRow, iStart, i-iStart)
                       ,"Error-GenericReadError");
          }
          // move the read head and column tracker forward
          i+=chunk.length; column+=chunk.length;

          // remove escapes
          var unescaped = "";
          for(var j=0; j < chunk.length; j++){
            if(chunk.charAt(j) == "\\") { j++; }  // if it's an escape char, skip over it and add the next one
            unescaped += chunk.charAt(j);
          }
          // split the chunk at each |
          var chunks = unescaped.split("|");
          // check for unbalanced |'s, and generate an error that begins at the last one
          // and extends for the remainder of the string
          if(((chunks.length%2) === 0)){
            endOfError = str.length;
            var sizeOfLastChunk = chunks[chunks.length-1].length+1, // add 1 for the starting '|'
              strBeforeLastChunk = chunk.slice(0, chunk.length-sizeOfLastChunk),
              lastVerbatimMarkerIndex = iStart+strBeforeLastChunk.length;
            // We need to go back and get more precise location information
            column = startCol;
            for(var j=0; j<strBeforeLastChunk.length; j++){
              if(str.charAt(i) === "\n"){line++; column = 0;}
              else { column++; }
            }
            throwError(new types.Message([source, ":", line.toString(), ":", column.toString(),
                                         ": read: unbalanced `|'"])
                      ,new Location(column, line, lastVerbatimMarkerIndex, str.length-lastVerbatimMarkerIndex)
                      ,"Error-GenericReadError");
          }

          // enforce case-sensitivity for non-verbatim sections.
          var filtered = chunks.reduce(function(acc, str, i){
            // if we're inside a verbatim portion (i is even) *or* we're case sensitive, preserve case
            return acc+= (i%2 || caseSensitiveSymbols)? str : str.toLowerCase();
          }, "");

          // if it's a newline, adjust line and column trackers
          if(filtered==="\n"){line++; column=0;}

          // add bars if it's a symbol that needs those escape characters, or if the original string used an escaped number
          var special_chars = new RegExp("^$|[\\(\\)\\{\\}\\[\\]\\,\\'\\`\\s\\\"\\\\]", 'g');
          var escaped_nums = new RegExp("^.*\\\\[\\d]*.*|\\|[\\d]*\\|");
          filtered = (escaped_nums.test(chunk) || special_chars.test(filtered)? "|"+filtered+"|" : filtered);

          // PERF: start out assuming it's a symbol...
          var node = new symbolExpr(filtered);
          // PERF: if it's not trivially a symbol, we take the hit of jsnums.fromSchemeString()
          if((chunks.length === 1) && !/^[a-zA-Z\-\?]+$/.test(filtered)){
            // attempt to parse using jsnums.fromSchemeString(), assign to sexp and add location
            // if it's a bad number, throw an error
            try{
              var numValue = jsnums.fromSchemeString(filtered, true);
              // If it's a number (don't interpret zero as 'false'), that's our node
              if(numValue || numValue === 0){
                if(numValue instanceof Object){
                  numValue.stx = filtered;
                  numValue.location = new Location(startCol, startRow, iStart, i-iStart);
                }
                node = new literal(numValue);
              }
              // if it's not a number OR a symbol
            } catch(e) {
              endOfError = i; // remember where we are, so readList can pick up reading
              var msg = new types.Message([source, ":", startRow.toString()
                , ":" , startCol.toString()
                , ": read: "+e.message]);
              throwError(msg
                       , new Location(startCol, startRow, iStart, i-iStart)
                       , "Error-GenericReadError");
            }
          }
          node.stx = filtered; // save the string that generated the symbol/number to begin with
          node.location = new Location(startCol, startRow, iStart, i-iStart);
          return node;
        }
        /////////////////////
        /* Export Bindings */
        /////////////////////
        plt.compiler.lex = function(str, strSource, debug){
          var start = new Date().getTime();
          try { var sexp      = readProg(str, strSource); }  // do the actual work
          catch(e) { console.log("LEXING ERROR"); throw e; }
          var end = new Date().getTime();
          if(debug){
            console.log("Lexed in "+(Math.floor(end-start))+"ms");
            console.log(sexp);
            console.log(sexpToString(sexp));
            //console.log("Lexing done");
          }
          return sexp;
        };
        plt.compiler.sexpToString = sexpToString;
      })();

      // Input 3

      /*

  //////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////// PARSER OBJECT //////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  Parser for http://docs.racket-lang.org/htdp-langs/intermediate-lam.html

       * Given an Array of SExps, produce an array of Programs or a structured error
       * see structures.js for Program Objects and Error throwing

       TODO
       - Perf: give location information to all AST nodes as constructor argument
       - JSLint
       */

      (function () {
        'use strict';

        // import frequently-used bindings
        var literal          = plt.compiler.literal;
        var symbolExpr       = plt.compiler.symbolExpr;
        var Program          = plt.compiler.Program;
        var couple           = plt.compiler.couple;
        var ifExpr           = plt.compiler.ifExpr;
        var beginExpr        = plt.compiler.beginExpr;
        var letExpr          = plt.compiler.letExpr;
        var letStarExpr      = plt.compiler.letStarExpr;
        var letrecExpr       = plt.compiler.letrecExpr;
        var localExpr        = plt.compiler.localExpr;
        var andExpr          = plt.compiler.andExpr;
        var orExpr           = plt.compiler.orExpr;
        var condExpr         = plt.compiler.condExpr;
        var caseExpr         = plt.compiler.caseExpr;
        var lambdaExpr       = plt.compiler.lambdaExpr;
        var quotedExpr       = plt.compiler.quotedExpr;
        var unquotedExpr     = plt.compiler.unquotedExpr;
        var quasiquotedExpr  = plt.compiler.quasiquotedExpr;
        var unquoteSplice    = plt.compiler.unquoteSplice;
        var callExpr         = plt.compiler.callExpr;
        var whenUnlessExpr   = plt.compiler.whenUnlessExpr;
        var defFunc          = plt.compiler.defFunc;
        var defVar           = plt.compiler.defVar;
        var defVars          = plt.compiler.defVars;
        var defStruct        = plt.compiler.defStruct;
        var requireExpr      = plt.compiler.requireExpr;
        var provideStatement = plt.compiler.provideStatement;
        var unsupportedExpr  = plt.compiler.unsupportedExpr;
        var throwError       = plt.compiler.throwError;

        //////////////////////////////////// UTILITY FUNCTIONS //////////////////////////////
        function isVector(x) { return types.isVector(x.val); }
        function isString(x) { return types.isString(x.val); }
        function isSymbol(x) { return x instanceof symbolExpr; }
        function isLiteral(x){ return x instanceof literal; }
        function isUnsupported(x){ return x instanceof unsupportedExpr;}

        // isSymbolEqualTo : symbolExpr symbolExpr -> Boolean
        // are these all symbols of the same value?
        function isSymbolEqualTo(x, y) {
          x = (x instanceof symbolExpr)? x.val : x;
          y = (y instanceof symbolExpr)? y.val : y;
          return x === y;
        }

        function isCons(x)  { return x instanceof Array && x.length>=1;}
        function rest(ls)   { return ls.slice(1); }

        // PARSING ///////////////////////////////////////////

        // parse* : sexp list -> Program list
        function parseStar(sexps) {
          function parseSExp(sexp) {
            return isDefinition(sexp) ? parseDefinition(sexp) :
              isExpr(sexp) ? parseExpr(sexp) :
              isRequire(sexp) ? parseRequire(sexp) :
              isProvide(sexp) ? parseProvide(sexp) :
              throwError(new types.Message(["Not a Definition, Expression, Library Require, or Provide"]),
                         sexp.location);
          }
          return sexps.map(parseSExp);
        }

        // parse : sexp list -> Program list
        function parse(sexp) {
          return (sexp.length === 0) ? [] :
            (!isCons(sexp)) ? throwError(new types.Message(["The sexp is not a list of definitions or expressions: "+sexp]),
                                         sexp.location):
                                           parseStar(sexp);
        }

        //////////////////////////////////////// DEFINITION PARSING ////////////////////////////////
        // (define-struct ...)
        function isStructDefinition(sexp) {
          return ((isCons(sexp)) && (isSymbol(sexp[0])) && (isSymbolEqualTo("define-struct", sexp[0])));
        }
        // (define ...)
        function isValueDefinition(sexp) {
          return (isCons(sexp) && isSymbol(sexp[0]) && isSymbolEqualTo("define", sexp[0]));
        }
        // (define-values ...)
        function isMultiValueDefinition(sexp) {
          return (isCons(sexp) && isSymbol(sexp[0]) && isSymbolEqualTo("define-values", sexp[0]));
        }
        // is it any kind of definition?
        function isDefinition(sexp) {
          return isStructDefinition(sexp) || isValueDefinition(sexp) || isMultiValueDefinition(sexp);
        }

        // : parseDefinition : SExp -> AST (definition)
        function parseDefinition(sexp) {
          function parseDefStruct(sexp) {
            // is it just (define-struct)?
            if(sexp.length < 2){
              throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                      , ": expected the structure name after define-struct, but nothing's there"])
                   , sexp.location);
            }
            // is the structure name there?
            if(!(sexp[1] instanceof symbolExpr)){
              throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                      , ": expected the structure name after define-struct, but found "
                                      , new types.ColoredPart("something else", sexp[1].location)])
                   , sexp.location);
            }
            // is it just (define-struct <name>)?
            if(sexp.length < 3){
              throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                      , ": expected at least one field name (in parentheses) after the "
                                      , new types.ColoredPart("structure name", sexp[1].location)
                                      , ", but nothing's there"])
                   , sexp.location);
            }
            // is the structure name followed by a list?
            if(!(sexp[2] instanceof Array)){
              throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                      , ": expected at least one field name (in parentheses) after the "
                                      , new types.ColoredPart("structure name", sexp[1].location)
                                      , ", but found "
                                      , new types.ColoredPart("something else", sexp[2].location)])
                   , sexp.location);
            }
            // is it a list of not-all-symbols?
            sexp[2].forEach(function(arg){
              if (!(arg instanceof symbolExpr)){
                throwError(new types.Message([new types.ColoredPart(sexp[0]. val,sexp[0].location)
                                      , ": expected a field name, but found "
                                      , new types.ColoredPart("something else", arg.location)])
                   , sexp.location);
              }
            });
            // too many expressions?
            if(sexp.length > 3){
              var extraLocs = sexp.slice(3).map(function(sexp){ return sexp.location; }),
                wording1 = (sexp[2].length === 1)? "field name" : "field names",
                wording2 = extraLocs.length+" extra "+((extraLocs.length === 1)? "part" : "parts");
              throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                      , ": expected nothing after the "
                                      , new types.ColoredPart(wording1, sexp[2].location)
                                      , ", but found "
                                      , new types.MultiPart(wording2, extraLocs, false)])
                     , sexp.location);
            }
            return new defStruct(parseIdExpr(sexp[1]), sexp[2].map(parseIdExpr), sexp);
          }
          function parseMultiDef(sexp){
            // is it just (define-values)?
            if(sexp.length < 2){
              throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                      , ": expects a list of variables and a body, but found neither"])
                     , sexp.location);
            }
            // is it just (define-values ... )?
            if(sexp.length < 3){
              throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                      , ": expects a list of variables and a body, but found only "
                                      , new types.ColoredPart("one part", sexp[1].location)])
                     , sexp.location);
            }
            // is it (define-values <not a list> )?
            if(!(sexp[1] instanceof Array)){
              throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                      , ": expects a list of variables and a body, but found "
                                      , new types.ColoredPart("something else", sexp[1].location)])
                     , sexp.location);
            }
            // too many parts?
            if(sexp.length > 3){
              var extraLocs = sexp.slice(3).map(function(sexp){ return sexp.location; }),
                wording = extraLocs.length+" extra "+((extraLocs.length === 1)? "part" : "parts"),
                msg = new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                , ": expects a list of variables and a body"
              + ", but found "
                , new types.MultiPart(wording, extraLocs, false)]);
              throwError(msg, sexp.location);
            }
            return new defVars(sexp[1].map(parseIdExpr), parseExpr(sexp[2]), sexp);
          }
          function parseDef(sexp) {
            // is it just (define)?
            if(sexp.length < 2){
              throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                      , ": expected a variable, or a function name and its variables "
                                    + "(in parentheses), after define, but nothing's there"])
                     , sexp.location);
            }
            // If it's (define (...)...)
            if(sexp[1] instanceof Array){
              // is there at least one element?
              if(sexp[1].length === 0){
                throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                      , ": expected a name for the function within "
                                      , new types.ColoredPart("the parentheses", sexp[1].location)])
                       , sexp.location);
              }
              // is the first element in the list a symbol?
              if(!(sexp[1][0] instanceof symbolExpr)){
                throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                      , ": expected a function name after the open parenthesis but found "
                                      , new types.ColoredPart("something else", sexp[1][0].location)])
                       , sexp.location);
              }
              // is the next element a list of not-all-symbols?
              sexp[1].forEach(function(arg){
                if (!(arg instanceof symbolExpr)){
                  throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                      , ": expected a variable but found "
                                      , new types.ColoredPart("something else", arg.location)])
                         , sexp.location);
                }
              });
              // is it just (define (<name> <args>))?
              if(sexp.length < 3){
                throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                            , ": expected an expression for the function body, but nothing's there"])
                         , sexp.location);
              }
              // too many parts?
              if(sexp.length > 3){
                var extraLocs = sexp.slice(3).map(function(sexp){ return sexp.location; }),
                  wording = extraLocs.length+" extra "+((extraLocs.length === 1)? "part" : "parts");
                throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                            , ": expected only one expression for the function body"
                                          + ", but found "
                                            , new types.MultiPart(wording, extraLocs, false)])
                         , sexp.location);
              }
              var args = rest(sexp[1]).map(parseIdExpr);
              args.location = sexp[1].location;
              return new defFunc(parseIdExpr(sexp[1][0]), args, parseExpr(sexp[2]), sexp);
            }
            // If it's (define x ...)
            if(sexp[1] instanceof symbolExpr){
              // is it just (define x)?
              if(sexp.length < 3){
                throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                            , ": expected an expression after the variable "
                                            , new types.ColoredPart(sexp[1].val, sexp[1].location)
                                            , " but nothing's there"])
                         , sexp.location);
              }
              // too many parts?
              if(sexp.length > 3){
                var extraLocs = sexp.slice(3).map(function(sexp){ return sexp.location; }),
                  wording = extraLocs.length+" extra "+((extraLocs.length === 1)? "part" : "parts");
                throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                            , ": expected only one expression after the variable "
                                            , new types.ColoredPart(sexp[1].val, sexp[1].location)
                                            , ", but found "
                                            , new types.MultiPart(wording, extraLocs, false)])
                         , sexp.location);
              }
              return new defVar(parseIdExpr(sexp[1]), parseExpr(sexp[2]), sexp);
            }
            // If it's (define <invalid> ...)
            throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                    , ": expected a variable but found "
                                    , new types.ColoredPart("something else", sexp[1].location)])
                         , sexp.location);
          }
          var def = isStructDefinition(sexp) ? parseDefStruct(sexp) :
            isValueDefinition(sexp)  ? parseDef(sexp) :
            isMultiValueDefinition   ? parseMultiDef(sexp) :
            throwError(new types.Message([": expected to find a definition, but found: "+ sexp]),
                       sexp.location);
                       def.location = sexp.location;
                       return def;
        }

        //////////////////////////////////////// EXPRESSION PARSING ////////////////////////////////
        function isExpr(sexp) {
          return ((!(isDefinition(sexp))) && (!(isRequire(sexp))) && (!(isProvide(sexp))));
        }

        function parseExpr(sexp) {
          return isCons(sexp) ? parseExprList(sexp) :
            parseExprSingleton(sexp);
        }

        // parseExprList : SExp -> AST
        // predicates and parsers for call, lambda, local, letrec, let, let*, if, and, or, quote and quasiquote exprs
        function parseExprList(sexp) {
          function parseFuncCall(sexp) {
            if(isSymbolEqualTo(sexp[0], "unquote")){
              throwError(new types.Message(["misuse of a comma or 'unquote, not under a quasiquoting backquote"])
                   , sexp.location
                   , "Error-GenericSyntacticError");
            }
            if(isSymbolEqualTo(sexp[0], "unquote-splicing")){
              throwError(new types.Message(["misuse of a ,@ or unquote-splicing, not under a quasiquoting backquote"])
                   , sexp.location
                   , "Error-GenericSyntacticError");
            }
            if(isSymbolEqualTo(sexp[0], "else")){
              throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp.location)
                                      , ": not allowed "
                                      , new types.ColoredPart("here", sexp.location)
                                      , ", because this is not a question in a clause"])
                   , sexp.location);
            }
            return isCons(sexp)? new callExpr(parseExpr(sexp[0]), rest(sexp).map(parseExpr), sexp[0]) :
              throwError(new types.Message(["function call sexp"]), sexp.location);
          }
          function parseLambdaExpr(sexp) {
            // is it just (lambda)?
            if(sexp.length === 1){
              throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                      , ": expected at least one variable (in parentheses) after lambda, but nothing's there"]),
                                    sexp.location);
            }
            // is it just (lambda <not-list>)?
            if(!(sexp[1] instanceof Array)){
              throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                      , ": expected at least one variable (in parentheses) after lambda, but found "
                                      , new types.ColoredPart("something else", sexp[1].location)]),
                                    sexp.location);
            }
            // is it a list of not-all-symbols?
            sexp[1].forEach(function(arg){
              if (!(arg instanceof symbolExpr)){
                var msg = new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                  , ": expected a list of variables after lambda, but found "
                  , new types.ColoredPart("something else", arg.location)]);
                throwError(msg, sexp.location);
              }
            });
            // is it just (lambda (x))?
            if(sexp.length === 2){
              throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                        , ": expected an expression for the function body, but nothing's there"]),
                                      sexp.location);
            }
            // too many expressions?
            if(sexp.length > 3){
              var extraLocs = sexp.slice(3).map(function(sexp){ return sexp.location; }),
                wording = extraLocs.length+" extra "+((extraLocs.length === 1)? "part" : "parts"),
                msg = new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                , ": expected only one expression for the function body, but found "
                , new types.MultiPart(wording, extraLocs, false)]);
              throwError(msg, sexp.location);
            }
            var args = sexp[1].map(parseIdExpr);
            args.location = sexp[1].location;
            return new lambdaExpr(args, parseExpr(sexp[2]), sexp[0]);
          }
          function parseLocalExpr(sexp) {
            // is it just (local)?
            if(sexp.length === 1){
              throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                        , ": expected at least one definition (in square brackets) after local,"
                                      + " but nothing's there"]),
                                      sexp.location);
            }
            // is it just (local <not-list>)?
            if(!(sexp[1] instanceof Array)){
              throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                        , ": expected a collection of definitions, but given "
                                        , new types.ColoredPart("something else", sexp[1].location)]),
                                      sexp[1].location);
            }
            // is it a list of not-all-definitions?
            sexp[1].forEach(function(def){
              if (!isDefinition(def)){
                throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                        , ": expected a definition, but given "
                                        , new types.ColoredPart("something else", def.location)]),
                                      def.location);
              }
            });
            // is it just (local [...defs...] ))?
            if(sexp.length === 2){
              throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                      , ": expected a single body, but found none"]),
                                    sexp.location);
            }
            // too many expressions?
            if(sexp.length > 3){
              var extraLocs = sexp.slice(3).map(function(sexp){ return sexp.location; }),
                wording = extraLocs.length+" extra "+((extraLocs.length === 1)? "part" : "parts");
              throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                      , ": expected a single body, but found "
                                      , new types.MultiPart(wording, extraLocs, false)]),
                                    sexp.location);
            }
            return new localExpr(sexp[1].map(parseDefinition), parseExpr(sexp[2]), sexp[0]);
          }
          function parseLetrecExpr(sexp) {
            // is it just (letrec)?
            if(sexp.length < 3){
              throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                      , ": expected an expression after the bindings, but nothing's there"]),
                                    sexp.location);
            }
            // is it just (letrec <not-list>)?
            if(!(sexp[1] instanceof Array)){
              throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                      , ": expected a key/value pair, but given "
                                      , new types.ColoredPart("something else", sexp[1].location)]),
                                    sexp.location);
            }
            // is it a list of not-all-bindings?
            sexp[1].forEach(function(binding){
              if (!sexpIsCouple(binding)){
                throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                        , ": expected a key/value pair, but given "
                                        , new types.ColoredPart("something else", binding.location)]),
                                      binding.location);
              }
            });
            // is it just (letrec (...bindings...) ))?
            if(sexp.length === 2){
              throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                      , ": expected an expression after the bindings, but nothing's there"]),
                                    sexp.location);
            }
            // too many expressions?
            if(sexp.length > 3){
              var extraLocs = sexp.slice(3).map(function(sexp){ return sexp.location; }),
                wording = extraLocs.length+" extra "+((extraLocs.length === 1)? "part" : "parts");
              throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                      , ": expected a single body, but found "
                                      , new types.MultiPart(wording, extraLocs, false)]),
                                    sexp.location);
            }
            return new letrecExpr(sexp[1].map(parseBinding), parseExpr(sexp[2]), sexp[0]);
          }
          function parseLetExpr(sexp) {
            // is it just (let)?
            if(sexp.length === 1){
              throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                      , ": expected at least one binding (in parentheses) after let, but nothing's there"]),
                                    sexp.location);
            }
            // is it just (let <not-list>)?
            if(!(sexp[1] instanceof Array)){
              throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                      , ": expected sequence of key value pairs, but given "
                                      , new types.ColoredPart("something else", sexp[1].location)]),
                                    sexp[1].location);
            }
            // is it a list of not-all-bindings?
            sexp[1].forEach(function(binding){
              if (!sexpIsCouple(binding)){
                throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                        , ": expected a key/value pair, but given "
                                      , new types.ColoredPart("something else", binding.location)]),
                                    binding.location);
              }
            });
            // too many expressions?
            if(sexp.length > 3){
              var extraLocs = sexp.slice(3).map(function(sexp){ return sexp.location; }),
                wording = extraLocs.length+" extra "+((extraLocs.length === 1)? "part" : "parts");
              throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                      , ": expected a single body, but found "
                                      , new types.MultiPart(wording, extraLocs, false)]),
                                    sexp.location);
            }
            // is it just (let (...bindings...) ))?
            if(sexp.length === 2){
              throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                      , ": expected a single body, but found none"]),
                                    sexp.location);
            }
            return new letExpr(sexp[1].map(parseBinding), parseExpr(sexp[2]), sexp);
          }
          function parseLetStarExpr(sexp) {
            // is it just (let*)?
            if(sexp.length === 1){
              throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                      , ": expected an expression after the bindings, but nothing's there"]),
                                    sexp.location);
            }
            // is it just (let* <not-list>)?
            if(!(sexp[1] instanceof Array)){
              var msg = new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                , ": expected sequence of key/value pairs, but given "
                , new types.ColoredPart("something else", sexp[1].location)]);
              throwError(msg, sexp.location);
            }
            // is it a list of not-all-bindings?
            sexp[1].forEach(function(binding){
              if (!sexpIsCouple(binding)){
                throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                      , ": expected a key/value pair, but given "
                                      , new types.ColoredPart("something else", binding.location)]),
                                    binding.location);
              }
            });
            // is it just (let* (...bindings...) ))?
            if(sexp.length === 2){
              throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                      , ": expected a single body, but found none"]),
                                    sexp.location);
            }
            // too many expressions?
            if(sexp.length > 3){
              var extraLocs = sexp.slice(3).map(function(sexp){ return sexp.location; }),
                wording = extraLocs.length+" extra "+((extraLocs.length === 1)? "part" : "parts");
              throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                      , ": expected a single body, but found "
                                      , new types.MultiPart(wording, extraLocs, false)]),
                                    sexp.location);
            }
            var bindings = sexp[1].map(parseBinding);
            bindings.location = sexp[1].location;
            return new letStarExpr(bindings, parseExpr(sexp[2]), sexp[0]);
          }
          function parseIfExpr(sexp) {
            // Does it have too few parts?
            if(sexp.length < 4){
              throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                      , ": expected a test, a consequence, and an alternative, but all three were not found"]),
                                    sexp.location);
            }
            // Does it have too many parts?
            if(sexp.length > 4){
              var extraLocs = sexp.slice(1).map(function(sexp){ return sexp.location; });
              throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                      , ": expected only a test, a consequence, and an alternative, "
                                      , "but found "
                                      , new types.MultiPart("more than three of these", extraLocs, false)]),
                                    sexp.location);
            }
            return new ifExpr(parseExpr(sexp[1]), parseExpr(sexp[2]), parseExpr(sexp[3]), sexp[0]);
          }
          function parseBeginExpr(sexp) {
            // is it just (begin)?
            if(sexp.length < 2){
              var msg = new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                , ": Inside a begin, expected to find a body, but nothing was found."]);
              throwError(msg, sexp.location);
            }
            return new beginExpr(rest(sexp).map(parseExpr), sexp[0]);
          }
          function parseAndExpr(sexp) {
            // and must have 2+ arguments
            if(sexp.length < 3){
              throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                      , ": expected at least 2 arguments, but given "
                                      , (sexp.length===1)? "0" : new types.ColoredPart((sexp.length-1).toString(),
                                    sexp[1].location)]),
                                    sexp.location);
            }
            return new andExpr(rest(sexp).map(parseExpr), sexp[0]);
          }
          function parseOrExpr(sexp) {
            // or must have 2+ arguments
            if(sexp.length < 3){
              throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                      , ": expected at least 2 arguments, but given "
                                      , (sexp.length===1)? "0" : new types.ColoredPart((sexp.length-1).toString(),
                                    sexp[1].location)]),
                                    sexp.location);
            }
            var orEx = new orExpr(rest(sexp).map(parseExpr), sexp[0]);
            return orEx;
          }
          function parseQuotedExpr(sexp) {

            function parseQuotedItem(sexp) {
              return isCons(sexp) ? sexp.map(parseQuotedItem)
                :  (sexp instanceof Array && sexp.length === 0)? sexp // the empty list is allowed inside quotes
                  : /* else */ parseExprSingleton(sexp);
            }
            // quote must have exactly one argument
            if(sexp.length < 2){
              throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                      , ": expected a single argument, but did not find one."]),
                                    sexp.location);
            }
            if(sexp.length > 2){
              var extraLocs = sexp.slice(1).map(function(sexp){ return sexp.location; });
              throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                      , ": expected a single argument, but found "
                                      , new types.MultiPart("more than one.", extraLocs, false)]),
                                    sexp.location);
            }
            return new quotedExpr(parseQuotedItem(sexp[1]));
          }

          return (function () {
            var peek = sexp[0];
            var expr = !(isSymbol(peek)) ? parseFuncCall(sexp) :
              isSymbolEqualTo("λ", peek)       ? parseLambdaExpr(sexp) :
              isSymbolEqualTo("lambda", peek)  ? parseLambdaExpr(sexp) :
              isSymbolEqualTo("local", peek)   ? parseLocalExpr(sexp) :
              isSymbolEqualTo("letrec", peek)  ? parseLetrecExpr(sexp) :
              isSymbolEqualTo("let", peek)     ? parseLetExpr(sexp) :
              isSymbolEqualTo("let*", peek)    ? parseLetStarExpr(sexp) :
              isSymbolEqualTo("cond", peek)    ? parseCondExpr(sexp) :
              isSymbolEqualTo("case", peek)    ? parseCaseExpr(sexp) :
              isSymbolEqualTo("if", peek)      ? parseIfExpr(sexp) :
              isSymbolEqualTo("begin", peek)   ? parseBeginExpr(sexp) :
              isSymbolEqualTo("and", peek)     ? parseAndExpr(sexp) :
              isSymbolEqualTo("or", peek)      ? parseOrExpr(sexp) :
              isSymbolEqualTo("when", peek)    ? parseWhenUnlessExpr(sexp) :
              isSymbolEqualTo("unless", peek)  ? parseWhenUnlessExpr(sexp) :
              isSymbolEqualTo("quote", peek)   ? parseQuotedExpr(sexp) :
              isSymbolEqualTo("quasiquote", peek)       ? parseQuasiQuotedExpr(sexp) :
              isSymbolEqualTo("unquote", peek)          ? parseUnquoteExpr(sexp) :
              isSymbolEqualTo("unquote-splicing", peek) ? parseUnquoteSplicingExpr(sexp) :
              parseFuncCall(sexp);
            expr.location = sexp.location;
            return expr;
          })();
        }

        function parseWhenUnlessExpr(sexp){
          // is it just (when)?
          if(sexp.length < 3){
            throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                      , ": expected at a test and at least one result after "+sexp[0]+", but nothing's there"]),
                                    sexp.location);
          }
          var exprs = sexp.slice(2), result = new whenUnlessExpr(parseExpr(sexp[1]), parse(exprs), sexp[0]);
          exprs.location = exprs[0].location; // FIXME: merge the locations
          result.location = sexp.location;
          return result;
        }

        function parseCondExpr(sexp) {
          // is it just (cond)?
          if(sexp.length === 1){
            throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                      , ": expected at least one clause after cond, but nothing's there"]),
                                    sexp.location);
          }
          var condLocs = [sexp[0].location, sexp.location.start(), sexp.location.end()];

          function isElseClause(couple){ return isSymbol(couple[0]) && isSymbolEqualTo(couple[0], "else"); }

          function checkCondCouple(clause) {
            var clauseLocations = [clause.location.start(), clause.location.end()];
            // is it (cond ...<not-a-clause>..)?
            if(!(clause instanceof Array)){
              throwError(new types.Message([new types.MultiPart(sexp[0].val, condLocs, true)
                                      , ": expected a clause with a question and an answer, but found "
                                      , new types.ColoredPart("something else", clause.location)]),
                                    clause.location);
            }
            if(clause.length === 0){
              throwError(new types.Message([new types.MultiPart(sexp[0].val, condLocs, true)
                                      , ": expected a clause with a question and an answer, but found an "
                                      , new types.MultiPart("empty part", clauseLocations, true)]),
                                    clause.location);
            }
            if(clause.length === 1){
              throwError(new types.Message([new types.MultiPart(sexp[0].val, condLocs, true)
                                      , ": expected a clause with a question and an answer, but found a "
                                      , new types.MultiPart("clause", clauseLocations, true)
                                      , " with only "
                                      , new types.MultiPart("one part", [clause[0].location], false)]),
                                    clause.location);
            }
            if(clause.length > 2){
              var extraLocs = clause.map(function(sexp){ return sexp.location; }),
                wording = extraLocs.length+" parts";
              throwError(new types.Message([new types.MultiPart(sexp[0].val, condLocs, true)
                                      , ": expected a clause with a question and an answer, but found "
                                      , new types.MultiPart("a clause", clauseLocations, true)
                                      , " with "
                                      , new types.MultiPart(wording, extraLocs, false)]),
                                    clause.location);
            }
          }

          function parseCondCouple(clause) {
            var test = parseExpr(clause[0]), result = parseExpr(clause[1]), cpl = new couple(test, result);
            // the only un-parenthesized keyword allowed in the first slot is 'else'
            if((plt.compiler.keywords.indexOf(test.val) > -1) && (test.val !== "else")){
              throwError(new types.Message([new types.ColoredPart(test.val, test.location)
                                        , ": expected an open parenthesis before "
                                        , test.val
                                        , ", but found none"]),
                                      test.location);
            }
            test.isClause = true; // used to determine appropriate "else" use during desugaring
            cpl.location = clause.location;
            return cpl;
          }

          // first check the couples, then parse if there's no problem
          rest(sexp).forEach(checkCondCouple);
          var numClauses = rest(sexp).length,
            parsedClauses = rest(sexp).map(parseCondCouple);
          // if we see an else and we haven't seen all other clauses first
          // throw an error that points to the next clause (rst + the one we're looking at + "cond")
          rest(sexp).forEach(function(couple, idx){
            if(isElseClause(couple) && (idx < (numClauses-1))){
              throwError(new types.Message([new types.MultiPart("cond", condLocs, true)
                                     , ": ", "found an "
                                     , new types.ColoredPart("else clause", couple.location)
                                     , " that isn't the last clause in its cond expression; there is "
                                     , new types.ColoredPart("another clause", sexp[idx+2].location)
                                     , " after it"]),
                                   couple.location);
            }
          });
          return new condExpr(parsedClauses, sexp[0]);
        }

        function parseCaseExpr(sexp) {
          // is it just (case)?
          if(sexp.length === 1){
            var msg = new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
              , ": expected at least one clause after case, but nothing's there"]);
            throwError(msg, sexp.location);
          }
          var caseLocs = [sexp[0].location, sexp.location.start(), sexp.location.end()];
          if(sexp.length === 2){
            var msg = new types.Message([new types.MultiPart(sexp[0].val, caseLocs, true)
              , ": expected a clause with at least one choice (in parentheses)"
            + " and an answer after the expression, but nothing's there"]);
            throwError(msg, sexp.location);
          }

          function checkCaseCouple(clause) {
            var clauseLocations = [clause.location.start(), clause.location.end()];
            if(!(clause instanceof Array)){
              var msg = new types.Message([new types.MultiPart(sexp[0].val, caseLocs, true)
                , ": expected a clause with at least one choice (in parentheses), but found "
                , new types.ColoredPart("something else", clause.location)]);
              throwError(msg, sexp.location);
            }
            if(clause.length === 0){
              var msg = new types.Message([new types.MultiPart(sexp[0].val, caseLocs, true)
                , ": expected at least one choice (in parentheses) and an answer, but found an "
                , new types.ColoredPart("empty part", clause.location)]);
              throwError(msg, sexp.location);
            }
            if(!( (clause[0] instanceof Array) ||
                 ((clause[0] instanceof symbolExpr) && isSymbolEqualTo(clause[0], "else")))){
              var msg = new types.Message([new types.MultiPart(sexp[0].val, caseLocs, true)
                , ": expected 'else', or at least one choice in parentheses, but found "
                , new types.ColoredPart("something else", clause.location)]);
              throwError(msg, sexp.location);
            }
            if(clause.length === 1){
              var msg = new types.Message([new types.MultiPart(sexp[0].val, caseLocs, true)
                , ": expected a clause with a question and an answer, but found a "
                , new types.MultiPart("clause", clauseLocations, true)
                , " with only "
                , new types.ColoredPart("one part", clause[0].location)]);
              throwError(msg, sexp.location);
            }
            if(clause.length > 2){
              var extraLocs = clause.map(function(sexp){ return sexp.location; }),
                wording = extraLocs.length+" parts",
                msg = new types.Message([new types.MultiPart(sexp[0].val, caseLocs, true)
                , ": expected only one expression for the answer in the case clause, but found a "
                , new types.MultiPart("clause", clauseLocations, true)
                , " with "
                , new types.MultiPart(wording, extraLocs, false)]);
              throwError(msg, sexp.location);
            }
          }

          // is this sexp actually an else clause?
          function isElseClause(sexp){ return isSymbol(sexp[0]) && (sexp[0].val==="else");}

          // read the first item in the clause as a quotedExpr, and parse the second
          // if it's an else clause, however, leave it alone
          function parseCaseCouple(sexp) {
            var test = isElseClause(sexp)? sexp[0] : new quotedExpr(sexp[0]),
              result = parseExpr(sexp[1]), cpl = new couple(test, result);
            test.isClause = true; // used to determine appropriate "else" use during desugaring
            cpl.location = sexp.location;
            return cpl;
          }

          var clauses = sexp.slice(2);
          // first check the couples, then parse if there's no problem
          clauses.forEach(checkCaseCouple);
          var numClauses = clauses.length,
            parsedClauses = clauses.map(parseCaseCouple);

          // if we see an else and we haven't seen all other clauses first
          // throw an error that points to the next clause (rst + the one we're looking at + "cond")
          clauses.forEach(function(couple, idx){
            if(isElseClause(couple) && (idx < (numClauses-1))){
              var msg = new types.Message([new types.MultiPart("case", caseLocs, true)
                , ": found an "
                , new types.ColoredPart("else clause", couple.location)
                , "that isn't the last clause in its case expression; there is "
                , new types.ColoredPart("another clause", sexp[idx+2].location)
                , " after it"]);
              throwError(msg, sexp.location);
            }
          });
          return new caseExpr(parseExpr(sexp[1]), parsedClauses, sexp[0]);
        }

        function parseBinding(sexp) {
          if(sexpIsCouple(sexp)){
            var binding = new couple(parseIdExpr(sexp[0]), parseExpr(sexp[1]));
            binding.location = sexp.location;
            binding.stx = sexp;
            return binding;
          } else {
            throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                      , ": expected a sequence of key/value pairs, but given "
                                      , new types.ColoredPart("something else", sexp[0].location)]),
                                    sexp.location);
          }
        }

        function parseUnquoteExpr(sexp, depth) {
          if (typeof depth === 'undefined') {
            throwError( new types.Message(["misuse of a comma or 'unquote, not under a quasiquoting backquote"])
                , sexp.location
                , "Error-GenericSyntacticError");
          } else if((sexp.length !== 2)){
            throwError( new types.Message(["Inside an unquote, expected to find a single argument, but found "+(sexp.length-1)])
               , sexp.location);
          } else if (depth === 1) {
            var result = new unquotedExpr(parseExpr(sexp[1]))
            result.location = sexp[1].location
            return result;
          } else if (depth > 1) {
            var result = new unquotedExpr(parseQuasiQuotedItem(sexp[1], depth-1))
            result.location = sexp[1].location
            return result;
          } else {
            throwError( new types.Message(["ASSERTION FAILURE: depth should have been undefined, or a natural number"])
               , sexp.location);
          }
        }

        function parseUnquoteSplicingExpr(sexp, depth) {
          if (typeof depth === 'undefined') {
            throwError( new types.Message(["misuse of a ,@ or unquote-splicing, not under a quasiquoting backquote"])
                , sexp.location
                , "Error-GenericSyntacticError");
          } else if((sexp.length !== 2)){
            throwError(new types.Message(["Inside an unquote-splicing, expected to find a single argument, but found "+(sexp.length-1)])
                 , sexp.location);
          } else if (depth === 1) {
            var result =  new unquoteSplice(parseExpr(sexp[1]))
            result.location = sexp[1].location
            return result;
          } else if (depth > 1) {
            var result =  new unquoteSplice(parseQuasiQuotedItem(sexp[1], depth-1))
            result.location = sexp[1].location
            return result;
          } else {
            throwError( new types.Message(["ASSERTION FAILURE: depth should have been undefined, or a natural number"])
               , sexp.location);
          }
        }

        /* This is what we use in place of `parseExpr` when we're in "data-mode",  */
        /* i.e. there's an active quasiquote. Active is a bit awkward to describe, */
        /* but basically it's an unmatch quasiquote, if we think of unquotes as    */
        /* matching quasiquotes, so:                                               */
        /*   ``,(+ 1 2)                                                            */
        /* has an active quasiquote while reading (+ 1 2), whereas:                */
        /*   ``,,(+ 1 2)                                                           */
        /* does not.                                                               */
        function parseQuasiQuotedItem(sexp, depth) {
          if (isCons(sexp) && sexp[0].val === 'unquote'){
            return parseUnquoteExpr(sexp, depth);
          } else if(isCons(sexp) && sexp[0].val === 'unquote-splicing'){
            return parseUnquoteSplicingExpr(sexp, depth);
          } else if(isCons(sexp) && sexp[0].val === 'quasiquote'){
            return parseQuasiQuotedExpr(sexp, depth);
          } else if(isCons(sexp)){
            var res = sexp.map(function (x) {return parseQuasiQuotedItem(x, depth)});
            res.location = sexp.location;
            return res;
          } else if( depth === 0){
            return parseExpr(sexp);
          } else {
            return (function () {
              var res = new quotedExpr(sexp);
              res.location=sexp.location;
              return res;})()
          }

        }

        function parseQuasiQuotedExpr(sexp, depth) {
          depth = (typeof depth === 'undefined') ? 0 : depth;
          // quasiquote must have exactly one argument
          if(sexp.length < 2){
            throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                    , ": expected a single argument, but did not find one "]),
                                  sexp.location);
          }
          if(sexp.length > 2){
            var extraLocs = sexp.slice(1).map(function(sexp){ return sexp.location; });
            throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                    , ": expected a single argument, but found "
                                    , new types.MultiPart("more than one.", extraLocs, false)]),
                                  sexp.location);
          }
          // if the argument is (unquote-splicing....), throw an error
          if(isCons(sexp[1]) && isSymbolEqualTo(sexp[1][0], "unquote-splicing")){
            throwError(new types.Message(["misuse of ,@ or `unquote-splicing' within a quasiquoting backquote"]), sexp.location);
          }

          var quoted = parseQuasiQuotedItem(sexp[1], depth+1);
          quoted.location = sexp[1].location;
          var result = new quasiquotedExpr(quoted);
          result.location = sexp.location;
          return result;
        }

        // replace all undefineds with the last sexp, and convert to a function call
        function parseVector(sexp){
          function buildZero(){
            var lit = new literal(0);
            lit.location = sexp.location;
            return lit;
          }
          var unParsedVector = sexp.val,
            vals = parseStar(unParsedVector.elts.filter(function(e){return e!==undefined;})),
            last = (vals.length===0)? buildZero() : vals[vals.length-1], // if they're all undefined, use 0
            elts = unParsedVector.elts.map(function(v){return (v===undefined)? last : parseExpr(v);});
          var vectorFunc = new symbolExpr("vector"),
            buildVector = new callExpr(vectorFunc, elts);
          vectorFunc.location = buildVector.location = sexp.location;
          return buildVector;
        }

        function parseExprSingleton(sexp) {
          var singleton = isUnsupported(sexp) ? sexp :
            isVector(sexp)  ? parseVector(sexp) :
            isSymbol(sexp) ? sexp :
            isLiteral(sexp) ? sexp :
            isSymbolEqualTo("quote", sexp) ? new quotedExpr(sexp) :
            isSymbolEqualTo("empty", sexp) ? new callExpr(new symbolExpr("list"), []) :
            throwError(new types.Message([new types.ColoredPart("( )", sexp.location)
                                    , ": expected a function, but nothing's there"])
                 , sexp.location);
               singleton.location = sexp.location;
               return singleton;
        }

        function parseIdExpr(sexp) {
          return isSymbol(sexp) ? sexp :
            throwError(new types.Message(["ID"]), sexp.location);
        }

        function isTupleStartingWithOfLength(sexp, symbol, n) {
          return ((isCons(sexp)) && (sexp.length === n) && (isSymbol(sexp[0])) && (isSymbolEqualTo(sexp[0], symbol)));
        }

        function sexpIsCouple(sexp) {
          return ((isCons(sexp)) && ((sexp.length === 2)));
        }

        function sexpIsCondListP(sexp) {
          return ((isCons(sexp)) && (sexp.length >= 2) && (isSymbol(sexp[0])) && (isSymbolEqualTo(sexp[0], "cond")));
        }

        //////////////////////////////////////// REQUIRE PARSING ////////////////////////////////
        function isRequire(sexp) {
          return isCons(sexp) && isSymbol(sexp[0]) && isSymbolEqualTo(sexp[0], "require");
        }

        function parseRequire(sexp) {
          // is it (require)?
          if(sexp.length < 2){
            var msg = new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
              , ": expected a module name after `require', but found nothing"]);
            throwError(msg, sexp.location);
          }
          // if it's (require (lib...))
          if((sexp[1] instanceof Array) && isSymbolEqualTo(sexp[1][0], "lib")){
            // is it (require (lib)) or (require (lib <string>))
            if(sexp[1].length < 3){
              var partsNum = sexp[1].slice(1).length,
                partsStr = partsNum + ((partsNum===1)? " part" : " parts"),
                msg = new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                , ": expected at least two strings after "
                , new types.ColoredPart("lib", sexp[1][0].location)
                , " but found only "
                , partsStr]);
              throwError(msg, sexp.location);
            }
            // is it (require (lib not-strings))?
            rest(sexp[1]).forEach(function(lit){
              if (!(isString(lit))){
                var msg = new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                  , ": expected a string for a library collection, but found "
                  , new types.ColoredPart("something else", str.location)]);
                throwError(msg, sexp.location);
              }
            });
            // if it's (require (planet...))
          } else if((sexp[1] instanceof Array) && isSymbolEqualTo(sexp[1][0], "planet")){
            var msg = new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
              , ": Importing PLaneT pacakges is not supported at this time"]);
            throwError(msg, sexp.location);
            // if it's (require <not-a-string-or-symbol>)
          } else if(!((sexp[1] instanceof symbolExpr) || isString(sexp[1]))){
            var msg = new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
              , ": expected a module name as a string or a `(lib ...)' form, but found "
              , new types.ColoredPart("something else", sexp[1].location)]);
            throwError(msg, sexp.location);
          }
          var req = new requireExpr(sexp[1], sexp[0]);
          req.location = sexp.location;
          return req;
        }

        //////////////////////////////////////// PROVIDE PARSING ////////////////////////////////
        function isProvide(sexp) {
          return isCons(sexp) && isSymbol(sexp[0]) && isSymbolEqualTo(sexp[0], "provide");
        }
        function parseProvide(sexp) {
          var clauses = rest(sexp).map(function(p){
            // symbols are ok
            if(p instanceof symbolExpr){ return p;}
            // (struct-out sym) is ok
            if((p instanceof Array) && (p.length == 2)
               && (p[0] instanceof symbolExpr) && isSymbolEqualTo(p[0], "struct-out")
             && (p[1] instanceof symbolExpr)){
               return p;
             }
             // everything else is NOT okay
             var msg = new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
               , ": I don't recognize the syntax of this "
               , new types.ColoredPart("clause", p.location)]);
             throwError(msg, sexp.location);
          });
          var provide = new provideStatement(clauses, sexp[0]);
          provide.location = sexp.location;
          return provide;
        }

        /////////////////////
        /* Export Bindings */
        /////////////////////
        plt.compiler.parse = function(sexp, debug){
          var start = new Date().getTime();
          try{ var AST = parse(sexp); AST.location = sexp.location; }   // do the actual work
          catch(e) { console.log("PARSING ERROR"); throw e; }
          var end = new Date().getTime();
          if(debug){
            console.log("Parsed in "+(Math.floor(end-start))+"ms");
            console.log(AST);
          }
          return AST;
        };
      })();

      // Input 4
      /*
         TODO
         -
       */

      //////////////////////////////////////////////////////////////////////////////
      /////////////////// MODULE BINDINGS //////////////////////////
      (function (){

        var moduleBinding   = plt.compiler.moduleBinding;
        var functionBinding = plt.compiler.functionBinding;
        var constantBinding = plt.compiler.constantBinding;

        // given a moduleName, return a function that converts binding specs into function bindings
        function makeFunctionBinding(modulePath){
          return function(binding){
            binding[3] = binding[3] || [];      // permissions default to none
            binding[4] = binding[4] || false;   // isCps defaults to false
            binding[5] = binding[5] || false;   // loc defaults to false
            return new functionBinding(binding[0], modulePath, binding[1], binding[2], binding[3], binding[4], binding[5]);
          };
        }

        // kernel-misc-module
        var kernelMiscModule  = new moduleBinding("moby/runtime/kernel/misc",
                                                  [["verify-boolean-branch-value", 2]
          ,["throw-cond-exhausted-error", 1 ]
          ,["'check-operator-is-function", 3]
          ,["print-values", 0]
        ].map(makeFunctionBinding('"moby/runtime/kernel/misc"'))
                                                 );

                                                 // foreign-module
                                                 var foreignModule     = new moduleBinding("moby/foreign",
                                                                                           [["get-js-object", 2, false, ["android.permission.FOREIGN-FUNCTION-INTERFACE"]]
                                                 ].map(makeFunctionBinding('"moby/foreign"'))
                                                                                          );

                                                                                          // world-effects-module
                                                                                          var worldEffectsModule= new moduleBinding("world-effects",
                                                                                                                                     [["make-effect:none", 0, false]
                                                                                            ,["make-effect:beep", 0, false, ["android.permission.VIBRATE"]]
                                                                                            ,["make-effect:play-dtmf-tone", 2, false]
                                                                                            ,["make-effect:send-sms", 2, false, ["android.permission.SEND-SMS"]]
                                                                                            ,["make-effect:play-sound", 1, false, ["android.permission.INTERNET"]]
                                                                                            ,["make-effect:stop-sound", 1, false]
                                                                                            ,["make-effect:pause-sound", 1, false]
                                                                                            ,["make-effect:set-sound-volume", 1, false]
                                                                                            ,["make-effect:set-beep-volume", 1, false]
                                                                                            ,["make-effect:raise-sound-volume", 0, false]
                                                                                            ,["make-effect:lower-sound-volume", 1, false]
                                                                                            ,["make-effect:set-wake-lock", 1, false, ["android.permission.WAKE-LOCK"]]
                                                                                            ,["make-effect:release-wake-lock", 1, false, ["android.permission.WAKE-LOCK"]]
                                                                                            ,["make-effect:pick-playlist", 1, false]
                                                                                            ,["make-effect:pick-random", 2, false]
                                                                                          ].map(makeFunctionBinding('"moby/world-effects"'))
                                                                                                                                    );

                                                                                                                                    // world-handlers-module
                                                                                                                                    var worldHandlersModule=new moduleBinding("world-config",
                                                                                                                                                                               [["on-tick", 1, true]
                                                                                                                                      ,["initial-effect", 1, false]
                                                                                                                                      ,["on-key", 1, false]
                                                                                                                                      ,["on-key!", 2, false]
                                                                                                                                      ,["on-mouse", 1, false]
                                                                                                                                      ,["on-tap", 1, false]
                                                                                                                                      ,["on-tilt", 1, false]
                                                                                                                                      ,["on-redraw", 1, false]
                                                                                                                                      ,["to-draw", 1, false]
                                                                                                                                      ,["on-draw", 2, false]
                                                                                                                                      ,["stop-when", 1, false]
                                                                                                                                    ].map(makeFunctionBinding('"moby/world-handlers"'))
                                                                                                                                                                              );

                                                                                                                                                                              // bootstrap-teachpack
                                                                                                                                                                              var bootstrapTeachpackFunctions = [["START", 14, false] ,["test-frame", 1, false] ,["sine", 1, false]
                                                                                                                                                                                ,["cosine", 1, false] ,["tangent", 1, false]];
                                                                                                                                                                              var bootstrapTeachpack = new moduleBinding("bootstrap/bootstrap-teachpack",
                                                                                                                                                                                                                          bootstrapTeachpackFunctions.map(makeFunctionBinding('"bootstrap/bootstrap-teachpack"'))),
                                                                                                                                                                              bootstrapTeachpack2011 = new moduleBinding("bootstrap2011/bootstrap-teachpack",
                                                                                                                                                                                                                          bootstrapTeachpackFunctions.map(makeFunctionBinding('"bootstrap2011/bootstrap-teachpack"'))),
                                                                                                                                                                              bootstrapTeachpack2012 = new moduleBinding("bootstrap2012/bootstrap-teachpack",
                                                                                                                                                                                                                          bootstrapTeachpackFunctions.map(makeFunctionBinding('"bootstrap2012/bootstrap-teachpack"'))),
                                                                                                                                                                              bootstrapTiltTeachpack2012 = new moduleBinding("bootstrap2012/bootstrap-tilt-teachpack",
                                                                                                                                                                                                                              bootstrapTeachpackFunctions.map(makeFunctionBinding('"bootstrap2012/bootstrap-tilt-teachpack"'))),
                                                                                                                                                                              bootstrapTeachpack2014 = new moduleBinding("bootstrap2014/bootstrap-teachpack",
                                                                                                                                                                                                                          bootstrapTeachpackFunctions.map(makeFunctionBinding('"bootstrap2014/bootstrap-teachpack"'))),
                                                                                                                                                                              bootstrapTiltTeachpack2014 = new moduleBinding("bootstrap2014/bootstrap-tilt-teachpack",
                                                                                                                                                                                                                              bootstrapTeachpackFunctions.map(makeFunctionBinding('"bootstrap2014/bootstrap-tilt-teachpack"'))),
                                                                                                                                                                              bootstrapTeachpack2015 = new moduleBinding("bootstrap2015/bootstrap-teachpack",
                                                                                                                                                                                                                          bootstrapTeachpackFunctions.map(makeFunctionBinding('"bootstrap2015/bootstrap-teachpack"'))),
                                                                                                                                                                              bootstrapTiltTeachpack2015 = new moduleBinding("bootstrap2015/bootstrap-tilt-teachpack",
                                                                                                                                                                                                                              bootstrapTeachpackFunctions.map(makeFunctionBinding('"bootstrap2015/bootstrap-tilt-teachpack"')));

                                                                                                                                                                              // cage-teachpack
                                                                                                                                                                              var cageTeachpack = new moduleBinding("bootstrap/cage-teachpack",[["start", 1, false]].map(makeFunctionBinding('"bootstrap/cage-teachpack"'))),
                                                                                                                                                                                cageTeachpack2011 = new moduleBinding("bootstrap2011/cage-teachpack",
                                                                                                                                                                                                                       [["start", 1, false]].map(makeFunctionBinding('"bootstrap2011/cage-teachpack"'))),
                                                                                                                                                                              cageTeachpack2012 = new moduleBinding("bootstrap2012/cage-teachpack",
                                                                                                                                                                                                                     [["start", 1, false]].map(makeFunctionBinding('"bootstrap2012/cage-teachpack"'))),
                                                                                                                                                                              cageTeachpack2014 = new moduleBinding("bootstrap2014/cage-teachpack",
                                                                                                                                                                                                                     [["start", 1, false]].map(makeFunctionBinding('"bootstrap2014/cage-teachpack"')));

                                                                                                                                                                              // function-teachpack
                                                                                                                                                                              var functionTeachpack = new moduleBinding("bootstrap/function-teachpack",
                                                                                                                                                                                                                         [["start", 1, false]].map(makeFunctionBinding('"bootstrap/function-teachpack"'))),
                                                                                                                                                                              functionTeachpack2011 = new moduleBinding("bootstrap2011/function-teachpack",
                                                                                                                                                                                                                         [["start", 1, false]].map(makeFunctionBinding('"bootstrap2011/function-teachpack"'))),
                                                                                                                                                                              functionTeachpack2012 = new moduleBinding("bootstrap2012/function-teachpack",
                                                                                                                                                                                                                         [["start", 1, false]].map(makeFunctionBinding('"bootstrap2012/function-teachpack"'))),
                                                                                                                                                                              functionTeachpack2014 = new moduleBinding("bootstrap2014/function-teachpack",
                                                                                                                                                                                                                         [["start", 1, false]].map(makeFunctionBinding('"bootstrap2014/function-teachpack"'))),
                                                                                                                                                                              functionTeachpack2015 = new moduleBinding("bootstrap2015/function-teachpack",
                                                                                                                                                                                                                         [["start", 1, false]].map(makeFunctionBinding('"bootstrap2015/function-teachpack"')));

                                                                                                                                                                              // location module
                                                                                                                                                                              var locationModule     = new moduleBinding("location",
                                                                                                                                                                                                                          [["get-latitude",      0, false, ["android.permission.LOCATION"]]
                                                                                                                                                                                ,["get-longitude",    0, false, ["android.permission.LOCATION"]]
                                                                                                                                                                                ,["get-altitude",     0, false, ["android.permission.LOCATION"]]
                                                                                                                                                                                ,["get-bearing",      0, false, ["android.permission.LOCATION"]]
                                                                                                                                                                                ,["get-speed",        0, false, ["android.permission.LOCATION"]]
                                                                                                                                                                                ,["location-distance", 0, false, ["android.permission.LOCATION"]]
                                                                                                                                                                              ].map(makeFunctionBinding('"moby/geolocation"'))
                                                                                                                                                                                                                         );

                                                                                                                                                                                                                         // accelerometer library
                                                                                                                                                                                                                         var tiltModule        = new moduleBinding("tilt",
                                                                                                                                                                                                                                                                     [["get-x-acceleration",  0, false, ["android.permission.TILT"]]
                                                                                                                                                                                                                           ,["get-y-acceleration", 0, false, ["android.permission.TILT"]]
                                                                                                                                                                                                                           ,["get-z-acceleration", 0, false, ["android.permission.TILT"]]
                                                                                                                                                                                                                           ,["get-azimuth",        0, false, ["android.permission.TILT"]]
                                                                                                                                                                                                                           ,["get-pitch",          0, false, ["android.permission.TILT"]]
                                                                                                                                                                                                                           ,["get-roll",           0, false, ["android.permission.TILT"]]
                                                                                                                                                                                                                         ].map(makeFunctionBinding('"moby/tilt"'))
                                                                                                                                                                                                                                                                    );

                                                                                                                                                                                                                                                                    // telephony module
                                                                                                                                                                                                                                                                    var telephonyModule    = new moduleBinding("telephony",
                                                                                                                                                                                                                                                                                                                 [["get-signal-strength",  0, false, ["android.permission.TELEPHONY"]]
                                                                                                                                                                                                                                                                    ].map(makeFunctionBinding('"moby/net"'))
                                                                                                                                                                                                                                                                                                                );

                                                                                                                                                                                                                                                                                                                // net module
                                                                                                                                                                                                                                                                                                                var netModule         = new moduleBinding("net",
                                                                                                                                                                                                                                                                                                                                                            [["get-url",  1, false, ["android.permission.INTERNET"]]
                                                                                                                                                                                                                                                                                                                ].map(makeFunctionBinding('"moby/net"'))
                                                                                                                                                                                                                                                                                                                                                           );

                                                                                                                                                                                                                                                                                                                                                           // parser module
                                                                                                                                                                                                                                                                                                                                                           var parserModule      = new moduleBinding("parser",
                                                                                                                                                                                                                                                                                                                                                                                                        [["xml->s-sexp",  1, false]
                                                                                                                                                                                                                                                                                                                                                           ].map(makeFunctionBinding('"moby/parser"'))
                                                                                                                                                                                                                                                                                                                                                                                                       );

                                                                                                                                                                                                                                                                                                                                                                                                       // js-world module
                                                                                                                                                                                                                                                                                                                                                                                                       var jsWorldModule     = new moduleBinding("jsworld",
                                                                                                                                                                                                                                                                                                                                                                                                                                                    [["js-big-bang",  1, false]
                                                                                                                                                                                                                                                                                                                                                                                                         ,["big-bang",    1, false]
                                                                                                                                                                                                                                                                                                                                                                                                         ,["js-div",      0, false]
                                                                                                                                                                                                                                                                                                                                                                                                         ,["js-p",        0, false]
                                                                                                                                                                                                                                                                                                                                                                                                         ,["js-button",   2, false]
                                                                                                                                                                                                                                                                                                                                                                                                         ,["js-button!",  2, false]
                                                                                                                                                                                                                                                                                                                                                                                                         ,["js-node",     1, false]
                                                                                                                                                                                                                                                                                                                                                                                                         ,["js-text",    1, false]
                                                                                                                                                                                                                                                                                                                                                                                                         ,["js-select",   2, false]
                                                                                                                                                                                                                                                                                                                                                                                                         ,["js-img",      1, false, ["android.permission.INTERNET"]]
                                                                                                                                                                                                                                                                                                                                                                                                       ].map(makeFunctionBinding('"moby/jsworld"'))
                                                                                                                                                                                                                                                                                                                                                                                                                                                   );

                                                                                                                                                                                                                                                                                                                                                                                                                                                   // world
                                                                                                                                                                                                                                                                                                                                                                                                                                                   var worldModule       = new moduleBinding("world",
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                worldHandlersModule.bindings.concat(worldEffectsModule.bindings,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        ["key=?"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"play-sound"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"big-bang"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"make-color"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"color-red"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"color-green"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"color-blue"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"color-alpha"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"empty-scene"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"scene+line"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"put-image"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"place-image"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"place-image/align"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"put-pinhole"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"circle"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"star"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"polygon"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"radial-star"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"star-polygon"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"nw:rectangle"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"rectangle"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"regular-polygon"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"rhombus"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"square"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"triangle"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"triangle/sas"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"triangle/sss"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"triangle/ass"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"triangle/ssa"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"triangle/aas"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"triangle/asa"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"triangle/saa"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"right-triangle"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"isosceles-triangle"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"ellipse"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"line"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"add-line"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"overlay"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"overlay/xy"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"overlay/align"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"underlay"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"underlay/xy"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"underlay/align"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"beside"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"beside/align"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"above"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"above/align"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"rotate"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"scale"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"scale/xy"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"crop"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"frame"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"flip-horizontal"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"flip-vertical"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"text"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"text/font"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"video-url"       // needs network
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"video/url"       // needs network
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"bitmap/url"      // needs network
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"image-url"       // needs network
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"open-image-url"  // needs network
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"image?"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"image=?"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"image-width"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"image-height"

                                                                                                                                                                                                                                                                                                                                                                                                                                                   // mouse-events
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"mouse-event?"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"mouse=?"

                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"image->color-list"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"color-list->image"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"color-list->bitmap"

                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"image-baseline"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"mode?"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"image-color?"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"name->color"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"x-place?"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"y-place?"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"angle?"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"side-count?"
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ,"step-count?"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        ].map(function(binding){
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          var needsPermission = ["video/url", "bitmap/url", "image-url", "open-image-url"];
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          var permissions = (needsPermission.indexOf(binding) > -1)? ["android.permission.INTERNET"] : [];
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          return new constantBinding(binding, '"moby/world"', permissions, false);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        }))
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               );

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               // top-level
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               var topLevelModule = new moduleBinding("moby/topLevel",
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          [["<", 2, true] // Numerics
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["<=", 2, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["=", 2, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,[">", 2, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,[">=", 2, true]

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["=~", 3]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["number->string", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["even?", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["odd?", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["positive?", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["negative?", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["number?", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["rational?", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["quotient", 2]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["remainder", 2]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["numerator", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["denominator", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["integer?", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["real?", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["abs", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["acos", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["add1", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["angle", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["asin", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["atan", 1, true]           // arity is either 1 or 2
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["ceiling", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["complex?", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["conjugate", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["cos", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["cosh", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["denominator", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["even?", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["exact->inexact", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["exact?", 1]               // *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["exp", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["expt", 2]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["floor", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["gcd", 1, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["imag-part", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["inexact->exact", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["inexact?", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["integer->char", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["integer-sqrt", 1]         // *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["integer?", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["lcm", 1, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["log", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["magnitude", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["make-polar", 2]           // *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["make-rectangular", 2]     // *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["max", 1, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["min", 1, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["modulo", 2]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["negative?", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["number?", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["numerator", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["odd?", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["positive?", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["random", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["rational?", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["real-part", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["real?", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["round", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["sgn", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["sin", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["sinh", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               //,["sq", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["sqr", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["sqrt", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["sub1", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["tan", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["zero?", 1]

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["+", 0, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["-", 1, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["*", 0, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["/", 1, true]

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               // Logic
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["not", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["false?", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["boolean?", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["boolean=?", 2]

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               // Symbols
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["symbol->string", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["symbol=?", 2]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["symbol?", 1]

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               // Lists
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["append", 0, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["assq", 2]                 // *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["assv", 2]                 // *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["assoc", 2]                 // *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["caaar", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["caadr", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["caar", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["cadar", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["cadddr", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["caddr", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["cadr", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["car", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["cddar", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["cdddr", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["cddr", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["cdr", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["cdaar", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["cdadr", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["cdar", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["cons?", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["list?", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["cons", 2]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["empty?", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["length", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["list", 0, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["list*", 1, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["list-ref", 2]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["remove", 2]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["member", 2]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["member?", 2]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["memq", 2]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["memv", 2]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["null?", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["pair?", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["rest", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["reverse", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["first", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["second", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["third", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["fourth", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["fifth", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["sixth", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["seventh", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["eighth", 1]

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               // We're commenting out the mutation operation on pairs
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 // because they're not supported in ISL/ASL anymore.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 //;,["set-car! 2]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 //;,["set-cdr! 2]

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 // Box
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["box", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["unbox", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["set-box!", 2]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["box?", 1]

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               // Posn
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["make-posn", 2]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["posn-x", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["posn-y", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["posn?", 1]

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               // Characters
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["char->integer", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["char-alphabetic?", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["char-ci<=?", 2, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["char-ci<?", 2, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["char-ci=?", 2, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["char-ci>=?", 2, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["char-ci>?", 2, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["char-downcase", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["char-lower-case?", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["char-numeric?", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["char-upcase", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["char-upper-case?", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["char-whitespace?", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["char<=?", 2, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["char<?", 2, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["char=?", 2, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["char>=?", 2, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["char>?", 2, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["char?", 1]

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               // Strings
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["format", 1, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["list->string", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["make-string", 2]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["replicate", 2]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["string", 0, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["string->list", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["string->number", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["string->symbol", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["string-alphabetic?", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["string-append", 0, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["string-ci<=?", 2, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["string-ci<?", 2, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["string-ci=?", 2, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["string-ci>=?", 2, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["string-ci>?", 2, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["string-copy", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["string-length", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["string-lower-case?", 1]   // *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["string-numeric?", 1]      // *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["string-ref", 2]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["string-upper-case?", 1]   // *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["string-whitespace?", 1]   // *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["string<=?", 2, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["string<?", 2, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["string=?", 2, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["string>=?", 2, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["string>?", 2, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["string?", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["substring", 3 ]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["string-ith", 2]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["int->string", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["string->int", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["explode", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["implode", 1]

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               // Eof
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["eof-object?", 1]

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               // Misc
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["=~", 3]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["eq?", 2]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["equal?", 2]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["equal~?", 3]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["eqv?", 2]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["error", 2]

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["identity", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["struct?", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["current-seconds", 0]

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               // Higher-Order Functions
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["andmap", 1, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["apply", 2, true]           // *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["argmax", 2]               // *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["argmin", 2]               // *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["build-list", 2]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["build-string", 2]         // *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["compose", 0, true]         // *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["filter", 2]               // *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["foldl", 2, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["foldr", 2, true]                // *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["map", 1, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["for-each", 1, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["memf", 2]                 // *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["ormap", 1, true]                // *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["procedure?", 1]           // *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["quicksort", 2]            // *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["sort", 2]                 // *

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["void", 0, true]

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               // Parsing
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["xml->s-exp", 1]

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               // Vectors
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["build-vector", 2]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               // FIXME: should only take one or two arguments", not vararity
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["make-vector", 1, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["vector", 0, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["vector-length", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["vector-ref", 2]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["vector-set!", 3]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["vector->list", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["list->vector", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["vector?", 1]

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["printf", 1, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["display", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["write", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["newline", 0]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["call/cc", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["procedure-arity", 1]

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               // Testing functions.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 // NOTE: the desugar.ss module converts use of check-expect into ones that
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 // thunk its arguments", and pass an additional location argument.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["check-expect", 2]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["EXAMPLE", 2]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["check-within", 3]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["check-error", 2]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["make-hasheq", 0]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["make-hash", 0]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["hash-set!", 3 ]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["hash-ref", 3]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["hash-remove!", 2]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["hash-map", 2]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["hash-for-each", 2]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["hash?", 1]

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               // Exception raising
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["raise", 1]

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               // Checking for undefined
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["undefined?", 1]

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               // values for multiple value definition
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["values", 0, true]

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               // structures
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["make-struct-type", 4, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["make-struct-field-accessor", 2, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["make-struct-field-mutator", 2, true]

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               // continuation mark stuff
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 // FIXME: add support for prompt optional argument
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["current-continuation-marks", 0, false]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["continuation-mark-set->list", 2, false]

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               // Things for javascript FFI and world
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["scheme->prim-js", 1, false]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["prim-js->scheme", 1, false]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["procedure->cps-js-fun", 1, false]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["procedure->void-js-fun", 1, false]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["js-===", 2, false]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["js-get-named-object", 1, false]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["js-get-field", 2, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               //,["get-js-array-field", 2, false]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["js-set-field!", 3, false]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               //,["js-set-array-field!", 3, false]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["js-typeof", 1, false]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["js-instanceof", 2, false]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["js-call", 2, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["js-new", 1, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["js-make-hash", 0, true]

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["make-world-config", 2, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["make-bb-info", 2, false]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["bb-info?", 1, false]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["bb-info-change-world", 1, false]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["bb-info-toplevel-node", 1, false]

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["make-effect-type", 4, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["effect?", 1, false]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["world-with-effects", 2, false]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               //,["coerce-world-handler", 1, false]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["make-render-effect-type", 4, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["render-effect-type?", 1]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["render-effect?", 1]

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               //,["make-effect:do-nothing 0, false]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 //,["effect:do-nothing? 1, false]

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["make-render-effect-type", 4, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               //,["render-effect-name 1, false]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 //,["render-effect-dom-node 1, false]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 //,["render-effect-effects 1, false]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 //,["render-effect? 1, false]

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["values", 0, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["sleep", 0, true]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["current-inexact-milliseconds", 0, false]

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["make-exn", 2, false]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["exn-message", 1, false]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ,["exn-continuation-marks", 1, false]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               ].map(makeFunctionBinding('"moby/toplevel"'))
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         );

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         // The core environment includes the baseConstants, the topLevel bindings, and the world bindings
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         // NOTE: worldModule *includes* worldEffects and worldHandlers, according to Danny's modules.ss file
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         plt.compiler.topLevelModules = [topLevelModule, kernelMiscModule, , jsWorldModule, worldModule];
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         plt.compiler.knownCollections = ["bootstrap", "bootstrap2011", "bootstrap2012", "bootstrap2014", "bootstrap2015"];

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         plt.compiler.knownModules = [kernelMiscModule
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 , jsWorldModule
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 , foreignModule
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 , worldModule
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 , bootstrapTeachpack
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 , bootstrapTeachpack2011
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 , bootstrapTeachpack2012
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 , bootstrapTeachpack2014
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 , bootstrapTeachpack2015
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 , bootstrapTiltTeachpack2012
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 , bootstrapTiltTeachpack2014
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 , bootstrapTiltTeachpack2015
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 , cageTeachpack
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 , cageTeachpack2011
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 , cageTeachpack2012
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 , cageTeachpack2014
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 , functionTeachpack
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 , functionTeachpack2011
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 , functionTeachpack2012
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 , functionTeachpack2014
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 , functionTeachpack2015
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 , locationModule
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 , tiltModule
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 , telephonyModule
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 , netModule
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 , parserModule
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 , topLevelModule];
      })();

      // Input 5

      /*
         TODO
         - stop using synchronous XmlHttpRequests -> probably only after the compiler is folded into the evaluator
       */

      (function () {
        'use strict';

        // import frequently-used bindings
        var literal          = plt.compiler.literal;
        var symbolExpr       = plt.compiler.symbolExpr;
        var Program          = plt.compiler.Program;
        var couple           = plt.compiler.couple;
        var ifExpr           = plt.compiler.ifExpr;
        var beginExpr        = plt.compiler.beginExpr;
        var letExpr          = plt.compiler.letExpr;
        var letStarExpr      = plt.compiler.letStarExpr;
        var letrecExpr       = plt.compiler.letrecExpr;
        var localExpr        = plt.compiler.localExpr;
        var andExpr          = plt.compiler.andExpr;
        var orExpr           = plt.compiler.orExpr;
        var condExpr         = plt.compiler.condExpr;
        var caseExpr         = plt.compiler.caseExpr;
        var lambdaExpr       = plt.compiler.lambdaExpr;
        var quotedExpr       = plt.compiler.quotedExpr;
        var unquotedExpr     = plt.compiler.unquotedExpr;
        var quasiquotedExpr  = plt.compiler.quasiquotedExpr;
        var unquoteSplice    = plt.compiler.unquoteSplice;
        var callExpr         = plt.compiler.callExpr;
        var whenUnlessExpr   = plt.compiler.whenUnlessExpr;
        var defFunc          = plt.compiler.defFunc;
        var defVar           = plt.compiler.defVar;
        var defVars          = plt.compiler.defVars;
        var defStruct        = plt.compiler.defStruct;
        var requireExpr      = plt.compiler.requireExpr;
        var provideStatement = plt.compiler.provideStatement;
        var unsupportedExpr  = plt.compiler.unsupportedExpr;

        var throwError       = plt.compiler.throwError;
        var structBinding    = plt.compiler.structBinding;
        var constantBinding  = plt.compiler.constantBinding;
        var functionBinding  = plt.compiler.functionBinding;
        var moduleBinding    = plt.compiler.moduleBinding;
        var knownModules     = plt.compiler.knownModules;

        // checkDuplicateIdentifiers : [listof SymbolExprs], Program -> Void
        // sort the array, and throw errors for non-symbols, keywords or duplicates
        function checkDuplicateIdentifiers(lst, stx, loc){
          var visitedIds = {}; // initialize a dictionary of ids we've seen
          lst.forEach(function(id){
            if(!(id instanceof symbolExpr)){
              throwError("expected identifier "+id.val, id.location);
            } else if(visitedIds[id.val]) { // if we've seen this variable before, throw an error
              throwError(new types.Message([new types.ColoredPart(stx.toString(), stx.location),
                                           ": found ",
                                           new types.ColoredPart("a variable", id.location),
                                           " that is already used ",
                                           new types.ColoredPart("here", visitedIds[id.val].location)])
                     , id.location);
            } else {
              visitedIds[id.val] = id; // otherwise, record the identifier as being visited
            }

          });
        }

        // tag-application-operator/module: Stx module-name -> Stx
        // Adjust the lexical context of the func so it refers to the environment of a particular module.
        function tagApplicationOperator_Module(application, moduleName){
          // get the module's env
          var module = plt.compiler.defaultModuleResolver(moduleName),
            env = new plt.compiler.emptyEnv().extendEnv_moduleBinding(module);
          // assign it as the context of the function, and each of the arguments
          [application.func].concat(application.args).forEach(function(expr){expr.context = env;});
          return application;
        }

        // forceBooleanContext: stx, loc, bool -> stx
        // Force a boolean runtime test on the given expression.
        function forceBooleanContext(stx, loc, boolExpr){
          stx = new literal(new types.string(stx.toString())); // turn the stx object into a string literal
          var verifyCall  = new symbolExpr("verify-boolean-branch-value"),
            stxQuote    = new quotedExpr(stx),
            locQuote    = new quotedExpr(new literal(loc.toVector())),
            boolLocQuote= new quotedExpr(new literal(boolExpr.location.toVector())),
            runtimeCall = new callExpr(verifyCall, [stxQuote, locQuote, boolExpr, boolLocQuote]);
          runtimeCall.location = verifyCall.location = boolExpr.location;
          stxQuote.location=locQuote.location=boolLocQuote.location = boolExpr.location;
          tagApplicationOperator_Module(runtimeCall, 'moby/runtime/kernel/misc');
          return runtimeCall;
        }

        //////////////////////////////////////////////////////////////////////////////
        // DESUGARING ////////////////////////////////////////////////////////////////

        // desugarProgram : Listof Programs null/pinfo -> [Listof Programs, pinfo]
        // desugar each program, appending those that desugar to multiple programs
        function desugarProgram(programs, pinfo, isTopLevelExpr){
          var acc = [ [], (pinfo || new plt.compiler.pinfo())];
          var res = programs.reduce((function(acc, p){
            var desugaredAndPinfo = p.desugar(acc[1]);
            // if it's an expression, insert a print-values call so it shows up in the repl
            if(plt.compiler.isExpression(p) && isTopLevelExpr){
              var printValues = new symbolExpr("print-values"),
                printCall = new callExpr(printValues, [desugaredAndPinfo[0]]);
              // set the location of the print-values call to that of the expression
              printValues.location = printCall.location = desugaredAndPinfo[0].location;
              desugaredAndPinfo[0] = printCall;
              tagApplicationOperator_Module(printCall,'moby/runtime/kernel/misc');
            }
            if(desugaredAndPinfo[0].length){
              acc[0] = acc[0].concat(desugaredAndPinfo[0]);
            } else {
              acc[0].push(desugaredAndPinfo[0]);
            }
            return [acc[0], desugaredAndPinfo[1]];
          }), acc);
          res[0].location = programs.location;
          return res;
        }

        // Program.prototype.desugar: pinfo -> [Program, pinfo]
        Program.prototype.desugar = function(pinfo){ return [this, pinfo]; };
        defFunc.prototype.desugar = function(pinfo){
          // check for duplicate arguments
          checkDuplicateIdentifiers([this.name].concat(this.args), this.stx[0], this.location);
          // check for non-symbol arguments
          this.args.forEach(function(arg){
            if(!(arg instanceof symbolExpr)){
              throwError(new types.Message([new types.ColoredPart(this.stx.val, this.stx.location)
                                , ": expected a variable but found "
                                , new types.ColoredPart("something else", arg.location)])
                   , sexp.location);
            }
          });
          var bodyAndPinfo = this.body.desugar(pinfo),
            newDefFunc = new defFunc(this.name, this.args, bodyAndPinfo[0], this.stx);
          newDefFunc.location = this.location;
          return [newDefFunc, bodyAndPinfo[1]];
        };
        defVar.prototype.desugar = function(pinfo){
          // convert (define f (lambda (x) x)) into (define (f x) x)
          if(this.expr instanceof lambdaExpr){
            var newDefFunc = new defFunc(this.name, this.expr.args, this.expr.body, this.stx);
            newDefFunc.location = this.location;
            return newDefFunc.desugar(pinfo);
          } else {
            var exprAndPinfo = this.expr.desugar(pinfo),
              newDefVar = new defVar(this.name, exprAndPinfo[0], this.stx);
            newDefVar.location = this.location;
            return [newDefVar, exprAndPinfo[1]];
          }
        };
        defVars.prototype.desugar = function(pinfo){
          var exprAndPinfo = this.expr.desugar(pinfo),
            newDefVars = new defVars(this.names, exprAndPinfo[0], this.stx);
          newDefVars.location = this.location;
          return [newDefVars, exprAndPinfo[1]];
        };
        defStruct.prototype.desugar = function(pinfo){
          var that = this,
            ids = ['make-'+this.name.val, this.name.val+'?', this.name.val+'-ref', this.name.val+'-set!'],
            idSymbols = ids.map(function(id){return new symbolExpr(id);}),
            makeStructTypeFunc = new symbolExpr('make-struct-type'),
            makeStructTypeArgs = [new quotedExpr(new symbolExpr(this.name.val)),
              new literal(false),
          new literal(this.fields.length),
          new literal(0)],
          makeStructTypeCall = new callExpr(makeStructTypeFunc, makeStructTypeArgs);
          // set location for all of these nodes
          [makeStructTypeCall, makeStructTypeFunc].concat(idSymbols, makeStructTypeArgs).forEach(function(p){p.location = that.location});

          // make the define-values stx object, but store the original stx for define-struct
          var defineValuesStx = new defVars([this.name].concat(idSymbols), makeStructTypeCall, this.stx),
            stxs = [defineValuesStx];
          defineValuesStx.location = this.location;
          // given a field, make a definition that binds struct-field to the result of
          // a make-struct-field accessor call in the runtime
          function makeAccessorDefn(f, i){
            var makeFieldFunc = new symbolExpr('make-struct-field-accessor'),
              makeFieldArgs = [new symbolExpr(that.name.val+'-ref'), new literal(i), new quotedExpr(new symbolExpr(f.val))],
              makeFieldCall = new callExpr(makeFieldFunc, makeFieldArgs),
              accessorSymbol= new symbolExpr(that.name.val+'-'+f.val),
              defineVar = new defVar(accessorSymbol, makeFieldCall);
            // set location for all of these nodes
            [defineVar, makeFieldFunc, makeFieldCall, accessorSymbol].concat(makeFieldArgs).forEach(function(p){p.location = that.location});
            stxs.push(defineVar);
          }
          this.fields.forEach(makeAccessorDefn);
          return [stxs, pinfo];
        };
        beginExpr.prototype.desugar = function(pinfo){
          var exprsAndPinfo = desugarProgram(this.exprs, pinfo),
            newBeginExpr = new beginExpr(exprsAndPinfo[0], this.stx);
          newBeginExpr.location = this.location;
          return [newBeginExpr, exprsAndPinfo[1]];
        };
        lambdaExpr.prototype.desugar = function(pinfo){
          // if this was parsed from raw syntax, check for duplicate arguments
          if(this.stx) checkDuplicateIdentifiers(this.args, this.stx, this.location);
          var bodyAndPinfo = this.body.desugar(pinfo),
            newLambdaExpr = new lambdaExpr(this.args, bodyAndPinfo[0], this.stx);
          newLambdaExpr.location = this.location;
          return [newLambdaExpr, bodyAndPinfo[1]];
        };
        localExpr.prototype.desugar = function(pinfo){
          var defnsAndPinfo = desugarProgram(this.defs, pinfo),
            exprAndPinfo = this.body.desugar(defnsAndPinfo[1]),
            newLocalExpr = new localExpr(defnsAndPinfo[0], exprAndPinfo[0], this.stx);
          newLocalExpr.location = this.location;
          return [newLocalExpr, exprAndPinfo[1]];
        };
        callExpr.prototype.desugar = function(pinfo){
          var exprsAndPinfo = desugarProgram([this.func].concat(this.args), pinfo),
            newCallExpr = new callExpr(exprsAndPinfo[0][0], exprsAndPinfo[0].slice(1), this.stx);
          newCallExpr.location = this.location;
          return [newCallExpr, exprsAndPinfo[1]];
        };
        ifExpr.prototype.desugar = function(pinfo){
          var exprsAndPinfo = desugarProgram([this.predicate,
                                             this.consequence,
          this.alternative],
          pinfo),
          predicate = forceBooleanContext(this.stx, this.stx.location, exprsAndPinfo[0][0]),
            consequence = exprsAndPinfo[0][1],
            alternative = exprsAndPinfo[0][2],
            newIfExpr = new ifExpr(predicate, consequence, alternative, this.stx);
          newIfExpr.location = this.location;
          return [newIfExpr, exprsAndPinfo[1]];
        };
        whenUnlessExpr.prototype.desugar = function(pinfo){
          var begin_exp = new beginExpr(this.exprs, this.stx),
            void_exp = new symbolExpr('void'),
            call_exp = new callExpr(void_exp, [], this.stx),
            consequence = (this.stx.val==="when")? begin_exp : call_exp,
            alternative = (this.stx.val==="when")? call_exp : begin_exp;
          begin_exp.location = this.exprs.location;
          void_exp.location = call_exp.location = this.location;
          // desugar each expression and construct an ifExpr
          var exprsAndPinfo = desugarProgram([this.predicate,
                                             consequence,
          alternative],
          pinfo),
          if_exp = new ifExpr(exprsAndPinfo[0][0], exprsAndPinfo[0][1], exprsAndPinfo[0][2], this.stx);
          if_exp.location = this.location;
          // DON'T desugar the ifExpr -- we don't forceBooleanContext on when/unless!
          return [if_exp, exprsAndPinfo[1]];
        };
        // letrecs become locals
        letrecExpr.prototype.desugar = function(pinfo){
          function bindingToDefn(b){
            var def = new defVar(b.first, b.second, b.stx);
            def.location = b.location;
            return def
          };
          var localAndPinfo = new localExpr(this.bindings.map(bindingToDefn), this.body, this.stx).desugar(pinfo);
          localAndPinfo[0].location = this.location;
          return localAndPinfo;
        };
        // lets become calls
        letExpr.prototype.desugar = function(pinfo){
          // utility functions for accessing first and second
          function coupleFirst(x) { return x.first; };
          function coupleSecond(x) { return x.second; };

          var ids   = this.bindings.map(coupleFirst),
            exprs = this.bindings.map(coupleSecond),
            lambda= new lambdaExpr(ids, this.body, this.stx),
            call  = new callExpr(lambda, exprs);
          lambda.location = call.location = this.location;
          return call.desugar(pinfo);
        };
        // let*s become nested lets
        letStarExpr.prototype.desugar = function(pinfo){
          function bindingToLet(body, binding){
            var let_exp = new letExpr([binding], body, binding.stx);
            let_exp.location = binding.location;
            return let_exp;
          }
          // if there are no bindings, desugar the body. Otherwise, reduce to nested lets first
          if(this.bindings.length === 0) return this.body.desugar(pinfo);
          else return this.bindings.reduceRight(bindingToLet, this.body).desugar(pinfo);
        };
        // conds become nested ifs
        condExpr.prototype.desugar = function(pinfo){
          // base case is all-false
          var condExhausted = new symbolExpr("throw-cond-exhausted-error"),
            exhaustedLoc = new quotedExpr(new literal(this.location.toVector())),
            expr = tagApplicationOperator_Module(new callExpr(condExhausted, [exhaustedLoc])
            , "moby/runtime/kernel/misc");
          var ifStx = new symbolExpr("if");
          ifStx.location = this.stx.location;

          expr.location = condExhausted.location = exhaustedLoc.location = this.location;
          for(var i=this.clauses.length-1; i>-1; i--){
            // desugar else to true
            if(this.clauses[i].first instanceof symbolExpr && this.clauses[i].first.val === "else"){
              this.clauses[i].first.val = "true";
            }
            expr = new ifExpr(this.clauses[i].first, this.clauses[i].second, expr, this.stx);
            expr.location = this.location;
          }
          return expr.desugar(pinfo);
        };
        // case become nested ifs, with ormap as the predicate
        caseExpr.prototype.desugar = function(pinfo){
          var that = this,
            caseStx = new symbolExpr("if"); // TODO: The server returns "if" here, but I am almost certain it should be "case"
          caseStx.location = that.location;

          var pinfoAndValSym = pinfo.gensym('val'),      // create a symbol 'val'
            updatedPinfo1 = pinfoAndValSym[0],        // generate pinfo containing 'val'
            valStx = pinfoAndValSym[1];               // remember the symbolExpr for 'val'
          var pinfoAndXSym = updatedPinfo1.gensym('x'), // create another symbol 'x' using pinfo1
            updatedPinfo2 = pinfoAndXSym[0],          // generate pinfo containing 'x'
            xStx = pinfoAndXSym[1],                   // remember the symbolExpr for 'x'
            voidStx = new symbolExpr('void');         // make the void symbol

          // track all the syntax we've created so far...
          var stxs = [valStx, xStx, voidStx];
          // if there's an 'else', pop off the clause and use the result as the base
          var expr, clauses = this.clauses, lastClause = clauses[this.clauses.length-1];
          if((lastClause.first instanceof symbolExpr) && (lastClause.first.val === 'else')){
            expr = lastClause.second;
            clauses.pop();
          } else {
            expr = new callExpr(voidStx,[], that.stx);
            expr.location = that.location;
          }
          // This is the predicate we'll be applying using ormap: (lambda (x) (equal? x val))
          var equalStx = new symbolExpr('equal?'),
            equalTestStx = new callExpr(equalStx, [xStx, valStx], caseStx),
            predicateStx = new lambdaExpr([xStx], equalTestStx, caseStx);
          // track the syntax that will need location information reset
          stxs = stxs.concat([equalStx, equalTestStx, predicateStx]);

          // generate (if (ormap <predicate> clause.first) clause.second base)
          function processClause(base, clause){
            var ormapStx = new symbolExpr('ormap'),
              callStx = new callExpr(ormapStx, [predicateStx, clause.first], that.stx),
              ifStx = new ifExpr(callStx, clause.second, base, caseStx);
            // track the syntax that will need location information reset
            stxs = stxs.concat([ormapStx, callStx, clause.first, ifStx]);
            return ifStx;
          }

          // build the body of the let by decomposing cases into nested ifs
          var binding = new couple(valStx, this.expr),
            body = clauses.reduceRight(processClause, expr),
            letExp = new letExpr([binding], body, caseStx);
          // track the syntax that will need location information reset
          stxs = stxs.concat([binding, letExp]);

          // assign location to every stx element we created
          stxs.forEach(function(stx){stx.location = that.location;});

          return letExp.desugar(updatedPinfo2);
        };

        // ands become nested ifs
        andExpr.prototype.desugar = function(pinfo){
          var that = this, ifStx = new symbolExpr("if"),
            exprsAndPinfo = desugarProgram(this.exprs, pinfo),
            exprs = exprsAndPinfo[0],
            pinfo = exprsAndPinfo[1];

          // recursively walk through the exprs
          function desugarAndExprs(exprs){
            var predicate = forceBooleanContext(that.stx, that.stx.location, exprs[0]),
              // if there only two exprs in the chain, force a boolean ctx on the second expr and make it the consequence
              // otherwise, desugar the rest of the chain before adding it
              consequence = (exprs.length > 2)? desugarAndExprs(exprs.slice(1))
                : forceBooleanContext(that.stx, that.stx.location, exprs[1]),
                alternative = new literal(false),
                  ifLink = new ifExpr(predicate, consequence, alternative, ifStx),
                  stxs = [alternative, ifStx, ifLink];

                // assign location information to everything
                stxs.forEach(function(stx){return stx.location = that.location;});
                return ifLink;
          }

          var ifChain = desugarAndExprs(exprs);
          ifChain.location = that.location;
          return [ifChain, pinfo];
        };
        // ors become nested lets-with-if-bodies
        orExpr.prototype.desugar = function(pinfo){
          var that = this, orStx = new symbolExpr("or"),
            exprsAndPinfo = desugarProgram(this.exprs, pinfo),
            exprs = exprsAndPinfo[0],
            pinfo = exprsAndPinfo[1];

          // recursively walk through the exprs
          function desugarOrExprs(exprs, pinfo){
            var firstExpr = exprs[0], exprLoc = firstExpr.location,
              pinfoAndTempSym = pinfo.gensym('tmp'),
              firstExprSym = pinfoAndTempSym[1],
              ifStx = new symbolExpr("if");

            // to match Racket's behavior, we override any expression's
            // stx to be "if", with the location of the whole expression
            if(firstExpr.stx && (firstExpr.stx.val !== "if")){
              ifStx.location = firstExpr.location;
              firstExpr.stx=ifStx;
            }
            var pinfo = pinfoAndTempSym[0],
              tmpBinding = new couple(firstExprSym, forceBooleanContext(that.stx, that.stx.location, firstExpr)),
              secondExpr;

            // if there are only two exprs in the chain, force a boolean ctx on the second expr before adding
            // otherwise, desugar the rest of the chain before adding it
            if(exprs.length == 2){
              secondExpr = forceBooleanContext(orStx, that.stx.location, exprs[1]);
            } else  {
              var secondExprAndPinfo = desugarOrExprs(exprs.slice(1), pinfo);
              secondExpr = secondExprAndPinfo[0];
              pinfo = secondExprAndPinfo[1];
            }

            // create if and let expressions, using these new symbols and bindings
            var if_exp = new ifExpr(firstExprSym, firstExprSym, secondExpr, new symbolExpr("if")),
              let_exp = new letExpr([tmpBinding], if_exp, orStx),
              stxs = [orStx, firstExprSym, tmpBinding, if_exp, if_exp.stx, let_exp];
            // assign location information to everything
            stxs.forEach(function(stx){return stx.location = that.location; });
            return let_exp.desugar(pinfo);
          }

          return desugarOrExprs(exprs, pinfo);
        };

        quotedExpr.prototype.desugar = function (pinfo) {
          if (typeof this.location === 'undefined') {
            throwError( new types.Message(["ASSERTION ERROR: Every quotedExpr should have a location"])
               , loc)
          }
          // Sexp-lists (arrays) become lists
          // literals and symbols stay themselves
          // everything else gets desugared
          function desugarQuotedItem(pinfo, loc){
            return function (x) {
              if (  x instanceof callExpr
                || x instanceof quotedExpr
                  || x instanceof unsupportedExpr
                 ) {
                   return x.desugar(pinfo);
                 } else if (  x instanceof symbolExpr
                   || x instanceof literal
                     || x instanceof Array
                           ) {
                             var res = new quotedExpr(x);
                             res.location = loc;
                             return [res, pinfo];
                           } else {
                             throwError(new types.Message(["ASSERTION ERROR: Found an unexpected item in a quotedExpr"])
                   , loc);
                           }
            }
          }

          return desugarQuotedItem(pinfo, this.location)(this.val);
        };

        unquotedExpr.prototype.desugar = function (pinfo, depth) {
          if (typeof depth === 'undefined') {
            throwError( new types.Message(["misuse of a ', not under a quasiquoting backquote"])
               , this.location);
          } else if (depth === 1) {
            return this.val.desugar(pinfo);
          } else if (depth > 1) {
            if (this.val instanceof Array) {
              return desugarQuasiQuotedList(element, pinfo, depth-1);
            } else {
              var uSym = new quotedExpr(new symbolExpr('unquote')),
                listSym = new symbolExpr('list'),
                listArgs = [uSym, this.val.desugar(pinfo, depth-1)[0]],
                listCall = new callExpr(listSym, listArgs);
              uSym.location = this.location;
              uSym.parent = listArgs;
              listSym.location = this.location;
              listSym.parent = listCall;
              listCall.location = this.location;
              return [listCall, pinfo];
            }
          } else {
            throwError( new types.Message(["ASSERTION FAILURE: depth should have been undefined, or a natural number"])
               , this.location);
          }
        };

        unquoteSplice.prototype.desugar = function (pinfo, depth) {
          if (typeof depth === 'undefined') {
            throwError( new types.Message(["misuse of a ,@, not under a quasiquoting backquote"])
               , this.location);
          } else if (depth === 1) {
            return this.val.desugar(pinfo);
          } else if (depth > 1) {
            if (this.val instanceof Array) {
              return desugarQuasiQuotedList(element, pinfo, depth-1);
            } else {
              var usSym = new quotedExpr(new symbolExpr('unquote-splicing')),
                listSym = new symbolExpr('list'),
                listArgs = [usSym, this.val.desugar(pinfo, depth-1)[0]],
                listCall = new callExpr(listSym, listArgs);
              usSym.location = this.location;
              usSym.parent = listArgs;
              listSym.location = this.location;
              listSym.parent = listCall;
              listCall.location = this.location;
              return [listCall, pinfo];
            }
          } else {
            throwError( new types.Message(["ASSERTION FAILURE: depth should have been undefined, or a natural number"])
               , this.location);
          }
        };

        function desugarQuasiQuotedList(qqlist, pinfo, depth) {

          // helper function for a single QQ-list element
          function desugarQuasiQuotedListElement(element, pinfo, depth, loc) {
            if (depth === 0 && element instanceof unquoteSplice) {
              return element.desugar(pinfo, depth);
            } else {
              var argument = (element instanceof Array) ?
                desugarQuasiQuotedList(element, depth, depth)[0] :
                element.desugar(pinfo, depth)[0],
              listSym = new symbolExpr('list'),
                listCall = new callExpr(listSym, [argument]);
              listSym.parent = listCall;
              listCall.location = listSym.location = loc;
              return [listCall, pinfo];
            }
          }

          var loc = (typeof qqlist.location != 'undefined') ? qqlist.location :
            ((qqlist instanceof Array) && (typeof qqlist[0].location != 'undefined')) ? qqlist[0].location :
            (throwError( types.Message(["ASSERTION FAILURE: couldn't find a usable location"])
            , new Location(0,0,0,0))),
          appendArgs = qqlist.map(function(x){ return desugarQuasiQuotedListElement(x, pinfo, depth, loc)[0]; }),
            appendSym = new symbolExpr('append');
          appendSym.location = loc
          var appendCall = new callExpr(appendSym, appendArgs);
          appendCall.location = loc;
          return [appendCall, pinfo];
        }

        // go through each item in search of unquote or unquoteSplice
        quasiquotedExpr.prototype.desugar = function(pinfo, depth){
          depth = (typeof depth === 'undefined') ? 0 : depth;
          if (depth >= 0) {
            var result;
            if(this.val instanceof Array){
              result = desugarQuasiQuotedList(this.val, pinfo, depth+1)[0];
            } else {
              result = this.val.desugar(pinfo, depth+1)[0];
            }
          } else {
            throwError( new types.Message(["ASSERTION FAILURE: depth should have been undefined, or a natural number"])
               , this.location);
          }

          if (depth == 0) {
            return [result, pinfo];
          } else {
            var qqSym = new quotedExpr(new symbolExpr('quasiquote')),
              listArgs = [qqSym, result],
              listSym = new symbolExpr('list'),
              listCall = new callExpr(listSym, listArgs);
            qqSym.parent = listArgs;
            qqSym.location = this.location;
            result.parent = listArgs;
            listSym.parent = listCall;
            listSym.location = this.location;
            listCall.location = this.location;
            return [listCall, pinfo]
          }
        };

        symbolExpr.prototype.desugar = function(pinfo){
          // if we're not in a clause, we'd better not see an "else"...
          if(!this.isClause && (this.val === "else")){
            var loc = (this.parent && this.parent[0] === this)? this.parent.location : this.location;
            throwError(new types.Message([new types.ColoredPart(this.val, loc)
                                      , ": not allowed "
                                      , new types.ColoredPart("here", loc)
                                      , ", because this is not a question in a clause"]),
                                    loc);
          }
          // if this is a define without a parent, or if it's not the first child of the parent
          if((this.parent && this.parent[0] !== this) && (this.val === "define")){
            var msg = new types.Message([new types.ColoredPart(this.val, this.location)
              , ": not allowed inside an expression"]);
            throwError(msg, this.location);
          }
          // if this is a keyword without a parent, or if it's not the first child of the parent
          if(!this.parent &&
             (plt.compiler.keywords.indexOf(this.val) > -1) && (this.val !== "else")){
            throwError(new types.Message([new types.ColoredPart(this.val, this.location)
                                      , ": expected an open parenthesis before "
                                      , this.val
                                      , ", but found none"]),
                                    this.location);
          }
          // the dot operator is not supported by WeScheme
          if(this.val === "."){
            var msg = new types.Message([this.location.source, ":",
                                        this.location.startRow.toString(), ":",
            this.location.startCol.toString()
                                  , ": read: '.' is not supported as a symbol in WeScheme"]);
                                throwError(msg
                 , this.location
                 , "Error-GenericReadError");
          }
          return [this, pinfo];
        };
        unsupportedExpr.prototype.desugar = function(pinfo){
          this.location.span = this.errorSpan;
          throwError(this.errorMsg, this.location, "Error-GenericReadError");
        }

        //////////////////////////////////////////////////////////////////////////////
        // COLLECT DEFINITIONS ///////////////////////////////////////////////////////

        // extend the Program class to collect definitions
        // Program.collectDefnitions: pinfo -> pinfo
        Program.prototype.collectDefinitions = function(pinfo){ return pinfo; };

        // bf: symbol path number boolean string -> binding:function
        // Helper function.
        function bf(name, modulePath, arity, vararity, loc){
          return new functionBinding(name, modulePath, arity, vararity, [], false, loc);
        }
        defFunc.prototype.collectDefinitions = function(pinfo){
          this.args.forEach(function(arg){
            if(plt.compiler.keywords.indexOf(arg.val) > -1){
              throwError(new types.Message([new types.ColoredPart(arg.val, arg.location),
                                           ": this is a reserved keyword and cannot be used"+
                                             " as a variable or function name"])
                     , arg.location);

            }
          });

          var binding = bf(this.name.val, false, this.args.length, false, this.name.location);
          return pinfo.accumulateDefinedBinding(binding, this.location);
        };
        defVar.prototype.collectDefinitions = function(pinfo){
          var binding = (this.expr instanceof lambdaExpr)?
            bf(this.name.val, false, this.expr.args.length, false, this.name.location)
              : new constantBinding(this.name.val, false, [], this.name.location);
              return pinfo.accumulateDefinedBinding(binding, this.location);
        };
        defVars.prototype.collectDefinitions = function(pinfo){
          var that = this,
            fieldToAccessor = function(f){return that.stx[1].val+"-"+f.val;},
            fieldToMutator = function(f){return "set-"+that.stx[1].val+"-"+f.val+"!";};
          // if it's define-struct, create a struct binding
          if(that.stx[0].val === "define-struct"){
            var id      = that.stx[1].val,
              fields  = that.stx[2],
              constructorId = "make-"+id,
              predicateId   = id+"?",
              selectorIds   = fields.map(fieldToAccessor),
              mutatorIds    = fields.map(fieldToMutator),
              // build bindings out of these ids
              structureBinding = new structBinding(id, false, fields, constructorId, predicateId,
                                                   selectorIds, mutatorIds, null, that.stx[1].location),
            constructorBinding = bf(constructorId, false, fields.length, false, that.location),
              predicateBinding   = bf(predicateId, false, 1, false, that.location),
              mutatorBinding     = bf(id+"-set!", false, 1, false, that.location),
              refBinding         = bf(id+"-ref", false, 1, false, that.location),
              // COMMENTED OUT ON PURPOSE:
              // these symbols are provided by separate definitions that result from desugaring, in keeping with the original compiler's behavior
              //        selectorBindings   = selectorIds.map(function(id){return bf(id, false, 1, false, that.location)}),
              // AND WOULD YOU BELIEVE IT:
              //  these symbols aren't exposed by the compiler either (maybe since set! isn't supported?)
              //        mutatorBindings    = mutatorIds.map(function(id){return bf(id, false, 2, false, that.location)}),
              // assemble all the bindings together
              bindings = [structureBinding, refBinding, constructorBinding, predicateBinding, mutatorBinding];
            return pinfo.accumulateDefinedBindings(bindings, that.location);
          } else {
            return this.names.reduce(function(pinfo, id){
              var binding = new constantBinding(id.val, false, [], id.location);
              return pinfo.accumulateDefinedBinding(binding, that.location);
            }, pinfo);
          }
        };

        // When we hit a require, we have to extend our environment to include the list of module
        // bindings provided by that module.
        // FIXME: we currently override moduleName, which SHOULD just give us the proper name
        requireExpr.prototype.collectDefinitions = function(pinfo){
          // if it's a literal, pull out the actual value. if it's a symbol use it as-is
          var moduleName = (this.spec instanceof literal)? this.spec.val.toString() : this.spec.toString(),
            resolvedModuleName = pinfo.modulePathResolver(moduleName, pinfo.currentModulePath),
            that = this,
            newPinfo;

          // is this a shared WeScheme program?
          function getWeSchemeModule(name){
            var m = name.match(/^wescheme\/(\w+)$/);
            return m? m[1] : false;
          }

          function throwModuleError(moduleName){
            var bestGuess = plt.compiler.moduleGuess(that.spec.toString());
            var msg = new types.Message(["Found require of the module "
              , new types.ColoredPart(that.spec.toString(), that.spec.location)
              , ", but this module is unknown."
              , ((bestGuess.name===that.spec.toString())? "": " Did you mean '"+bestGuess.name+"'?")]);
            throwError(msg, that.spec.location, "Error-UnknownModule");
          }

          // if it's an invalid moduleName, throw an error
          if(!(resolvedModuleName || getWeSchemeModule(moduleName))){ throwModuleError(moduleName); }

          // processModule : JS -> pinfo
          // assumes the module has been assigned to window.COLLECTIONS.
          // pull out the bindings, and then add them to pinfo
          function processModule(moduleName){
            var provides = window.COLLECTIONS[moduleName].provides;
            var strToBinding = function(p){
              var b = new constantBinding(p, new symbolExpr(moduleName), false);
              b.imported = true; // WTF: Moby treats imported bindings differently, so we need to identify them
              return b;
            },
            provideBindings = provides.map(strToBinding),
              modulebinding = new moduleBinding(moduleName, provideBindings);
            newPinfo = pinfo.accumulateModule(modulebinding).accumulateModuleBindings(provideBindings);
          }

          // open a *synchronous* GET request -- FIXME to use callbacks?
          var url = window.location.protocol+"//"+window.location.host
          + (getWeSchemeModule(moduleName)?  "/loadProject?publicId="+(getWeSchemeModule(moduleName))
            : "/js/mzscheme-vm/collects/"+moduleName+".js");

            // if the module is already loaded, we can just process without loading
            if(window.COLLECTIONS && window.COLLECTIONS[moduleName]){
              processModule(moduleName);
            } else {
              jQuery.ajax({
                url:    url,
                success: function(result) {
                  // if it's not a native module, manually assign it to window.COLLECTIONS
                  if(getWeSchemeModule(moduleName)){
                    var program = (0,eval)('(' + result + ')');
                    // Create the COLLECTIONS array, if it doesn't exist
                    if(window.COLLECTIONS === undefined){ window.COLLECTIONS = []; }
                    // extract the sourcecode
                    var lexemes     = plt.compiler.lex(program.source.src, moduleName),
                      AST         = plt.compiler.parse(lexemes),
                      desugared   = plt.compiler.desugar(AST)[0],  // includes [AST, pinfo]
                      pinfo       = plt.compiler.analyze(desugared),
                      objectCode  = plt.compiler.compile(desugared, pinfo);
                    window.COLLECTIONS[moduleName] = {
                      'name': moduleName,
                      'bytecode' : (0,eval)('(' + objectCode.bytecode + ')'),
                      'provides' : objectCode.provides
                    };
                    // otherwise, simply evaluate the raw JS
                  } else {
                    eval(result);
                  }
                  if(result){ processModule(moduleName); }
                  else { throwModuleError(moduleName); }
                },
                error: function (error) { throwModuleError(moduleName); },
                async: false
              });
            }
            return newPinfo;
        };
        // BINDING STRUCTS ///////////////////////////////////////////////////////
        function provideBindingId(symbl){ this.symbl = symbl;}
        function provideBindingStructId(symbl){ this.symbl = symbl; }

        //////////////////////////////////////////////////////////////////////////////
        // COLLECT PROVIDES //////////////////////////////////////////////////////////

        // extend the Program class to collect provides
        // Program.collectProvides: pinfo -> pinfo
        Program.prototype.collectProvides = function(pinfo){ return pinfo; };
        provideStatement.prototype.collectProvides = function(pinfo){
          var that = this;

          function addProvidedName(id){ pinfo.providedNames.put(id, new provideBindingId(id)); }

          // collectProvidesFromClause : pinfo clause -> pinfo
          function collectProvidesFromClause(pinfo, clause){
            // if it's a symbol, make sure it's defined (otherwise error)
            if (clause instanceof symbolExpr){
              if(pinfo.definedNames.containsKey(clause.val)){
                addProvidedName(clause.val);
                return pinfo;
              } else {
                var msg = new types.Message(["The name '"
                  , new types.ColoredPart(clause.toString(), clause.location)
                  , "', is not defined in the program, and cannot be provided."]);
                throwError(msg, clause.location);
              }
              // if it's an array, make sure the struct is defined (otherwise error)
              // NOTE: ONLY (struct-out id) IS SUPPORTED AT THIS TIME
            } else if(clause instanceof Array){
              if(pinfo.definedNames.containsKey(clause[1].val) &&
                 (pinfo.definedNames.get(clause[1].val) instanceof structBinding)){
                // add the entire structBinding to the provided binding, so we
                // can access fieldnames, predicates, and permissions later
                var b = pinfo.definedNames.get(clause[1].val),
                  fns = [b.name, b.constructor, b.predicate].concat(b.accessors, b.mutators);
                fns.forEach(addProvidedName);
                return pinfo;
              } else {
                throwError(new types.Message(["The struct '"
                                          , new types.ColoredPart(clause[1].toString(), clause[1].location)
                                          , "', is not defined in the program, and cannot be provided"])
                       , clause.location);
              }
              // anything with a different format throws an error
            } else {
              throw "Impossible: all invalid provide clauses should have been filtered out!";
            }
          }
          return this.clauses.reduce(collectProvidesFromClause, pinfo);
        };

        //////////////////////////////////////////////////////////////////////////////
        // ANALYZE USES //////////////////////////////////////////////////////////////

        // extend the Program class to analyzing uses
        // Program.analyzeUses: pinfo -> pinfo
        Program.prototype.analyzeUses = function(pinfo, env){ return pinfo; };
        defVar.prototype.analyzeUses = function(pinfo){
          // if it's a lambda, extend the environment with the function, then analyze as a lambda
          if(this.expr instanceof lambdaExpr) pinfo.env.extend(bf(this.name.val, false, this.expr.args.length, false, this.location));
          return this.expr.analyzeUses(pinfo, pinfo.env);
        };
        defVars.prototype.analyzeUses = function(pinfo){
          return this.expr.analyzeUses(pinfo, pinfo.env);
        };
        defFunc.prototype.analyzeUses = function(pinfo){
          // extend the env to include the function binding, then make a copy of all the bindings
          var oldEnv = pinfo.env.extend(bf(this.name.val, false, this.args.length, false, this.location)),
            oldKeys = oldEnv.bindings.keys(),
            newBindings = types.makeLowLevelEqHash();
          oldKeys.forEach(function(k){newBindings.put(k, oldEnv.bindings.get(k));});

          // make a copy of the environment, using the newly-copied bindings
          // add the args to this environment
          var newEnv = new plt.compiler.env(newBindings),
            newEnv = this.args.reduce(function(env, arg){
            return env.extend(new constantBinding(arg.val, false, [], arg.location));
          }, newEnv);
          pinfo.env = newEnv;                           // install the post-arg env into pinfo
          pinfo = this.body.analyzeUses(pinfo, newEnv); // analyze the body
          pinfo.env = oldEnv;                           // install the pre-arg environment for pinfo
          return pinfo;
        };
        beginExpr.prototype.analyzeUses = function(pinfo, env){
          return this.exprs.reduce(function(p, expr){return expr.analyzeUses(p, env);}, pinfo);
        };
        // FIXME: Danny says that using a basePInfo is almost certainly a bug, but we're going to do it for now
        // to match the behavior in Moby, which promotes any closed variables to a global.
        lambdaExpr.prototype.analyzeUses = function(pinfo, env){
          //    var env1 = pinfo.env, // FIXME: this is what the line *should* be
          var env1 = plt.compiler.getBasePinfo("base").env,
            env2 = this.args.reduce(function(env, arg){
            return env.extend(new constantBinding(arg.val, false, [], arg.location));
          }, env1);
          return this.body.analyzeUses(pinfo, env2);
        };

        /*
        // If we don't care about matching Danny's compiler, the code *probably should be*
        localExpr.prototype.analyzeUses = function(pinfo, env){
        var pinfoAfterDefs = this.defs.reduce(function(pinfo, d){ return d.analyzeUses(pinfo, env); }, pinfo);
        return this.body.analyzeUses(pinfoAfterDefs, env);
        };
         */

        // This is what we do to match Danny's compiler, which I think behaves incorrectly. It's a
        // horrible, horrible hack designed to get around the fact that we use immutable hashtables
        // SHOULD BE TESTED FURTHER
        localExpr.prototype.analyzeUses = function(pinfo, env){
          //    var originalEnv = pinfo.env;
          pinfo.env = plt.compiler.getBasePinfo("base").env;
          var pinfoAfterDefs = this.defs.reduce(function(pinfo, d){ return d.analyzeUses(pinfo);}, pinfo);

          // extend the env to include the function binding, then make a copy of all the bindings
          var envAfterDefs = pinfoAfterDefs.env, oldKeys = envAfterDefs.bindings.keys(),
            newBindings = types.makeLowLevelEqHash();
          oldKeys.forEach(function(k){newBindings.put(k, envAfterDefs.bindings.get(k));});

          var bodyPinfo = this.body.analyzeUses(pinfoAfterDefs, envAfterDefs);
          bodyPinfo.env = envAfterDefs;
          return bodyPinfo;
        };

        callExpr.prototype.analyzeUses = function(pinfo, env){
          return [this.func].concat(this.args).reduce(function(p, arg){
            return (arg instanceof Array)?
              // if arg is a subexpression, reduce THAT
              arg.reduce((function(pinfo, p){return p.analyzeUses(pinfo, pinfo.env);})
                                               , pinfo)
                                             // otherwise analyze and return
                                               : arg.analyzeUses(p, env);
          }, pinfo);
        }
        ifExpr.prototype.analyzeUses = function(pinfo, env){
          var exps = [this.predicate, this.consequence, this.alternative];
          return exps.reduce(function(p, exp){
            return exp.analyzeUses(p,env);
          }, pinfo);
        };
        symbolExpr.prototype.analyzeUses = function(pinfo, env){
          // if this is a keyword without a parent, or if it's not the first child of the parent
          if((plt.compiler.keywords.indexOf(this.val) > -1) &&
             (!this.parent || this.parent[0]!== this) || (this.parent instanceof couple)){
            throwError(new types.Message([new types.ColoredPart(this.val, this.location)
                                      , ": expected an open parenthesis before "
                                      , this.val
                                      , ", but found none"]),
                                    this.location);
          }
          var binding = env.lookup_context(this.val);
          if(binding){
            return pinfo.accumulateBindingUse(binding, pinfo);
          } else {
            return pinfo.accumulateFreeVariableUse(this.val, pinfo);
          }
        };

        /////////////////////////////////////////////////////////////
        function analyze(programs){
          return programAnalyzeWithPinfo(programs, plt.compiler.getBasePinfo("base"));
        }

        // programAnalyzerWithPinfo : [listof Programs], pinfo -> pinfo
        // build up pinfo by looking at definitions, provides and uses
        function programAnalyzeWithPinfo(programs, pinfo){
          // collectDefinitions: [listof Programs] pinfo -> pinfo
          // Collects the definitions either imported or defined by this program.
          function collectDefinitions(programs, pinfo){
            return programs.reduce((function(pinfo, p){ return p.collectDefinitions(pinfo); })
                            , pinfo);
          }
          // collectProvides: [listof Programs] pinfo -> pinfo
          // Walk through the program and collect all the provide statements.
          function collectProvides(programs, pinfo){
            return programs.reduce((function(pinfo, p){ return p.collectProvides(pinfo); })
                             , pinfo);
          }
          // analyzeUses: [listof Programs] pinfo -> pinfo
          // Collects the uses of bindings that this program uses.
          function analyzeUses(programs, pinfo){
            return programs.reduce((function(pinfo, p){ return p.analyzeUses(pinfo, pinfo.env); })
                             , pinfo);
          }
          var pinfo1 = collectDefinitions(programs, pinfo);
          var pinfo2 = collectProvides(programs, pinfo1);
          return analyzeUses(programs, pinfo2);
        }

        /////////////////////
        /* Export Bindings */
        /////////////////////
        plt.compiler.desugar = function(p, pinfo, debug){
          var start       = new Date().getTime();
          try {
            var ASTandPinfo = desugarProgram(p, pinfo, true), // do the actual work
              program     = ASTandPinfo[0],
              pinfo       = ASTandPinfo[1];
          } catch (e) { console.log("DESUGARING ERROR"); throw e; }
          var end = new Date().getTime();
          if(debug){
            console.log("Desugared in "+(Math.floor(end-start))+"ms");
            console.log(program);
            console.log(program.toString());
          }
          return ASTandPinfo;
        };
        plt.compiler.analyze = function(program, debug){
          var start       = new Date().getTime();
          try { var pinfo       = analyze(program); }             // do the actual work
          catch (e) { console.log("ANALYSIS ERROR"); throw e; }
          var end         = new Date().getTime();
          if(debug){
            console.log("Analyzed in "+(Math.floor(end-start))+"ms");
            //      console.log(pinfo.toString());
          }
          return pinfo;
        };
        plt.compiler.provideBindingId = provideBindingId;
        plt.compiler.provideBindingStructId = provideBindingStructId;
      })();

      // Input 6

      /*
         TODO
         - stop using synchronous XmlHttpRequests -> probably only after the compiler is folded into the evaluator
       */

      // Input 7

      /*
         TODO
         - compiled-indirects
         - someday, get rid of convertToBytecode()
         - PERF: Switch from array to hashtable for freeVariables search
         - fix uniqueGlobalNames hack!
         - deal with more complex module resolution (e.g. - rename-out, etc)
       */

      (function (){

        // import frequently-used bindings
        var literal          = plt.compiler.literal;
        var symbolExpr       = plt.compiler.symbolExpr;
        var Program          = plt.compiler.Program;
        var ifExpr           = plt.compiler.ifExpr;
        var beginExpr        = plt.compiler.beginExpr;
        var localExpr        = plt.compiler.localExpr;
        var andExpr          = plt.compiler.andExpr;
        var orExpr           = plt.compiler.orExpr;
        var lambdaExpr       = plt.compiler.lambdaExpr;
        var quotedExpr       = plt.compiler.quotedExpr;
        var callExpr         = plt.compiler.callExpr;
        var defFunc          = plt.compiler.defFunc;
        var defVar           = plt.compiler.defVar;
        var defVars          = plt.compiler.defVars;
        var defStruct        = plt.compiler.defStruct;
        var requireExpr      = plt.compiler.requireExpr;
        var provideStatement = plt.compiler.provideStatement;

        // Inheritance from pg 168: Javascript, the Definitive Guide.
        var heir = function(p) {
          var f = function() {};
          f.prototype = p;
          return new f();
        };

        literal.prototype.toBytecode = function(){
          var str = this.val.toBytecode? this.val.toBytecode()
            : this.val===true? "true"
              : this.val===false? "false"
                : this.toString();
                return '{"$":"constant","value":'+str+'}';
        };
        symbolExpr.prototype.toBytecode = function(){
          return 'types.symbol("'+escapeSym(this.val)+'")';
        };
        Vector.prototype.toBytecode = function(){
          return 'types.vector(['+this.elts.join(',')+'])';
        };
        Array.prototype.toBytecode = function(quoted){
          return 'types.'+(this.length===0? 'EMPTY':'list(['+this.map(convertToBytecode).join(',')+'])');
        };
        // Bytecode generation for jsnums types
        jsnums.Rational.prototype.toBytecode = function(){
          return 'types.rational('+convertToBytecode(this.n)+', '+convertToBytecode(this.d)+')';
        };
        jsnums.BigInteger.prototype.toBytecode = function(){
          return 'types.bignum("'+this.toString()+'")';
        };
        jsnums.Roughnum.prototype.toBytecode = function(){
          return 'types.roughnum('+this.toString()+')';
        };
        Char.prototype.toBytecode = function(){
          return 'types[\'char\'](String.fromCharCode('+this.val.charCodeAt(0)+'))';
        };
        // STACKREF STRUCTS ////////////////////////////////////////////////////////////////
        function stackReference(){}
        function localStackReference(name, isBoxed, depth){
          stackReference.call(this);
          this.name = name;
          this.isBoxed = isBoxed;
          this.depth = depth;
        }
        localStackReference.prototype = heir(stackReference.prototype);
        function globalStackReference(name, depth, pos){
          stackReference.call(this);
          this.name = name;
          this.pos = pos;
          this.depth = depth;
        }
        globalStackReference.prototype = heir(stackReference.prototype);
        function unboundStackReference(name){
          stackReference.call(this);
          this.name = name;
        }
        unboundStackReference.prototype = heir(stackReference.prototype);

        /**************************************************************************
         *
         *    BYTECODE STRUCTS -
         *    (see https://github.com/bootstrapworld/wescheme-compiler2012/blob/master/js-runtime/src/bytecode-structs.ss)
         *
         **************************************************************************/

        // all Programs, by default, print out their values and have no location
        // anything that behaves differently must provide their own toBytecode() function
        var Bytecode = function() {
          // -> JSON
          this.toBytecode = function(){ console.log(this); throw "IMPOSSIBLE - generic bytecode toBytecode method was called"; };
        };

        // for mapping JSON conversion over an array
        function convertToBytecode(bc){
          //console.log('convertToBytecode of ' + bc);
          if(types.isString(bc) && bc.chars!==undefined) return '"'+bc.toString()+'"';
          return (bc.toBytecode)? bc.toBytecode() : bc;
        }

        // convert a symbol-name into bytecode string
        function escapeSym(symName){
          var str = symName.toString().replace(/\|/g,''),  bcStr = "";
          // possible characters that need to be escaped
          var escapes = ["{", "}", "[", "]", ",", "'", "`", " ", "\\", '"'];
          for(var j=0; j<str.length; j++){
            bcStr += ((escapes.indexOf(str.charAt(j)) > -1)? '\\' : '') + str.charAt(j);
          }
          // special-case for newline characters
          bcStr= bcStr.replace(/\n/g,"\\n");
          return bcStr;
        }

        // Global bucket
        function globalBucket(name) {
          Bytecode.call(this);
          this.name = name;  // symbol
          this.toBytecode = function(){
            return '{"$":"global-bucket","value":"'+escapeSym(this.name)+'"}';
          };
        };
        globalBucket.prototype = heir(Bytecode.prototype);

        // Module variable
        function moduleVariable(modidx, sym, pos, phase) {
          Bytecode.call(this);
          this.$    = 'module-variable';
          this.modidx = modidx; // module-path-index
          this.sym    = sym;    // symbol
          this.pos    = pos;    // exact integer
          this.phase  = phase;  // 1/0 - direct access to exported id
          this.toBytecode = function(){
            return '{"$":"module-variable","sym":'+this.sym.toBytecode()
            +',"modidx":'+this.modidx.toBytecode()+',"pos":'+this.pos
            +',"phase":'+this.phase+'}';
          };
        };
        moduleVariable.prototype = heir(Bytecode.prototype);

        // Wrap syntax object
        function wrap() {
          Bytecode.call(this);
        };
        wrap.prototype = heir(Bytecode.prototype);

        // Wrapped syntax object
        function wrapped(datum, wraps, certs) {
          Bytecode.call(this);
          this.datum  = datum;  // any
          this.wraps  = wraps;  // list of wrap
          this.certs = certs;   // list or false
        };
        wrapped.prototype = heir(Bytecode.prototype);

        // Stx
        function stx(encoded) {
          this.encoded  = encoded;  // wrapped
          Bytecode.call(this);
        };
        stx.prototype = heir(Bytecode.prototype);

        // prefix
        function prefix(numLifts, topLevels, stxs) {
          Bytecode.call(this);
          this.numLifts   = numLifts;  // exact, non-negative integer
          this.topLevels  = topLevels; // list of (false, symbol, globalBucket or moduleVariable)
          this.stxs       = stxs;      // list of stxs
          this.toBytecode = function(){
            return '{"$":"prefix","num-lifts":'+this.numLifts+',"toplevels":['
            +this.topLevels.map(function(v){return convertToBytecode(v);}).join(',')
            +'],"stxs":['
            +this.stxs.map(convertToBytecode)+']}';
          };
        };
        prefix.prototype = heir(Bytecode.prototype);

        // form
        function form() {
          Bytecode.call(this);
        };
        form.prototype = heir(Bytecode.prototype);

        // expr
        function expr(form) {
          Bytecode.call(this);
        };
        expr.prototype = heir(Bytecode.prototype);

        // Indirect
        function indirect(v) {
          Bytecode.call(this);
          this.v  = v; // ??
          this.toBytecode = function(){
            return '{"$":"indirect","v":'+this.v.toBytecode()+'}';
          };
        };
        indirect.prototype = heir(Bytecode.prototype);

        // compilationTop
        function compilationTop(maxLetDepth, prefix, code) {
          Bytecode.call(this);
          this.maxLetDepth= maxLetDepth;  // exact non-negative integer
          this.prefix     = prefix;       // prefix
          this.code       = code;         // form, indirect, or any
          this.toBytecode = function(){
            return '{"$":"compilation-top","max-let-depth":'+this.maxLetDepth+',"prefix":'
            + this.prefix.toBytecode()+',"compiled-indirects":[],"code":'
            + this.code.toBytecode()+'}';
          };
        };
        compilationTop.prototype = heir(Bytecode.prototype);

        // provided
        function provided(name, src, srcName, nomSrc, srcPhase, isProtected, insp) {
          Bytecode.call(this);
          this.name     = name;      // symbol
          this.src      = src;       // false or modulePathIndex
          this.srcName  = srcName;   // symbol
          this.nomSrc   = nomSrc;    // false or modulePathIndex
          this.srcPhase = srcPhase;  // 0/1
          this.insp     = insp;      // boolean or void
          this.isProtected=isProtected; // boolean
        };
        provided.prototype = heir(Bytecode.prototype);

        // topLevel
        function topLevel(depth, pos, constant, ready, loc) {
          Bytecode.call(this);
          this.depth    = depth;    // exact, non-negative integer
          this.pos      = pos;      // exact, non-negative integer
          this.constant = constant; // boolean
          this.ready    = ready;    // boolean
          this.loc      = loc;      // false or Location
          this.toBytecode = function(){
            return '{"$":"toplevel","depth":'+this.depth.toString()+',"pos":'+this.pos.toString()
            +',"const?":'+this.constant+',"ready?":'+this.ready+',"loc":'
            + (this.loc && this.loc.toVector().toBytecode())+'}';
          };
        };
        topLevel.prototype = heir(Bytecode.prototype);

        // seq
        function seq(forms) {
          Bytecode.call(this);
          this.forms    = forms;  // list of form, indirect, any
          this.toBytecode = function(){
            return '{"$":"seq","forms":['+this.forms.map(convertToBytecode).join(',')+']}';
          };
        };
        seq.prototype = heir(Bytecode.prototype);

        // defValues
        function defValues(ids, rhs) {
          Bytecode.call(this);
          this.ids  = ids;  // list of toplevel or symbol
          this.rhs  = rhs;  // expr, indirect, seq, any
          this.toBytecode = function(){
            return '{"$":"def-values","ids":['+this.ids.map(convertToBytecode).join(',')
            +'],"body":'+this.rhs.toBytecode()+'}';
          };
        };
        defValues.prototype = heir(Bytecode.prototype);

        // defSyntaxes
        function defSyntaxes(ids, rhs, prefix, maxLetDepth) {
          Bytecode.call(this);
          this.$          = 'def-values';
          this.ids        = ids;      // list of toplevel or symbol
          this.rhs        = rhs;      // expr, indirect, seq, any
          this.prefix     = prefix;   // prefix
          this.maxLetDepth= maxLetDepth; // exact, non-negative integer
          this.toBytecode = function(){
            return '{"$":"def-values","ids":['+this.ids.toBytecode().join(',')
            +'],"rhs":'+this.rhs.toBytecode()
            +',"prefix":'+this.prefix.toBytecode()+',"max-let-depth":'+this.maxLetDepth.toBytecode()+'}';
          };
        };
        defSyntaxes.prototype = heir(Bytecode.prototype);

        // defForSyntax
        function defForSyntax(ids, rhs, prefix, maxLetDepth) {
          Bytecode.call(this);
          this.ids        = ids;      // list of toplevel or symbol
          this.rhs        = rhs;      // expr, indirect, seq, any
          this.prefix     = prefix;   // prefix
          this.maxLetDepth= maxLetDepth; // exact, non-negative integer
        };
        defForSyntax.prototype = heir(Bytecode.prototype);

        // mod
        function mod(name, selfModidx, prefix, provides, requires, body,
                     syntaxBody, unexported, maxLetDepth, dummy, langInfo,
                     internalContext) {
                       Bytecode.call(this);
                       this.name       = name;         // exact, non-negative integer
                       this.selfModidx = selfModidx;   // exact, non-negative integer
                       this.prefix     = prefix;       // boolean
                       this.provides   = provides;     // boolean
                       this.requires   = requires;     // false or Location
                       this.body       = body;         // exact, non-negative integer
                       this.syntaxBody = syntaxBody;   // exact, non-negative integer
                       this.unexported = unexported;   // boolean
                       this.maxLetDepth= maxLetDepth;  // exact, non-negative integer
                       this.dummy      = dummy;        // false or Location
                       this.langInfo   = langInfo;     // false or (vector modulePath symbol any)
                       this.internalContext = internalContext;
                       this.toBytecode = function(){
                         return '{"$":"mod","name":'+this.name.toBytecode()+',"self-modidx":'+this.selfModidx.toBytecode()
                         +',"prefix":'+this.prefix.toBytecode()+',"provides":'+this.provides.toBytecode()
                         +',"requires":'+(this.requires && this.requires.toVector().toBytecode())+',"body":'
                         +this.body.toBytecode()+',"stx-body":'+this.syntaxBody.toBytecode()+',"max-let-depth":'
                         +this.maxLetDepth.toBytecode()+'}';
                       };
                     };
                     mod.prototype = heir(Bytecode.prototype);

                     // lam
                     function lam(name, operatorAndRandLocs, flags, numParams, paramTypes,
                                  rest, closureMap, closureTypes, maxLetDepth, body) {

                                    Bytecode.call(this);
                                    this.name       = name;         // symbol, vector, empty
                                    this.flags      = flags;        // (list of ('preserves-marks 'is-method 'single-result))
                                    this.numParams  = numParams;    // exact, non-negative integer
                                    this.paramTypes = paramTypes;   // list of ('val 'ref 'flonum)
                                    this.rest       = rest;         // boolean
                                    this.body       = body;         // expr, seq, indirect
                                    this.closureMap = closureMap;   // vector of exact, non-negative integers
                                    this.maxLetDepth= maxLetDepth;  // exact, non-negative integer
                                    this.closureTypes=closureTypes; // list of ('val/ref or 'flonum)
                                    this.operatorAndRandLocs = operatorAndRandLocs; // list of Vectors
                                    // operator+rand-locs includes a list of vectors corresponding to the location
                                    // of the operator, operands, etc if we can pick them out.  If we can't get
                                    // this information, it's false
                                    this.toBytecode = function(){
                                      return '{"$":"lam","name":'+this.name.toBytecode()+',"locs":['
                                      +this.operatorAndRandLocs.map(convertToBytecode).join(',')+'],"flags":['
                                      +this.flags.map(convertToBytecode).join(',')+'],"num-params":'+this.numParams
                                      +',"param-types":['+this.paramTypes.map(convertToBytecode).join(',')+'],"rest?":'+this.rest
                                      +',"closure-map":['+this.closureMap.map(convertToBytecode).join(',')+'],"closure-types":['
                                      +this.closureTypes.map(convertToBytecode).join(',')+'],"max-let-depth":'+this.maxLetDepth
                                      +',"body":'+this.body.toBytecode()+'}';
                                    };
                                  };
                                  lam.prototype = heir(Bytecode.prototype);

                                  // closure: a static closure (nothing to close over)
                                  function closure(code, genId) {
                                    Bytecode.call(this);
                                    this.code     = code;  // lam
                                    this.genId    = genId; // symbol
                                    this.toBytecode = function(){
                                      return '{"$":"closure","code":'+this.code.toBytecode()+',"gen-id":'+this.genId.toBytecode()+'}';
                                    };
                                  };
                                  closure.prototype = heir(Bytecode.prototype);

                                  // caseLam: each clause is a lam (added indirect)
                                  function caseLam(name, clauses) {
                                    Bytecode.call(this);
                                    this.name     = name;  // symbol, vector, empty
                                    this.clauses  = clauses; // list of (lambda or indirect)
                                    this.toBytecode = function(){
                                      return '{"$":"case-lam","name":'+this.name.toBytecode()+',"clauses":'+this.clauses.toBytecode()+'}';
                                    };
                                  };
                                  caseLam.prototype = heir(Bytecode.prototype);

                                  // letOne
                                  function letOne(rhs, body, flonum) {
                                    Bytecode.call(this);
                                    this.rhs     = rhs;   // expr, seq, indirect, any
                                    this.body    = body;  // expr, seq, indirect, any
                                    this.flonum  = flonum;// boolean
                                    this.toBytecode = function(){
                                      return '{"$": "let-one","rhs":'+this.rhs.toBytecode()+',"body":'+this.body.toBytecode()
                                      +',"flonum":'+this.flonum.toBytecode()+'}';
                                    };
                                  };
                                  letOne.prototype = heir(Bytecode.prototype);

                                  // letVoid
                                  function letVoid(count, boxes, body) {
                                    Bytecode.call(this);
                                    this.count   = count;   // exact, non-negative integer
                                    this.boxes   = boxes;   // boolean
                                    this.body    = body;    // expr, seq, indirect, any
                                    this.toBytecode = function(){
                                      return '{"$":"let-void","count":'+convertToBytecode(this.count)+',"boxes?":'
                                      +convertToBytecode(this.boxes)+',"body":'+this.body.toBytecode()+'}';
                                    };
                                  };
                                  letVoid.prototype = heir(Bytecode.prototype);

                                  // letRec: put `letrec'-bound closures into existing stack slots
                                  function letRec(procs, body) {
                                    Bytecode.call(this);
                                    this.procs   = procs;   // list of lambdas
                                    this.body    = body;    // expr, seq, indirect, any
                                    this.toBytecode = function(){
                                      return '{"$":"let-rec","procs":'+this.procs.toBytecode()+',"body":'+this.body.toBytecode()+'}';
                                    };
                                  };
                                  letRec.prototype = heir(Bytecode.prototype);

                                  // installValue
                                  function installValue(count, pos, boxes, rhs, body) {
                                    Bytecode.call(this);
                                    this.count   = count;   // exact, non-negative integer
                                    this.pos     = pos;     // exact, non-negative integer
                                    this.boxes   = boxes;   // boolean
                                    this.rhs     = rhs;     // expr, seq, indirect, any
                                    this.body    = body;    // expr, seq, indirect, any -- set existing stack slot(s)
                                    this.toBytecode = function(){
                                      return '{"$":"install-value","count":'+convertToBytecode(this.count)+',"pos":'+convertToBytecode(this.pos)
                                      +',"boxes?":'+convertToBytecode(this.boxes)+',"rhs":'+this.rhs.toBytecode()
                                      +',"body":'+this.body.toBytecode()+'}';
                                    };
                                  };
                                  installValue.prototype = heir(Bytecode.prototype);

                                  // boxEnv: box existing stack element
                                  function boxEnv(pos, body) {
                                    Bytecode.call(this);
                                    this.pos     = pos;     // exact, non-negative integer
                                    this.body    = body;    // expr, seq, indirect, any
                                    this.toBytecode = function(){
                                      return '{"$":"boxenv","pos":'+this.pos.toBytecode()+',"body":'+this.body.toBytecode()+'}';
                                    };
                                  };
                                  boxEnv.prototype = heir(Bytecode.prototype);

                                  // localRef: access local via stack
                                  function localRef(unbox, pos, clear, otherClears, flonum) {
                                    Bytecode.call(this);
                                    this.unbox   = unbox || false;   // boolean
                                    this.pos     = pos;     // exact, non-negative integer
                                    this.clear   = clear;   // boolean
                                    this.flonum  = flonum;  // boolean
                                    this.otherClears= otherClears; // boolean
                                    this.toBytecode = function(){
                                      return '{"$":"localref","unbox?":'+this.unbox+',"pos":'+this.pos+',"clear":'+this.clear
                                      +',"other-clears?":'+this.otherClears+',"flonum?":'+this.flonum+'}';
                                    };
                                  };
                                  localRef.prototype = heir(Bytecode.prototype);

                                  // topSyntax : access syntax object via prefix array (which is on stack)
                                  function topSyntax(depth, pos, midpt) {
                                    Bytecode.call(this);
                                    this.depth   = depth;   // exact, non-negative integer
                                    this.pos     = pos;     // exact, non-negative integer
                                    this.midpt   = midpt;   // exact, non-negative integer
                                  };
                                  topSyntax.prototype = heir(Bytecode.prototype);

                                  // application: function call
                                  function application(rator, rands) {
                                    Bytecode.call(this);
                                    this.rator   = rator;   // expr, seq, indirect, any
                                    this.rands   = rands;   // list of (expr, seq, indirect, any)
                                    this.toBytecode = function(){
                                      return '{"$":"application","rator":'+this.rator.toBytecode()+',"rands":['
                                      +this.rands.map(convertToBytecode).join(',')+']}';
                                    };
                                  };
                                  application.prototype = heir(Bytecode.prototype);

                                  // branch
                                  function branch(testExpr, thenExpr, elseExpr) {
                                    Bytecode.call(this);
                                    this.testExpr = testExpr;   // expr, seq, indirect, any
                                    this.thenExpr = thenExpr;   // expr, seq, indirect, any
                                    this.elseExpr = elseExpr;   // expr, seq, indirect, any
                                    this.toBytecode = function(){
                                      return '{"$":"branch","test":'+this.testExpr.toBytecode()
                                      +',"then":'+this.thenExpr.toBytecode()
                                      +',"else":'+this.elseExpr.toBytecode()+'}';
                                    };
                                  };
                                  branch.prototype = heir(Bytecode.prototype);

                                  // withContMark:'with-cont-mark'
                                  function withContMark(key, val, body) {
                                    Bytecode.call(this);
                                    this.$    = 'with-cont-mark';
                                    this.key  = key;   // expr, seq, indirect, any
                                    this.val  = val;   // expr, seq, indirect, any
                                    this.body = body;  // expr, seq, indirect, any
                                    this.toBytecode = function(){
                                      return '{"$":"with-cont-mark","key":'+new literal(new symbolExpr(this.key)).toBytecode()
                                      +',"val":'+new literal(this.val).toBytecode()
                                      +',"body":'+this.body.toBytecode()+'}';
                                    };
                                  };
                                  withContMark.prototype = heir(Bytecode.prototype);

                                  // beg0: begin0
                                  function beg0(seq) {
                                    Bytecode.call(this);
                                    this.seq  = seq;   // list  of (expr, seq, indirect, any)
                                    this.toBytecode = function(){ return '{"$":"beg0","seq":'+this.seq.toBytecode()+'}';  };
                                  };
                                  beg0.prototype = heir(Bytecode.prototype);

                                  // splice: top-level 'begin'
                                  function splice(forms) {
                                    Bytecode.call(this);
                                    this.forms  = forms;   // list  of (expr, seq, indirect, any)
                                    this.toBytecode = function(){ return '{"$":"splice","forms":'+this.forms.toBytecode()+'}';  };
                                  };
                                  splice.prototype = heir(Bytecode.prototype);

                                  // varRef: `#%variable-reference'
                                  function varRef(topLevel) {
                                    Bytecode.call(this);
                                    this.topLevel  = topLevel;   // topLevel
                                    this.toBytecode = function(){ return '{"$":"varref","top-level":'+this.topLevel.toBytecode()+'}';  };
                                  };
                                  varRef.prototype = heir(Bytecode.prototype);

                                  // assign: top-level or module-level set!
                                  function assign(id, rhs, undefOk) {
                                    Bytecode.call(this);
                                    this.id      = id;      // topLevel
                                    this.rhs     = rhs;     // expr, seq, indirect, any
                                    this.undefOk = undefOk; // boolean
                                    this.toBytecode = function(){
                                      return '{"$":"assign","id":'+this.id.toBytecode()+',"rhs":'+this.rhs.toBytecode()
                                      +',"undef-ok":'+this.undefOk.toBytecode()+'}';
                                    };
                                  };
                                  assign.prototype = heir(Bytecode.prototype);

                                  // applyValues: `(call-with-values (lambda () ,args-expr) ,proc)
                                  function applyValues(proc, args) {
                                    Bytecode.call(this);
                                    this.proc    = proc;    // expr, seq, indirect, any
                                    this.args    = args;    // expr, seq, indirect, any
                                    this.toBytecode = function(){
                                      return '{"$":"apply-values","proc":'+this.proc.toBytecode()+',"args":'+this.args.toBytecode()+'}';
                                    };
                                  };
                                  applyValues.prototype = heir(Bytecode.prototype);

                                  // primVal: direct preference to a kernel primitive
                                  function primVal(id) {
                                    Bytecode.call(this);
                                    this.id      = id;    // exact, non-negative integer
                                    this.toBytecode = function(){ return '{"$":"primval","id":'+this.id.toBytecode()+'}';  };
                                  };
                                  primVal.prototype = heir(Bytecode.prototype);

                                  // req
                                  function req(reqs, dummy) {
                                    Bytecode.call(this);
                                    this.$        = 'req';
                                    this.reqs    = reqs;    // syntax
                                    this.dummy   = dummy;   // toplevel
                                    this.toBytecode = function(){
                                      var reqBytecode = (this.reqs instanceof literal)? '"'+this.reqs.val+'"' : this.reqs.toBytecode();
                                      return '{"$":"req","reqs":'+reqBytecode+',"dummy":'+this.dummy.toBytecode()+'}';
                                    };
                                  };
                                  req.prototype = heir(Bytecode.prototype);

                                  // lexicalRename
                                  function lexicalRename(bool1, bool2, alist) {
                                    this.bool1   = bool1;    // boolean
                                    this.bool2   = bool2;    // boolean
                                    this.alist   = alist;    // should be list of (cons symbol, symbol)
                                    Bytecode.call(this);
                                  };
                                  lexicalRename.prototype = heir(Bytecode.prototype);

                                  // phaseShift
                                  function phaseShift(amt, src, dest) {
                                    this.amt     = amt;    // syntax
                                    this.src     = src;    // false or modulePathIndex
                                    this.dest    = dest;   // false or modulePathIndex
                                    Bytecode.call(this);
                                  };
                                  phaseShift.prototype = heir(Bytecode.prototype);

                                  // wrapMark
                                  function wrapMark(val) {
                                    this.val     = val;    // exact integer
                                    Bytecode.call(this);
                                  };
                                  wrapMark.prototype = heir(Bytecode.prototype);

                                  // prune
                                  function prune(sym) {
                                    this.sym     = sym;    // any
                                    Bytecode.call(this);
                                  };
                                  prune.prototype = heir(Bytecode.prototype);

                                  // allFromModule
                                  function allFromModule(path, phase, srcPhase, exceptions, prefix) {
                                    this.path     = path;       // modulePathIndex
                                    this.phase    = phase;      // false or exact integer
                                    this.srcPhase = srcPhase;   // any
                                    this.prefix   = prefix;     // false or symbol
                                    this.exceptions=exceptions; // list of symbols
                                    Bytecode.call(this);
                                  };
                                  allFromModule.prototype = heir(Bytecode.prototype);

                                  // nominalPath
                                  function nominalPath() {
                                    Bytecode.call(this);
                                  };
                                  nominalPath.prototype = heir(Bytecode.prototype);

                                  // simpleNominalPath
                                  function simpleNominalPath(value) {
                                    this.value = value; // modulePathIndex
                                    Bytecode.call(this);
                                  };
                                  simpleNominalPath.prototype = heir(Bytecode.prototype);

                                  /*    // moduleBinding
                                        function moduleBinding() {
                                        Bytecode.call(this);
                                        };
                                        moduleBinding.prototype = heir(Bytecode.prototype);
                                   */
                                  // phasedModuleBinding
                                  function phasedModuleBinding(path, phase, exportName, nominalPath, nominalExportName) {
                                    this.path       = path;       // modulePathIndex
                                    this.phase      = phase;      // exact integer
                                    this.exportName = nominalPath;// nominalPath
                                    this.nominalExportName  = nominalExportName; // any
                                    Bytecode.call(this);
                                  };
                                  phasedModuleBinding.prototype = heir(Bytecode.prototype);

                                  // exportedNominalModuleBinding
                                  function exportedNominalModuleBinding(path, exportName, nominalPath, nominalExportName) {
                                    this.path       = path;       // modulePathIndex
                                    this.exportName = exportName; // any
                                    this.nominalPath= nominalPath;// nominalPath
                                    this.nominalExportName  = nominalExportName; // any
                                    Bytecode.call(this);
                                  };
                                  exportedNominalModuleBinding.prototype = heir(Bytecode.prototype);

                                  // nominalModuleBinding
                                  function nominalModuleBinding(path, nominalPath) {
                                    this.path       = path;        // modulePathIndex
                                    this.nominalPath= nominalPath; // any
                                    Bytecode.call(this);
                                  };
                                  nominalModuleBinding.prototype = heir(Bytecode.prototype);

                                  // exportedModuleBinding
                                  function exportedModuleBinding(path, exportName) {
                                    this.path       = path;       // modulePathIndex
                                    this.exportName = exportName; // any
                                    Bytecode.call(this);
                                  };
                                  exportedModuleBinding.prototype = heir(Bytecode.prototype);

                                  // simpleModuleBinding
                                  function simpleModuleBinding(path) {
                                    this.path       = path;       // modulePathIndex
                                    Bytecode.call(this);
                                  };
                                  simpleModuleBinding.prototype = heir(Bytecode.prototype);

                                  // ModuleRename
                                  function ModuleRename(phase, kind, setId, unmarshals, renames, markRenames, plusKern) {
                                    this.phase      = phase;       // false or exact integer
                                    this.kind       = kind;        // "marked" or "normal"
                                    this.unmarshals = unmarshals;  // list of allFromModule
                                    this.renames    = renames;     // list of (symbol or moduleBinding)
                                    this.markRenames= markRenames; // any
                                    this.plusKern   = plusKern;    // boolean
                                    Bytecode.call(this);
                                  };
                                  ModuleRename.prototype = heir(Bytecode.prototype);

                                  // HACK: module-path
                                  function modulePath(path, base){
                                    this.path = path;
                                    this.base = base;
                                    Bytecode.call(this);
                                    this.toBytecode = function(){
                                      return '{"$":"module-path","path":'+convertToBytecode(this.path)+',"base":'+convertToBytecode(this.base)+'}';
                                    };
                                  };
                                  modulePath.prototype = heir(Bytecode.prototype);

                                  // freeVariables : [listof symbols] env -> [list of symbols]
                                  Program.prototype.freeVariables   = function(acc, env){ return acc; }
                                  ifExpr.prototype.freeVariables    = function(acc, env){
                                    return this.alternative.freeVariables(this.consequence.freeVariables(this.predicate.freeVariables(acc, env), env), env);
                                  };
                                  beginExpr.prototype.freeVariables = function(acc, env){
                                    return this.exprs.reduceRight(function(acc, expr){return expr.freeVariables(acc, env);}, acc);
                                  };
                                  // if it's an unbound variable that we haven't seen before, add it to acc
                                  symbolExpr.prototype.freeVariables= function(acc, env){
                                    return ((env.lookup(this.val, 0) instanceof unboundStackReference)
                                            && (acc.indexOf(this) == -1))? acc.concat([this]) : acc;
                                  };
                                  localExpr.prototype.freeVariables = function(acc, env){
                                    // helper functions
                                    var pushLocalBoxedFromSym = function(env, sym) { return new plt.compiler.localEnv(sym.val, true, env); },
                                      pushLocalFromSym      = function(env, sym) { return new plt.compiler.localEnv(sym.val, false, env); };

                                    // collect all the defined names in the local
                                    var definedNames = this.defs.reduce(function(names, d){
                                      return ((d instanceof defVars)? d.names : [d.name]).concat(names); }
                                           , []),
                                         // make an environment with those names added to the stack
                                           updatedEnv = definedNames.reduce(pushLocalBoxedFromSym, env),
                                             // use that env to find all free variables in the body
                                             freeVarsInBody = this.body.freeVariables(acc, updatedEnv),

                                             // given free variables and a definition, add the free variables from that definition...
                                             // while *also* updating the stack to reflect defined names
                                             addFreeVarsInDef = function(acc, d){
                                             if(d instanceof defFunc){
                                               var envWithArgs = d.args.reduce(function(env, arg){return pushLocalFromSym(env, arg);}, updatedEnv);
                                               return d.body.freeVariables(acc, envWithArgs);
                                             }
                                             if(d instanceof defStruct){ return acc; }
                                             else{ return d.expr.freeVariables(acc, updatedEnv); }
                                           }

                                           // collect free variables from all the definitions and the body, while simultaneously
                                           // updating the environment to reflect defined names
                                           return this.defs.reduce(addFreeVarsInDef, freeVarsInBody);
                                  };
                                  andExpr.prototype.freeVariables   = function(acc, env){
                                    return this.exprs.reduceRight(function(acc, expr){ return expr.freeVariables(acc, env);} , acc);
                                  };
                                  orExpr.prototype.freeVariables    = function(acc, env){
                                    return this.exprs.reduceRight(function(acc, expr){ return expr.freeVariables(acc, env);} , acc);
                                  }
                                  // be careful to make a copy of the array before reversing!
                                  lambdaExpr.prototype.freeVariables= function(acc, env){
                                    var pushLocalFromSym  = function(env, sym) { return new plt.compiler.localEnv(sym.val, false, env); },
                                      envWithArgs       = this.args.slice(0).reverse().reduce(pushLocalFromSym, env);
                                    return this.body.freeVariables(acc, envWithArgs);

                                  };
                                  quotedExpr.prototype.freeVariables= function(acc, env){ return acc; };
                                  callExpr.prototype.freeVariables  = function(acc, env){
                                    return this.func.freeVariables(acc, env).concat(this.args).reduceRight(function(acc, expr){
                                      return expr.freeVariables(acc, env);
                                    } , acc);
                                  };

                                  /**************************************************************************
                                   *
                                   *    COMPILATION -
                                   *    (see https://github.com/bootstrapworld/wescheme-compiler2012/blob/master/js-runtime/src/mzscheme-vm.ss)
                                   *
                                   **************************************************************************/

                                  // sort-and-unique: (listof X) (X X -> boolean) (X X -> boolean) -> (listof X)
                                  function sortAndUnique(elts, lessThan, equalTo) {
                                    function unique(elts){
                                      return (elts.length <= 1)? elts
                                        :  equalTo(elts[0], elts[1])? unique(elts.slice(1))
                                          :  [elts[0]].concat(unique(elts.slice(1)));
                                    }
                                    // convert lessThan fn into a fn that returns -1 for less, 1 for greater, 0 for equal
                                    var convertedSortFn = function(x,y){ return lessThan(x,y)? -1 : lessThan(y,x);}
                                    return unique(elts.sort(convertedSortFn));
                                  }

                                  // [bytecodes, pinfo, env], Program -> [bytecodes, pinfo, env]
                                  // compile the program, then add the bytecodes and pinfo information to the acc
                                  function compilePrograms(acc, p){
                                    var bytecodes = acc[0], pinfo = acc[1], env = acc[2],
                                      compiledProgramAndPinfo = p.compile(env, pinfo),
                                      compiledProgram = compiledProgramAndPinfo[0],
                                      pinfo     = compiledProgramAndPinfo[1];
                                    return [[compiledProgram].concat(bytecodes), pinfo, env];
                                  }

                                  // extend the Program class to include compilation
                                  // compile: pinfo -> [bytecode, pinfo]

                                  // literals evaluate to themselves
                                  Program.prototype.compile = function(env, pinfo){
                                    return [this, pinfo];
                                  };

                                  defFunc.prototype.compile = function(env, pinfo){
                                    var compiledFunNameAndPinfo = this.name.compile(env, pinfo),
                                      compiledFunName = compiledFunNameAndPinfo[0],
                                      pinfo = compiledFunNameAndPinfo[1];
                                    var lambda = new lambdaExpr(this.args, this.body),
                                      compiledLambdaAndPinfo = lambda.compile(env, pinfo, false, this.name),
                                      compiledLambda = compiledLambdaAndPinfo[0],
                                      pinfo = compiledLambdaAndPinfo[1];
                                    var bytecode = new defValues([compiledFunName], compiledLambda);
                                    return [bytecode, pinfo];
                                  };

                                  defVar.prototype.compile = function(env, pinfo){
                                    var compiledIdAndPinfo = this.name.compile(env, pinfo),
                                      compiledId = compiledIdAndPinfo[0],
                                      pinfo = compiledIdAndPinfo[1];
                                    var compiledExprAndPinfo = this.expr.compile(env, pinfo),
                                      compiledExpr = compiledExprAndPinfo[0],
                                      pinfo = compiledExprAndPinfo[1];
                                    var bytecode = new defValues([compiledId], compiledExpr);
                                    return [bytecode, pinfo];
                                  };

                                  defVars.prototype.compile = function(env, pinfo){
                                    var compiledIdsAndPinfo = this.names.reduceRight(compilePrograms, [[], pinfo, env]),
                                      compiledIds = compiledIdsAndPinfo[0],
                                      pinfo = compiledIdsAndPinfo[1];
                                    var compiledBodyAndPinfo = this.expr.compile(env, pinfo),
                                      compiledBody = compiledBodyAndPinfo[0],
                                      pinfo = compiledBodyAndPinfo[1];
                                    var bytecode = new defValues(compiledIds, compiledBody);
                                    return [bytecode, pinfo];
                                  };

                                  beginExpr.prototype.compile = function(env, pinfo){
                                    var compiledExpressionsAndPinfo = this.exprs.reduceRight(compilePrograms, [[], pinfo, env]),
                                      compiledExpressions = compiledExpressionsAndPinfo[0],
                                      pinfo1 = compiledExpressionsAndPinfo[1];
                                    var bytecode = new seq(compiledExpressions);
                                    return [bytecode, pinfo1];
                                  };

                                  // Compile a lambda expression.  The lambda must close its free variables over the
                                  // environment.
                                  lambdaExpr.prototype.compile = function(env, pinfo, isUnnamedLambda, name){
                                    if(isUnnamedLambda===undefined) isUnnamedLambda = true;

                                    // maskUnusedGlobals : (listof symbol?) (listof symbol?) -> (listof symbol or false)
                                    function maskUnusedGlobals(listOfNames, namesToKeep){
                                      return listOfNames.map(function(n){ return (namesToKeep.indexOf(n)>-1)? n : false; });
                                    }

                                    function pushLocal(env, n)      { return new plt.compiler.localEnv(n, false, env); }
                                    function pushLocalBoxed(env, n) { return new plt.compiler.localEnv(n, true, env); }
                                    function pushGlobals(names, env){ return new plt.compiler.globalEnv(names, false, env); }

                                    // getClosureVectorAndEnv : (list of Symbols) (list of Symbols) env -> [(Vector of number), env]
                                    // take in a list of args, a list of freevars, and an empty env that ONLY includes the arguments
                                    function getClosureVectorAndEnv(args, freeVariables, originalEnv){
                                      // pull out the stack references for all variables that are free in this environment
                                      var freeVariableRefs = freeVariables.map(function(v){return originalEnv.lookup(v.val, 0);}),
                                        // some utility functions
                                        ormap = function(f, l){return (l.length===0)? false : f(l[0])? l[0] : ormap(f, l.slice(1));},
                                        isLocalStackRef   = function(r){return r instanceof localStackReference;},
                                        isGlobalStackRef  = function(r){return r instanceof globalStackReference;},
                                        isUnboundStackRef = function(r){return r instanceof unboundStackReference;},
                                        getDepthFromRef   = function(r){return r.depth;},
                                        // this will either be #f, or the first unboundStackRef
                                        anyUnboundStackRefs = ormap(isUnboundStackRef, freeVariableRefs);
                                      // if any of the references are unbound, freak out!
                                      if(anyUnboundStackRefs){
                                        throw "Can't produce closure; I don't know where " + anyUnboundStackRefs.name + " is bound.";
                                        // otherwise, compute the depths of all local and global free variables
                                      } else {
                                        var lexicalFreeRefs   = sortAndUnique(freeVariableRefs.filter(isLocalStackRef),
                                                                              function(x,y){return x.depth < y.depth;},
                                        function(x,y){return x.depth === y.depth;}),
                                        lexicalFreeDepths = lexicalFreeRefs.map(getDepthFromRef),
                                          globalRefs        = freeVariableRefs.filter(isGlobalStackRef),
                                          globalDepths      = sortAndUnique(globalRefs.map(getDepthFromRef),
                                                                            function(x,y){return x<y;},
                                        function(x,y){return x===y;});
                                        // Add Function Arguments (in reverse order) to the environment
                                        var env1 = args.reverse().map(function(s){return s.val;}).reduce(pushLocal, originalEnv);

                                        // Add the lexical free variables (in reverse order)
                                        var env2 = lexicalFreeRefs.reverse().reduce(function(env, ref){
                                          return ref.isBoxed? pushLocalBoxed(env, ref.name) : pushLocal(env, ref.name);
                                        }, env1);

                                        // Add the global free variables (in reverse order)
                                        var env3 = globalDepths.reverse().reduce(function(env, depth){
                                          var refsAtDepth = globalRefs.filter(function(ref){return ref.depth===depth;}),
                                            usedGlobals = refsAtDepth.map(function(ref){return ref.name}),
                                            newGlobals  = maskUnusedGlobals(originalEnv.peek(depth).names, usedGlobals);
                                          return pushGlobals(newGlobals, env);
                                        }, env2);

                                        // return a vector of depths (global, then local), along with the environment
                                        return [globalDepths.concat(lexicalFreeDepths), env3];
                                      }
                                    }
                                    // push each arg onto an empty Env, the compute the free variables in the function body with that Env
                                    var envWithArgs = this.args.map(function(s){return s.val;}).reduce(pushLocal, new plt.compiler.emptyEnv());
                                    freeVarsInBody = this.body.freeVariables([], envWithArgs);
                                    // compute the closure information using a COPY of the args array (protect against in-place reversal)
                                    var closureVectorAndEnv = getClosureVectorAndEnv(this.args.slice(0), freeVarsInBody, env),
                                      closureVector = closureVectorAndEnv[0],
                                      extendedEnv = closureVectorAndEnv[1];
                                    // compile the body using the closure's environent
                                    var compiledBodyAndPinfo = this.body.compile(extendedEnv, pinfo),
                                      compiledBody = compiledBodyAndPinfo[0],
                                      pinfo1 = compiledBodyAndPinfo[1];
                                    // emit the bytecode
                                    var getLocs = function(id){return id.location.toVector();},
                                      bytecode = new lam(isUnnamedLambda? [] : new symbolExpr(name),
                                                         [isUnnamedLambda? this.stx:name].concat(this.args).map(getLocs),
                                    [],                                                          // flags
                                    this.args.length,                                            // numParams
                                    this.args.map( function(){ return new symbolExpr("val");}  ),  // paramTypes
                                    false,                                                       // rest
                                    closureVector,                                               // closureMap
                                    closureVector.map(function(){ return new symbolExpr("val/ref"); }  ), // closureTypes
                                    0,                                                           // maxLetDepth
                                    compiledBody);                                               // body
                                    return [bytecode, pinfo1];
                                  };

                                  localExpr.prototype.compile = function(env, pinfo){
                                    // if there are no definitions, just pull the body out and compile it.
                                    if(this.defs.length === 0) return this.body.compile(env, pinfo);

                                    // Otherwise...
                                    // (1) create an environment where all defined names are given local, boxed stackrefs
                                    var that = this,
                                      definedNames = this.defs.reduce(getDefinedNames, []),
                                      pushLocalBoxedFromSym = function(env, sym) { return new plt.compiler.localEnv(sym.val, true, env); },
                                      envWithBoxedNames = definedNames.reverse().reduce(pushLocalBoxedFromSym, env);

                                    // (2) process the definitions, starting with pinfo and our new environment as the base
                                    var letVoidBodyAndPinfo = processDefns(this.defs, pinfo, envWithBoxedNames, 0),
                                      letVoidBody = letVoidBodyAndPinfo[0],
                                      pinfo = letVoidBodyAndPinfo[1];

                                    // (3) return a new letVoid for the stack depth we require, then use the bytecode as the body
                                    return [new letVoid(definedNames.length, true, letVoidBody), pinfo]

                                    // getDefinedNames : [names], def -> names
                                    // given a list of names and a defn, add defined name(s) to the list
                                    function getDefinedNames(names, def){
                                      return names.concat((def instanceof defVars)? def.names : def.name);
                                    }

                                    // processDefns : [defs], pinfo, numInstalled -> [bytecode, pinfo]
                                    // fold-like function that will generate bytecode to install each defn at the
                                    // correct stack location , then move on to the rest of the definitions
                                    function processDefns(defs, pinfo, env, numInstalled){
                                      if(defs.length===0){ return that.body.compile(envWithBoxedNames, pinfo); }

                                      // compile the first definition in the current environment
                                      var compiledDefAndPInfo = defs[0].compile(env, pinfo),
                                        compiledRhs         = compiledDefAndPInfo[0].rhs, // important: all we need is the rhs!!
                                        pinfo               = compiledDefAndPInfo[1];

                                      // figure out how much room we'll need on the stack for this defn
                                      // compile the rest of the definitions, using the new pinfo and stack size
                                      var numToInstall    = (defs[0] instanceof defVars)? defs[0].names.length : 1,
                                        newBodyAndPinfo = processDefns(defs.slice(1), pinfo, env, numInstalled+numToInstall)
                                      newBody         = newBodyAndPinfo[0],
                                        pinfo           = newBodyAndPinfo[1];

                                      // generate bytecode to install new values for the remaining body
                                      var bytecode = new installValue(numToInstall, numInstalled, true, compiledRhs, newBody);
                                      return [bytecode, pinfo];
                                    }
                                  };

                                  callExpr.prototype.compile = function(env, pinfo){
                                    // add space to the stack for each argument, then build the bytecode for the application itself
                                    var makeSpace = function(env, operand){return new plt.compiler.unnamedEnv(env);},
                                      extendedEnv = this.args.reduce(makeSpace, env);
                                    var compiledOperatorAndPinfo = this.func.compile(extendedEnv, pinfo),
                                      compiledOperator = compiledOperatorAndPinfo[0],
                                      pinfo1 = compiledOperatorAndPinfo[1];
                                    var compiledOperandsAndPinfo = this.args.reduceRight(compilePrograms, [[], pinfo, extendedEnv]),
                                      compiledOperands = compiledOperandsAndPinfo[0],
                                      pinfo2 = compiledOperatorAndPinfo[1],
                                      app = new application(compiledOperator, compiledOperands);
                                    // extract the relevant locations for error reporting, then wrap the application in continuation marks
                                    var extractLoc= function(e){return e.location;},
                                      locs      = [this.func.location].concat(this.args.map(extractLoc)),
                                      locVectors= locs.concat(this.location).map(function(loc){return loc.toVector();}),
                                      appWithcontMark=new withContMark(new symbolExpr("moby-application-position-key"), locVectors,
                                                                       new withContMark(new symbolExpr("moby-stack-record-continuation-mark-key"),
                                                                                        this.location.toVector(), app));
                                                                                        return [appWithcontMark, pinfo2];
                                  };

                                  ifExpr.prototype.compile = function(env, pinfo){
                                    var compiledPredicateAndPinfo = this.predicate.compile(env, pinfo),
                                      compiledPredicate = compiledPredicateAndPinfo[0],
                                      pinfo1 = compiledPredicateAndPinfo[1];
                                    var compiledConsequenceAndPinfo = this.consequence.compile(env, pinfo),
                                      compiledConsequence = compiledConsequenceAndPinfo[0],
                                      pinfo2 = compiledConsequenceAndPinfo[1];
                                    var compiledAlternateAndPinfo = this.alternative.compile(env, pinfo),
                                      compiledAlternate = compiledAlternateAndPinfo[0],
                                      pinfo3 = compiledAlternateAndPinfo[1];
                                    var bytecode = new branch(compiledPredicate, compiledConsequence, compiledAlternate);
                                    return [bytecode, pinfo3];
                                  };

                                  symbolExpr.prototype.compile = function(env, pinfo){
                                    var stackReference = env.lookup(this.val, 0), bytecode;
                                    if(stackReference instanceof localStackReference){
                                      bytecode = new localRef(stackReference.isBoxed, stackReference.depth, false, false, false);
                                    } else if(stackReference instanceof globalStackReference){
                                      bytecode = new topLevel(stackReference.depth, stackReference.pos, false, false, this.location);
                                    } else if(stackReference instanceof unboundStackReference){
                                      throw "Couldn't find '"+this.val+"' in the environment";
                                    } else {
                                      throw "IMPOSSIBLE: env.lookup failed for '"+this.val+"'! A reference should be added to the environment!";
                                    }
                                    return [bytecode, pinfo];
                                  };

                                  // a quotedExpr is a literal version of the raw stx object
                                  quotedExpr.prototype.compile = function(env, pinfo){
                                    function unwrapLiterals(v){
                                      return (v instanceof literal)? unwrapLiterals(v.val) : (v instanceof Array)? v.map(unwrapLiterals) : v;
                                    }
                                    result = new literal(unwrapLiterals(this.val));
                                    return [result, pinfo];
                                  };

                                  provideStatement.prototype.compile = function(env, pinfo){};
                                  requireExpr.prototype.compile = function(env, pinfo){
                                    return [new req(this.spec, new topLevel(0, 0, false, false, false)), pinfo];
                                  };

                                  // compile-compilation-top: program pinfo -> bytecode
                                  function compileCompilationTop(program, pinfo){
                                    // makeModulePrefixAndEnv : pinfo -> [prefix, env]
                                    // collect all the free names being defined and used at toplevel
                                    // Create a prefix that refers to those values
                                    // Create an environment that maps to the prefix
                                    function makeModulePrefixAndEnv(pinfo){
                                      var requiredModuleBindings = pinfo.modules.reduce(function(acc, m){return acc.concat(m.bindings);}, []),
                                        isNotRequiredModuleBinding = function(b){ return b.moduleSource && (requiredModuleBindings.indexOf(b) === -1)},
                                        moduleOrTopLevelDefinedBindings = pinfo.usedBindingsHash.values().filter(isNotRequiredModuleBinding),

                                        allModuleBindings = requiredModuleBindings.concat(moduleOrTopLevelDefinedBindings),

                                        // utility functions for making globalBuckets and moduleVariables
                                        makeGlobalBucket = function(name){ return new globalBucket(name);},
                                        modulePathIndexJoin = function(path, base){return new modulePath(path, base);},
                                        // Match Moby: if it's a module that was imported via 'require', we treat it differently for some reason (WTF)
                                        makeModuleVariablefromBinding = function(b){
                                        return new moduleVariable(modulePathIndexJoin(b.moduleSource,
                                                                                      (b.imported)? false : modulePathIndexJoin(false, false))
                                      , new symbolExpr(b.name), -1, 0);
                                      };
                                      var globalNames = pinfo.freeVariables.concat(pinfo.definedNames.keys()),
                                        // FIXME: we have to make uniqueGlobalNames because a function name can also be a free variable,
                                        // due to a bug in analyze-lambda-expression in which the base pinfo is used for the function body.
                                        uniqueGlobalNames = sortAndUnique(globalNames, function(a,b){return a<b;}, function(a,b){return a==b;}),
                                        topLevels         = [false].concat(uniqueGlobalNames.map(makeGlobalBucket)
                                        ,allModuleBindings.map(makeModuleVariablefromBinding)),
                                      globals           = [false].concat(uniqueGlobalNames
                                        ,allModuleBindings.map(function(b){return b.name;}));
                                      return [new prefix(0, topLevels ,[])
               , new plt.compiler.globalEnv(globals, false, new plt.compiler.emptyEnv())];
                                    };
                                    // The toplevel is going to include all of the defined identifiers in the pinfo
                                    // The environment will refer to elements in the toplevel.
                                    var toplevelPrefixAndEnv = makeModulePrefixAndEnv(pinfo),
                                      toplevelPrefix = toplevelPrefixAndEnv[0],
                                      env = toplevelPrefixAndEnv[1];
                                    // pull out separate program components for ordered compilation
                                    var defns    = program.filter(plt.compiler.isDefinition),
                                      requires = program.filter((function(p){return (p instanceof requireExpr);})),
                                      exprs    = program.filter(plt.compiler.isExpression);
                                    var compiledRequiresAndPinfo = requires.reduceRight(compilePrograms, [[], pinfo, env]),
                                      compiledRequires = compiledRequiresAndPinfo[0],
                                      pinfo = compiledRequiresAndPinfo[1];
                                    var compiledDefinitionsAndPinfo = defns.reduceRight(compilePrograms, [[], pinfo, env]),
                                      compiledDefinitions = compiledDefinitionsAndPinfo[0],
                                      pinfo = compiledDefinitionsAndPinfo[1];
                                    var compiledExpressionsAndPinfo = exprs.reduceRight(compilePrograms, [[], pinfo, env]),
                                      compiledExpressions = compiledExpressionsAndPinfo[0],
                                      pinfo = compiledExpressionsAndPinfo[1];
                                    // generate the bytecode for the program and return it, along with the program info
                                    var forms = new seq([].concat(compiledRequires, compiledDefinitions, compiledExpressions)),
                                      zo_bytecode = new compilationTop(0, toplevelPrefix, forms),
                                      response = {"bytecode" : "/* runtime-version: local-compiler-summer2014 */\n" + zo_bytecode.toBytecode(),
                                        "permissions" : pinfo.permissions(),
                                    "provides" : pinfo.providedNames.keys()};
                                    return response;
                                  }

                                  /////////////////////
                                  /* Export Bindings */
                                  /////////////////////
                                  plt.compiler.localStackReference  = localStackReference;
                                  plt.compiler.globalStackReference = globalStackReference;
                                  plt.compiler.unboundStackReference= unboundStackReference;
                                  plt.compiler.compile              = function(program, pinfo, debug){
                                    var start = new Date().getTime();
                                    try { var response = compileCompilationTop(program, pinfo); }  // do the actual work
                                    catch (e) { console.log("COMPILATION ERROR"); throw e; }
                                    var end = new Date().getTime();
                                    if(debug){
                                      console.log("Compiled in "+(Math.floor(end-start))+"ms");
                                      console.log(JSON.stringify(response));
                                    }
                                    return response;
                                  };
      })();

      // Input 8

      /*

         BSL AST -> Pyret Source
         follows definition from http://www.pyret.org/docs/latest/

         TODO:
         - insert accessor and predicate functions into source, to allow them to evaluate to functions?
         - use those functions in the pyret source instead, simplifying callExpr translation?
         - use binop form of all infix functions
         - fix quoted symbols, so they print as strings
         - translate append as a binop tree
         - we must auto-insert data definition for posn, and functions for lists (first, append, etc) and boxes
       */
                                  (function () {
                                    'use strict';

                                    // import frequently-used bindings
                                    var literal          = plt.compiler.literal;
                                    var symbolExpr       = plt.compiler.symbolExpr;
                                    var Program          = plt.compiler.Program;
                                    var couple           = plt.compiler.couple;
                                    var ifExpr           = plt.compiler.ifExpr;
                                    var beginExpr        = plt.compiler.beginExpr;
                                    var letExpr          = plt.compiler.letExpr;
                                    var letStarExpr      = plt.compiler.letStarExpr;
                                    var letrecExpr       = plt.compiler.letrecExpr;
                                    var localExpr        = plt.compiler.localExpr;
                                    var andExpr          = plt.compiler.andExpr;
                                    var orExpr           = plt.compiler.orExpr;
                                    var condExpr         = plt.compiler.condExpr;
                                    var caseExpr         = plt.compiler.caseExpr;
                                    var lambdaExpr       = plt.compiler.lambdaExpr;
                                    var quotedExpr       = plt.compiler.quotedExpr;
                                    var unquotedExpr     = plt.compiler.unquotedExpr;
                                    var quasiquotedExpr  = plt.compiler.quasiquotedExpr;
                                    var unquoteSplice    = plt.compiler.unquoteSplice;
                                    var callExpr         = plt.compiler.callExpr;
                                    var whenUnlessExpr   = plt.compiler.whenUnlessExpr;
                                    var defFunc          = plt.compiler.defFunc;
                                    var defVar           = plt.compiler.defVar;
                                    var defVars          = plt.compiler.defVars;
                                    var defStruct        = plt.compiler.defStruct;
                                    var requireExpr      = plt.compiler.requireExpr;
                                    var provideStatement = plt.compiler.provideStatement;
                                    var unsupportedExpr  = plt.compiler.unsupportedExpr;
                                    var throwError       = plt.compiler.throwError;
                                    var structBinding    = plt.compiler.structBinding;

                                    var _pinfo = null, constructors = {}, accessors = {}, predicates = {};
                                    // add info about posns
                                    constructors["make-posn"] = "posn";
                                    accessors["posn-x"] = "x";
                                    accessors["posn-y"] = "y";
                                    predicates["posn?"] = "is-posn";
                                    // add info about lists
                                    //accessors["rest"] = "rest";
                                    //accessors["first"] = "first";
                                    //accessors["length"] = "length";
                                    predicates["posn?"] = "is-posn";

                                    // convertToPyretString : [listof Programs] pinfo -> Pyret String
                                    // BSL-to-pyret translation for testing. ignores location information altogether
                                    function converttoPyretString(programs, pinfo){
                                      _pinfo = pinfo;
                                      // identify structs
                                      var isStruct = function(b){return (b instanceof structBinding);},
                                      accumulateStructInfo = function(b){
                                        constructors[b.constructor] = b.name;
                                        predicates[b.predicate] = "is-"+b.name;
                                        b.accessors.forEach(function(a){accessors[a]=a.substring(b.name.length+1);});
                                      },
                                        isTestCase = function(p){
                                          return (p instanceof callExpr)
                                            && (p.func instanceof symbolExpr)
                                            && (["check-expect", "EXAMPLE", "check-within"].indexOf(p.func.val) > -1);
                                        },
                                        defsAndExprs = programs.filter(function(p){return !isTestCase(p);}),
                                          testCases = programs.filter(isTestCase);
                                      _pinfo.definedNames.values().filter(isStruct).forEach(accumulateStructInfo);

                                      return defsAndExprs.map(toPyretString, []).concat(testCases.map(toPyretString));
                                    }

                                    function toPyretString(p){return p.toPyretString(); }

                                    ////////////////////////// FUNCTION MAPPINGS ///////////////////////
                                    // pyret functions that are infix
                                    /*
                                    var infix = ["+","-","*","/","=",">","<",">=","<=","and","or", "append", "string"];
                                    */
                                    var infix = ["and","or", "append", "string"];
                                    // racket functions for which there is no known translation
                                    var noTranslation = ["eval"];

                                    // racket->pyret function name mapping
                                    var symbolMap = {};
                                    symbolMap["min"]    = "num-min";
                                    symbolMap["max"]    = "num-max";
                                    symbolMap["abs"]    = "num-abs";
                                    symbolMap["sin"]    = "num-sin";
                                    symbolMap["cos"]    = "num-cos";
                                    symbolMap["tan"]    = "num-tan";
                                    symbolMap["asin"]   = "num-asin";
                                    symbolMap["acos"]   = "num-acos";
                                    symbolMap["atan"]   = "num-atan";
                                    symbolMap["modulo"] = "num-modulo";
                                    symbolMap["sqrt"]   = "num-sqrt";
                                    symbolMap["sqr"]    = "num-sqr";
                                    symbolMap["ceiling"]= "num-ceiling";
                                    symbolMap["floor"]  = "num-floor";
                                    symbolMap["log"]    = "num-log";
                                    symbolMap["expt"]   = "num-expr";
                                    //symbolMap["="]      = "==";
                                    symbolMap["equal?"] = "equal-always";
                                    symbolMap["image=?"] = "equal-always";
                                    //symbolMap["string=?"] = "equal-always";
                                    symbolMap["ormap"]  = "any";
                                    symbolMap["number->string"] = "num-tostring";
                                    symbolMap["bitmap/url"] = "image-url";
                                    symbolMap["empty?"] = "is-empty";
                                    symbolMap["cons?"]  = "is-link";
                                    symbolMap["cons"]   = "link";

                                    symbolMap["*"] = "_times";
                                    symbolMap["+"] = "_plus";
                                    symbolMap["-"] = "_minus";
                                    symbolMap["/"] = "_divide";
                                    symbolMap["<"] = "_lessthan";
                                    symbolMap["<="] = "_lessequal";
                                    symbolMap["="] = "num-equal";
                                    symbolMap[">"] = "_greaterthan";
                                    symbolMap[">="] = "_greaterequal";
                                    symbolMap["angle"] = "num-angle";
                                    symbolMap["car"] = "list-first";
                                    symbolMap["cdr"] = "list-rest";
                                    symbolMap["conjugate"] = "num-conjugate";
                                    symbolMap["eq?"] = "identical";
                                    symbolMap["eqv?"] = "identical";
                                    symbolMap["exact->inexact"] = "num-to-complexroughnum";
                                    symbolMap["exact?"] = "num-is-complexrational";
                                    symbolMap["exp"] = "num-exp";
                                    symbolMap["first"] = "list-first";
                                    symbolMap["imag-part"] = "num-imagpart";
                                    symbolMap["inexact->exact"] = "num-to-complexrational";
                                    symbolMap["inexact?"] = "num-is-complexroughnum";
                                    symbolMap["length"] = "list-length";
                                    symbolMap["list->vector"] = "array-from-list";
                                    symbolMap["list?"] = "is-link";
                                    symbolMap["magnitude"] = "num-magnitude";
                                    symbolMap["member"] = "list-member";
                                    symbolMap["number?"] = "is-number";
                                    symbolMap["real-part"] = "num-realpart";
                                    symbolMap["rest"] = "list-rest";
                                    symbolMap["round"] = "num-round";
                                    symbolMap["string->number"] = "string-tonumber";
                                    symbolMap["string-ci<=?"] = "string-ci-less-equal";
                                    symbolMap["string-ci<?"] = "string-ci-less";
                                    symbolMap["string-ci=?"] = "string-ci-equal";
                                    symbolMap["string-ci>=?"] = "string-ci-greater-equal";
                                    symbolMap["string-ci>?"] = "string-ci-greater";
                                    symbolMap["string-downcase"] = "string-tolower";
                                    symbolMap["string-ref"] = "string-char-at";
                                    symbolMap["string-upcase"] = "string-toupper";
                                    symbolMap["string<=?"] = "string-less-equal";
                                    symbolMap["string<?"] = "string-less";
                                    symbolMap["string=?"] = "string-equal";
                                    symbolMap["string>=?"] = "string-greater-equal";
                                    symbolMap["string>?"] = "string-greater";
                                    symbolMap["string?"] = "is-string";
                                    symbolMap["truncate"] = "num-truncate";
                                    symbolMap["vector->list"] = "array-to-list-now";
                                    symbolMap["vector-length"] = "array-length";
                                    symbolMap["vector-ref"] = "array-get-now";
                                    symbolMap["vector-set!"] = "array-set-now";
                                    symbolMap["vector?"] = "is-array";

                                    function makeBinopTreeForInfixApplication(infixOperator, exprs){
                                      function addExprToTree(tree, expr){
                                        return "("+expr.toPyretString()+" "+infixOperator+" "+tree+")";
                                      }
                                      // starting with the first expr, build the binop-expr tree
                                      var last = exprs[exprs.length-1], rest = exprs.slice(0, exprs.length-1);
                                      return rest.reduceRight(addExprToTree, last.toPyretString());
                                    }

                                    // convert a symbol to a Pyret string or a Pyret boolean
                                    function makeLiteralFromSymbol(sym){
                                      return '"'+sym.val+'"';
                                    }

                                    function makeStructFromMembers(constructor, elts, isQuoted){
                                      var args = elts.map(function(e){
                                        return (e instanceof Array)? makeStructFromMembers(constructor, e, isQuoted)
                                          : (isQuoted && e instanceof symbolExpr)? makeLiteralFromSymbol(e)
                                            : e.toPyretString();});
                                      return "["+constructor+": "+args.join(",")+"]"
                                    }

                                    Char.prototype.toPyretString = function(){
                                      var hexCode = (this.val.charCodeAt(0).toString(16).toUpperCase());
                                      return (this.val.charCodeAt(0) < 128)? '"'+this.val+'"' : ('"\\u'+hexCode +'"');
                                    }

                                    ////////////////////////// DEFINITIONS AND EXPRESSIONS /////////////
                                    // Function definition
                                    // defFunc(name, args, body, stx)
                                    defFunc.prototype.toPyretString = function(){
                                      var str="fun "+this.name.toPyretString()+"("+this.args.map(toPyretString).join(",")+"):\n";
                                      str+="  "+this.body.toPyretString()+"\nend";
                                      return str;
                                    };

                                    // Variable definition
                                    // defVar(name, expr, stx)
                                    defVar.prototype.toPyretString = function(){
                                      var str = this.name.toPyretString()+" = "+this.expr.toPyretString();
                                      return str;
                                    };
                                    defVars.prototype.toPyretString = function(){
                                      return "translation of defVars is not yet implemented";
                                    };

                                    // Structure definition
                                    // defStruct(name, fields, stx)
                                    defStruct.prototype.toPyretString = function(){
                                      var str = "", name = this.name.toPyretString(),
                                      typeName = name+"_"
                                        str+="data "+typeName+": | "+name+"("+this.fields.map(toPyretString).join(", ")+")"+" end\n";

                                      function makeStandaloneAccessorFunction(field){
                                        str+="fun "+name+"-"+field.toPyretString()+"(_struct_): "
                                          +"_struct_."+field.toPyretString()+" end\n";
                                      }

                                      // add accessor functions, constructor and predicate
                                      this.fields.forEach(makeStandaloneAccessorFunction)
                                        str+="fun "+name+"QUESTION(_struct_): "+"is-"+name+"(_struct_) end\n";
                                      str+="fun make-"+name+"("+this.fields.map(toPyretString).join(",")+"): "
                                        +name+"("+this.fields.map(toPyretString).join(",")+") end\n";
                                      return str;
                                    };

                                    beginExpr.prototype.toPyretString = function(){
                                      return "block: "+this.exprs.map(toPyretString)+" end";
                                    };
                                    whenUnlessExpr.prototype.toPyretString = function(){
                                      // if it's "unless", change the predicate to not(pred) in racket
                                      var pred = (this.stx.val==="unless")? "not("+this.predicate.toPyretString()+")"
                                        : this.predicate.toPyretString(),
                                        begin_exp = new beginExpr(this.exprs, this.stx);
                                      return "when "+pred+":"+begin_exp.toPyretString()+" end"
                                    };
                                    localExpr.prototype.toPyretString = function(){
                                      // if there are no defs, just translate the body
                                      if(this.defs.length === 0) return this.body.toPyretString();
                                      function makeBindingFromDefn(d){
                                        return d.name.toPyretString()+" = "+((d instanceof defVar)? d.expr.toPyretString() :
                                            "lam("+d.args.map(toPyretString).join(", ")+"):\n"+d.body.toPyretString()+" end")
                                      }
                                      var bindings = this.defs.map(makeBindingFromDefn);
                                      return "letrec "+bindings.join(", ")+": "+this.body.toPyretString()+" end";
                                    };

                                    letrecExpr.prototype.toPyretString = function(){
                                      // if there are no defs, just translate the body
                                      if(this.bindings.length === 0) return this.body.toPyretString();
                                      function makeBindingFromCouple(c){
                                        return c.first.toPyretString()+" = "+c.second.toPyretString();
                                      }
                                      var bindings = this.bindings.map(makeBindingFromCouple);
                                      return "letrec "+bindings.join(", ")+": "+this.body.toPyretString()+" end";
                                    };
                                    // we make temp bindings first, to preserve scope behavior
                                    letExpr.prototype.toPyretString = function(){
                                      // if there are no defs, just translate the body
                                      if(this.bindings.length === 0) return this.body.toPyretString();
                                      var tmpIDs = this.bindings.map(function(c){return c.first.toPyretString()+"_tmp";}),
                                        // bind the rhs to lhs_tmp (a_1 = 5, ...)
                                        tmpBindings = this.bindings.map(function(c, i){return tmpIDs[i]+" = "+c.second.toPyretString();}),
                                        // bind lhs_tmp to lhs (a = a_1, ...)
                                        newBindings = this.bindings.map(function(c, i){return c.first.toPyretString()+" = "+tmpIDs[i];});
                                      return "block:\n"+tmpBindings.join("\n")+"\n"+newBindings.join("\n")+"\n"+this.body.toPyretString()+" end";
                                    };
                                    letStarExpr.prototype.toPyretString = function(){
                                      // if there are no defs, just translate the body
                                      if(this.bindings.length === 0) return this.body.toPyretString();
                                      var bindings = this.bindings.map(function(c){
                                        return c.first.toPyretString()+" = "+c.second.toPyretString();
                                      });
                                      return "block:\n"+bindings.join("\n")+"\n"+this.body.toPyretString()+" end";
                                    };
                                    caseExpr.prototype.toPyretString = function(){
                                      function convertClause(c){
                                        return "| any(lam(elt): equal-always(_val,elt) end, "
                                          + c.first.toPyretString() + ") then: " + c.second.toPyretString();
                                      }
                                      return "block: \n _val=" + this.expr.toPyretString() + "\n ask:"
                                        + this.clauses.map(convertClause).join("\n") + "\n end \n end";
                                    };

                                    // Lambda expression
                                    // lambdaExpr(args, body, stx)
                                    lambdaExpr.prototype.toPyretString = function(){
                                      var str = "";
                                      str+="lam("+this.args.map(toPyretString).join(", ")+"):\n";
                                      str+="  "+this.body.toPyretString()+"\nend";
                                      return str;
                                    };

                                    // cond expression
                                    // condExpr(clauses, stx)
                                    condExpr.prototype.toPyretString = function(){
                                      function convertClause(couple){
                                        return " | "+((couple.first.toPyretString()=="else")? " otherwise: "
                                          : couple.first.toPyretString() + " then: ")
                                          + couple.second.toPyretString()+"\n";
                                      }

                                      var str = "ask:\n";
                                      str+=this.clauses.map(convertClause).join('')+"end";
                                      return str;
                                    };

                                    // and expression
                                    // andExpr(exprs, stx)
                                    andExpr.prototype.toPyretString = function(){
                                      return makeBinopTreeForInfixApplication("and", this.exprs);
                                    };

                                    // or expression
                                    // orExpr(exprs, stx)
                                    orExpr.prototype.toPyretString = function(){
                                      return makeBinopTreeForInfixApplication("or", this.exprs);
                                    };

                                    // call expression
                                    // callExpr(func, args, stx)
                                    callExpr.prototype.toPyretString = function(){
                                      var funcStr = this.func.toString();

                                      // special-case for check-expect and EXAMPLE
                                      if(["EXAMPLE", "check-expect"].indexOf(funcStr) > -1){
                                        return "check:\n"+this.args[0].toPyretString()+" is "+this.args[1].toPyretString()+"\nend";
                                      }

                                      // special-case for infix operators
                                      if(infix.indexOf(funcStr) > -1){
                                        return makeBinopTreeForInfixApplication(this.func.toPyretString(), this.args);
                                      }

                                      // special-case for vector and list constructors
                                      if(funcStr==="vector") return makeStructFromMembers("array", this.args);
                                      if(funcStr==="list")   return makeStructFromMembers("list", this.args);

                                      // special-case for big-bang
                                      if(funcStr === "big-bang"){
                                        var world_args = [this.args[0].toPyretString(), makeStructFromMembers("list", this.args.slice(1))];
                                        return this.func.toPyretString() +"("+world_args.join(', ')+")";
                                      }

                                      // special-case for constructor functions
                                      if(constructors[funcStr]){
                                        return funcStr.substring(5)+"("+this.args.map(toPyretString).join(', ')+")";
                                      }

                                      // special-case for accessor functions
                                      if(accessors[funcStr]){
                                        return this.args[0].toPyretString()+"."+accessors[funcStr];
                                      }

                                      // special-case for struct-predicate functions
                                      if(predicates[funcStr]){
                                        return predicates[funcStr]+"("+this.args[0].toPyretString()+")";
                                      }

                                      // general case
                                      return this.func.toPyretString() +"("+this.args.map(toPyretString).join(', ')+")";
                                    };

                                    // if expression
                                    // ifExpr(predicate, consequence, alternate, stx)
                                    ifExpr.prototype.toPyretString = function(){
                                      var rawPredicate = ((this.predicate instanceof callExpr)
                                          && (this.predicate.func.val === "verify-boolean-branch-value"))?
                                        this.predicate.args[2] : this.predicate;
                                      var str = "";
                                      str+="if "+rawPredicate.toPyretString() + ":\n  ";
                                      str+=this.consequence.toPyretString() + "\nelse:\n  ";
                                      str+=this.alternative.toPyretString() + "\nend";
                                      return str;
                                    };

                                    // quotedExpr
                                    // quotedExpr(val)
                                    quotedExpr.prototype.toPyretString = function(){
                                      if(this.val instanceof literal && this.val.val instanceof symbolExpr){
                                        return makeLiteralFromSymbol(this.val);
                                      } else if(this.val instanceof literal){
                                        return this.val.toPyretString();
                                      } else if(this.val instanceof symbolExpr){
                                        return makeLiteralFromSymbol(this.val);
                                      } else if (this.val instanceof Array){
                                        return makeStructFromMembers("list", this.val, true);
                                      } else {
                                        throw "There is no translation for "+this.toString();
                                      }
                                    };
                                    // we do the best we can to desugar and translate quasiquoted expressions
                                    quasiquotedExpr.prototype.toPyretString = function(){
                                      return this.desugar(_pinfo)[0].toPyretString();
                                    };

                                    // if a symbol already has a (different) name in Pyret, use that
                                    // otherwise, clean it up so it's a valid Pyret identifier
                                    symbolExpr.prototype.toPyretString = function(){
                                      return (symbolMap[this.val])? symbolMap[this.val]
                                        : this.val.length===1? this.val
                                          : this.val.replace(/\//g,'SLASH').replace(/\?/g,'QUESTION').replace(/\!/g,'BANG').replace(/\+/g,'PLUS');
                                    };

                                    // literals
                                    // literal(String|Char|Number)
                                    literal.prototype.toPyretString = function(){
                                      return this.val.toPyretString? this.val.toPyretString()
                                        : this.val.toWrittenString? this.val.toWrittenString()
                                        /* else */        : this.val.toString();
                                  };

                                  // require expression
                                  // requireExpr(spec, stx)
                                  requireExpr.prototype.toPyretString = function(){
                                    return "translation of Require Expressions is not yet implemented";
                                  };

                                  /////////////////////
                                  /* Export Bindings */
                                  /////////////////////
                                  plt.compiler.toPyretString = converttoPyretString;
    })();

    // Input 9

    /*

       BSL AST -> Pyret AST
       follows definition from XXXXX
       TODO:
       - conversion of symbols, to account for common-but-invalid chars like '?', '!', etc.
       - translation of boolean symbols/values
       - desugar (case...), then translate it?
       - collect check-expect and EXAMPLE, convert to toplevel where: clauses
       - use pinfo to locate all accessor functions, convert to <Struct.Field>
       - desugar quoted items?
       - when implemented, use tuples and roughnums for define-values and #i
     */

    (function () {
      'use strict';

      // import frequently-used bindings
      var literal          = plt.compiler.literal;
      var symbolExpr       = plt.compiler.symbolExpr;
      var Program          = plt.compiler.Program;
      var couple           = plt.compiler.couple;
      var ifExpr           = plt.compiler.ifExpr;
      var beginExpr        = plt.compiler.beginExpr;
      var letExpr          = plt.compiler.letExpr;
      var letStarExpr      = plt.compiler.letStarExpr;
      var letrecExpr       = plt.compiler.letrecExpr;
      var localExpr        = plt.compiler.localExpr;
      var andExpr          = plt.compiler.andExpr;
      var orExpr           = plt.compiler.orExpr;
      var condExpr         = plt.compiler.condExpr;
      var caseExpr         = plt.compiler.caseExpr;
      var lambdaExpr       = plt.compiler.lambdaExpr;
      var quotedExpr       = plt.compiler.quotedExpr;
      var unquotedExpr     = plt.compiler.unquotedExpr;
      var quasiquotedExpr  = plt.compiler.quasiquotedExpr;
      var unquoteSplice    = plt.compiler.unquoteSplice;
      var callExpr         = plt.compiler.callExpr;
      var whenUnlessExpr   = plt.compiler.whenUnlessExpr;
      var defFunc          = plt.compiler.defFunc;
      var defVar           = plt.compiler.defVar;
      var defVars          = plt.compiler.defVars;
      var defStruct        = plt.compiler.defStruct;
      var requireExpr      = plt.compiler.requireExpr;
      var provideStatement = plt.compiler.provideStatement;
      var unsupportedExpr  = plt.compiler.unsupportedExpr;
      var throwError       = plt.compiler.throwError;
      var structBinding    = plt.compiler.structBinding;

      // empty location
      var blankLoc = {"startRow": 1, "startCol": 0, "startChar": 1, "endRow": 1, "endCol": 0, "endChar": 1};
      // Pyret syntax objects that were never actually part of the source
      var lBrackStx = {name: "LBRACK",      value: "[",       key: "'LBRACK:[",     pos: blankLoc},
        colonStx  = {name: "COLON",       value: ":",       key: "'COLON::",      pos: blankLoc},
        commaStx  = {name: "COMMA",       value: ",",       key: "'COMMA:,",      pos: blankLoc},
        rBrackStx = {name: "RBRACK",      value: "]",       key: "'RBRACK:]",     pos: blankLoc},
        lParenStx = {name: "PARENNOSPACE", value: "(",      key: "'PARENNOSPACE:(", pos:blankLoc},
        rParenStx = {name: "RPAREN",      value: ")",       key: "'RPAREN:)",      pos:blankLoc},
        equalsStx = {name: "EQUALS",      value: "=",       key: "'EQUALS:=",     pos: blankLoc},
        funStx    = {name: "FUN",         value: "fun",     key: "'FUN:fun",       pos: blankLoc},
        endStx    = {name: "END",         value: "end",     key: "'END:end",       pos:blankLoc},
        letStx    = {name: "let",         value: "let",     key: "'LET:let",       pos:blankLoc},
        lamStx    = {name: "LAM",         value: "lam",     key: "'LAM:lam",      pos: blankLoc},
        blockStx  = {name: "BLOCK",       value: "block",   key: "'BLOCK:block",  pos: blankLoc},
        dataStx   = {name: "DATA",        value: "data",    key: "'DATA:data",    pos: blankLoc},
        barStx    = {name: "BAR",         value: "|",       key: "'BAR:|",         pos:blankLoc},
        ifStx     = {name: "IF",          value: "if",      key: "'IF:if",         pos: blankLoc},
        elseStx   = {name: "ELSECOLON",   value: "else:",   key: "'ELSECOLON:else:", pos: blankLoc},
        letrecStx = {name: "LETREC" ,     value: "lerec",   key: "'LETREC:letrec" ,  pos:blankLoc},
        whenStx   = {name: "WHEN",        value: "when",    key: "'WHEN:when",      pos: blankLoc},
        askStx    = {name: "ASKCOLON",    value: "ask:",    key: "'ASKCOLON:ask:",   pos:blankLoc},
        thenStx   = {name: "THENCOLON",   value: "then:",   key: "'THENCOLON:then:", pos:blankLoc},
        otherwiseStx={name:"OTHERWISE",   value: "otherwise:",key:"'OTHERWISE:otherwise:",pos:blankLoc};

      // pinfo that is reset for each translation
      var _pinfo = null;

      // convertToPyret : [listof Programs], pinfo -> JSON
      // generate pyret parse tree, preserving location information
      // follows http://www.pyret.org/docs/latest/s_program.html
      // provide and import will never be used
      function convertToPyret(programs, pinfo){
        _pinfo = pinfo;
        return { name: "program"
             , kids: [ {name: "prelude"
                        , kids: [/* TBD */]
                        , pos: blankLoc}
                      , {name: "block"
                        , kids: programs.map(function(p){return {name:"stmt", kids:[p.toPyret()], pos: p.location};})
                        , pos: programs.location}]
             , pos: programs.location};
      }

      // makeLetExprFromCouple : Racket Couple -> Pyret let-expr
      // used by Let, Let*, possibly others..
      function makeLetExprFromCouple(couple){
        return {name: "stmt"
              , kids: [{name: "let-expr"
                       , kids: [makeBindingFromSymbol(couple.first)
                                ,equalsStx
                                ,couple.second.toPyret()]
                       , pos: couple.location}]
              , pos: couple.location};
      }

      // given a symbol, make a binding (used for let-expr, fun-expr, lam-expr...)
      function makeBindingFromSymbol(sym){
        var loc = sym.location;
        return {name:"binding"
              , kids: [{name:"NAME", value: sym.val, key:"'NAME:"+sym.val, pos:loc}]
              , pos: loc};
      }

      // translates (f e1 e2 e3...) into (e1 f (e2 f (e3 ...)))
      // TODO: are some operators left-associative?
      function makeBinopTreeForInfixApplication(infixOperator, exprs){
        function addExprToTree(tree, expr){
          return {name: "binop-expr"
                , kids: [expr.toPyret(), infixOperator, tree]
                , pos: expr.location}
        }
        // starting with the firs expr, build the binop-expr tree
        var last = exprs[exprs.length-1], rest = exprs.slice(0, exprs.length-1);
        return rest.reduceRight(addExprToTree, last.toPyret());
      }

      // convert a symbol to a Pyret string or a Pyret boolean
      function makeLiteralFromSymbol(sym){
        var loc = sym.location, result, kid;
        if(["true", "false", "#t", "#f"].indexOf(sym.val) > -1){
          kid = (sym.val==="true" || sym.val==="#t")?
            {name:"TRUE", value:"true", key:"'TRUE:true", pos: loc}
              : {name:"FALSE", value:"false", key:"'FALSE", pos: loc};
              result = {name:"bool-expr", kids:[kid], pos: loc};
        } else {
          kid = {name:"STRING", value:'"'+sym.val+'"', key:"'STRING:\""+sym.val+"\"", pos:loc};
          result = {name:"string-expr", kids:[kid], pos: loc};
        }
        return {name:"expr", kids:[{name:"prim-expr", kids:[result], pos: loc}], pos: loc};
      }

      function makeStructFromMembers(constructor, elts, loc){
        var fakeArrayCall = new symbolExpr(constructor),
          makeListEltFromValue = function(val){
          return {name: "list-elt" , kids: [val.toPyret(), commaStx], pos: val.location};
        },
        listElts = elts.slice(0, elts.length-1).map(makeListEltFromValue),
          lastElt = (elts.length>1)? elts[elts.length-1].toPyret() : null;
        // set the location of the constructor call, and add the last elt (if it exists)
        fakeArrayCall.location = blankLoc;
        listElts.push(lastElt);
        // build the object
        return {name:"expr"
              , kids: [{name: "constructor-expr"
                        , kids: [lBrackStx
                                 , {name: "constructor-modifier", kids: [], pos: blankLoc}
                                 , fakeArrayCall.toPyret()
                                 , colonStx].concat(listElts, [rBrackStx])
                        , pos: blankLoc}]
              , pos:loc};
      }
      // Bytecode generation for jsnums types
      jsnums.BigInteger.prototype.toPyret =
        jsnums.Rational.prototype.toPyret =
        jsnums.Roughnum.prototype.toPyret =
        jsnums.ComplexRational.prototype.toPyret =
        jsnums.ComplexRoughnum.prototype.toPyret =
        function(){
        var loc = this.location;
        return {name: "num-expr"
              , kids: [{value: this.stx
                       , key: "'NUMBER:"+this.stx
                       , name: "NUMBER"
                       , pos: loc}]
              , pos: loc};
      };

      Char.prototype.toPyret = function(){
        return {name: "string-expr"
                , pos : this.location
                , kids: [{key: "'STRING:"+this.val
                         , name: "STRING"
                         , value: this.val
                         , pos : this.location}]};
      };

      Program.prototype.toPyret = function(){ console.log(this); throw "no toPyret() method defined"; };
      // literals
      // literal(String|Char|Number|Vector)
      // everything has a toPyret() method _except_ Strs,
      // which are a hidden datatype for some reason
      literal.prototype.toPyret = function(){
        var loc = this.location,
          that = this;
        function convertString(){
          return {name: "string-expr"
                , pos : loc
                , kids: [{key: "'STRING:"+that.val.toWrittenString()
                         , name: "STRING"
                         , value: that.val.toWrittenString()
                         , pos : loc}]};
        }
        function convertNumber(){
          var str = (that.val.toString)? that.val.toString() : that.val;
          return {name: "num-expr"
                , kids: [{name: "NUMBER"
                         , value: str
                         , key: "'NUMBER:"+str
                         , pos : loc}]
                , pos : loc};
        }

        var val = (that.val.toPyret)? that.val.toPyret() :
          isNaN(this)? convertString()  :
          /* else */  convertNumber();

        return  {name: "check-test"
              , kids: [{name: "binop-expr"
                      , kids: [{name: "expr"
                               , kids: [{name: "prim-expr"
                                          , kids: [val]
                                          , pos: loc}]
                               , pos: loc}]
                      , pos: loc}]
              , pos: loc};
      };

      // Function definition
      // defFunc(name, args, body, stx)
      defFunc.prototype.toPyret = function(){
        var loc = this.location;
        return {name:"stmt"
              , kids:[{name: "fun-expr"
                      , kids: [funStx
                               ,{name:"fun-header"
                               , kids: [{name:"ty-params", kids:[], pos: blankLoc}
                                        ,{name:"NAME"
                                          , value: this.name.stx
                                          , key:"'NAME:"+this.name.stx
                                          , pos: this.name.location}
                                        ,{name:"args"
                                          , kids: [].concat([lParenStx]
                                                            , this.args.map(makeBindingFromSymbol)
                                                            ,[rParenStx])
                                          , pos: this.args.location}
                                        ,{name:"return-ann"
                                          ,kids: []
                                          ,pos:loc}]
                                , pos: this.stx[1].location}
                               ,colonStx
                               ,{name:"doc-string", kids: [], pos: blankLoc}
                               ,{name:"block", kids: [this.body.toPyret()], pos: this.body.location}
                               ,{name:"where-clause", kids:  [], pos: blankLoc}
                               ,{name:"end"
                                , kids: [endStx]
                                , pos: this.location.end()}]
                      , pos: loc}]
                , pos: loc};
      };

      // Variable definition
      // (define name expr) -> let name = expr
      // see: http://www.pyret.org/docs/latest/Statements.html#%28part._s~3alet-expr%29
      // TODO: detect toplevel declarations?
      defVar.prototype.toPyret = function(){
        return {name: "let-expr"
              ,kids:[letStx
                    ,{name: "toplevel-binding"
                     ,kids:[makeBindingFromSymbol(this.name)]
                     ,pos:this.name.location}
                    ,equalsStx].concat(this.expr.toPyret())
              , pos: this.location};
      };

      // Multi-Variable definition
      // defVars(names, rhs, stx)
      // maybe wait for tuples to be implemented?
      defVars.prototype.toPyret = function(){
        throw "translation of Multi-Variable Definitions is not yet implemented";
      };

      // Data Declaration
      // (define-struct foo (x y)) -> data foo_: foo(x, y) end
      // see: http://www.pyret.org/docs/latest/Statements.html#%28part._s~3adata-expr%29
      defStruct.prototype.toPyret = function(){
        // makeListVariantMemberFromField : symbolExpr -> list-variant-member
        function makeListVariantMemberFromField(field){
          return {name: "list-variant-member"
                , kids: [{name: "variant-member"
                         , kids: [makeBindingFromSymbol(field)]
                         , pos: field.location}
                        , commaStx]
                , pos:field.location};
        }

        var listVariantMembers = this.fields.map(makeListVariantMemberFromField);
        return {name:"stmt"
              , kids: [{name: "data-expr"
                       , kids: [dataStx
                                ,{name:"NAME"
                                  , value: this.name+"_"
                                  , key: "'NAME:"+this.name+"_"
                                  , pos: this.stx[1].location}
                                ,{name:"ty-params"
                                  , kids: [] // there are no parameters for racket datatypes
                                  , pos: this.stx[0].location}
                                , {name:"data-mixins"
                                  , kids: [] // there are no mixins for racket datatypes
                                  , pos: this.stx[0].location}
                                , colonStx
                                , {name:"first-data-variant"
                                  ,kids: [barStx
                                          , {name: "variant-constructor"
                                            , kids:[{name:"NAME"
                                                      , value: this.name+""
                                                      , key: "'NAME:"+this.name
                                                      , pos: this.stx[1].location}
                                                    ,{name: "variant-members"
                                                      , kids:[lParenStx].concat(listVariantMembers, [rParenStx])
                                                      , pos: this.stx[2].location}]
                                            , pos: this.stx[1].location}
                                          , {name: "data-with", kids: [], pos:this.location}]
                                  ,pos:this.stx[1].location}
                                , {name: "data-sharing", kids:[], pos: blankLoc} // no sharing in racket
                                , {name: "where-clause", kids: [], pos: blankLoc}// no struct tests in racket
                                , endStx]
                       , pos: this.location}]
              , pos: this.location}
      };

      // Begin expression
      // beginExpr(exprs) -> block: exprs end
      // translates to a block: http://www.pyret.org/docs/latest/Blocks.html
      beginExpr.prototype.toPyret = function(){
        var loc = this.location;
        // given a single expr, convert to Pyret and wrap it inside a stmt
        function makeStmtFromExpr(expr){
          return {name:"stmt"
                , kids: [expr.toPyret()]
                , pos: expr.location};
        }
        return {name: "expr"
              , kids: [{name: "user-block-expr"
                       , kids: [blockStx
                                ,{name: "block"
                                 , kids:[this.exprs.map(makeStmtFromExpr)]
                                 , pos: this.location}
                                ,{name: "end", kids:[endStx], pos: loc}]
                       , pos: loc}]
              , pos: loc};
      };

      // Lambda expression
      // lambdaExpr(args, body) -> lam(args): body end
      lambdaExpr.prototype.toPyret = function(){
        var loc = this.location;
        return {name: "expr"
              , kids: [{name: "lambda-expr"
                       , kids:[lamStx
                               ,{name:"ty-params", kids:[], pos:loc}
                               ,{name:"args"
                                , kids: [lParenStx].concat(
                              this.args.map(makeBindingFromSymbol)
                                          ,[rParenStx])
                                , pos: this.args.location}
                               , {name: "return-ann", kids: [], pos: loc}
                               , colonStx
                               , {name:"doc-string", kids:[], pos: loc}
                               , {name:"block"
                                , kids:[this.body.toPyret()]
                                , pos: this.body.location}
                               , {name:"where-clause", kids:[], pos: loc}
                               , {name:"end", kids:[endStx], pos: loc}]
                       , pos: this.location}]
              , pos: loc};
      };

      // Local becomes letrec
      // First translate the racket node to letrec, then call toPyret()
      localExpr.prototype.toPyret = function(){
        function defToCouple(d){
          var cpl = new couple(d.name, d.expr, d.stx);
          cpl.location = d.location;
          return cpl
        };
        var racket_letrec = new letrecExpr(this.defs.map(defToCouple), this.body, this.stx);
        racket_letrec.location = this.location;
        return racket_letrec.toPyret();
      };

      // call expression
      // callExpr(func, args, stx)
      callExpr.prototype.toPyret = function(){
        var loc = this.location;
        // which functions are infix?
        function getInfixForSym(sym){
          if(!(sym instanceof symbolExpr)) return false;
          var str = sym.val, loc = sym.location;
          /*
          var infixOp = (str==="+")? {name:"PLUS",   value: "+",   key: "'PLUS: +",   pos: loc}
            : (str==="-")?  {name:"DASH",   value: "-",   key: "'DASH: -",   pos: loc}
              : (str==="*")?  {name:"STAR",   value: "*",   key: "'STAR: *",   pos: loc}
                : (str==="/")?  {name:"SLASH",  value: "-",   key: "'SLASH: /",  pos: loc}
                  : (str===">")?  {name:"GT",     value: ">",   key: "'GT: >",     pos: loc}
                    : (str==="<")?  {name:"LT",     value: "<",   key: "'LT: -",     pos: loc}
                      : (str===">=")? {name:"GEQ",    value: ">=",  key: "'GEQ: >=",    pos: loc}
                        : (str==="<=")? {name:"LEQ",    value: "<=",  key: "LEQ: <=",     pos: loc}
                          : (str==="=")?  {name:"EQUALEQUAL", value: "==", key: "'EQUALEQUAL: -", pos: loc}
                            : false; // if the function isn't a binop, return false
                            return { name: "binop", kids: [infixOp] };
                            */
                           var infixOp = false;
                            return { name: "binop", kids: [infixOp] };
        }

        // runtime calls to "vector" need to be processed specially
        if(this.func.val === "vector") return makeStructFromMembers("array", this.args, this.location);

        // if the function is infix in Pyret, return the binop tree instead of a call-expr
        var infixOperator = getInfixForSym(this.func);
        if(infixOperator){
          return makeBinopTreeForInfixApplication(infixOperator, this.args);
        } else {
          return {name:"app-expr"
                , kids: [{name: "expr"
                          , kids: [{name: "id-expr"
                                  , kids: [{name: "NAME"
                                           , value: this.func.val
                                           , key: "'NAME:"+this.func.val
                                           , pos: this.func.location}]
                                  , pos: this.func.location}]
                          , pos: this.func.location}
                         ,{name: "app-args"
                                  , kids: [lParenStx].concat(
                                this.args.map(function(p){return p.toPyret()}), [rParenStx])
                                  , pos: this.func.location}]
              , pos: loc}
        }
      };

      // if expression maps to if-expr
      // see: http://www.pyret.org/docs/latest/Expressions.html#%28part._s~3aif-expr%29
      ifExpr.prototype.toPyret = function(){
        return {name: "if-expr"
              , kids: [ifStx
                       ,this.predicate.toPyret()
                       ,colonStx
                       ,{name:"block"
                        ,kids:[{name:"stmt"
                               , kids:[this.consequence.toPyret()]
                               , pos: this.consequence.location}]
                        ,pos: this.consequence.location}
                       ,elseStx
                       ,{name:"block"
                        ,kids:[{name:"stmt"
                               , kids:[this.alternative.toPyret()]
                               , pos: this.alternative.location}]
                        ,pos: this.alternative.location}
                       ,{name:"end", kids:[endStx], pos:this.location.end()}]
              , pos: this.location};
      };

      // when(pred, expr) translates to when(pred, expr)
      // unless(pred, expr) translates to when(not(pred), expr)
      // see: http://www.pyret.org/docs/latest/A_Tour_of_Pyret.html#%28part._.When_blocks%29
      // TODO: do we need to wrap the expr in a block?
      whenUnlessExpr.prototype.toPyret = function(){
        var loc = this.location;

        // if it's "unless", change the predicate to not(pred) in racket
        if(this.stx.val==="unless"){
          var notFn = new symbolExpr("not"),
            notCall = new callExpr(notFn, [this.predicate]);
          notFn.location = notCall.location = this.predicate.location;
          this.predicate = notCall;
        }

        return {name: "when-expr"
              , kids:[whenStx
                      ,this.predicate.toPyret()
                      ,colonStx
                      ,this.exprs.toPyret()
                      ,{name:"end", kids:[endStx], pos:this.location.end()}]
              , pos: loc};
      };

      // letrec becomes letrec
      // the last binding becomes a let-expr,
      // the rest become letrec-bindings,
      // and the body becomes a block
      letrecExpr.prototype.toPyret = function(){
        function makeLetRecBindingExprFromCouple(couple){
          return {name: "letrec-binding"
                , kids: [makeLetExprFromCouple(couple), commaStx]
                , pos: couple.location};
        }
        var loc = this.location,
          letrecBindings = this.bindings.slice(1).map(makeLetRecBindingExprFromCouple),
          finalLet = makeLetExprFromCouple(this.bindings[this.bindings.length-1]).kids[0],
          bodyBlock = {name:"block", kids:[this.body.toPyret()], pos: this.body.location};
        return {name:"expr"
              ,kids:[{name: "letrec-expr"
                      ,kids: [letrecStx].concat(letrecBindings, [finalLet, colonStx, bodyBlock, endStx])
                      ,pos:loc}]
              ,pos:loc};
      };

      // let -> blockful of let-exprs, BUT...
      // in order to preserve semantics, we introduce temporary identifiers:
      // (let [(a 5) (b a)] b) -> block: a_1 = 5 b_1 = a a = a_1 b = b_1 b end
      // then we can safely convert
      letExpr.prototype.toPyret = function(){
        var loc = this.location;
        var tmpIDs = [],
          // bind the rhs to lhs_tmp (a_1 = 5, ...)
          tmpBindings = this.bindings.map(function(c){
          var tmpSym = new symbolExpr(c.first.val+"_tmp"),
            tmpBinding = new couple(tmpSym, c.second);
          tmpSym.location = c.first.location;
          tmpBinding.location = c.location;
          tmpIDs.push(tmpSym);
          return tmpBinding;
        }),
        // bind lhs_tmp to lhs (a = a_1, ...)
        newBindings = this.bindings.map(function(c, i){
          var c2 = new couple(c.first, tmpIDs[i]);
          c2.location = c.location;
          return c2;
        }),
        stmts = tmpBindings.concat(newBindings).map(makeLetExprFromCouple);
        stmts.push(this.body.toPyret());
        return {name: "expr"
              , kids: [{name: "user-block-expr"
                       , kids: [blockStx
                                ,{name: "block", kids: stmts, pos: this.location}
                                ,{name: "end", kids:[endStx], pos: loc}]
                       , pos: loc}]
              , pos: loc};

      };

      // let* becomes a simple blockful of let-exprs
      // see: http://www.pyret.org/docs/latest/Statements.html#%28part._s~3alet-expr%29
      letStarExpr.prototype.toPyret = function(){
        var loc = this.location,
          stmts = this.bindings.map(makeLetExprFromCouple);
        stmts = stms.push(this.body.toPyret());
        return {name: "expr"
              , kids: [{name: "user-block-expr"
                       , kids: [blockStx
                                ,{name: "block", kids:stmts, pos: this.location}
                                ,{name: "end", kids:[endStx], pos: loc}]
                       , pos: loc}]
              , pos: loc};
      };

      // cond -> ask
      // see: http://www.pyret.org/docs/latest/Expressions.html#%28part._s~3aask-expr%29
      condExpr.prototype.toPyret = function(){
        function makeIfPipeBranchfromClause(clause){
          return {name: "if-pipe-branch"
                , kids: [barStx
                         ,clause.first.toPyret()
                         ,thenStx
                         ,{name: "block"
                          ,kids: [clause.second.toPyret()]
                          ,pos: clause.second.location}]
                , pos: clause.location};
        }

        // make an ifPipe for each non-else clause
        var lastClause  = this.clauses[this.clauses.length-1],
          hasElse     = (lastClause.first.stx && lastClause.first.stx==="else"),
          ifClauses   = hasElse? this.clauses.slice(this.clauses.length-2) : this.clauses,
          branches = ifClauses.map(makeIfPipeBranchfromClause);

        // if there's an else clause, turn it into a block and add it and it's syntax to the list of branches
        if(hasElse){
          var elseClause =  this.clauses[this.clauses.length-1],
            otherwiseBlock = {name: "block", kids: [elseClause.second.toPyret()], pos: elseClause.second.location};
          branches = branches.concat([otherwiseStx, otherwiseBlock]);
        }

        return {name:"expr"
              , kids: [{name: "if-pipe-expr"
                        , kids: [askStx].concat(branches, [{name: "end", kids:[endStx], pos:blankLoc}])
                        , pos: this.location}]
              , pos: this.location};
      };

      // case -> cases
      // see: http://www.pyret.org/docs/latest/Expressions.html#%28part._s~3acases-expr%29
      caseExpr.prototype.toPyret = function(){
        throw "translation of case expressions is not yet implemented";
      };

      // and -> and
      // convert to nested, binary ands
      andExpr.prototype.toPyret = function(){
        var loc = this.stx.location,
          infixOperator = {name:"AND", value: "and", key: "'AND:and", pos: loc};
        return makeBinopTreeForInfixApplication(infixOperator, this.exprs);
      };

      // or -> or
      // convert to nested, binary ors
      orExpr.prototype.toPyret = function(){
        var loc = this.stx.location,
          infixOperator = {name:"OR", value: "or", key: "'OR:or", pos: loc};
        return makeBinopTreeForInfixApplication(infixOperator, this.exprs);
      };

      /*
         Pyret lacks any notion of quoting,
         so this is a *partially-supported approximation*!!!

         quasiquoted expressions could be desugared into mostly-valid
         expressions, but cond, case, and & or would desugar into invalid
         code. Therefore, we throw errors for everything but quoated
         expressions, and we translate those using loose Pyret equivalents
       */

      // quoted literals translate to themselves
      // quoted symbols translate to strings
      // quoted lists evaluate to lists
      quotedExpr.prototype.toPyret = function(){
        if(this.val instanceof literal){
          return this.val.toPyret();
        } else if(this.val instanceof symbolExpr){
          return makeLiteralFromSymbol(this.val);
        } else if (this.val instanceof Array){
          return makeStructFromMembers("list", this.val, this.val.location);
        } else {
          throw "There is no translation for "+this.toString();
        }
      };

      quasiquotedExpr.prototype.toPyret = function(){
        return this.desugar(_pinfo)[0].toPyretString();
      };

      // symbol expression
      // symbolExpr(val)
      symbolExpr.prototype.toPyret = function(){
        var loc = this.location;
        return {name: "expr"
             , kids: [{name: "id-expr"
                      , kids: [{name: "NAME"
                               , value: this.val
                               , key: "'NAME:"+this.val
                               , pos: loc}]
                      , pos: loc}]
             , pos: loc};
      }

      /////////////////////
      /* Export Bindings */
      /////////////////////
      plt.compiler.toPyretAST = convertToPyret;
    })();

    function schemeToPyretAST(runtime, code) {
      console.log("code is " + code);
      var debug = false;
      var sexp = plt.compiler.lex(code, undefined, debug);
      console.log("sexp is " + sexp);
      var ast = plt.compiler.parse(sexp, debug)
      console.log("ast is " + ast);
      var astAndPinfo = plt.compiler.desugar(ast, undefined, debug);
      var program = astAndPinfo[0];
      var pinfo = plt.compiler.analyze(program, debug);
      var pstring = plt.compiler.toPyretString(ast, pinfo);
      console.log("pyretstring is " + pstring);
      var jast = plt.compiler.toPyretAST(ast, pinfo);
      console.log('jast is ' + jast);
      return runtime.ffi.makeList([jast]);
    }

    function schemeToPyretString(code) {
      // is runtime param needed hn
      //console.log("code is " + code);
      var debug = false;
      var sexp = plt.compiler.lex(code, undefined, debug);
      //console.log("sexp is " + sexp);
      var ast = plt.compiler.parse(sexp, debug)
      //console.log("ast is " + ast);
      var astAndPinfo = plt.compiler.desugar(ast, undefined, debug);
      var program = astAndPinfo[0];
      var pinfo = plt.compiler.analyze(program, debug);
      var pstring = plt.compiler.toPyretString(ast, pinfo);
      //console.log("pyretstring is " + pstring);
      // separate toplevel programs by newline because pyret can't
      // tolerate programs strung together on same line
      //return pstring.join('\n');
      return pstring;
    }

    return {
      //schemeToPyretAST: schemeToPyretAST,
      schemeToPyretString: schemeToPyretString,
      types: types
    }

  });
