import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import GoogleAPI from './GoogleAPI.js';
import {CLIENT_ID, FILE_EXT, APP_NAME, API_KEY} from './config.js';
import '../../css/dashboard/index.css';

import 'react-mdl/extra/material.css';
import 'react-mdl/extra/material.js';
import { Layout, Header, Textfield, Drawer, Navigation, Content, Button, HeaderRow, HeaderTabs, Tab, Snackbar } from 'react-mdl';

import File from './File';
import ClassList from './ClassList';
import Class from './Class';
import StudentList from './StudentList';
import Student from './Student';

class TeacherDashboard extends Component {
  constructor() {
    super();

    this.state = {
      signedIn: false,
      classes: {},
      activeTab: 0,
      activeClassId: false,
      activeClass: '',
      studentsInClass: [],
      studentSpinnerActive: true,
      classSpinnerActive: true,
      isSnackbarActive: false,
      snackbarText: ''
    };

    this.api = new GoogleAPI();
    this.api.load().then((resp) => {
      this.handlePageLoad();
    });
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (this.state.studentsInClass != prevState.studentsInClass) {
      this.setState({studentSpinnerActive: false});
    }
    if (this.state.classes != prevState.classes) {
      this.setState({classSpinnerActive: false});
    }
  }

  setSnackBarMessage = (message) => {
    this.setState({
      isSnackbarActive: true,
      snackbarText: message
    })
  }

  handleTimeoutSnackbar = () =>{
    this.setState({ isSnackbarActive: false });
  }

  handleClickActionSnackbar = () => {
    this.setState({ isSnackbarActive: false });
  }

  handleSignInClick = (event) => {
    this.api.signIn().then((resp) => {
      this.handlePageLoad();
    });
  }

  handleSignOutClick = (event) => {
    this.setState({signedIn: false});
    window.location.replace('/logout');
  }

  handlePageLoad = () => {
    this.setState({signedIn: true});
    this.api.initializePyretData().then(() => {
      this.refreshState();
    });
  }

  refreshState = () => {
    this.api.getAllClasses().then((resp) => {
      const classes = resp;
      this.setState({
        classes: classes,
        activeClassId: 'class' + Object.keys(classes)[0] || '',
        activeClass: Object.keys(classes)[0] || false
      }, () => {
        this.refreshInnerState();
      })
    });
  }

  refreshInnerState = () => {
    if (this.state.activeClass) {
      this.api.getStudentsInClass(this.state.activeClass).then(resp => {
        this.setState({studentsInClass: resp})
      })
    }
  }

  handleClickClass = (event) => {
    const activeClass = event.currentTarget.id.match(/\d/g).join("");
    this.setState({studentSpinnerActive: true, activeClassId: event.currentTarget.id, activeClass: activeClass}, () => {
      this.refreshInnerState();
    });
  }

  render = () => {
    const getContentForTab = () => {
      const activeTab = this.state.activeTab;
      // Roster
      if (activeTab == 0) {
        return (
          <StudentList
            updating={this.state.studentSpinnerActive}
            students={this.state.studentsInClass}
            activeClass={this.state.activeClass}
            api={this.api}
            refreshParent={this.refreshState}
            snackBar={this.setSnackBarMessage}
          />
        )
      }
      // Assignments
      if (activeTab == 1) {
        return (
          <h3>Assignments</h3>
        )
      }
    }

    return (
      <Layout fixedHeader fixedDrawer>

        <Header>
          <HeaderRow title="Pyret - Teacher Dashboard">
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
             <Tab>Roster</Tab>
             <Tab>Assignments</Tab>
           </HeaderTabs>
        </Header>

        <Drawer title="Classes">
          <Navigation>
            <ClassList
              updating={this.state.classSpinnerActive}
              classes={Object.values(this.state.classes)}
              activeClassId={this.state.activeClassId}
              handleClickClass={this.handleClickClass}
              api={this.api}
              refreshParent={this.refreshState}
              snackBar={this.setSnackBarMessage}
            />
          </Navigation>
        </Drawer>

        <Content>
          <div className="page-content">
            {getContentForTab()}
          </div>
          <Snackbar
            active={this.state.isSnackbarActive}
            onClick={this.handleClickActionSnackbar}
            onTimeout={this.handleTimeoutSnackbar}
            action="OK">{this.state.snackbarText}
          </Snackbar>
        </Content>

      </Layout>
    );
  }
}

ReactDOM.render(
  <TeacherDashboard />,
  document.getElementById('root')
);
