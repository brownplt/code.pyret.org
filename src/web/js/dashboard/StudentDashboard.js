import React, { Component } from 'react';
import GoogleAPI from './GoogleAPI.js';
import {CLIENT_ID, DISCOVERY_DOCS, SCOPES, FILE_EXT, APP_NAME, AUTH_FLOW, API_KEY} from './config.js';
import File from './File';

class StudentDashboard extends Component {
  constructor() {
    super();

    this.state = {apiLoaded: true, signedIn: false, files: [], activeTab: 'recent-files', newFileName: ''};

    this.api = new GoogleAPI();
    this.api.load().then((resp) => {
      console.log('hello');
      console.log(resp);
      this.setState({signedIn: true});
      this.updateRecentFiles();
    });
  }

/*  componentWillMount = () => {
    this.setState({apiLoaded: false, signedIn: false, files: [], activeTab: 'recent-files', newFileName: ''});
  }
*/
  // apiLoaded = () => {
  //   this.setState({apiLoaded: true});
  //   if (this.api.isSignedIn()) {
  //     this.setState({signedIn: true});
  //   }
  // }

  handleSignInClick = (event) => {
    this.api.signIn().then((resp) => {
      console.log(resp);
      this.setState({signedIn: true});
      this.updateRecentFiles();
    });
  }

  handleSignOutClick = (event) => {
    this.api.signOut().then(() => {
      this.setState({signedIn: false});
    });
  }

  handleTabClick = (event) => {
    this.setState({activeTab: event.target.id});
    if (event.target.id === 'recent-files') {
      this.updateRecentFiles();
    }
    else if (event.target.id === 'template-files') {
      this.updateTemplateFiles();
    }
  }

  updateTemplateFiles = () => {
    this.setState({
      files: [
        {name: 'Sort a List.arr', id: '0B32bNEogmncOTEJjQ1VicHdlYmc'},
        {name: 'Compute a Derivative.arr', id: '0B32bNEogmncOWU9OWW5MSFlHSDQ'},
        {name: 'Land a plane.arr', id: '0B32bNEogmncONnZNU2JsUnRVRG8'},
        {name: 'Play 2048.arr', id: '0B32bNEogmncOMTg5T2plV19LX0k'}
      ]
    });
  }

  updateRecentFiles = () => {
    this.api.getRecentFilesByExt(FILE_EXT).then((resp) => {
      this.setState({files: resp.result.files});
    });
  }

  handleNewFilenameChange = (event) => {
    this.setState({newFileName: event.target.value});
  }

  handleCreateNewFile = (event) => {
    event.preventDefault();
    if (this.state.newFileName) {
      this.api.getAppFolderID(APP_NAME).then((resp) => {
        var files = resp.result.files;

        // App Folder did not yet exist
        if (files.length === 0) {
          this.api.createAppFolder(APP_NAME).then((resp) => {
            return this.api.createNewFile(resp.result.id, this.state.newFileName + '.arr').then((resp)=> {
              window.location.assign(EDITOR_REDIRECT_URL + resp.result.id);
            });
          });
        }

        // App Folder already existed
        else {
          return this.api.createNewFile(files[0].id, this.state.newFileName + '.arr').then((resp) => {
            window.location.assign(EDITOR_REDIRECT_URL + resp.result.id);
          });
        }
      });
    }
  }

  handleSelectFileClick = (event) => {
    this.api.createPicker(CLIENT_ID, API_KEY, this.pickerCallback);
  }

  // A simple callback implementation.
  pickerCallback = (data) => {
    if (data.action === window.google.picker.Action.PICKED) {
      var fileId = data.docs[0].id;
      window.location.assign(EDITOR_REDIRECT_URL + fileId);
    }
  }
  //<i id='loading-spinner' className={'fa fa-circle-o-notch fast-spin fa-3x fa-fw ' + (this.state.apiLoaded ? 'hidden' : '')}></i>
  render = () => {
    return (
      <div className='wrap'>
        <div id='header' className=''>
          <div className='container'>
            <h1 className='logo-text left'>{APP_NAME} – Web Dashboard</h1>
            <div className='button-wrapper right'>
              <button className={'auth-button ' + (this.state.signedIn ? 'hidden' : '')} onClick={this.handleSignInClick} id='signin-button' >Sign in</button>
            </div>
            <div className='button-wrapper right'>
              <button className={'auth-button ' + (this.state.signedIn ? '' : 'hidden')} onClick={this.handleSignOutClick} id='signout-button' >Sign out</button>
            </div>
          </div>
        </div>
        <div id='file-picker-modal' className={'container ' + (this.state.signedIn ? '' : 'hidden')}>
          <div id='file-picker-modal-tabs'>
            <h2 id='recent-files' className={'tab ' + ((this.state.activeTab === 'recent-files') ? 'active' : '')} onClick={this.handleTabClick}>Recent Files</h2>
            <h2 id='template-files' className={'tab ' + ((this.state.activeTab === 'template-files') ? 'active' : '')} onClick={this.handleTabClick}>Templates</h2>
          </div>
          <div id='file-picker-modal-body'>
            <div className='file-list cf'>
              {this.state.files.map((f) => {return <File key={f.id} id={f.id} name={f.name} />})}
            </div>
          </div>
          <div id='file-picker-modal-footer' className='cf'>
            <form className='floatable left' onSubmit={this.handleCreateNewFile}>
              <input className='form' type='text' value={this.state.newFileName} onChange={this.handleNewFilenameChange} />
              <span className='arr-ext'>.arr</span>
              <input id='new-file' className='button ' type='submit' value='New file' />
            </form>
            <div className='button-wrapper floatable right'>
              <button id='select-file' onClick={this.handleSelectFileClick} >Select From Drive</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default StudentDashboard;
