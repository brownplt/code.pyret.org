import React, { Component } from 'react';
import GoogleAPI from './GoogleAPI.js';
import Student from './Student.js';

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
    this.setState({[event.target.name]: event.target.value});
  }

  handleSubmitAddStudent = (event) => {
    event.preventDefault();
    this.setState({addingStudent: false});
    this.props.api.addStudent({
      firstName: this.state.newStudentFirstName,
      lastName: this.state.newStudentLastName,
      email: this.state.newStudentEmail
    }).then((resp) => {
      const studentID = resp.id;
      this.props.api.addExistingStudentToClass(studentID, this.props.activeClass).then(() => {
        this.setState({
          newStudentFirstName: '',
          newStudentLastName: '',
          newStudentEmail: ''
        });
        this.props.refreshParent();
      });
    });
  }

  render = () => {
    const students = this.props.students.map(c => {
      return <Student key={c.id} details={c} api={this.props.api} refreshParent={this.props.refreshParent}/>;
    });
    return (
      <div>
        {students}
        <button onClick={this.handleClickAddStudent}>{this.state.addingStudent ? 'Cancel' : 'Add Student'}</button>
        <div className={this.state.addingStudent ? '': 'hidden'}>
          <form onSubmit={this.handleSubmitAddStudent}>
            <label>First Name:</label>
            <input type='text' name='newStudentFirstName' value={this.state.newStudentFirstName} onChange={this.handleChange}/>
            <label>Last Name:</label>
            <input type='text' name='newStudentLastName' value={this.state.newStudentLastName} onChange={this.handleChange}/>
            <label>Email:</label>
            <input type='text' name='newStudentEmail' value={this.state.newStudentEmail} onChange={this.handleChange}/>
            <input type='submit'/>
          </form>
        </div>
      </div>
    );
  }
}

export default StudentList;
