(function() {

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
    tableHead: '<thead><tr>{{> thRunAll}}{{#columns}}{{> thNoRunner}}{{/columns}}</tr></thead>',
    tableRow: '<tr>{{> tdRunAllForName}} {{#cells}} {{> tdRun}} {{/cells}}</tr>',
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
  var RunnerPromises;

  /**
   */
  var RunnerQueueStatus;

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

  var savePriorRunsForm = function(form) {
    var numPriorRuns = LocalStorage.getNumberOfPriorRuns();
    if (!(numPriorRuns > 0)) {
      numPriorRuns = 0;
    }
    LocalStorage.setNumberOfPriorRuns(numPriorRuns + 1);
  };

  /**
   */
  var setGlobalsEmpty = function() {
    IdToRunner = {};
    IdToStudentRunner = {};
    RunnerPromises = [];
    RunnerQueueStatus = {};
  };

  /**
   */
  var hasBeenQueued = function(runner) {
    return !!(RunnerQueueStatus[runner.uniqueId]);
  };

  /**
   */
  var queueRunner = function(runner) {
    if (!hasBeenQueued(runner)) {
      RunnerQueueStatus[runner.uniqueId] = true;
      var promise = runner.run();
      RunnerPromises.push(promise);
      return true;
    }
    return false;
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
      queueRunner(runner);
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
    var id = runner.uniqueId;
    return {
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
    if(!!(studentRunner.coals)) {
      for (var i = 0; i < studentRunner.coals.length; i++) {
        var name = 'coal ' + i;
        var id = 'run-all-' + name;
        coals[i] = {
          name: name,
          id: id
        };
      }
    }

    return ([test, gold]).concat(coals);
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
    var runner = IdToRunner[e.target.id];
    queueRunner(runner);
  };

  /**
   */
  var onStudentRunnerCellClicked = function(e) {
    var studentRunner = IdToStudentRunner[e.target.id];
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
      $(selector).click(onRunnerCellClicked);
    }

    for (id in IdToStudentRunner) {
      selector = jQueryIDSelector(id);
      $(selector).click(onStudentRunnerCellClicked);
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

  /**
   */
  var generateJSON = function() {
    Q.all(RunnerPromises).then(function(gradeRunDataArray) {
      $("#out").text(JSON.stringify(gradeRunDataArray, null, "\t"));
    }).fail(function(err) {
      alert('Something went wrong. Open the console to see the error.');
      console.error(err);
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
      var studentRunners = getStudentRunners();
      renderTable(studentRunners);
    });

    $('#load').removeAttr('disabled');

    /**
     */
    var getStudentRunners = function() {
      var testSuiteFileID = $('#suite').val();
      var goldFileID = $('#gold').val();
      var coalFolderID = $('#coals').val();
      var submissionsFolderID = $('#id').val();
      var submissionName = 'final-submission'; // TODO: add to form
      var implementationName = $('#implementation').val();
      var testName = $('#test').val();

      return gradeApi.createStudentRunners(testSuiteFileID, goldFileID, coalFolderID,
        submissionsFolderID, submissionName, implementationName, testName);
    };

    /**
     */
    var getAndRunEverything = function() {
      var studentRunners = getStudentRunners();
      console.log('studentRunners:', studentRunners);

      var studentRunGradeDataPromises = studentRunners.map(function(studentRunner) {
        return gradeApi.runStudentRunner(studentRunner);
      });

      Q.all(studentRunGradeDataPromises)
      .then(function(studentGradeRunDataArray) {
        console.log('gradeRunData:', studentGradeRunDataArray);
      })
      .fail(function(err) {
        console.error(err);
      });
    };
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
  }

  var checkIfLoaded = function() {
    if (window.CPOGRADE) {
      onCPOGradeLoaded(window.CPOGRADE);
    } else if (new Date().getTime() - startTime > 30000) {
      console.error('Timed out while waiting for runtime to load :(');
    } else {
      window.setTimeout(checkIfLoaded, 250);
    }
  }

  var startTime = new Date().getTime();
  loadScriptUrl('/js/cpo-grade.jarr');
  window.setTimeout(checkIfLoaded, 250);

})();