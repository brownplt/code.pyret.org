class GoogleAPI {
  /**
   *  Load the client library. Return a promise to allow .then() in caller
   */
  load = () => {
    return window.gwrap.load({name: 'drive',
      version: 'v3',
      reauth: {
        immediate: true
      }
    });
  }

  /**
   *  Sign in the user upon button click.
   */
  signIn = () => {
    return window.gwrap.load({name: 'drive',
      version: 'v3',
      reauth: {
        immediate: false
      }
    });
  }

  createAppFolder = (appName) => {
    return window.gapi.client.drive.files.create({
      resource: {
        'name' : appName,
        'mimeType' : 'application/vnd.google-apps.folder'
      }
    });
  }

  // for use while testing
  removeFileOrFolder = (id) => {
    return window.gapi.client.drive.files.delete({
      'fileId': id
    });
  }

  // ACTUAL FUNCTION: lists all files in appDataFolder with name = appName
  getAppFolderID = (appName) => {
    return window.gapi.client.drive.files.list({
      q: 'not trashed and mimeType="application/vnd.google-apps.folder" and name ="' + appName + '"'
    });
  }

  createNewFile = (parentFolderId, fileName) => {
    return window.gapi.client.request({
      'path': '/drive/v3/files',
      'method': 'POST',
      'body': {
        'parents': [parentFolderId],
        'mimeType': 'text/plain',
        'name': fileName
      }
    });
  }

  /**
  * Copy an existing file.
  * @param {String} sourceFileID ID of the origin file to copy.
  * @param {String} DestinationFileName Title of the copy.
  */
  copyFile = (sourceFileID, DestinationFileName) => {
    return window.gapi.client.drive.files.copy.request({
      'fileId': sourceFileID,
      'resource': body,
      'body' : {
        'title': DestinationFileName,
      }
    });
  }

  /**
   * list files w/ extension [ext].
   */
  getRecentFilesByExt = (ext) => {
    return window.gapi.client.drive.files.list({
      fields: "files(id, name)",
      q: 'not trashed and fileExtension="' + ext + '"'
    });
  }

  getAppDataFileID = (appDataFilename) => {
    return window.gapi.client.drive.files.list({
      q: 'not trashed and name="' + appDataFilename + '"',
      spaces: 'appDataFolder'
    });
  }

  getFileInFolder = (fileName, folderID) => {
    return window.gapi.client.drive.files.list({
      q: 'not trashed and name="' + fileName + '" and "' + folderID + '" in parents'
    });
  }

  createAppDataFile = (appDataFilename) => {
    return window.gapi.client.drive.files.create({
      resource: {
        name: appDataFilename,
        parents: ['appDataFolder']
      }
    });
  }

  // Note: name says "appData" but you can use on any file I think
  getAppDataFileContent = (fileId) => {
    return window.gapi.client.drive.files.get({
      fileId: fileId,
      // Download a file — files.get with alt=media file resource
      alt: 'media'
    });
  }

  saveAppData = (fileId, appData) => {
    return window.gapi.client.request({
      path: '/upload/drive/v3/files/' + fileId,
      method: 'PATCH',
      params: {
        uploadType: 'media'
      },
      body: appData
    });
  }

  // Create and render a Google Picker object for selecting a file.
  createPicker = (callback) => {
    window.gapi.load('picker', function(){
      var picker = new window.google.picker.PickerBuilder()
        .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
        .setTitle("Select a Pyret document")
        .addView(new window.google.picker.View(window.google.picker.ViewId.DOCS).setQuery("*.arr"))
        .setOAuthToken(window.gapi.auth.getToken().access_token)
        .setCallback(callback)
        .setOrigin(location.protocol + '//' + location.host)
        .build();

      picker.setVisible(true);
    });
  }

  getPyretDataFileID = () => {
    return this.getAppFolderID("pyret").then((folderID) => {
      // extract folder id from response. We can use files[0] because the precondition
      // is that we have a pyret folder
      folderID = folderID.result.files[0].id;
      return this.getFileInFolder("pyretinfo.json", folderID);
    });
  }

  //keeping this around to keep calls clean in getters/setters
  getPyretData = () => {
    return this.getPyretDataFileID().then((response) => {
      var fileID = response.result.files[0].id;
      return this.getAppDataFileContent(fileID);
    });
  }

  savePyretData = (newData) => {
    return this.getPyretDataFileID().then((response) => {
      var fileID = response.result.files[0].id;
      return this.saveAppData(fileID, newData);
    });
  }

  /**
  Intended to be used on login. If a pyret data file does not exist, it is created.
  */
  initializePyretData = () => {
    // if folder doesn't exist, create it
    return this.getAppFolderID("pyret").then((response) => {
      if (response.result.files.length === 0) {
        return this.createAppFolder("pyret").then((folderResponse) => {
          // there was no folder, so create the file
          var newFolderId = folderResponse.result.id;
          return this.createNewFile(newFolderId, "pyretinfo.json");
        }).then((fileResponse) => {
          var newFileId = fileResponse.result.id;
          var baseData = {
            nextClassID: 0,
            nextStudentID: 0,
            nextAssignmentID: 0,
            classList: {},
            studentList: {},
            assignmentList: {}
          };
          return this.saveAppData(newFileId, baseData);
        });
      }
    });
  }

  /**
  Create a new class with the given name. The new class has no students or assignments.
  */
  addClass = (className) => {
    // get contents of pyretinfo.json in appDataFolder/pyret
    return this.getPyretData().then((response) => {
      //modify data
      var data = response.result;

      var classInfo = {
        id: data.nextClassID, //technically indexed by this now but I'll leave it here too
        name: className,
        students: [],
        assignments: []
      };

      data.nextClassID += 1;
      // old version was using arrays. updated to use object for easy access via ID
      // data.classList.push(classInfo)
      data.classList[classInfo.id] = classInfo;

      //send data back to google
      return this.savePyretData(data);
    });
  }

  /**
  Attempts to get the class with id = classID. Returns undefined if the id does not exist.
  */
  getClass = (classID) => {
    return this.getPyretData().then((response) => {
      return response.result.classList[classID];
    });
  }

  /**
  Gets all of this teacher's classes
  */
  getAllClasses = () => {
    return this.getPyretData().then((response) => {
      return response.result.classList;
    });
  }

  /**
  Removes a class with the given id from the list of classes, if it exists
  */
  removeClass = (classID) => {
    return this.getPyretData().then((response) => {
      var data = response.result;
      delete data.classList[classID];
      return this.savePyretData(data);
    });
  }

  /**
  Sets the object representing the class with id classID to be the object classInfo
  */
  updateClass = (classID, classInfo) => {
    //TODO: validate the class info
    return this.getPyretData().then((response) => {
      var data = response.result;
      if (classID in data.classList){
        data.classList[classID] = classInfo;
      }
      else {
        //TODO: not sure what's the best way to throw an error here.
        return undefined;
      }
      return this.savePyretData(data);
    });
  }

/**
  Create a new student, with no classes. Students are specified as follows:

  studentInfo:
  {
    // the function handles assigning an id
    firstName: string
    lastName: string
    email: string
  }

  All of these fields are required to execute this method. If one is missing, an error will be thrown
  */
  addStudent = (studentInfo) => {
    // validation
    for (var key in studentInfo) {
      if (key !== "firstName" &&
          key !== "lastName" &&
          key !== "email"){
        //TODO: not sure of best way to throw an error
        return undefined;
      }
    }

    return this.getPyretData().then((response) => {
      //modify data
      var data = response.result;

      studentInfo.id = data.nextStudentID;
      studentInfo.classes = [];

      data.nextStudentID += 1;

      //data.studentList.push(studentInfo)
      data.studentList[studentInfo.id] = studentInfo;
      //send data back to google
      return this.savePyretData(data).then(() => {
        return studentInfo;
      });
    });
  }

  removeStudent = (studentID) => {
    //needs to remove student from all classes they are in
    return this.getPyretData().then((response) => {
      //I'm pretty sure this doesn't work, but it was apparently working for Kevin...
      var data = response.result;
      if (studentID in data.studentList){
        for (var key in data.classList){
          var index = data.classList[key].students.indexOf(studentID);
          if (index !== undefined){
            data.classList[key].students.splice(index, 1);
          }
        }
        delete data.studentList[studentID];
      }
      return this.savePyretData(data);
    });
  }

  getStudent = (studentID) => {
    return this.getPyretData().then((response) => {
      var data = response.result;
      return data.studentList[studentID];
    });
  }

  getAllStudents = () => {
    return this.getPyretData().then((response) => {
      var data = response.result;
      return data.studentList;
    });
  }

  getStudentsInClass = (classID) => {
    return this.getClass(classID).then((classInfo) => {
      var studentIDs = classInfo["students"];
      return this.getAllStudents().then((studentInfo) => {
        var courseRoster = [];
        for (var i = 0; i < studentIDs.length; i++){
          var studentObject = studentInfo[studentIDs[i]];
          courseRoster.push(studentObject);
        }
        return courseRoster;
      });
    });
  }

  updateStudent = (studentID, studentInfo) => {
    //TODO: validate the student info
    return this.getPyretData().then((response) => {
      var data = response.result;
      if (studentID in data.studentList){
        data.studentList[studentID] = studentInfo;
      }
      else {
        //TODO: not sure what's the best way to throw an error here.
        return undefined;
      }
      return this.savePyretData(data);
    });
  }

  addExistingStudentToClass = (studentID, classID) => {
    return this.getPyretData().then((response) => {
      var data = response.result;

      if (classID in data.classList && studentID in data.studentList){
        data.classList[classID].students.push(studentID);
        data.studentList[studentID].classes.push(classID);
      }
      else {
        //TODO: not sure what's the best way to throw an error here.
        return undefined;
      }
      return this.savePyretData(data);
    });
  }

  removeExistingStudentFromClass = (studentID, classID) => {
    return this.getPyretData().then((response) => {
      var data = response.result;

      if (classID in data.classList && studentID in data.studentList){
        var studentIndex = data.classList[classID].students.indexOf(studentID);
        var classIndex = data.studentList[studentID].classes.indexOf(classID);
        data.classList[classID].students.splice(studentIndex, 1);
        data.studentList[studentID].classes.splice(classID, 1);
      }
      else {
        //TODO: not sure what's the best way to throw an error here.
        return undefined;
      }
      return this.savePyretData(data);
    });
  }

  /** To create, distribute and manage assignments
  assignment_info{
    id: int
    name: string
    class: int
    docID: string //id of the template drive file
    opened: int [] //student id's that have opened
    submitted: int [] //student id's that have submitted
  }
  */

  getAllAssignments = () => {
    return this.getPyretData().then((response) => {
      var data = response.result;
      return data.assignmentList;
    });
  }

  getAssingmentsInClass = (classID) => {
    return this.getClass(classID).then((classInfo) => {
      var assignmentIDs = classInfo["assignments"];
      return this.getAllAssignments().then((assignmentInfo) => {
        var assignmentObjects = [];
        for (var i = 0; i < assignmentIDs.length; i++){
          var assignmentObject = assignmentInfo[assignmentIDs[i]];
          assignmentObjects.push(assignmentObject);
        }
        return assignmentObjects;
      });
    });
  }

  // create a folder for that particular assignment in the teacher's drive
  createAssignmentFolder = (classID, assignmentName) => {
    return this.getPyretData().then((response) => {
      var data = response.result;
      var assignmentFolderName = data.classList[classID].name + "_Assignment_" + assignmentName;
      return this.createAppFolder(assignmentFolderName);
    });
  }

  duplicateAssignments = (classID, assignmentName, teacherAssignmentFileId, assignmentFolderName, studentID) => {
    return this.getPyretData().then((response) => {
      var data = response.result;
      var assignmentFileName = data.classList[classID].name + "_Assignment_" + assignmentName + "_" + studentID;
      var assignmentInfo = {
        id: data.nextAssignmentID,
        name: assignmentName,
        class: classID,
        docID: 'None',
        opened: [], //list of studentIDs
        submitted: [], //list of studentIDs
        filename: assignmentFileName
      };

      //create a folder for the assignment of student with sID  
      return this.createAppFolder(assignmentFolderName).then((parentFolderId) => {
        this.createNewFile(parentFolderId, assignmentFileName).then((resultFile) => {
          this.copyFile(teacherAssignmentFileId, resultFile).then((newAssignment) => {
            assignmentInfo.docID = newAssignment.id;
            data.classList[classID].assignments.append(data.nextAssignmentID);
            data.nextAssignmentID+=1;
            return this.savePyretData(data);
          });
        });
      });
    });
  }

  createStudentAssignments = (classID, assignmentName, teacherAssignmentFileId) => {
    return this.getPyretData().then((response) => {
      var data = JSON.parse(response.result);
      return this.getStudentsInClass(classID).then((studentIDList) => {
        var studentTotal = studentIDList.length;
        for (var n=0; n<studentTotal; n++) 
        {
          var requiredStudentId = studentIDList[n];
          var assignmentFolderName = data.classList[classID].name + "_" + requiredStudentId;
          //create a folder for the assignment for each student
          this.duplicateAssignments = (classID, assignmentName, teacherAssignmentFileId, assignmentFolderName, requiredStudentId).then((result) => {
            return result;
          });
        }
      });
    });
  }
}

export default GoogleAPI;

/**
For testing purposes:
Kevin - krs252@cornell.edu
Micheal - mrm355@cornell.edu
Anagha - at767@cornell.edu
*/
