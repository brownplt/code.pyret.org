({
  requires: [
    { "import-type": "dependency",
      protocol: "js-file",
      args: ["./cpo-ide-hooks"]
    }
  ],
  nativeRequires: [
    "cpo/gdrive-locators"
  ],
  theModule: function(runtime, namespace, uri, cpoIdeHooks, gdriveLocators) {
    var api;
    var errNoApiMessage = 'Attempted to get file(s) before gdrive api was ready.';

    window.storageAPI.then(function(programCollectionAPI) {
      console.log("gdrive api ready for use by cpo-grade.");
      api = programCollectionAPI;
    }, function(err) {
      console.error(err);
    });

    function promiseRetry(promise, iteration, max) {
      var deferred = Q.defer();
      promise.then(function(resolvedObject) {
        deferred.resolve(resolvedObject);
      }).fail(function(err) {
        if (iteration >= max) {
          deferred.reject(err);
        } else {
          // formula from https://gist.github.com/peterherrmann/2700284
          var timeToWait = (Math.pow(2, n) * 1000) + (Math.round(Math.random() * 1000));
          console.log("Retrying request in " + (timeToWait / 1000) + " seconds...");
          setTimeout(function(){
            console.log("...retrying request now.");
            promiseRetry(promise, iteration + 1, max);
          }, timeToWait);
        }
      });
      return deferred.promise;
    }

    function getFile(id) {
      if (api) {
        return promiseRetry(api.getFileById(id), 0, 5);
      } else {
        console.error(errNoApiMessage);
      }
    }

    function getFilesInFolder(folderId) {
      if (api) {
        return promiseRetry(api.getFilesInFolder(folderId), 0, 5);
      } else {
        console.error(errNoApiMessage);
      }
    }

    function gatherSubmissions(submissionsFolderId) {
      var deferred = Q.defer();
      var submissions = {};

      getFilesInFolder(submissionsFolderId).then(function(students) {
        return Q.all(students.map(function(student) {
          var name = student.getName();
          return getFilesInFolder(student.getUniqueId()).then(function(dirs) {
            return dirs.find(function(dir) {
              return dir.getName() == "final-submission";
            });
          }).then(function(dir) {
            /*
             * TODO(fgoodman): Remove gremlin files with preprocessing
             * and remove this conditional (and below as well).
             */
            if (dir !== undefined) {
              return getFilesInFolder(dir.getUniqueId());
            }
            else {
              return null;
            }
          }).then(function(files) {
            if (files) {
              submissions[name] = files;
            }
            return files;
          });
        }));
      }).then(function() {
        deferred.resolve(submissions);
      }).fail(function(err) {
        console.error(err);
      });

      return deferred.promise;
    }

    function generateJSONFile(result) {
      var o = {};
      if (runtime.isSuccessResult(result)) {
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

    var gf = runtime.getField;
    var gmf = function(m, f) { return gf(gf(m, "values"), f); };

    // creates a findModule that behaves as normal except when importing
    // fileName via the "my-gdrive" protocol, in which case it uses fileObj
    function createFindModuleFunction(fileName, fileObj) {
      // because this is serving as a substitute for getFileByName, we create
      // a promise which resolves with an _array_ of file objects
      var filesDefer = Q.defer();
      filesDefer.resolve([fileObj]);
      var filesPromise = filesDefer.promise;

      // NOTE(awstlaur): this function was copied and modified from the default
      // findModule found in cpo-repl.js
      return function(contextIgnored, dependency) {
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
                },
                dependency: function(protocol, args) {
                  var arr = runtime.ffi.toArray(args);
                  if (protocol === "my-gdrive") {
                    if (arr[0] === fileName) {
                      return constructors.makeMyGDriveLocator(arr[0], filesPromise);
                    } else {
                      return constructors.makeMyGDriveLocator(arr[0]);
                    }
                  }
                  else if (protocol === "shared-gdrive") {
                    return constructors.makeSharedGDriveLocator(arr[0], arr[1]);
                  }
                  else {
                    console.error("Unknown import: ", dependency);
                  }

                }
              });
           }, function(l) {
              return gmf(compileLib, "located").app(l, runtime.nothing);
           }, "findModule");
        }
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

    function processSubmission(testSuite) {
      var assignmentID = $("#id").val();
      var implName = $("#implementation").val();
      var testName = $("#test").val();
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

      function toTargets(submission) {
        var targets = [];
        var implSubmission = getSubmission(submission, implName);
        var testSubmission = getSubmission(submission, testName);
        if (testSubmission !== null && implSubmission !== null) {
          targets.push({
            name: "test",
            eval: makeRunner(
              testSuite, implName, implSubmission.getUniqueId())
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

      var submissionsPromise = gatherSubmissions(assignmentID);

      submissionsPromise.then(function(submissions) {
        for (var student in submissions) {
          if (submissions.hasOwnProperty(student)) {
            submissions[student] = toTargets(submissions[student]);
          }
        }

        renderSubmissions(submissions);

        $("#frm").submit(function() {
          generateJSON(submissions);
        }).show();
      }).fail(function(f){console.error(f);});
    };

    function loadAndRenderSubmissions() {
      $("#cfg-container").hide();
      var suiteID = $("#suite").val();

      var suiteSubmissionPromise = getFile(suiteID);
      suiteSubmissionPromise.then(function(testSuite) {
        processSubmission(testSuite);
      });
    }

    window.CPOGRADE = {
      loadAndRenderSubmissions: loadAndRenderSubmissions
    };

    console.log("cpo-grade loaded.");

    return runtime.makeModuleReturn({}, {});
  }
})