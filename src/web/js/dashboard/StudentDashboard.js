import React, { Component } from 'react';
import GoogleAPI from './GoogleAPI.js';
import {CLIENT_ID, FILE_EXT, APP_NAME, API_KEY} from './config.js';
import File from './File';
import ReactDOM from 'react-dom';
import '../../css/dashboard/index.css';

class StudentDashboard extends Component {
  constructor() {
    super();

    this.state = {signedIn: false, files: [], activeTab: 'recent-files', newFileName: ''};

    this.api = new GoogleAPI();
    this.api.load().then((resp) => {
      this.setState({signedIn: true});
      this.updateRecentFiles();
    });
  }

  handleSignInClick = (event) => {
    this.api.signIn().then((resp) => {
      this.setState({signedIn: true});
      this.updateRecentFiles();
    });
  }

  handleSignOutClick = (event) => {
    this.setState({signedIn: false});
    window.location.replace('/logout');
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
              window.open(EDITOR_REDIRECT_URL + resp.result.id, '_newtab');
            });
          });
        }

        // App Folder already existed
        else {
          return this.api.createNewFile(files[0].id, this.state.newFileName + '.arr').then((resp) => {
            window.open(EDITOR_REDIRECT_URL + resp.result.id, '_newtab');
          });
        }
      });
    }
  }

  handleSelectFileClick = (event) => {
    this.api.createPicker((data) => {
      if (data.action === window.google.picker.Action.PICKED) {
        var fileId = data.docs[0].id;
        window.open(EDITOR_REDIRECT_URL + fileId, '_newtab');
        window.picker.setVisible(false);
      }
    });
  }

  // A simple callback implementation.
  pickerCallback = (data) => {
    console.log(data);
    if (data.action === window.google.picker.Action.PICKED) {
      var fileId = data.docs[0].id;
      window.open(EDITOR_REDIRECT_URL + fileId, '_newtab');
    }
  }

  render = () => {
    return (
      <div className='component-wrap'>
        <div id='header' className=''>
          <div className='container'>
            <h1 className='logo-text left'>{APP_NAME} – Student Dashboard</h1>
            <div className='button-wrapper right'>
              <button className={'auth-button ' + (this.state.signedIn ? 'hidden' : '')} onClick={this.handleSignInClick} id='signin-button' >Sign in</button>
            </div>
            <div className='button-wrapper right'>
              <button className={'auth-button ' + (this.state.signedIn ? '' : 'hidden')} onClick={this.handleSignOutClick} id='signout-button' >Sign out</button>
            </div>
          </div>
        </div>
        <div id='loading-spinner' className={this.state.signedIn ? 'hidden' : ''}>
          <h1>Waiting for login...</h1>
          <i className='fa fa-circle-o-notch fast-spin fa-3x fa-fw'></i>
        </div>
        <div id='modal' className={'modal-wrap modal-student container ' + (this.state.signedIn ? '' : 'hidden')}>
          <div id='modal-tabs' className='cf'>
            <h2 id='recent-files' className={'tab floatable left ' + ((this.state.activeTab === 'recent-files') ? 'active' : '')} onClick={this.handleTabClick}>Recent Files</h2>
            <h2 id='template-files' className={'tab floatable left ' + ((this.state.activeTab === 'template-files') ? 'active' : '')} onClick={this.handleTabClick}>Templates</h2>
            <h2 id='new-file' className={'tab floatable left ' + ((this.state.activeTab === 'new-file') ? 'active' : '')} onClick={this.handleTabClick}>New File</h2>
            <div className='button-wrapper floatable right'>
              <button id='select-file' onClick={this.handleSelectFileClick} >Select From Drive</button>
            </div>
          </div>
          <div id='modal-body' className={'modal-body ' + ((this.state.activeTab === 'new-file') ? 'hidden' : '')}>
            <div className='file-list cf'>
              {this.state.files.map((f) => {return <File key={f.id} id={f.id} name={f.name} />;})}
            </div>
          </div>
          <div className={'modal-body ' + ((this.state.activeTab === 'new-file') ? '' : 'hidden')}>
            <form onSubmit={this.handleCreateNewFile}>
              <input type='text' value={this.state.newFileName} onChange={this.handleNewFilenameChange} />
              <span className='arr-ext'>.arr</span>
              <input id='new-file' type='submit' value='New file' />
            </form>
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <StudentDashboard />,
  document.getElementById('root')
);
