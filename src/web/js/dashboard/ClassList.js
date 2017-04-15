import React, { Component } from 'react';
import GoogleAPI from './GoogleAPI.js';
import Class from './Class.js';

class ClassList extends Component {
  state = {
    addingClass: false,
    newClassName: ''
  };

  handleClickAddClass = () => {
    this.setState({addingClass: ! this.state.addingClass});
  }

  handleChange = (event) => {
    this.setState({[event.target.name]: event.target.value});
  }

  handleSubmitAddClass = (event) => {
    event.preventDefault();
    this.setState({addingClass: false});
    this.props.api.addClass(this.state.newClassName).then(() => {
      this.setState({newClassName: ''});
      this.props.refreshParent();
    });
  }

  render = () => {
    const classes = this.props.classes.map(c => {
      return  <Class
                key={c.id}
                onClick={this.props.handleClickClass}
                details={c}
                api={this.props.api}
                refreshParent={this.props.refreshParent}
                activeClassId={this.props.activeClassId}
              />
    });
    return (
      <div>
        {classes}
        <button onClick={this.handleClickAddClass}>{this.state.addingClass ? 'Cancel' : 'Add Class'}</button>
        <div className={this.state.addingClass ? '': 'hidden'}>
          <form onSubmit={this.handleSubmitAddClass}>
            <label>Class Name:</label>
            <input type='text' name='newClassName' value={this.state.newClassName} onChange={this.handleChange}/>
            <input type='submit'/>
          </form>
        </div>
      </div>
    );
  }
}

export default ClassList;
