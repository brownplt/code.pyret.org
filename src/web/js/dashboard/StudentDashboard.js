import React, { Component } from 'react';
import GoogleAPI from './GoogleAPI.js';
import {CLIENT_ID, FILE_EXT, APP_NAME, API_KEY} from './config.js';
import File from './File';
import ReactDOM from 'react-dom';
import '../../css/dashboard/index.css';

import 'react-mdl/extra/material.css';
import 'react-mdl/extra/material.js';
import { Layout, Header, Textfield, Drawer, Navigation, Content, Button, HeaderRow, HeaderTabs, Tab } from 'react-mdl';

class StudentDashboard extends Component {
  constructor() {
    super();

    this.state = {
      activeTab: 0,
      signedIn: false,
      recentFiles: [],
      newFileName: '',
      templateFiles: [
        {name: 'Sort a List.arr', id: '0B32bNEogmncOTEJjQ1VicHdlYmc'},
        {name: 'Compute a Derivative.arr', id: '0B32bNEogmncOWU9OWW5MSFlHSDQ'},
        {name: 'Land a plane.arr', id: '0B32bNEogmncONnZNU2JsUnRVRG8'},
        {name: 'Play 2048.arr', id: '0B32bNEogmncOMTg5T2plV19LX0k'}
      ]
    };

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

  updateRecentFiles = () => {
    this.api.getRecentFilesByExt(FILE_EXT).then((resp) => {
      let files = resp.result.files;
      if (files.length == 0) {
        files = [{name: 'No Recent Files :(', id: null}]
      }
      this.setState({recentFiles: files});
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
    const getContentForTab = () => {
      const activeTab = this.state.activeTab;
      // Recent Files
      if (activeTab == 0) {
        return (
          <div>
            <Button
              style={{backgroundColor: '#db3236', 'margin': '16pt'}} raised colored ripple
              onClick={this.handleSelectFileClick}
            >
              Select From Drive
            </Button>
            <span> or select a file below:</span>
            <div className='file-list cf'>
              {this.state.recentFiles.map((f) => {return <File key={f.id} id={f.id} name={f.name} />;})}
            </div>
          </div>
        )
      }
      // Template Files
      if (activeTab == 1) {
        return (
          <div className='file-list cf'>
            {this.state.templateFiles.map((f) => {return <File key={f.id} id={f.id} name={f.name} />;})}
          </div>
        )
      }
      // New file
      if (activeTab == 2) {
        return (
          <form onSubmit={this.handleCreateNewFile}>
            <Textfield
                onChange={this.handleNewFilenameChange}
                value={this.state.newFileName}
                label="Filename"
                floatingLabel
                style={{width: '200px'}}
            />
            <span className='arr-ext'>.arr</span>
            <Button raised colored ripple>Create New File</Button>
          </form>
        )
      }
    }
    return (
      <Layout fixedHeader>

        <Header>
          <HeaderRow title="Pyret - Student Dashboard">
            <Navigation>
              <Button
                raised ripple style={{'lineHeight': '33px'}}
                onClick={this.state.signedIn ? this.handleSignOutClick : this.handleSignInClick}
              >
                {this.state.signedIn ? 'Sign Out' : 'Sign In'}
              </Button>
            </Navigation>
          </HeaderRow>

           <HeaderTabs ripple activeTab={this.state.activeTab} onChange={(tabId) => this.setState({ activeTab: tabId })}>
             <Tab>Recent Files</Tab>
             <Tab>Templates</Tab>
             <Tab>New File</Tab>
           </HeaderTabs>
        </Header>

        <Content>
          <div className="page-content">
            {getContentForTab()}
          </div>
        </Content>

      </Layout>
    );
  }
}

ReactDOM.render(
  <StudentDashboard />,
  document.getElementById('root')
);
