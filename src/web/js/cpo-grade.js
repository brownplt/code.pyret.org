/* global Q */

({
  requires: [
    { 'import-type': 'dependency',
      protocol: 'js-file',
      args: ['./cpo-ide-hooks']
    }
  ],
  nativeRequires: [
    'cpo/gdrive-locators'
  ],
  theModule: function(runtime, namespace, uri, cpoIdeHooks, gdriveLocators) {
    // JS Doc annotations herein use an approximation the Google Closure
    // Compiler type expression syntax, but will not be type-checked
    //
    // Promise<T> will refer to a promise whose `then`, etc methods
    // are of type {function(T)}

    /**
     * @enum {string}
     */
    var RunnerType = {
      TEST: 0, // Run a student implementation against the solution test suite.
      GOLD: 1, // Run a student test suite against the solution implementation.
      COAL: 2  // Run a student test suite against a broken implementation.
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
    var CPOGradeUtil = {
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
          var testsTotal = (runnerType === RunnerType.TEST) ? 80 : CPOGradeUtil.getRandomIntInclusive(40,100);
          var testsPassed = CPOGradeUtil.getRandomIntInclusive(0,testsTotal);
          var success = (CPOGradeUtil.getRandomIntInclusive(0,1) === 1);

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
          var gradeRunData = CPOGradeUtil.Mock.createMockGradeData(implementation, test, student, runnerType);
          var gradeRunDataPromise = CPOGradeUtil.makeResolvedPromise(gradeRunData);

          var run = function() {
            return gradeRunDataPromise;
          };

          var uniqueId = [student.id, implementation.id, test.id, 'Runner'].join('-');

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

            return CPOGradeUtil.Mock.createMockRunner(implementation, test, student, runnerType);
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

            return CPOGradeUtil.Mock.createMockRunner(implementation, test, student, runnerType);
          });

          var numCoals = CPOGradeUtil.getRandomIntInclusive(3,6);

          var coalRunnerArrays = studentData.map(function(student) {
            var coalsFileData = CPOGradeUtil.Mock.createMockCoalsFileData(numCoals);

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

              return CPOGradeUtil.Mock.createMockRunner(implementation, test, student, runnerType);
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
      }
    };

    var api;
    var errNoApiMessage = 'Attempted to get file(s) before gdrive api was ready.';

    window.storageAPI.then(function(programCollectionAPI) {
      console.log("gdrive api ready for use by cpo-grade.");
      api = programCollectionAPI.api;      
    }, function(err) {
      console.error(err);
    });

    /**
     */
    var apiRequestRetryHelper = function(request, iteration, max, defer) {
      var retry = function() {
        // formula from https://gist.github.com/peterherrmann/2700284
        var timeToWait = (Math.pow(2, iteration) * 1000) + (Math.round(Math.random() * 1000));
        console.log("Retrying request in " + (timeToWait / 1000) + " seconds...");
        setTimeout(function() {
          apiRequestRetryHelper(request, iteration + 1, max, defer);
        }, timeToWait);
      };

      if (iteration > 0) {
        console.log("...retrying request now.");
      }

      (request()).then(function(resolvedObject) {
        defer.resolve(resolvedObject);
      }).fail(function(apiResponseError) {
        if ((apiResponseError.message === 'User Rate Limit Exceeded') && (iteration < max)) {
          retry();
        } else {
          defer.reject(apiResponseError);
        }
      });

      return defer.promise;
    };

    /**
     */
    var apiRequestRetry = function(request) {
      var defer = Q.defer();
      return apiRequestRetryHelper(request, 0, 3, defer);
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

    /**
     * @param {string} testSuiteFileID
     * @param {string} goldFileID
     * @param {string} coalFolderID
     * @param {string} submissionsFolderID
     * @param {string} submissionName
     * @param {string} implementationName
     * @param {string} testName
     * @return {Array<StudentRunner>}
     */
    var createStudentRunners = function(testSuiteFileID, goldFileID, coalFolderID,
      submissionsFolderID, submissionName, implementationName, testName) {

      var testSuiteFilePromise = getFile(testSuiteFileID);
      var goldFilePromise = getFile(goldFileID);
      var coalFolderFilesPromise = getFilesInFolder(coalFolderID);
      var submissionsFolderFilesPromise = getFilesInFolder(submissionsFolderID)
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
              return file.getName() === submissionName;
            });
            if (!submission) {
              console.error(files);
              throw new Error('Could not find "' + submissionName + '" for student "' + student.name + '"');
            } else {
              return getFilesInFolder(submission.getUniqueId());
            }
          }).then(function(submittedFiles) {
            var implementation = submittedFiles.find(function(file) {
              return file.getName() === implementationName;
            });
            var test = submittedFiles.find(function(file) {
              return file.getName() === testName;
            });
            return {
              student: student,
              implementation: implementation,
              test: test
            };
          });
        });

        return Q.all(arrayOfPromises);
      });

      var registerLogger = function(promise, msg) {
        return promise.then(function(result) {
          console.log(msg, result);
        }).fail(function(result) {
          console.log(msg + " ERROR");
          console.error(result);
        });
      };

      registerLogger(testSuiteFilePromise, "TEST SUITE FILE");
      registerLogger(goldFilePromise, "GOLD FILE");
      registerLogger(coalFolderFilesPromise, "COAL FILES");
      registerLogger(submissionsFolderFilesPromise, "SUBMISSIONS FILES");

      return CPOGradeUtil.Mock.createMockStudentRunners();
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
})