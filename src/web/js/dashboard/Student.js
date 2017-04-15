import React, { Component } from 'react';
import GoogleAPI from './GoogleAPI.js';

class Student extends Component {
  state = {
    id: this.props.details.id,
    firstName: this.props.details.firstName,
    lastName: this.props.details.lastName,
    email: this.props.details.email,
    editing: false
  };
  api = this.props.api;

  handleClickEditStudent = (event) => {
    this.setState({editing: true});
  }

  handleChange = (event) => {
    this.setState({[event.target.name]: event.target.value});
  }

  handleClickRemoveStudent = (event) => {
    if (confirm('Remove this student from the roster? This cannot be undone.')) {
      this.api.removeStudent(this.state.id);
    }
  }

  handleSubmitEditStudent = (event) => {
    event.preventDefault();
    this.setState({editing: false});
    this.api.updateStudent(this.state.id, {
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      email: this.state.email
    });
  }

  render = () => {
    const editing = this.state.editing;
    return (
      <div className='student'>
        <div className={editing ? 'cf hidden': 'cf'}>
          <span className='name left'>{this.state.firstName} {this.state.lastName}</span>
          <i className="fa fa-times remove right" aria-hidden="true" onClick={this.handleClickRemoveStudent}></i>
          <i className="fa fa-pencil edit right" aria-hidden="true" onClick={this.handleClickEditStudent}></i>
        </div>
        <div className={editing ? '': 'hidden'}>
          <form onSubmit={this.handleSubmitEditStudent} className=''>
            <label>First Name:</label>
            <input type='text' name='firstName' value={this.state.firstName} onChange={this.handleChange}/>
            <label>Last Name:</label>
            <input type='text' name='lastName' value={this.state.lastName} onChange={this.handleChange}/>
            <label>Email:</label>
            <input type='text' name='email' value={this.state.email} onChange={this.handleChange}/>
            <input type='submit'/>
          </form>
        </div>
      </div>
    );
  }
}

export default Student;
