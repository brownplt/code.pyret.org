class GoogleAPI {
  /**
   *  Load the client library. Return a promise to allow .then() in caller
   */
  load = () => {
    return gwrap.load({name: 'drive',
      version: 'v3',
      reauth: {
        immediate: true
      }
    });
  }

  /**
   *  Sign in the user upon button click.
   */
  signIn = (event) => {
    return gwrap.load({name: 'drive',
      version: 'v3',
      reauth: {
        immediate: false
      }
    });
  }

  /**
   *  Sign out the user upon button click.
   */
  signOut = (event) => {
    throw "Can't sign out yet.";
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
      'fileId': id,
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
   * list files w/ extension [ext].
   */
  getRecentFilesByExt = (ext) => {
    return window.gapi.client.drive.files.list({
      fields: "files(id, name)",
      q: 'not trashed and fileExtension="' + ext + '"',
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
      body: JSON.stringify(appData)
    });
  }

  // old version, used incorrect API call...keeping it around for now.
  // saveAppData = (fileId, appData) => {
  //   return window.gapi.client.drive.files.update({
  //     path: '/upload/drive/v3/files/' + fileId,
  //     method: 'PATCH',
  //     params: {
  //       uploadType: 'media'
  //     },
  //     body: JSON.stringify(appData)
  //   });
  // }

  // Create and render a Google Picker object for selecting a file.
  createPicker = (callback) => {
    window.gapi.load('picker', function(){
      window.picker = new window.google.picker.PickerBuilder()
        .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
        .setTitle("Select a Pyret document")
        .addView(new window.google.picker.View(window.google.picker.ViewId.DOCS))
        .setOAuthToken(window.gapi.auth.getToken().access_token)
        .setCallback(callback)
        .setOrigin(window.location.protocol + '//' + window.location.host)
        .build();

      window.picker.setVisible(true);
    });
  }

  getPyretDataFileID = () => {
    return this.getAppFolderID("pyret").then((folderID) => {
      // extract folder id from response. We can use files[0] because the precondition 
      // is that we have a pyret folder
      folderID = JSON.parse(folderID.body).files[0].id
      return this.getFileInFolder("pyretinfo.json", folderID)
    })
  }

  //keeping this around to keep calls clean in getters/setters
  getPyretData = () => {
    return this.getPyretDataFileID().then((response) => {
      var fileID = JSON.parse(response.body).files[0].id
      return this.getAppDataFileContent(fileID)
    })
  }

  savePyretData = (newData) => {
    return this.getPyretDataFileID().then((response) => {
      var fileID = JSON.parse(response.body).files[0].id
      return this.saveAppData(fileID, JSON.stringify(newData))
    })
  }

  /**
  Intended to be used on login. If a pyret data file does not exist, it is created.
  */
  initializePyretData = () => {
    // if folder doesn't exist, create it
    return this.getAppFolderID("pyret").then((response) => {
      if (JSON.parse(response.body).files.length === 0) {
        return this.createAppFolder("pyret")
      }
    }).then((folderResponse) => {
      // there was no folder, so create the file
      var newFolderId = JSON.parse(folderResponse.body).id
      return this.createNewFile(newFolderId, "pyretinfo.json")
    }).then((fileResponse) => {
      var newFileId = JSON.parse(fileResponse.body).id
      var baseData = {
        nextClassID: 0,
        nextStudentID: 0,
        nextAssignmentID: 0,
        classList: {},
        studentList: {},
        assignmentList: {}
      }
      return this.saveAppData(newFileId, baseData)
    }) 
  }

  /**
  Create a new class with the given name. The new class has no students or assignments.
  */
  addClass = (className) => {
    // get contents of pyretinfo.json in appDataFolder/pyret
    return this.getPyretData().then((response) => {
      //modify data
      var data = JSON.parse(response.result)

      var classInfo = {
        id: data.nextClassID, //technically indexed by this now but I'll leave it here too
        name: className,
        students: [],
        assignments: []
      };

      data.nextClassID += 1
      // old version was using arrays. updated to use object for easy access via ID
      // data.classList.push(classInfo)
      data.classList[classInfo.id] = classInfo

      //send data back to google
      return this.savePyretData(data)
    })
  }

  /**
  Attempts to get the class with id = classID. Returns undefined if the id does not exist.
  */
  getClass = (classID) => {
    return this.getPyretData().then((response) => {
      var data = JSON.parse(response.result)
      return data.classList[classID]
    })
  }

  /**
  Removes a class with the given id from the list of classes, if it exists
  */
  removeClass = (classID) => {
   return this.getPyretData().then((response) => {
      var data = JSON.parse(response.result)
      delete data.classList[classID]
      return this.savePyretData(data)
    }) 
  }

  /**
  Sets the object representing the class with id classID to be the object classInfo
  */
  updateClass = (classID, classInfo) => {
    //TODO: validate the class info
    return this.getPyretData().then((response) => {
      var data = JSON.parse(response.result)
      if (classID in data.classList){
        data.classList[classID] = classInfo
      }
      else {
        //TODO: not sure what's the best way to throw an error here.
        return undefined
      }
      return this.savePyretData(data)
    }) 
  }

/**
  Create a new student, with no classes. Students are specified as follows:
  
  student_info:
  {
    // the function handles assigning an id
    first_name: string
    last_name: string
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
        return undefined
      }
    }

    this.getPyretData().then((response) => {
      //modify data
      var data = JSON.parse(response.result)
      
      studentInfo.id = data.nextStudentID
      studentInfo.classes = []
      
      console.log(studentInfo)

      data.nextStudentID += 1

      //data.studentList.push(studentInfo)
      data.studentList[studentInfo.id] = studentInfo

      //send data back to google
      return this.savePyretData(data)
    })
  }

  removeStudent = (studentID) => {
    //needs to remove student from all classes they are in
    return this.getPyretData().then((response) => {
      var data = JSON.parse(response.result)
      if (studentID in data.studentList){
        for (key in data.classList){
          var index = data.classList[key].students.indexOf(studentID)
          if (index !== undefined){
            data.classList[key].students.splice(index, 1)
          }
        }
        var index = data.studentList.indexOf(studentID)
        data.studentList.splice(index, 1)
      }
      return this.savePyretData(data)
    }) 
  }

  getStudent = (studentID) => {
    return this.getPyretData().then((response) => {
      var data = JSON.parse(response.result)
      return data.studentList[studentID]
    })
  }

  updateStudent = (studentID, studentInfo) => {
    //TODO: validate the student info
    return this.getPyretData().then((response) => {
      var data = JSON.parse(response.result)
      if (studentID in data.studentList){
        data.studentList[studentID] = studentInfo
      }
      else {
        //TODO: not sure what's the best way to throw an error here.
        return undefined
      }
      return this.savePyretData(data)
    }) 
  }

  addExistingStudentToClass = (studentID, classID) => {
    return this.getPyretData().then((response) => {
      var data = JSON.parse(response.result)
      
      if (classID in data.classList && studentID in data.studentList){
        data.classList[classID].students.push(studentID)
        console.log(data.studentList[studentID])
        data.studentList[studentID].classes.push(classID)
      }
      else {
        //TODO: not sure what's the best way to throw an error here.
        return undefined
      }
      return this.savePyretData(data)
    })
  }

  removeExistingStudentFromClass = (studentID, classID) => {
    return this.getPyretData().then((response) => {
      var data = JSON.parse(response.result)
      
      if (classID in data.classList && studentID in data.studentList){
        var studentIndex = data.classList[classID].students.indexOf(studentID)
        var classIndex = data.studentList[studentID].classes.indexOf(classID)
        data.classList[classID].students.splice(studentIndex, 1)
        data.studentList[studentID].classes.splice(classID, 1)
      }
      else {
        //TODO: not sure what's the best way to throw an error here.
        return undefined
      }
      return this.savePyretData(data)
    })
  }

  /** To create, distribute and manage assignments 
  assignment_info{
    id: int
    name: string
    class: int
    doc_id: string //id of the template drive file
    opened: int [] //student id's that have opened
    submitted: int [] //student id's that have submitted
  }
  */

  createAssignment = () => {
    // create an assignment file

  }

  createAssignmentCopy = () => {
    // make a copy of a file for distribution of assignments
  }

  distributeAssignment = () => {
    // distribute assignments to students of a particular class
  }


}

export default GoogleAPI;
