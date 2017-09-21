import React, { Component } from 'react';
import GoogleAPI from './GoogleAPI.js';
import {CLIENT_ID, FILE_EXT, APP_NAME, API_KEY} from './config.js';
import File from './File';

const NOT_SIGNED_IN = 1;
const WAITING_FOR_SIGNIN = 2;
const SIGNED_IN = 3;
const INITIAL_LOAD = 4;


const WAITING_FOR_FILES = [];


class StudentDashboard extends Component {
  constructor() {
    super();

    this.state = {
      signedIn: INITIAL_LOAD,
      files: [],
      activeTab: 'recent-files',
      newFileName: '',
      userName: false
    };

    this.api = new GoogleAPI();
    var apiLoaded = this.api.load();
    apiLoaded.then((resp) => {
      if(resp.hasAuth()) {
        this.setState({signedIn: SIGNED_IN});
        this.updateRecentFiles();
        this.api.getUsername().then((userInfo) => {
          this.setState({ userName: userInfo.emails[0].value });
        });
      }
      else {
        this.setState({ signedIn: NOT_SIGNED_IN });
      }
    });
    apiLoaded.fail((e) => {
      this.setState({ signedIn: NOT_SIGNED_IN });
    });
  }

  handleStartCodingClick = (event) => {
    window.open("/editor", "_blank");
  }

  handleSignInClick = (event) => {
    this.setState({signedIn: WAITING_FOR_SIGNIN});
    this.api.signIn().then((resp) => {
      console.log("The response is: ", resp);
      this.setState({signedIn: SIGNED_IN});
      this.api.getUsername().then((userInfo) => {
        this.setState({ userName: userInfo.emails[0].value });
      });
      this.updateRecentFiles();
    })
    .fail((resp) => {
      this.setState({ signedIn: NOT_SIGNED_IN });
    });
  }

  handleSignOutClick = (event) => {
    this.setState({signedIn: NOT_SIGNED_IN});
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
    this.setState({files: WAITING_FOR_FILES});
    this.api.getRecentFilesByExtAndAppName(APP_NAME, FILE_EXT).then((resp) => {
      this.setState({files: resp.result.files});
    })
  }

  handleNewFilenameChange = (event) => {
    this.setState({newFileName: event.target.value});
  }

  handleCreateNewFile = (event) => {
    event.preventDefault();
    var w = window.open("about:blank", "_blank");
    if (this.state.newFileName) {
      this.api.getAppFolderID(APP_NAME).then((resp) => {
        var files = resp.result.files;

        // App Folder did not yet exist
        if (files.length === 0) {
          this.api.createAppFolder(APP_NAME).then((resp) => {
            return this.api.createNewFile(resp.result.id, this.state.newFileName + '.arr').then((resp)=> {
              w.location = EDITOR_REDIRECT_URL + resp.result.id;
//              window.open(EDITOR_REDIRECT_URL + resp.result.id, '_newtab');
            });
          });
        }

        // App Folder already existed
        else {
          return this.api.createNewFile(files[0].id, this.state.newFileName + '.arr').then((resp) => {
            w.location = EDITOR_REDIRECT_URL + resp.result.id;
//            window.open(EDITOR_REDIRECT_URL + resp.result.id, '_newtab');
          });
        }
      });
    }
  }

  handleSelectFileClick = (event) => {
    var w = window.open("about:blank", "_blank");
    this.api.getAppFolderID(APP_NAME).then((resp) => {
      var files = resp.result.files;
      if(files.length === 0) {
        var urlToOpen = "https://drive.google.com/drive/u/0/";
      }
      else {
        var urlToOpen = "https://drive.google.com/drive/u/0/folders/" + files[0].id;
      }
      w.location = urlToOpen;
    }).fail((err) => {
      w.close();
    });
    /*
    this.api.createPicker(APP_NAME, (data) => {
      if (data.action === window.google.picker.Action.PICKED) {
        var fileId = data.docs[0].id;
        window.open(EDITOR_REDIRECT_URL + fileId, "_blank");
        window.picker.setVisible(false);
      }
    });
    */
  }

  // A simple callback implementation.
  pickerCallback = (data) => {
    console.log(data);
    if (data.action === window.google.picker.Action.PICKED) {
      var fileId = data.docs[0].id;
      window.open(EDITOR_REDIRECT_URL + fileId, "_blank");
    }
  }

  render = () => {
    return (
      <div className='wrap'>
        <div id='header' className=''>
          <div className='container'>
            <div className='left'>
              <img src='/img/pyret-logo.png' className='dashboard-logo'></img>
              <div className='header'>
                <h1 className='logo-text'>{APP_NAME}</h1>
                <h2 className={'person-text ' + (this.state.userName === false ? 'hidden' : '')}>{this.state.userName}</h2> 
              </div>
            </div>
            <div className='button-wrapper right'>
              <button className={'auth-button ' + (this.state.signedIn !== NOT_SIGNED_IN ? '' : 'hidden')} onClick={this.handleSignOutClick} id='signout-button' >Sign out</button>
            </div>
            <div className='button-wrapper right start'>
              <button className={'start-button ' + (this.state.signedIn === SIGNED_IN ? '' : 'hidden')} onClick={this.handleStartCodingClick} id='start-button' >Open Editor</button>
            </div>
          </div>
        </div>
        <div className={'main middle container ' + (this.state.signedIn === NOT_SIGNED_IN ? '' : 'hidden')}>

          <div className={'middle large-logo-container'}>
            <img src="/img/pyret-logo.png"></img>
          </div>

          <div className='clearfix'></div>


          <div className={'left'}>
            <p><button onClick={this.handleStartCodingClick} id='start-button' >Open Editor</button></p><p><em>to start coding immediately</em></p>
          </div>

          <div className={'right'}>
            <p><button className={'auth-button'} onClick={this.handleSignInClick} id='signin-button' >Sign in</button></p><p><em>to save and view programs</em></p>
          </div>

          <div className='clearfix'></div>

          <br/><br/>

          <p>You can also check out <a href="http://papl.cs.brown.edu">our book that uses Pyret</a> or <a href="http://www.bootstrapworld.org">our curricula</a>.</p>

        </div>
        <div id='loading-spinner' className={this.state.signedIn === WAITING_FOR_SIGNIN ? '' : 'hidden'}>
          <h1>Waiting for login...</h1>
          <i className='fa fa-circle-o-notch fast-spin fa-3x fa-fw'></i>
        </div>
        <div id='file-picker-modal' className={'modal-wrap container ' + (this.state.signedIn === SIGNED_IN ? '' : 'hidden')}>
          <div id='file-picker-modal-tabs' className='cf'>
            <h2 id='recent-files' className={'tab floatable left ' + ((this.state.activeTab === 'recent-files') ? 'active' : '')} onClick={this.handleTabClick}>Recent Files</h2>
            <h2 id='new-file' className={'tab floatable left ' + ((this.state.activeTab === 'new-file') ? 'active' : '')} onClick={this.handleTabClick}>New File</h2>
            <div className='button-wrapper right'>
              <button id='select-file' onClick={this.handleSelectFileClick} >View in Google Drive</button>
            </div>
          </div>
          <div id='file-picker-modal-body' className={'modal-body ' + ((this.state.activeTab === 'new-file') ? 'hidden' : '')}>
            {
              this.state.files === WAITING_FOR_FILES ?
              (<div id='loading-spinner'>
                <h2>Loading files...</h2>
                <i className='fa fa-circle-o-notch fast-spin fa-3x fa-fw'></i>
              </div>)
              :  
                this.state.files.length > 0 ?
                    (<div className='file-list cf'>
                      {this.state.files.map((f) => {return <File key={f.id} id={f.id} name={f.name} />;})}
                    </div>)
                  :
                    <p><em>No Pyret files yet, use New File above to create one.</em></p>
            }
          </div>
          <div className={'modal-body ' + ((this.state.activeTab === 'new-file') ? '' : 'hidden')}>
            <form onSubmit={this.handleCreateNewFile}>
              <label className='input-label'>New file name:</label>
              <input className='form' type='text' value={this.state.newFileName} onChange={this.handleNewFilenameChange} />
              <span className='arr-ext'>.arr</span>
              <input id='new-file' className='button ' type='submit' value='Create' />
            </form>
          </div>
        </div>
        <div className='footer middle'>
          <p className='right'>
            <a target="_blank" href="https://www.pyret.org">pyret.org</a> | <a target="_blank" href="/privacy/">Privacy</a> | <a target="_blank" href="https://www.github.com/brownplt/code.pyret.org">Software</a></p>
        </div>

      </div>
    );
  }
}

export default StudentDashboard;
