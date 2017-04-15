import React, { Component } from 'react';
import GoogleAPI from './GoogleAPI.js';

class Class extends Component {
  state = {
    id: this.props.details.id,
    name: this.props.details.name,
    asssignments: this.props.details.assignments,
    students: this.props.details.students,
    editing: false
  };

  handleClickEditClass = (event) => {
    this.setState({editing: true});
  }

  handleChange = (event) => {
    this.setState({[event.target.name]: event.target.value});
  }

  handleClickRemoveClass = (event) => {
    if (confirm('Remove this Class from the roster? This cannot be undone.')) {
      this.props.api.removeClass(this.state.id).then(this.props.refreshParent);
    }
  }

  handleSubmitEditClass = (event) => {
    event.preventDefault();
    this.setState({editing: false});
    this.props.api.updateClass(this.state.id, {
      id: this.state.id,
      name: this.state.name,
      asssignments: this.state.assignments,
      students: this.state.students
    }).then(this.props.refreshParent);
  }

  render = () => {
    const editing = this.state.editing;
    return (
      <div className='student'>
        <div className={editing ? 'cf hidden': 'cf'}>
          <span className='name left'>{this.state.name}</span>
          <i className="fa fa-times remove right" aria-hidden="true" onClick={this.handleClickRemoveClass}></i>
          <i className="fa fa-pencil edit right" aria-hidden="true" onClick={this.handleClickEditClass}></i>
        </div>
        <div className={editing ? '': 'hidden'}>
          <form onSubmit={this.handleSubmitEditClass} className=''>
            <label>Class Name:</label>
            <input type='text' name='name' value={this.state.name} onChange={this.handleChange}/>
            <input type='submit'/>
          </form>
        </div>
      </div>
    );
  }
}

export default Class;
