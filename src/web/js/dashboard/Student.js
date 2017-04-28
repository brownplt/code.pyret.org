import React, { Component } from 'react';
import { Icon, Tooltip } from 'react-mdl';
import { Card, CardTitle, CardText, Textfield, Button } from 'react-mdl';

class Student extends Component {
  state = {
    id: this.props.details.id,
    firstName: this.props.details.firstName,
    lastName: this.props.details.lastName,
    email: this.props.details.email,
    editing: false
  };
  api = this.props.api;

  handleClickEditStudent = () => {
    this.setState({editing: true});
  }

  handleChange = (event) => {
    this.setState({[event.target.id]: event.target.value});
  }

  handleClickRemoveStudent = () => {
    if (confirm('Remove this student from the roster? This cannot be undone.')) {
      this.props.snackBar('Student Removed. Please allow a few seconds for changes to appear.');
      this.api.removeStudent(this.state.id).then(this.props.refreshParent);
    }
  }

  handleSubmitEditStudent = (event) => {
    event.preventDefault();
    this.props.snackBar('Student Updated. Please allow a few seconds for changes to appear.');
    this.setState({editing: false});
    this.api.updateStudent(this.state.id, {
      id: this.state.id,
      firstName: this.state.firstName.trim(),
      lastName: this.state.lastName.trim(),
      email: this.state.email.trim()
    }).then(this.props.refreshParent);
  }

  render = () => {
    const editing = this.state.editing;
    return (
      <Card
        onClick={this.handleFileClick}
        shadow={1}
        style={{
          'display': 'inline-block',
          'margin': '8pt',
          'background': '#f4f6ff',
          'minHeight': '0px',
          'verticalAlign': 'middle'
        }}
      >
          <CardTitle>{this.state.firstName + ' ' + this.state.lastName}</CardTitle>
          <CardText>
            <div style={{'width': '100%'}} className={editing ? 'cf hidden': 'cf'}>
              <Tooltip label="Edit Student" position="top">
                <Icon name="edit" onClick={this.handleClickEditStudent}/>
              </Tooltip>
              <Tooltip label="Remove Student From Roster" position="top">
                <Icon name="close" onClick={this.handleClickRemoveStudent}/>
              </Tooltip>
            </div>
            <div className={editing ? '': 'hidden'}>
              <form onSubmit={this.handleSubmitEditStudent} className=''>
              <Textfield
                id='firstName'
                value={this.state.firstName}
                onChange={this.handleChange}
                label="First Name"
                floatingLabel
                style={{width: '100%'}}
              />
              <Textfield
                id='lastName'
                value={this.state.lastName}
                onChange={this.handleChange}
                label="Last Name"
                floatingLabel
                style={{width: '100%'}}
              />
              <Textfield
                id='email'
                value={this.state.email}
                onChange={this.handleChange}
                label="Email"
                floatingLabel
                style={{width: '100%'}}
              />
              <Button type='submit' style={{'margin': '8pt'}} raised ripple colored>Update Student</Button>
              </form>
            </div>
          </CardText>
      </Card>
    );
  }
}

export default Student;
