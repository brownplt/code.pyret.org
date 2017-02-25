// const GOOGLE_API_URL = 'https://apis.google.com/js/api.js';

class GoogleAPI {
  /**
   *  Load the client library. Return a promise to allow .then() in caller
   */
  load = () => {
    return gwrap.load({name: 'drive',
                version: 'v3',
                reauth: {
                  immediate: true
                }});
  }

  /**
   *  Return whether the user is signed in.
   */
  isSignedIn = () => {
    // TODO
    return false;
  }

  /**
   *  Sign in the user upon button click.
   */
  signIn = (event) => {
    return gwrap.load({name: 'drive',
                version: 'v3',
                reauth: {
                  immediate: false
                }});
  }

  /**
   *  Sign out the user upon button click.
   */
  signOut = (event) => {
    throw "Can't sign out yet.";
  }

  createAppFolder = (appName) => {
    return gapi.client.drive.files.create({
      resource: {
        'name' : appName,
        'mimeType' : 'application/vnd.google-apps.folder'
      }
    });
  }

  getAppFolderID = (appName) => {
    return gapi.client.drive.files.list({
      q: 'not trashed and mimeType="application/vnd.google-apps.folder" and name ="' + appName + '"'
    });
  }

  createNewFile = (parentFolderId, fileName) => {
    var reqOpts = {
      'path': '/drive/v3/files',
      'method': 'POST',
      'body': {
        'parents': [parentFolderId],
        'mimeType': 'text/plain',
        'name': fileName
      }
    };
    return gapi.client.request(reqOpts);
  }

  /**
   * list files w/ extension [ext].
   */
  getRecentFilesByExt = (ext) => {
    return gapi.client.drive.files.list({
      // fields: "files(id, name)",
      q: 'not trashed and fileExtension="' + ext + '"',
    });
  }

  getAppDataFileID = (appDataFilename) => {
    return gapi.client.drive.files.list({
      q: 'not trashed and name="' + appDataFilename + '"',
      spaces: 'appDataFolder'
    });
  }

  createAppDataFile = (appDataFilename) => {
    return gapi.client.drive.files.create({
      resource: {
        name: appDataFilename,
        parents: ['appDataFolder']
      }
    });
  }

  getAppDataFileContent = (fileId) => {
    return gapi.client.drive.files.get({
      fileId: fileId,
      // Download a file — files.get with alt=media file resource
      alt: 'media'
    });
  }

  saveAppData = (fileId, appData) => {
    return gapi.client.drive.files.update({
      path: '/upload/drive/v3/files/' + fileId,
      method: 'PATCH',
      params: {
        uploadType: 'media'
      },
      body: JSON.stringify(appData)
    });
  }

  // Create and render a Google Picker object for selecting a file.
  createPicker = (client_id, api_key, callback) => {
    var picker = new window.google.picker.PickerBuilder()
      .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
      .setAppId(client_id)
      .setOAuthToken(gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token)
      .addView(new window.google.picker.View(window.google.picker.ViewId.DOCS))
      .setDeveloperKey(api_key)
      .setCallback(callback)
      .build();
    picker.setVisible(true);
  }
}

export default GoogleAPI;
