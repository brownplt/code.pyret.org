import React, { Component } from 'react';
import Student from './Student.js';
import { Button, Textfield, Card, CardTitle, CardText, Spinner } from 'react-mdl';

class StudentList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      addingStudent: false,
      newStudentFirstName: '',
      newStudentLastName: '',
      newStudentEmail: ''
    };
  }

  handleClickAddStudent = () => {
    this.setState({addingStudent: ! this.state.addingStudent});
  }

  handleChange = (event) => {
    this.setState({[event.target.id]: event.target.value});
  }

  handleSubmitAddStudent = (event) => {
    event.preventDefault();
    this.props.snackBar('Student Added. Please allow a few seconds for changes to appear.');
    this.setState({addingStudent: false});
    this.props.api.addStudent({
      firstName: this.state.newStudentFirstName.trim(),
      lastName: this.state.newStudentLastName.trim(),
      email: this.state.newStudentEmail.trim()
    }).then((resp) => {
      const studentID = resp.id;
      this.props.api.addExistingStudentToClass(studentID, this.props.activeClass).then(() => {
        this.setState({
          newStudentFirstName: '',
          newStudentLastName: '',
          newStudentEmail: ''
        });
        this.props.refreshParent();
      }).catch(e => {
        console.log(e);
        this.props.snackBar('Could not add student to class (possibly network error). Try again in a few moments.');
      });
    }).catch(e => {
      console.log(e);
      this.props.snackBar('Could not create student (possibly network error). Try again in a few moments.');
    });
  }

  render = () => {
    const students = this.props.students.map(c => {
      return <Student snackBar={this.props.snackBar} key={c.id} details={c} api={this.props.api} refreshParent={this.props.refreshParent}/>;
    });
    return (
      <div>
        <Spinner className={this.props.updating ? '' : 'hidden'} singleColor style={{'margin': '16px'}} />
        <div className={this.props.updating ? 'hidden' : ''}>
          {students}
          <Button style={{'margin': '8pt 8pt 16pt 8pt', 'display': 'block'}} raised ripple colored
            onClick={this.handleClickAddStudent}
          >
            {this.state.addingStudent ? 'Cancel' : 'Add Student'}
          </Button>
          <Card
            className={this.state.addingStudent ? '': 'hidden'}
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
            <CardTitle>New Student</CardTitle>
            <CardText>
              <form onSubmit={this.handleSubmitAddStudent}>
                <Textfield
                  id='newStudentFirstName'
                  value={this.state.newStudentFirstName}
                  onChange={this.handleChange}
                  label="First Name"
                  floatingLabel
                  style={{width: '100%'}}
                />
                <Textfield
                  id='newStudentLastName'
                  value={this.state.newStudentLastName}
                  onChange={this.handleChange}
                  label="Last Name"
                  floatingLabel
                  style={{width: '100%'}}
                />
                <Textfield
                  id='newStudentEmail'
                  value={this.state.newStudentEmail}
                  onChange={this.handleChange}
                  label="Email"
                  floatingLabel
                  style={{width: '100%'}}
                />
                <Button type='submit' style={{'margin': '8pt'}} raised ripple colored>Add New Student</Button>
              </form>
            </CardText>
          </Card>
        </div>
      </div>
    );
  }
}

export default StudentList;
