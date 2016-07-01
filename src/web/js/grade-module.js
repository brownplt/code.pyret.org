({
  requires: [
    { "import-type": "dependency",
      protocol: "file",
      args: ["../../../pyret/src/arr/compiler/compile-lib.arr"]
    },
    { "import-type": "dependency",
      protocol: "file",
      args: ["../../../pyret/src/arr/compiler/compile-structs.arr"]
    },
    { "import-type": "dependency",
      protocol: "file",
      args: ["../../../pyret/src/arr/compiler/repl.arr"]
    },
    { "import-type": "dependency",
      protocol: "file",
      args: ["../arr/cpo.arr"]
    },
    { "import-type": "dependency",
      protocol: "js-file",
      args: ["./repl-ui"]
    },
    { "import-type": "builtin",
      name: "runtime-lib"
    },
    { "import-type": "builtin",
      name: "load-lib"
    },
    { "import-type": "builtin",
      name: "builtin-modules"
    },
    { "import-type": "builtin",
      name: "cpo-builtins"
    }
  ],
  nativeRequires: [
    "cpo/gdrive-locators",
    "cpo/http-imports",
    "cpo/guess-gas",
    "cpo/cpo-builtin-modules",
    "cpo/modal-prompt",
    "pyret-base/js/runtime"
  ],
  theModule: function(runtime, namespace, uri,
                      compileLib, compileStructs, pyRepl, cpo, replUI,
                      runtimeLib, loadLib, builtinModules, cpoBuiltins,
                      gdriveLocators, http, guessGas, cpoModules, modalPrompt,
                      rtLib) {
    // TODO(all): Move createPCAPI to a require module.
    // var storageAPIP = createProgramCollectionAPI(
    //   clientId, apiKey, "code.pyret.org", false);

    // var proxy = function(s) {
    //   return APP_BASE_URL + "/downloadImg?" + s;
    // };
    // var makeFind = find.createFindModule(storageAPIP);
    // var runnerP = webRunner.createRunner(proxy, makeFind);

    /**
     * vvv copy-pasted and modified from cpo-main.js vvv
     * <copy>
     */
    var gf = runtime.getField;
    var gmf = function(m, f) { return gf(gf(m, "values"), f); };
    var gtf = function(m, f) { return gf(m, "types")[f]; };

    var constructors = gdriveLocators.makeLocatorConstructors(storageAPI, runtime, compileLib, compileStructs, builtinModules);

    var replEnv = gmf(compileStructs, "standard-builtins");
    function findModule(contextIgnored, dependency) {
      return runtime.safeCall(function() {
        return runtime.ffi.cases(gmf(compileStructs, "is-Dependency"), "Dependency", dependency,
          {
            builtin: function(name) {
              var raw = cpoModules.getBuiltinLoadableName(runtime, name);
              if(!raw) {
                throw runtime.throwMessageException("Unknown module: " + name);
              }
              else {
                return gmf(cpo, "make-builtin-js-locator").app(name, raw);
              }
              /*
              if (cpoBuiltin.knownCpoModule(name)) {
                return cpoBuiltin.cpoBuiltinLocator(runtime, compileLib, compileStructs, name);
              }
              else if(okImports.indexOf(name) === -1) {
                throw runtime.throwMessageException("Unknown module: " + name);
              } else {
                return gmf(compileLib, "located").app(
                  gmf(builtin, "make-builtin-locator").app(name),
                  runtime.nothing
                );
              }
              */
            },
            dependency: function(protocol, args) {
              var arr = runtime.ffi.toArray(args);
              if (protocol === "my-gdrive") {
                return constructors.makeMyGDriveLocator(arr[0]);
              }
              else if (protocol === "shared-gdrive") {
                return constructors.makeSharedGDriveLocator(arr[0], arr[1]);
              }
              /*
              else if (protocol === "js-http") {
                // TODO: THIS IS WRONG with the new locator system
                return http.getHttpImport(runtime, args[0]);
              }
              else if (protocol === "gdrive-js") {
                return constructors.makeGDriveJSLocator(arr[0], arr[1]);
              }
              */
              else {
                console.error("Unknown import: ", dependency);
              }

            }
          });
       }, function(l) {
          return gmf(compileLib, "located").app(l, runtime.nothing);
       }, "findModule");
    }

    // NOTE(joe): This line is "cheating" by mixing runtime levels,
    // and uses the same runtime for the compiler and running code.
    // Usually you can only get a new Runtime by calling create, but
    // here we magic the current runtime into one.
    var pyRuntime = gf(gf(runtimeLib, "internal").brandRuntime, "brand").app(
      runtime.makeObject({
        "runtime": runtime.makeOpaque(runtime)
      }));
    var pyRealm = gf(loadLib, "internal").makeRealm(cpoModules.getRealm());


    var builtins = [];
    Object.keys(runtime.getParam("staticModules")).forEach(function(k) {
      if(k.indexOf("builtin://") === 0) {
        builtins.push(runtime.makeObject({
          uri: k,
          raw: cpoModules.getBuiltinLoadable(runtime, k)
        }));
      }
    });
    var builtinsForPyret = runtime.ffi.makeList(builtins);

    var replP = Q.defer();
    runtime.safeCall(function() {
        return gmf(cpo, "make-repl").app(
            builtinsForPyret,
            runtime.makeFunction(function() {
              return CPO.editor.cm.getValue();
            }),
            pyRuntime,
            pyRealm,
            runtime.makeFunction(findModule));
      }, function(repl) {
        var jsRepl = {
          runtime: runtime.getField(pyRuntime, "runtime").val,
          restartInteractions: function(ignoredStr, typeCheck) {
            var ret = Q.defer();
            setTimeout(function() {
              runtime.runThunk(function() {
                return gf(repl, "restart-interactions").app(typeCheck);
              }, function(result) {
                ret.resolve(result);
              });
            }, 0);
            return ret.promise;
          },
          run: function(str, name) {
            var ret = Q.defer();
            setTimeout(function() {
              runtime.runThunk(function() {
                return runtime.safeCall(
                  function() {
                    return gf(repl,
                    "make-interaction-locator").app(
                      runtime.makeFunction(function() { return str; }))
                  },
                  function(locator) {
                    return gf(repl, "run-interaction").app(locator);
                  });
              }, function(result) {
                ret.resolve(result);
              }, "make-interaction-locator");
            }, 0);
            return ret.promise;
          },
          pause: function(afterPause) {
            runtime.schedulePause(function(resumer) {
              afterPause(resumer);
            });
          },
          stop: function() {
            runtime.breakAll();
          },
          runtime: runtime
        };
        return withRepl(jsRepl);
      }, "make-repl");
    /*
     * </copy>
     * ^^^ copy-pasted and modified from cpo-main.js ^^^
     **/
     function withRepl(repl) {

       console.log("Loaded");
       clearInterval($("#loader").data("intervalID"));
       $("#loader").hide();

       // NOTE(joe): This forces the loading of all the built-in compiler libs
       var interactionsReady = repl.restartInteractions();
       interactionsReady.fail(function(err) {
         console.error("Couldn't start REPL: ", err);
       });
       interactionsReady.then(function(result) {
         //editor.cm.setValue("print('Ahoy, world!')");
         console.log("REPL ready.");
       });
     }

        var gQ = storageAPI.gQ;
        var drive = storageAPI.drive;
        var fileBuilder = storageAPI.fileBuilder;

        var nextWait = 0;
        function req(thunk) {
          var deferred = Q.defer();

          function req_(thunk) {
            thunk().then(function(res) {
              if (nextWait > 0) nextWait -= 100;
              deferred.resolve(res);
            }).fail(function(err) {
              if (nextWait == 0) nextWait = 900;
              nextWait += 100;
              setTimeout(function () {
                req_(thunk);
              }, nextWait);
            });
          }
          req_(thunk);

          return deferred.promise;
        }

        function getFile(id) {
          var filesThunk = function() {
            return gQ(drive.files.get({fileId: id}));
          };
          return req(filesThunk).then(fileBuilder);
        }

        function getFiles(id) {
          var childrenThunk = function() {
            return gQ(drive.children.list({folderId: id}));
          };
          return req(childrenThunk)
            .then(function(directory) {
              return Q.all(directory.items.map(function(file) {
                return getFile(file.id);
              }));
            });
        }

        function gatherSubmissions(id) {
          var deferred = Q.defer();
          var submissions = {};

          getFiles(id).then(function(students) {
            return Q.all(students.map(function(student) {
              var name = student.getName();
              return getFiles(student.getUniqueId()).then(function(dirs) {
                return dirs.find(function(dir) {
                  return dir.getName() == "final-submission";
                });
              }).then(function(dir) {
                /*
                 * TODO(fgoodman): Remove gremlin files with preprocessing
                 * and remove this conditional (and below as well).
                 */
                if (dir !== undefined) {
                  return getFiles(dir.getUniqueId());
                }
                else {
                  return null;
                }
              }).then(function(files) {
                if (files)
                  submissions[name] = files;
                return files;
              });
            }));
          }).then(function() {
            deferred.resolve(submissions);
          });

          return deferred.promise;
        }

        function generateJSONFile(result) {
          var o = {};

          var runtime = runner.runtime;
          if (runner.runtime.isSuccessResult(result)) {
            if (runtime.ffi.isRight(result.result)) {

              var checks = runtime.ffi.toArray(
                runtime.getField(runtime.getField(result.result, "v")
                  .val.result.result, "checks"));

              function toObject(test) {
                return {
                  isSuccess: test.$name == "success",
                  result: test.$name,
                  code: runtime.getField(test, "code"),
                  loc: runtime.getField(test, "loc").dict
                };
              }

              o.isError = false;
              for (var k = 0; k < checks.length; k++) {
                o[runtime.getField(checks[k], "name")] =
                  runtime.ffi.toArray(runtime.getField(
                      checks[k], "test-results")).map(toObject);
              }

              return o;
            }
            else {
              // TODO: identify this case and handle it
              console.log("left", result);
              return {};
            }
          }
          else {
            console.log("failure result", result);
            return {
              isError: true,
              errorName: result.exn.exn.$name,
              stack: result.exn.stack,
              loc: runtime.getField(result.exn.exn, "loc").dict
            };
          }
        }

        function generateJSON(submissions) {
          var blob = {};
          console.log(submissions);
          var sk = Object.keys(submissions);
          sk.sort();
          for (var i = 0; i < sk.length; i++) {
            var student = {};
            var s = submissions[sk[i]];
            if (submissions.hasOwnProperty(sk[i]) && s !== null) {
              var fk = Object.keys(s);
              fk.sort();
              for (var j = 0; j < fk.length; j++) {
                var f = s[fk[j]];
                if (f.result !== undefined) {
                  student[s[fk[j]].name] = generateJSONFile(f.result);
                }
              }
            }
            blob[sk[i]] = student;
          }
          $("#out").text(JSON.stringify(blob, null, "\t"));
        }

        function makeTarget(target) {
          return function() {
            var targetTD = $(this);
            targetTD.removeClass("def").css("background-color", "#f7cb2a");
            $("#tbl td.def, #tbl th.def").addClass("dis").removeClass("def");
            target.eval(function(result) {
              if (runner.runtime.isSuccessResult(result)) {
                targetTD.css("background-color", "#30ba40");
                if (typeof(result.exn) === "undefined") {
                  targetTD.attr("title", "Run (compile, runtime success)");
                }
                else {
                  var r = result.exn.exn.$name;
                  targetTD.attr("title",
                    "Run (compile success, runtime error: " + r + ")");
                }
              }
              else {
                targetTD.css("background-color", "#de1d10");
                var r = result.exn.exn.$name;
                targetTD.attr("title", "Run (compile error: " + r + ")");
              }
              console.log("Result:", result);
              target.result = result;
              targetTD.addClass("fin");
              $("#tbl td.dis, #tbl th.dis").addClass("def").removeClass("dis");
            });
          };
        }

        function runTDs(tds) {
          var i = 0;
          var interval = setInterval(function() {
            if (i < tds.length) {
              if (tds.eq(i).hasClass("def")) {
                tds.eq(i).click();
              }
              if (tds.eq(i).hasClass("fin")) {
                i++;
              }
            }
            else {
              clearInterval(interval);
            }
          }, 50);
        }

        function renderSubmissionsHeader(thead, submissions) {
          var colspan = 0;
          for (var student in submissions) {
            if (submissions.hasOwnProperty(student) &&
                submissions[student] !== null) {
              for (; colspan < submissions[student].length; colspan++) {
                var target = submissions[student][colspan];
                thead.append($("<th>").html("<div><span>" + target.name +
                      "</span></div>").addClass("tooltip")
                    .attr("title", "Run All for '" + target.name + "'")
                    .addClass("def").click(
                    function() {
                      var idx = $(this).index() + 1;
                      runTDs($(this).parent().parent().parent().find(
                          "td:not(.nohov):nth-child(" + idx + ")"));
                    }));
              }
              break;
            }
          }
          thead.prepend($("<th>").html("<div><span>student</span></div>").click(
                function () {
            runTDs($(this).parent().parent().parent().find("td:not(.nohov):not(:first-child)"));
          }).addClass("def").addClass("tooltip").attr("title", "Run All"));
          return colspan;
        }

        function renderSubmissionsRows(tbody, colspan, submissions) {
          var keys = Object.keys(submissions);
          keys.sort();
          for (var i = 0; i < keys.length; i++) {
            var student = keys[i];
            if (submissions.hasOwnProperty(student)) {
              var tr = $("<tr>");
              var td = $("<td>").text(student).addClass("tooltip")
                .attr("title", "Run All for '" + student + "'");
              if (submissions[student] !== null) {
                for (var j = 0; j < submissions[student].length; j++) {
                  tr.append($("<td>").addClass("def").click(
                        makeTarget(submissions[student][j]))
                      .addClass("tooltip")
                      .attr("title", "Run"));
                }
                tr.prepend(td.addClass("def").click(
                    function() {
                      runTDs($(this).parent().find("td:not(:first-child)"));
                    }));
              }
              else {
                tr.append(td.addClass("nohov"));
                tr.append($("<td>").attr("colspan", colspan).addClass("nohov"));
              }
              tbody.append(tr);
            }
          }
        }

        function renderSubmissions(submissions) {
          var thead = $("#tbl thead tr");
          var colspan = renderSubmissionsHeader(thead, submissions);

          var tbody = $("#tbl tbody");
          tbody.css("height", $("#cfg").height() - thead.height());
          renderSubmissionsRows(tbody, colspan, submissions);
        }

        function getSubmission(submission, name) {
          for (var i = 0; i < submission.length; i++) {
            if (submission[i].getName() == name) {
              return submission[i];
            }
          }

          return null;
        }

        function makeRunner(fileObj, fileName, fileID) {
          if (fileObj !== null) {
            return function(thunk) {
              return fileObj.getContents().then(function(contents) {
                var subs = {};
                subs[fileName] = fileID;
                return runner.runString(contents, "", subs);
              }).then(thunk);
            };
          }
          else {
            return null;
          }
        }

        function loadAndRenderSubmissions(e) {
          e.preventDefault();
          $("#cfg-container").hide();

          var assignmentID = $("#id").val();
          var implName = $("#implementation").val();
          var testName = $("#test").val();
          var suiteID = $("#suite").val();
          var goldID = $("#gold").val();
          var coals;
          if ($("#coals").val() === "") {
            coals = [];
          }
          else {
            coals = $("#coals").val().split("\n").map(function(coal) {
              return coal.split(":");
            });
          }

          getFile(suiteID).then(function(suiteSubmission) {
            function toTargets(submission) {
              var targets = [];
              var implSubmission = getSubmission(submission, implName);
              var testSubmission = getSubmission(submission, testName);
              if (testSubmission !== null && implSubmission !== null) {
                targets.push({
                  name: "test",
                  eval: makeRunner(
                    suiteSubmission, implName, implSubmission.getUniqueId())
                });
                targets.push({
                  name: "gold",
                  eval: makeRunner(testSubmission, implName, goldID)
                });
                for (var i = 0; i < coals.length; i++) {
                  targets.push({
                    name: "coal-" + i,
                    eval: makeRunner(testSubmission, coals[i][0], coals[i][1])
                  });
                }
                return targets;
              }
              else {
                return null;
              }
            }

            gatherSubmissions(assignmentID).then(function(submissions) {
              for (var student in submissions) {
                if (submissions.hasOwnProperty(student)) {
                  submissions[student] = toTargets(submissions[student]);
                }
              }

              renderSubmissions(submissions);

              $("#frm").submit(function() {
                generateJSON(submissions);
              }).show();
            }).fail(function(f){console.log(f);});
          });
        }

        function resetForm(e) {
          e.preventDefault();
          localStorage.clear();
          drawForm();
          console.log("reset");
        }

        function saveForm(e) {
          e.preventDefault();
          if (!(localStorage.n > 0)) localStorage.n = 0;
          localStorage.n++;
          localStorage[localStorage.n] = $(this).serialize();
          localStorage["t" + localStorage.n] = new Date;
        }

        function drawForm() {
          if (localStorage.n > 0) {
            $("#pr").html("<option selected disabled>Click to select</option>");
            for (var i = localStorage.n; i > 0; i--) {
              $("#pr").append(
                "<option value=" + i + ">" + localStorage["t" + i] + "</option>");
            }
          }
          else {
            $("#pr").html("<option selected disabled>No prior runs</option>");
          }
        }

        function updateForm(e) {
          e.preventDefault();
          var s = localStorage[$("#pr").val()];
          var form_data = s.split("&");
          $.each(form_data, function(k, v) {
            var data = v.split("=");
            $("#" + data[0]).val(decodeURIComponent(data[1]));
          });
        }

        drawForm();
        $("#load").on("click", function(e) {
          e.preventDefault();
          saveForm(e);
          loadAndRenderSubmissions(e);
        });

        $("#reset").on("click", resetForm);
        $("#prf").on("submit", updateForm);


        $(document)
        .on("mouseover", ".tooltip", function() {
          var title = $(this).attr("title");
          $(this).data("tipText", title).removeAttr("title");
          $("<p class=\"tt\"></p>")
          .text(title)
          .appendTo("body")
          .fadeIn(0);
        })
        .on("mouseout", ".tooltip", function () {
            $(this).attr("title", $(this).data("tipText"));
            $(".tt").remove();
        })
        .on("mousemove", ".tooltip", function(e) {
            var x = e.pageX;
            var y = e.pageY;
            $(".tt").css({ top: y, left: x });
        });

    return runtime.makeJSModuleReturn({
      getFile: getFile,
      getFiles: getFiles,
      gatherSubmissions: gatherSubmissions,
      generateJSON: generateJSON,
      generateJSONFile: generateJSONFile,
      makeTarget: makeTarget,
      runTDs: runTDs,
      renderSubmissionsHeader: renderSubmissionsHeader,
      renderSubmissionsRows: renderSubmissionsRows,
      renderSubmissions: renderSubmissions,
      getSubmission: getSubmission,
      makeRunner: makeRunner,
      loadAndRenderSubmissions: loadAndRenderSubmissions,
      resetForm: resetForm,
      saveForm: saveForm,
      drawForm: drawForm,
      updateForm: updateForm
    });
  }
})