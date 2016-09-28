/* global Q $ */
(function() {

  // temp hack because heroku is hard
  // var process = {
  //   env: {
  //     PYRET: 'https://s3.amazonaws.com/pyret-grading/cpo-main.jarr.gz.js',
  //     PYRET_GRADE: 'https://s3.amazonaws.com/pyret-grading/cpo-grade.jarr.gz.js'
  //   }
  // };
  
  var process = {
    env: {
      PYRET: '/js/cpo-main.jarr',
      PYRET_GRADE: '/js/cpo-grade.jarr'
    }
  };

  /**
   */
  var RunAllId = 'run-all';

  /**
   */
  var Templates = {
    nameSpan: '<div><span>{{name}}</span></div>',
    thNoRunner: '<th class="def" id="{{id}}">{{> nameSpan}}</th>',
    thRunAll: '<th class="tooltip def" id="{{runAllId}}" title="Run All">Student</th>',
    thRunAllForName: '<th class="tooltip def" id="{{id}}" title="Run All for {{name}}">{{> nameSpan}}</th>',
    tdRunAllForName: '<td class="tooltip def" id="{{id}}" title="Run All for {{name}}">{{> nameSpan}}</td>',
    tdRun: '<td class="tooltip def" id="{{id}}" title="Run"></td>',
    tdRunMissing: '<td class="tooltip def" title="Something is missing.">?</td>',
    tableHead: '<thead><tr>{{> thRunAll}}{{#columns}}{{> thNoRunner}}{{/columns}}</tr></thead>',
    tableRow: '<tr>{{> tdRunAllForName}} {{#cells}} {{#isPresent}} {{> tdRun}} {{/isPresent}} {{^isPresent}} {{> tdRunMissing}} {{/isPresent}} {{/cells}}</tr>',
    tableBody: '<tbody> {{#students}} {{> tableRow}}  {{/students}} </tbody>',
    tableContents: '{{> tableHead}}{{> tableBody}}',
    priorRunsOptions: '<option selected disabled>Click to select</option>{{#options}}<option value="{{value}}">{{text}}</option>{{/options}}',
    noPriorRunsOptions: '<option selected disabled>No prior runs</option>',
    tooltipContents: '<p class="tt">{{text}}</p>'
  };

  /**
   */
  var IdToRunner;

  /**
   */
  var IdToStudentRunner;

  /**
   */
  var Runners;

  /**
   */
  var RunnerQueueStatus;

  var Colors = {
    pending: '#f7cb2a',
    success: '#30ba40',
    failure: '#de1d10'
  };

  var LocalStorage = {
    get: function(key) {
      return window.localStorage[key];
    },

    set: function(key, value) {
      window.localStorage[key] = value;
    },

    getNumberOfPriorRuns: function() {
      return parseInt(LocalStorage.get('n'), 10);
    },

    setNumberOfPriorRuns: function(num) {
      return LocalStorage.set('n', num);
    },

    indexToTimestampKey: function(index) {
      return 't' + index;
    },

    getTimestampAtIndex: function(index) {
      var key = LocalStorage.indexToTimestampKey(index);
      return LocalStorage.get(key);
    },

    setTimestampAtIndex: function(index) {
      var key = LocalStorage.indexToTimestampKey(index);
      var val = new Date();
      return LocalStorage.set(key, val);
    },

    setWithTimestamp: function(index, data) {
      LocalStorage.set(index, data);
      return LocalStorage.setTimestampAtIndex(index);
    },

    saveNewFormData: function(data) {
      var numPriorRuns = LocalStorage.getNumberOfPriorRuns();
      if (!(numPriorRuns > 0)) {
        numPriorRuns = 0;
      }
      numPriorRuns += 1;
      LocalStorage.setNumberOfPriorRuns(numPriorRuns);
      LocalStorage.setWithTimestamp(numPriorRuns, data);
    },

    clear: function() {
      return window.localStorage.clear();
    }
  };

  /**
   */
  var setGlobalsEmpty = function() {
    IdToRunner = {};
    IdToStudentRunner = {};
    Runners = [];
    RunnerQueueStatus = {};
  };

  /**
   */
  var hasBeenQueued = function(runner) {
    return !!(RunnerQueueStatus[runner.uniqueId]);
  };
  
  /**
   */
  var setRunnerCellBackgroundColor = function(runner, color) {
    var selector = jQueryIDSelector(runner.uniqueId);
    $(selector).css('background-color', color);
  };

  /**
   */
  var setRunnerCellBackgroundImage = function(runner, image) {
    var selector = jQueryIDSelector(runner.uniqueId);
    $(selector).css('background-image', image);
    $(selector).css('background-size', '35px 35px');
    $(selector).css('background-repeat', 'no-repeat');
  };

  /**
   */
  var queueRunner = function(runner) {
    if (!hasBeenQueued(runner)) {
      RunnerQueueStatus[runner.uniqueId] = true;
      Runners.push(runner);
      // console.log("queued runner");
      setRunnerCellBackgroundColor(runner, Colors.pending);
    }
  };

  /**
   */
  var getAllRunners = function(studentRunner) {
    return ([studentRunner.test, studentRunner.gold]).concat(studentRunner.coals);
  };

  /**
   */
  var queueStudentRunner = function(studentRunner) {
    var runners = getAllRunners(studentRunner);
    runners.forEach(function(runner) {
      if (runner !== null) {
        queueRunner(runner);
      }
    });
  };

  /**
   * @param  {Object} objA
   * @param  {T} objB
   * @param  {Object<string, T>} map
   * @return {boolean} true iff map was updated
   */
  var optionallyMapUniqueIdOfObjectToItself = function(map, obj) {
    if(!!obj && (typeof obj.uniqueId === 'string')) {
      map[obj.uniqueId] = obj;
      return true;
    }
    return false;
  };

  /**
   */
  var populateIdMaps = function(studentRunners) {
    setGlobalsEmpty();
    studentRunners.forEach(function(studentRunner) {
      IdToStudentRunner[studentRunner.uniqueId] = studentRunner;
      optionallyMapUniqueIdOfObjectToItself(IdToRunner, studentRunner.test);
      optionallyMapUniqueIdOfObjectToItself(IdToRunner, studentRunner.gold);
      studentRunner.coals.forEach(function(coalRunner) {
        optionallyMapUniqueIdOfObjectToItself(IdToRunner, coalRunner);
      });
    });
  };

  /**
   * Taken from learn.jquery.com
   */
  var jQueryIDSelector = function(domID) {
    return "#" + domID.replace( /(:|\.|\[|\]|,)/g, '\\\\$1' );
  };

  /**
   */
  var renderTemplate = function(template, view) {
    return window.Mustache.render(template, view, Templates);
  };

  /**
   */
  var getTemplateTemplateViewForRunner = function(runner) {
    var id = (runner === null) ? null : runner.uniqueId;
    return {
      isPresent: (runner !== null) && !(runner.isMissing),
      id: id
    };
  };

  /**
   */
  var getTemplateTemplateViewForStudentRunner = function(studentRunner) {
    var name = studentRunner.student.name;
    var id = studentRunner.uniqueId;
    var allRunners = getAllRunners(studentRunner);
    var cells = allRunners.map(getTemplateTemplateViewForRunner);

    return {
      name: name,
      id: id,
      cells: cells
    };
  };

  /**
   */
  var getColumnsTemplateView = function(studentRunner) {
    var test = {
      name: 'test',
      id: 'run-all-test'
    };

    var gold = {
      name: 'gold',
      id: 'run-all-gold'
    };

    var coals = [];
    if (studentRunner.coals) {
      for (var i = 0; i < studentRunner.coals.length; i++) {
        var name = 'coal ' + i;
        var id = 'run-all-' + name;
        coals[i] = {
          name: name,
          id: id
        };
      }
    }

    var testAndMaybeGold = (studentRunner.gold != null) ? [test, gold] : [test];
    return testAndMaybeGold.concat(coals);
  };

  /**
   */
  var getTableTemplateView = function(studentRunners) {   
    var students = studentRunners.map(getTemplateTemplateViewForStudentRunner);
    var columns = getColumnsTemplateView(studentRunners[0]);
    return {
      students: students,
      columns: columns,
      runAllId: RunAllId
    };
  };

  /**
   */
  var onRunnerCellClicked = function(e) {
    var id = e.data.id;
    var runner = IdToRunner[id];
    queueRunner(runner);
  };

  /**
   */
  var onStudentRunnerCellClicked = function(e) {
    var id = e.data.id;
    var studentRunner = IdToStudentRunner[id];
    queueStudentRunner(studentRunner);
  };

  /**
   */
  var renderTable = function(studentRunners) {
    var view = getTableTemplateView(studentRunners);

    var tableHTML = renderTemplate(Templates.tableContents, view);
    $('#tbl').html(tableHTML);

    populateIdMaps(studentRunners);

    for (var id in IdToRunner) {
      var selector = jQueryIDSelector(id);
      var eventData = {id: id};
      $(selector).click(eventData, onRunnerCellClicked);
    }

    for (id in IdToStudentRunner) {
      selector = jQueryIDSelector(id);
      eventData = {id: id};
      $(selector).click(eventData, onStudentRunnerCellClicked);
    }

    $(jQueryIDSelector(RunAllId)).click(function() {
      studentRunners.forEach(queueStudentRunner);
    });

    $("#frm").submit(function(e) {
      e.preventDefault();
      generateJSON();
    });

    $('#frm').show();

  };

  var mapPromisesOneAtATime = function(funcs) {
    var newFuncs = funcs.map(function (f) {
      return function (accumulated) {
        var thePromise = f();
        return thePromise.then(function (data) {
          accumulated.push(data);
          return accumulated;
        });
      }
    });

    var accumulator = [];

    return newFuncs.reduce(function (soFar, f) {
        return soFar.then(f);
    }, Q(accumulator));
  };

  var onStart = function(recordWithUniqueId) {
    setRunnerCellBackgroundImage(recordWithUniqueId, 'url("/img/pyret-spin.gif")');
  };

  var onDoneSuccess = function(recordWithUniqueId) {
    //removeClassFromRunnerCell(recordWithUniqueId, 'runner-status-pending');
    //addClassToRunnerCell(recordWithUniqueId, 'runner-status-complete-success');
    setRunnerCellBackgroundImage(recordWithUniqueId, '');
    setRunnerCellBackgroundColor(recordWithUniqueId, Colors.success);
  };

  var onDoneFailure = function(recordWithUniqueId) {
    // removeClassFromRunnerCell(recordWithUniqueId, 'runner-status-pending');
    // addClassToRunnerCell(recordWithUniqueId, 'runner-status-complete-failure');
    setRunnerCellBackgroundImage(recordWithUniqueId, '');
    setRunnerCellBackgroundColor(recordWithUniqueId, Colors.failure);
  };

  /**
   */
  var generateJSON = function() {
    var resultFuncs = Runners.map(function(runner) {
      return function() {
        // console.log("Running...");
        return runner.run(onStart, onDoneSuccess, onDoneFailure);
      }
    });

    
    var aggregatePromise = mapPromisesOneAtATime(resultFuncs);
    aggregatePromise.then(function(gradeRunDataArray) {
      // console.log("...done!");
      console.log(gradeRunDataArray);
      $("#out").text(JSON.stringify(gradeRunDataArray, null, "\t"));
      $('#download').removeAttr('disabled');
    }).fail(function(err) {
      console.error(err);
      alert('Something went wrong. Open the console to see the error.');
    });
  };

  var makeFileName = function(gradeRunData) {
    var path = [String(gradeRunData.student.name)];
    if (gradeRunData.runnerType === 'COAL') {
      path.push('coals');
    }
    path.push(String(gradeRunData.implementation.name) + '.json');

    return path.join('/');
  };

  /**
   */
  var downloadJSON = function() {
    var jsonString = $('#out').text();
    var gradeRunDataArray = JSON.parse(jsonString);

    var zip = new JSZip();

    for (var i = 0; i < gradeRunDataArray.length; i++) {     
      var fileName = makeFileName(gradeRunDataArray[i]);
      var fileContents = JSON.stringify(gradeRunDataArray[i], null, '\t');
      zip.file(fileName, fileContents);
    }

    zip.generateAsync({type: 'blob'})
    .then(function(content) {
      saveAs(content, 'grade-data.zip');
    });
  };

  /**
   */
  var resetPriorRunsForm = function() {
    LocalStorage.clear();
    drawPriorRunsForm();
  };

  /**
   */
  var savePriorRunsForm = function(form) {
    var data = $(form).serialize();
    LocalStorage.saveNewFormData(data);
  };

  /**
   */
  var updateConfigFromPriorRunsForm = function() {
    var s = LocalStorage.get($('#pr').val());
    var formData = s.split('&');
    $.each(formData, function(k, v) {
      var data = v.split('=');
      $('#' + data[0]).val(decodeURIComponent(data[1]));
    });
  };

  /**
   */
  var drawPriorRunsForm = function() {
    var template = Templates.noPriorRunsOptions;
    var view = {
      options: []
    };

    var numPriorRuns = LocalStorage.getNumberOfPriorRuns();
    if (numPriorRuns > 0) {
      template = Templates.priorRunsOptions;
      for (var i = numPriorRuns; i > 0; i--) {
        var value = i;
        var text = LocalStorage.getTimestampAtIndex(i);
        var optionsIndex = numPriorRuns - i;
        view.options[optionsIndex] = {
          value: value,
          text: text
        };
      }
    }
    
    var selectHTML = renderTemplate(template, view);
    $('#pr').html(selectHTML);
  };

  /**
   */
  var onCPOGradeLoaded = function(gradeApi) {

    $('#cfg').on('submit', function(e) {
      e.preventDefault();
      savePriorRunsForm(this);
      $('#cfg-container').hide();
      $('#loading-message').show();
      getStudentRunners().then(function(studentRunners) {
        $('#loading-message').hide();
        renderTable(studentRunners);
      }).fail(function(err) {
        console.error(err);
        alert(err);
      });
    });

    $('#load').removeAttr('disabled');

    $('#download').click(function(e) {
      e.preventDefault();
      downloadJSON();
    });

    /**
     */
    var getStudentRunners = function() {
      var DEFAULT_TIMEOUT = '120';

      var testSuiteFileID = $('#suite').val();
      var goldFileID = $('#gold').val();
      var coalFolderID = $('#coals').val();
      var submissionsFolderID = $('#id').val();
      var submissionName = $('#submission-name').val();
      var implementationName = $('#implementation').val();
      var testName = $('#test').val();

      var timeoutString = $('#timeout').val() || DEFAULT_TIMEOUT;
      var timeoutInSeconds = parseInt(timeoutString, 10);
      if (isNaN(timeoutInSeconds)) {
        throw new Error('Could not parse int from "' + timeoutString + '"');
      }
      var timeout = timeoutInSeconds * 1000;

      return gradeApi.createStudentRunners(testSuiteFileID, goldFileID, coalFolderID,
        submissionsFolderID, submissionName, implementationName, testName, timeout);
    };

    /**
     */
    // var getAndRunEverything = function() {
    //   var studentRunners = getStudentRunners();
    //   console.log('studentRunners:', studentRunners);

    //   var studentRunGradeDataPromises = studentRunners.map(function(studentRunner) {
    //     return gradeApi.runStudentRunner(studentRunner);
    //   });

    //   Q.all(studentRunGradeDataPromises)
    //   .then(function(studentGradeRunDataArray) {
    //     console.log('gradeRunData:', studentGradeRunDataArray);
    //   })
    //   .fail(function(err) {
    //     console.error(err);
    //   });
    // };
  };

  $(document).on('mouseover', '.tooltip', function() {
    var title = $(this).attr('title');
    $(this).data('tipText', title).removeAttr('title');
    var tooltipHTML = renderTemplate(Templates.tooltipContents, {text: title});
    $(tooltipHTML).appendTo('body').fadeIn(0);
  });

  $(document).on('mouseout', '.tooltip', function () {
    $(this).attr('title', $(this).data('tipText'));
    $('.tt').remove();
  });

  $(document).on('mousemove', '.tooltip', function(e) {
    var x = e.pageX;
    var y = e.pageY;
    $('.tt').css({ top: y, left: x });
  });

  $('#reset').on('click', function(e) {
    resetPriorRunsForm();
  });

  $('#prf').on('submit', function(e) {
    e.preventDefault();
    updateConfigFromPriorRunsForm();
  });

  drawPriorRunsForm();

  var loadScriptUrl = function(url) {
    var scriptTag = document.createElement('script');
    scriptTag.src = url;
    scriptTag.type = 'text/javascript';
    document.body.appendChild(scriptTag);
  };

  var checkIfLoaded = function() {
    if (window.CPOGRADE) {
      onCPOGradeLoaded(window.CPOGRADE);
    } else if (new Date().getTime() - startTime > 30000) {
      console.error('Timed out while waiting for runtime to load :(');
    } else {
      window.setTimeout(checkIfLoaded, 250);
    }
  };

  var startTime = new Date().getTime();
  console.log(process.env.PYRET_GRADE)
  loadScriptUrl(process.env.PYRET_GRADE);
  window.setTimeout(checkIfLoaded, 250);

})();