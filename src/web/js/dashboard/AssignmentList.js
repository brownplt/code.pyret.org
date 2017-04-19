import React, { Component } from 'react';
import GoogleAPI from './GoogleAPI.js';
import Assignment from './Assignment.js';
import { Button, Textfield, Card, CardTitle, CardText } from 'react-mdl';

class AssignmentList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      addingAssignment: false,
      newAssignmentName: '',
      selectedTemplateFileID: false,
      selectedTemplateFileName: false
    };
  }

  handleClickAddAssignment = () => {
    this.setState({addingAssignment: ! this.state.addingAssignment});
  }

  handleChange = (event) => {
    this.setState({[event.target.id]: event.target.value});
  }

  handleSubmitAddAssignment = (event) => {
    event.preventDefault();
    this.props.snackBar('Assignment Added. Please allow a few seconds for changes to appear.');
    this.setState({addingAssignment: false});
    // this.props.api.addAssignment({
    //   name: this.state.newAssignmentName,
    // }).then((resp) => {
    //   const assignmentID = resp.id;
    //   this.props.api.addExistingAssignmentToClass(assignmentID, this.props.activeClass).then(() => {
        this.setState({
          newAssignmentName: '',
          selectedTemplateFileID: false,
          selectedTemplateFileName: false
        });
    //     this.props.refreshParent();
    //   });
    // });
  }

  handleClickSelectTemplateFile = (event) => {
    event.preventDefault();
    this.setState({
      selectedTemplateFileID: '1298SDLFKJO!@JOKJSDFKJBOBSIO',
      selectedTemplateFileName: 'HeyImATest.arr'
    });
  }

  render = () => {
    const assignments = this.props.assignments.map(c => {
      return <Assignment snackBar={this.props.snackBar} key={c.id} details={c} api={this.props.api} refreshParent={this.props.refreshParent}/>;
    });
    return (
      <div>
        {assignments}
        <Button style={{'margin': '8pt 8pt 16pt 8pt', 'display': 'block'}} raised ripple colored
          onClick={this.handleClickAddAssignment}
        >
          {this.state.addingAssignment ? 'Cancel' : 'Add Assignment'}
        </Button>
        <Card
          className={this.state.addingAssignment ? '': 'hidden'}
          onClick={this.handleFileClick}
          shadow={1}
          style={{
            'display': 'block',
            'margin': '8pt',
            'background': '#f4f6ff',
            'minHeight': '0px',
            'verticalAlign': 'middle'
          }}
        >
          <CardTitle>New Assignment</CardTitle>
          <CardText>
            <form onSubmit={this.handleSubmitAddAssignment}>
              <Textfield
                id='newAssignmentName'
                value={this.state.newAssignmentName}
                onChange={this.handleChange}
                label="Assignment Name"
                floatingLabel
                style={{width: '100%'}}
              />
              <div style={{'margin': '0 0 32pt 0'}}>
                <Textfield
                  label={this.state.selectedTemplateFileID ? 'File Name' : 'No template file currently selected'}
                  value={this.state.selectedTemplateFileID ? (this.state.selectedTemplateFileName || '[Untitled]') : ''}
                  floatingLabel
                  style={{width: '100%'}}
                  disabled
                />
                <Button raised ripple colored onClick={this.handleClickSelectTemplateFile}>
                  {this.state.selectedTemplateFileID ? 'Change Template File' : 'Select Template File'}
                </Button>
              </div>
              <Button type='submit' style={{'margin': '8pt 0'}} raised ripple colored>Create New Assignment</Button>
            </form>
          </CardText>
        </Card>
      </div>
    );
  }
}

export default AssignmentList;
