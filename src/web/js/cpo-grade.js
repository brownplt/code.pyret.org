/* global Q $ */

({
  requires: [
    { 'import-type': 'dependency',
      protocol: 'js-file',
      args: ['./cpo-repl']
    },
    { 'import-type': 'builtin',
      name: 'load-lib'
    },
    { "import-type": "dependency",
      protocol: "js-file",
      args: ["./check-ui"]
    },
    { "import-type": "builtin",
      name: "option" },
    { "import-type": "builtin",
      name: "srcloc" },
    { "import-type": "builtin",
      name: "checker" }
  ],
  nativeRequires: [],
  provides: {},
  theModule: function(runtime, namespace, uri, cpoRepl, loadLib, checkUI, option, srcloc, checker) {

    // copied from error-ui.js in logging branch
    function callDeferred(runtime, thunk) {
      var ret = Q.defer();
      runtime.runThunk(
        thunk,
        function (result) {
          if (runtime.isSuccessResult(result)) {
            ret.resolve(result.result);
          } else {
            ret.reject(result.exn);
          }
        });
      return ret.promise;
    }

    var ffi = runtime.ffi;
    option = runtime.getField(option, "values");
    srcloc = runtime.getField(srcloc, "values");
    var CH = runtime.getField(checker, "values");


    // JS Doc annotations herein use an approximation the Google Closure
    // Compiler type expression syntax, but will not be type-checked
    //
    // Promise<T> will refer to a promise whose `then`, etc methods
    // are of type {function(T)}

    /**
     * @enum {string}
     */
    var RunnerType = {
      TEST: 'TEST', // Run a student implementation against the solution test suite.
      GOLD: 'GOLD', // Run a student test suite against the solution implementation.
      COAL: 'COAL' // Run a student test suite against a broken implementation.
    };

    /**
     * @typedef {{
     *  name: string,
     *  id: string
     * }}
     *
     * GDriveFileData
     */
    
    /**
     * @typedef {{
     *  name: string,
     *  id: string
     * }}
     *
     * GDriveFolderData
     */
    
    /**
     * @typedef {{
     *   implementation: GDriveFileData,
     *   test: GDriveFileData,
     *   student: GDriveFolderData,
     *   runnerType: RunnerType,
     *   success: boolean,
     *   testsPassed: number,
     *   testsTotal: number
     * }}
     * 
     * GradeRunData
     */
    
    /**
     * @typedef {{
     *   student: GDriveFolderData,
     *   test: GradeRunData,
     *   gold: GradeRunData,
     *   coals: Array<GradeRunData>
     * }}
     *
     * StudentGradeRunData
     */
    
    /**
     * @typedef {{
     *   implementation: GDriveFileData,
     *   test: GDriveFileData,
     *   student: GDriveFolderData,
     *   runnerType: RunnerType,
     *   run: function(): Promise<GradeRunData>,
     *   uniqueId: string
     * }}
     *
     * Runner
     */
    
    /**
     * @typedef {{
     *   student: GDriveFolderData,
     *   test: Runner,
     *   gold: Runner,
     *   coals: Array<Runner>,
     *   uniqueId: string
     * }}
     *
     * StudentRunner
     */

    /**
     * Internal helper functions
     * @type {Object<string,function()>}
     */
    var Util = {

      // works for null/undefined as well
      toString: function(obj) {
        // if (obj === null) {
        //   return 'null';
        // } else if (obj === undefined) {
        //   return 'undefined';
        // } else {
        //   return obj.toString();
        // }
        
        return String(obj);
      },
      /**
       * Taken from developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
       * @param {number} min
       * @param {number} max
       * @return {number}
       */
      getRandomIntInclusive: function(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
      },

      /**
       * @param {T} resolveData
       * @return {Promise<T>}
       */
      makeResolvedPromise: function(resolveData) {
        var deferred = Q.defer();
        deferred.resolve(resolveData);
        return deferred.promise;
      },

      /**
       * @param {*} error
       * @return {Promise}
       */
      makeRejectedPromise: function(error) {
        var deferred = Q.defer();
        deferred.reject(error);
        return deferred.promise;
      },

      /**
       */
      replaceCurlyQuotes: function(str) {
        return str.replace(/\u201D/g, "\"")
                  .replace(/\u201C/g, "\"")
                  .replace(/\u2019/g, "\'")
                  .replace(/\u2018/g, "\'");
      },

      /**
       */
      looseFilenameMatch: function(strX, strY) {
        var xSplit = strX.split('.');
        var ySplit = strY.split('.');
        return (xSplit[0] === ySplit[0]);
      },

      /**
       * Create mock student/grade data for testing
       * @type {Object<string,function()>}
       */
      Mock: {
        /**
         * @param  {GDriveFileData} implementation
         * @param  {GDriveFileData} test
         * @param  {GDriveFolderData} student
         * @param  {RunnerType} runnerType
         * @return {GradeRunData}
         */
        createMockGradeData: function(implementation, test, student, runnerType) {
          var testsTotal = (runnerType === RunnerType.TEST) ? 80 : Util.getRandomIntInclusive(40,100);
          var testsPassed = Util.getRandomIntInclusive(0,testsTotal);
          var success = (Util.getRandomIntInclusive(0,1) === 1);

          return {
            implementation: implementation,
            test: test,
            student: student,
            runnerType: runnerType,
            success: success,
            testsPassed: testsPassed,
            testsTotal: testsTotal
          };
        },

        /**
         * @param {number} numCoals
         * @return {Array<GDriveFileData>}
         */
        createMockCoalsFileData: function(numCoals) {
          var coals = [];
          for(var i = 0; i < numCoals; i++) {
            var name = 'coal-' + i + '.arr';
            var id = name + '-gdrive-id';

            coals[i] = {
              name: name,
              id: id
            };
          }
          return coals;
        },

        /**
         * @param {GDriveFileData} implementation
         * @param {GDriveFileData} test
         * @param {GDriveFolderData} student
         * @param {RunnerType} runnerType
         * @return {Runner}
         */
        createMockRunner: function(implementation, test, student, runnerType) {
          var gradeRunData = Util.Mock.createMockGradeData(implementation, test, student, runnerType);
          var gradeRunDataPromise = Util.makeResolvedPromise(gradeRunData);

          var run = function() {
            return gradeRunDataPromise;
          };

          var uniqueId = [student.id, Util.toString(implementation.id), Util.toString(test.id), 'Runner'].join('-');

          return {
            implementation: implementation,
            test: test,
            student: student,
            runnerType: runnerType,
            run: run,
            uniqueId: uniqueId
          };
        },

        /**
         * @return {Array<StudentRunner>}
         */
        createMockStudentRunners: function() {
          var studentData = (['A','B','C','D']).map(function(str) {
            var name = str + '_Surname@brown.edu';
            var id = str + '-gdrive-id';
            return {
              name: name,
              id: id
            };
          });

          var testRunners = studentData.map(function(student) {
            // Run the student implementation...
            var implementation = {
              name: 'assignment-code.arr',
              id: 'assignment-code-gdrive-id'
            };

            // ...against the solution test suite.
            var test = {
              name:'test-suite.arr',
              id: 'test-suite-gdrive-id'
            };

            var runnerType = RunnerType.TEST;

            return Util.Mock.createMockRunner(implementation, test, student, runnerType);
          });

          var goldRunners = studentData.map(function(student) {
            // Run the gold implementation...
            var implementation = {
              name: 'gold.arr',
              id: 'gold-gdrive-id'
            };

            // ...against the student test suite.
            var test = {
              name:'assignment-test.arr',
              id: 'assignment-test-gdrive-id'
            };

            var runnerType = RunnerType.GOLD;

            return Util.Mock.createMockRunner(implementation, test, student, runnerType);
          });

          var numCoals = Util.getRandomIntInclusive(3,6);

          var coalRunnerArrays = studentData.map(function(student) {
            var coalsFileData = Util.Mock.createMockCoalsFileData(numCoals);

            return coalsFileData.map(function(coalFileData) {
              // Run the coal implementation...
              var implementation = {
                name: coalFileData.name,
                id: coalFileData.id
              };

              // ...against the student test suite.
              var test = {
                name:'assignment-test.arr',
                id: 'assignment-test-gdrive-id'
              };

              var runnerType = RunnerType.COAL;

              return Util.Mock.createMockRunner(implementation, test, student, runnerType);
            });
          });

          var studentRunners = [];

          for (var studentIndex = 0; studentIndex < studentData.length; studentIndex++) {
            var student = studentData[studentIndex];
            var test = testRunners[studentIndex];
            var gold = goldRunners[studentIndex];
            var coals = coalRunnerArrays[studentIndex];

            studentRunners[studentIndex] = {
              student: student,
              test: test,
              gold: gold,
              coals: coals,
              uniqueId: student.id + '-StudentRunner'
            };
          }

          return studentRunners;
        }
      },
    };

    /**
     */
    var createRepl = function(myGDriveOverride, fileObjToRun) {
      var protocolOverrideMap = {
        'my-gdrive': myGDriveOverride,
        'shared-gdrive': {
          keepAuth: true
        }
      };
      var fileId = fileObjToRun.getUniqueId();
      var makeFindModule = cpoRepl.createMakeFindModuleFunction(protocolOverrideMap);
      return (fileObjToRun.getContents()).then(function(stringtoRun) {
        stringtoRun = Util.replaceCurlyQuotes(stringtoRun);
        var thisFileId = fileObjToRun.getUniqueId();
        DEBUG.assertEqual(fileId, thisFileId);
        var getDefsForPyret = runtime.makeFunction(function() {
          return stringtoRun;
        });
        return cpoRepl.createRepl(makeFindModule, getDefsForPyret);     
      });
    };

    /**
     */
    var ReplPromises = {};

    /**
     */
    var registerRepl = function(importName, actualImplementation, testFileObj) {
      if (ReplPromises[importName] == null) {
        ReplPromises[importName] = {};
      }

      var fileIdToImport = actualImplementation.getUniqueId();
      if (ReplPromises[importName][fileIdToImport] == null) {
        ReplPromises[importName][fileIdToImport] = {};
      }

      var myGDriveOverride = {};
      myGDriveOverride[importName] = Util.makeResolvedPromise([actualImplementation]);
      var replPromise = createRepl(myGDriveOverride, testFileObj);
      var fileIdToRun = testFileObj.getUniqueId();
      ReplPromises[importName][fileIdToImport][fileIdToRun] = replPromise;
    };

    var isTestSuccess = function(val) {
      return runtime.unwrap(runtime.getField(CH, "is-success").app(val));
    };

    var getCheckResults = function(checkResults) {
      var checkBlocks = ffi.toArray(checkResults).reverse();
      if (checkBlocks.length === 0) {
        return [];
      }

      var checkTotalAll = 0;
      var checkPassedAll = 0;

      var checkBlocksErrored = 0;

      var checkBlockReports = checkBlocks.map(function(checkBlock) {
        var isSome = runtime.getField(option, "is-some");
        var maybeErr = runtime.getField(checkBlock, "maybe-err");
        var isError = isSome.app(maybeErr);
        if (isError) {
          checkBlocksErrored += 1;
        }

        var name = runtime.getField(checkBlock, "name");
        var testResults = runtime.getField(checkBlock, "test-results");
        var tests = ffi.toArray(testResults).reverse();

        // console.log('THIS CHECK BLOCK HAS ' + tests.length + ' TESTS:', tests);

        var testsInBlock = 0;
        var testsPassingInBlock = 0;

        tests = tests.map(function(test) {
          checkTotalAll += 1;
          testsInBlock += 1;
          var isSuccess = isTestSuccess(test);
          if (isSuccess) {
            checkPassedAll += 1;
            testsPassingInBlock += 1;
          }
          var loc = runtime.getField(test, "loc").dict;
          var name = test.$name;
          return {
            isSuccess: isSuccess,
            name: name,
            loc: loc
          };
        });

        var error = isError ? runtime.getField(runtime.getField(checkBlock, "maybe-err"),"value").val : null;

        return {
          isError: isError,
          error: error,
          testsPassedInBlock: testsPassingInBlock,
          testsTotalInBlock: testsInBlock,
          tests: tests
        };
      });
      var checkBlockCount = checkBlocks.length;

      console.log('Passed ' + checkPassedAll + ' out of ' + checkTotalAll);

      return {
        testsPassed: checkPassedAll,
        testsTotal: checkTotalAll,
        numCheckBlocks: checkBlockCount,
        checkBlocks: checkBlockReports
      };
    };

    
    // var lastResortIfPending = function(defer, resolveWith) {
    //   if (defer.promise.inspect().state === "pending") {
    //     defer.resolve({
    //             isError: true,
    //             failureCase: 'unknown (defer unresolved)',
    //             exn: resolveWith,
    //             checks: null
    //           });
    //   }
    // };

    /**
     * Copied/modified from repl-ui.js:displayResult
     */
    var createResultExtractor = function(pyretResult) {
      var dataDefer = Q.defer();
      var thunk = function() {
        var data = {
          isError: true,
          failureCase: null,
          exn: null,
          checks: null,
          stats: pyretResult.stats
        };
        console.log("Full time including compile/load:", JSON.stringify(pyretResult.stats));
        if (runtime.isFailureResult(pyretResult)) {
          data.failureCase = 'isFailureResult(pyretResult)';
          data.exn = pyretResult.exn;
          // console.log('ABOUT TO RESOLVE DATA:', data);
          dataDefer.resolve(data);
          return runtime.nothing;
        } else if (runtime.isSuccessResult(pyretResult)) {
          var result = pyretResult.result;
          // console.log('about to descend into cases');
          ffi.cases(ffi.isEither, "is-Either", result, {
            left: function(compileResultErrors) {
              var errs = [];
              var results = ffi.toArray(compileResultErrors);
              results.forEach(function(r) {
                errs = errs.concat(ffi.toArray(runtime.getField(r, "problems")));
              });
              data.failureCase = 'is-left(result)';
              data.exn = errs;
              // console.log('ABOUT TO RESOLVE DATA:', data);
              dataDefer.resolve(data);
              return runtime.nothing;
            },
            right: function(v) {
              var runResult = runtime.getField(loadLib, "internal").getModuleResultResult(v);
              console.log("Time to run compiled program:", JSON.stringify(runResult.stats));
              if (runtime.isSuccessResult(runResult)) {
                runtime.safeCall(function() {
                  var checks = runtime.getField(runResult.result, "checks");
                  data.isError = false;
                  data.checks = getCheckResults(checks);
                  return runtime.nothing;
                }, function(safeCallResult) {
                  // console.log('safeCallResult:', safeCallResult);
                  // console.log('ABOUT TO RESOLVE DATA:', data);
                  dataDefer.resolve(data);
                  return runtime.nothing;
                });
              } else if (runtime.isFailureResult(runResult)) {
                data.failureCase = 'isFailureResult(runResult)';
                data.exn = runResult.exn;
                // console.log('ABOUT TO RESOLVE DATA:', data);
                dataDefer.resolve(data);
                return runtime.nothing;
              } else {
                data.failureCase = 'unknown(runResult)';
                data.exn = {
                  unknown: runResult
                };
                // console.log('ABOUT TO RESOLVE DATA:', data);
                dataDefer.resolve(data);
                return runtime.nothing;
              }
            }
          });
        } else {
          data.failureCase = 'unknown(pyretResult)';
          data.exn = {
            unknown: pyretResult
          };
          // console.log('ABOUT TO RESOLVE DATA:', data);
          dataDefer.resolve(data);
          return runtime.nothing;
        }
      };

      return function() {
        return callDeferred(runtime, thunk)
          .then(function (result) {
            // console.log('.then:', result);
            return dataDefer.promise;
          })
          .fail(function (error) {
            // console.log('.fail:', error);
            return dataDefer.promise;
          });
      };
    };

    /**
     */
    var DEBUG = {
      assertEqual: function(obj1, obj2) {
        if (obj1 !== obj2) {
          console.error('assertEqual failed:', obj1, obj2);
          throw new Error('');
        }
      },
      assertRunner: function(runner, expectedImplementationId, expectedTestId) {
        var actualTestId = runner.test.id;
        var actualImplementationId = runner.implementation.id;
        DEBUG.assertEqual(expectedTestId, actualTestId);
        DEBUG.assertEqual(actualImplementationId, expectedImplementationId);
      },
      assertTestNumbersConsistent: function(testsPassed, testsTotal) {
        console.assert(0 <= testsPassed);
        console.assert(testsPassed <= testsTotal);
      }
    };

    /**
     */
    var makeRunner = function(implementationFileObj, testFileObj, student, runnerType, implementationName, timeout) {
      // TODO, maybe: make typeCheck an option
      var typeCheck = false;

      var implementationFileObjName = (implementationFileObj === null) ? null : implementationFileObj.getName();
      var implementationFileObjId = (implementationFileObj === null) ? null : implementationFileObj.getUniqueId();
      var implementation = {
        name: implementationFileObjName,
        id: implementationFileObjId
      };

      var testFileObjName = (testFileObj === null) ? null : testFileObj.getName();
      var testFileObjId = (testFileObj === null) ? null : testFileObj.getUniqueId();
      var test = {
        name: testFileObjName,
        id: testFileObjId
      };

      if (testFileObj !== null) {
        registerRepl(implementationName, implementationFileObj, testFileObj);
      }
      var replPromise = (implementationFileObjId === null || testFileObjId === null) ? null :
        ReplPromises[implementationName][implementationFileObjId][testFileObjId];

      var uniqueId = [student.id, Util.toString(implementation.id), Util.toString(test.id), 'Runner'].join('-');

      var runnerRecord = {uniqueId: uniqueId};

      var isMissing = (replPromise === null);

      var run = function(onStart, onDoneSuccess, onDoneFailure) {
        var resultDefer = Q.defer();
        var resolveRunData = function(runData) {
          var gradeRunData = {
            uniqueId: uniqueId,
            implementation: implementation,
            test: test,
            student: student,
            runnerType: runnerType,
            runData: runData,
            timestamp: Date.now()
          };

          resultDefer.resolve(gradeRunData);

          
          if (runData.isError) {
            onDoneFailure(runnerRecord);
          } else {
            onDoneSuccess(runnerRecord);
          }
        };

        if (isMissing) {
          onStart(runnerRecord);
          var runData = {
            isError: true,
            failureCase: 'missing',
            exn: 'Implementation and/or test is missing.',
            checks: null
          };
          resolveRunData(runData);
          return resultDefer.promise;
        }

        return replPromise.then(function(jsRepl) {
          onStart(runnerRecord);
          var runResultPromise = jsRepl.restartInteractions('', typeCheck);
          var done = false;
          var timer = setTimeout(function() {
            if(!done) {
              jsRepl.stop();
              var runData = {
                isError: true,
                failureCase: 'timeout',
                exn: 'timeout exceed max time of ' + timeout,
                checks: null
              };
              resolveRunData(runData);
            }
          }, timeout);

          runResultPromise.then(function(pyretResult) {
            done = true;
            clearTimeout(timer);
            var extract = createResultExtractor(pyretResult);
            return extract();
          }).then(function(runData) {
            resolveRunData(runData);
          }).fail(function(err) {
            console.error(err);
            throw err;
          });

          return resultDefer.promise;
        });
      };

      var runner = {
        implementation: implementation,
        test: test,
        student: student,
        runnerType: runnerType,
        run: run,
        uniqueId: uniqueId,
        isMissing: isMissing
      };

      // DEBUG.assertRunner(runner, implementationFileObj.getUniqueId(), testFileObj.getUniqueId());

      return runner;
    };

    var makeStudentRunner = function(testSuiteFile, goldFile, coalFiles, submission, implementationName, timeout) {
      var student = submission.student;
      var test = (testSuiteFile === null || submission.implementation === null) ? null : makeRunner(submission.implementation, testSuiteFile, student, RunnerType.TEST, implementationName, timeout);
      var gold = (goldFile === null || submission.test === null) ? null : makeRunner(goldFile, submission.test, student, RunnerType.GOLD, implementationName, timeout);
      var coals = coalFiles.map(function(coalFile) {
        return makeRunner(coalFile, submission.test, student, RunnerType.COAL, implementationName, timeout);
      });
      var uniqueId = student.id + '-StudentRunner';

      return {
        student: student,
        test: test,
        gold: gold,
        coals: coals,
        uniqueId: uniqueId
      };
    };

    var api;
    var errNoApiMessage = 'Attempted to get file(s) before gdrive api was ready.';

    window.storageAPI.then(function(programCollectionAPI) {
      console.log('gdrive api ready for use by cpo-grade.');
      api = programCollectionAPI;      
    }, function(err) {
      console.error(err);
    });

    /**
     */
    var MAX_REQUESTS_PER_INTERVAL = 10;

    
    /**
     */
    var requestQueue = [];

    /**
     */
    var processUpToXRequests = function() {
      var x = Math.min(MAX_REQUESTS_PER_INTERVAL, requestQueue.length);
      for (var i = 0; i < x; i++) {
        // pop and shift give FIFO behavior
        var nextRequest = requestQueue.shift();
        nextRequest();
      }
    };

    /**
     */
    var apiRequestRetryHelper = function(request, iteration, max, defer) {
      var retry = function() {
        // formula from https://gist.github.com/peterherrmann/2700284
        var timeToWait = (Math.pow(2, iteration) * 1000) + (Math.round(Math.random() * 1000));
        console.log('Retrying request in ' + (timeToWait / 1000) + ' seconds...');
        setTimeout(function() {
          apiRequestRetryHelper(request, iteration + 1, max, defer);
        }, timeToWait);
      };

      if (iteration > 0) {
        console.log('...retrying request now.');
      }

      var makeRequest = function() {
        console.log('making request');
        (request()).then(function(resolvedObject) {
          defer.resolve(resolvedObject);
        }).fail(function(apiResponseError) {
          if ((apiResponseError.message === 'User Rate Limit Exceeded') && (iteration < max)) {
            retry();
          } else {
            defer.reject(apiResponseError);
          }
        });
      };

      requestQueue.push(makeRequest);

      return defer.promise;
    };

    /**
     */
    var apiRequestRetry = function(request) {
      var defer = Q.defer();
      return apiRequestRetryHelper(request, 0, 6, defer);
    };

    /**
     */
    var idAndApiCheck = function(id) {
      if (!id || (typeof id !== 'string')) {
        throw new Error('Cannot get id: ' + id);
      } else if (!api) {
        throw new Error(errNoApiMessage);
      }
    };

    /**
     */
    var getFile = function(id) {
      idAndApiCheck(id);
      var request = function() {
        return api.getFileById(id);
      };
      return apiRequestRetry(request);
    };

    /**
     */
    var listChildren = function(id) {
      idAndApiCheck(id);
      var request = function() {
        return api.listChildren(id);
      };
      return apiRequestRetry(request);
    };

    /**
     */
    var getFilesInFolder = function(id) {
      idAndApiCheck(id);
      return (listChildren(id)).then(function(directory) {
        if (directory.items != null) {
          return Q.all(directory.items.map(function(file) {
            return getFile(file.id);
          }));
        } else {
          throw new Error('directory.items is null or undefined');
        }
      }).fail(function(err) {
        throw err;
      });
    };

    var optionalGetFile = function(id) {
      if (id.length > 0) {
        return getFile(id);
      } else {
        return Util.makeResolvedPromise(null);
      }
    };

    var optionalGetFilesInFolder = function(id) {
      if (id.length > 0) {
        return getFilesInFolder(id);
      } else {
        return Util.makeResolvedPromise([]);
      }
    };

    /**
     * @param {string} testSuiteFileID
     * @param {string} goldFileID
     * @param {string} coalFolderID
     * @param {string} submissionsFolderID
     * @param {string} submissionName
     * @param {string} implementationName
     * @param {string} testName
     * @param {number} timeout
     * @return {Promise<Array<StudentRunner>>}
     */
    var createStudentRunners = function(testSuiteFileID, goldFileID, coalFolderID,
      submissionsFolderID, submissionName, implementationName, testName, timeout) {

      setInterval(processUpToXRequests, 1050);

      var testSuiteFilePromise = optionalGetFile(testSuiteFileID);
      var goldFilePromise = optionalGetFile(goldFileID);
      var coalFilesPromise = optionalGetFilesInFolder(coalFolderID);
      var submissionsPromise = getFilesInFolder(submissionsFolderID)
      .then(function(studentFolders) {
        var arrayOfPromises = studentFolders.map(function(studentFolder) {
          var name = studentFolder.getName();
          var id = studentFolder.getUniqueId();
          var student = {
            name: name,
            id: id
          };
          return getFilesInFolder(id).then(function(files) {
            var submission = files.find(function(file) {
              return file === null ? false : file.getName() === submissionName;
            });
            if (submission == null) {
              console.error('Could not find ' + submissionName + ' for student ' + student.name);
              return [];
            } else {
              return getFilesInFolder(submission.getUniqueId());
            }
          }).then(function(submittedFiles) {
            var implementation = submittedFiles.find(function(file) {
              // return file === null ? false : file.getName() === implementationName;
              return file === null ? false : Util.looseFilenameMatch(file.getName(), implementationName);
            });
            var test = submittedFiles.find(function(file) {
              // return file === null ? false : file.getName() === testName;
              return file === null ? false : Util.looseFilenameMatch(file.getName(), testName);
            });

            //fallback: assume submittedFiles === [implfile, testfile]
            implementation = implementation || submittedFiles[0] || null;
            test = test || submittedFiles[1] || null;

            return {
              student: student,
              implementation: implementation,
              test: test
            };
          });
        });
        return Q.all(arrayOfPromises);
      });
      
      var studentRunners =  Q.all([
        testSuiteFilePromise,
        goldFilePromise,
        coalFilesPromise,
        submissionsPromise
      ]).then(function(results) {
        // console.log(results);
        var testSuiteFile = results[0];
        var goldFile = results[1];
        var coalFiles = results[2];
        var submissions = results[3];
        return submissions.map(function(submission) {
          return makeStudentRunner(testSuiteFile, goldFile, coalFiles, submission, implementationName, timeout);
        });
      });

      return studentRunners;
    };

    /**
     * @param {StudentRunner} studentRunner
     * @return {Promise<StudentGradeRunData>}
     */
    var runStudentRunner = function(studentRunner) {
      var testGradeDataPromise = studentRunner.test.run();
      var goldGradeDataPromise = studentRunner.gold.run();
      var coalGradeDataPromises = studentRunner.coals.map(function(coalRunner) {
        return coalRunner.run();
      });
      var coalGradeDataArrayPromise = Q.all(coalGradeDataPromises);

      return Q.all([
        testGradeDataPromise,
        goldGradeDataPromise,
        coalGradeDataArrayPromise
      ]).then(function(promises) {
        return {
          student: studentRunner.student,
          test: promises[0],
          gold: promises[1],
          coals: promises[2]
        };
      });
    };

    window.CPOGRADE = {
      createStudentRunners: createStudentRunners,
      runStudentRunner: runStudentRunner
    };

    console.log('cpo-grade loaded.');

    return runtime.makeModuleReturn({}, {});
  }
}) // eslint-disable-line semi
