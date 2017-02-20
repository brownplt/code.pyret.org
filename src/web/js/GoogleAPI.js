import loadScript from 'load-script';
const GOOGLE_API_URL = 'https://apis.google.com/js/api.js';

class GoogleAPI {
    /**
     *  Load the client library. Return a promise to allow .then() in caller
     */
    load = (clientId, discoveryDocs, scope) => {
      return new Promise((resolve, reject) => {
        loadScript(GOOGLE_API_URL, () => {
          window.gapi.load('client:auth2', () => {
            window.gapi.load('picker', () => {
              window.gapi.client.init({
                discoveryDocs: discoveryDocs,
                clientId: clientId,
                scope: scope
              }).then(function () {
                resolve();
              });
            });
          });
        });
      });
    }

    /**
     *  Return whether the user is signed in.
     */
    isSignedIn = () => {
      return window.gapi.auth2.getAuthInstance().isSignedIn.get();
    }

    /**
     *  Sign in the user upon button click.
     */
    signIn = (event) => {
      return window.gapi.auth2.getAuthInstance().signIn();
    }

    /**
     *  Sign out the user upon button click.
     */
    signOut = (event) => {
      return window.gapi.auth2.getAuthInstance().signOut();
    }

    createAppFolder = (appName) => {
      return window.gapi.client.drive.files.create({
        resource: {
          'name' : appName,
          'mimeType' : 'application/vnd.google-apps.folder'
        }
      });
    }

    getAppFolderID = (appName) => {
      return window.gapi.client.drive.files.list({
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
      return window.gapi.client.request(reqOpts);
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

    createAppDataFile = (appDataFilename) => {
      return window.gapi.client.drive.files.create({
        resource: {
          name: appDataFilename,
          parents: ['appDataFolder']
        }
      });
    }

    getAppDataFileContent = (fileId) => {
      return window.gapi.client.drive.files.get({
        fileId: fileId,
        // Download a file — files.get with alt=media file resource
        alt: 'media'
      });
    }

    saveAppData = (fileId, appData) => {
      return window.gapi.client.drive.files.update({
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
        .setOAuthToken(window.gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token)
        .addView(new window.google.picker.View(window.google.picker.ViewId.DOCS))
        .setDeveloperKey(api_key)
        .setCallback(callback)
        .build();
      picker.setVisible(true);
    }
}

export default GoogleAPI;
