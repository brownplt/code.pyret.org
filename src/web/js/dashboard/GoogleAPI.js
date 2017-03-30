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

  getPyretData = () => {
    this.getAppFolderID("pyret").then((folderID) => {
      // extract folder id from response. We can use files[0] because the precondition 
      // is that we have a pyret folder
      folderID = JSON.parse(folderID.body).files[0].id
      console.log("folderID: " + folderID)
      return this.getFileInFolder("pyretinfo.json", folderID).then((fileID) => {
        fileID = JSON.parse(fileID.body).files[0].id
        console.log("fileID: " + fileID)
        return this.getAppDataFileContent(fileID)
      })
    })
  }

  /**
  Create a new class. Classes are specified as follows:
  
  student_info:
  {
      id: int
      first_name: string
      last_name: string
      email: string
      classes: int []
  }

  All of these fields are required to execute this method. If one is missing, an error will be thrown
  */
  addClass = (class_info) => {
    // if no app folder, create
    // if no classinfo.json, create
    // get contents of pyretinfo.json in appDataFolder/pyret
    getPyretData().then((pyretinfo) => {
      // add a class
      
    })
  }

  removeClass = (class_id) => {

  }

  getClass = (class_id) => {

  }

  updateClass = (class_id, class_info) => {

  }





/**
  Create a new student. Students are specified as follows:
  
  student_info:
  {
    id: int
    first_name: string
    last_name: string
    email: string
    classes: int []
  }

  All of these fields are required to execute this method. If one is missing, an error will be thrown
  */
  addStudent = (student_info) => {

  }

  removeStudent = (student_id) => {
      //needs to remove student from all classes they are in
  }

  geStudent = (student_id) => {

  }

  updateStudent = (student_info) => {

  }

  addStudentToClass = (student_id, class_id) => {

  }

  removeStudentFromClass = (student_id, class_id) => {

  }


}

export default GoogleAPI;
