import React, { Component } from 'react';
import { Icon, Tooltip, Button, Textfield } from 'react-mdl';

class Class extends Component {
  state = {
    id: this.props.details.id,
    name: this.props.details.name,
    asssignments: this.props.details.assignments,
    students: this.props.details.students,
    editing: false
  };

  handleClickEditClass = () => {
    this.setState({editing: true});
  }

  handleChange = (event) => {
    this.setState({[event.target.id]: event.target.value});
  }

  handleClickRemoveClass = () => {
    if (confirm('Remove this Class from the roster? This cannot be undone.')) {
      this.props.snackBar('Class Removed. Please allow a few seconds for changes to appear.');
      this.props.api.removeClass(this.state.id).then(this.props.refreshParent);
    }
  }

  handleSubmitEditClass = (event) => {
    event.preventDefault();
    this.props.snackBar('Class Updated. Please allow a few seconds for changes to appear.');
    this.setState({editing: false});
    this.props.api.updateClass(this.state.id, {
      id: this.state.id,
      name: this.state.name.trim(),
      asssignments: this.state.assignments,
      students: this.state.students
    }).then(this.props.refreshParent);
  }

  render = () => {
    const editing = this.state.editing;
    const active = (this.props.activeClassId == ('class' + this.state.id)) ? 'active': '';
    return (
      <div className={'class ' + active}
        onClick={this.props.onClick}
        id={'class' + this.state.id}
      >
        <div className={editing ? 'cf hidden': 'cf'}>
          <span className='name left'>{this.state.name}</span>
          <Tooltip className='right' label="Remove Class" position="top">
            <Icon name="close" onClick={this.handleClickRemoveClass}/>
          </Tooltip>
          <Tooltip label="Edit Class" className='right' position="top">
            <Icon name="edit" onClick={this.handleClickEditClass}/>
          </Tooltip>
        </div>
        <div className={editing ? '': 'hidden'}>
          <form onSubmit={this.handleSubmitEditClass} className=''>
            <Textfield
              id='name'
              onChange={this.handleChange}
              label="Class Name"
              floatingLabel
              style={{width: '100%'}}
              value={this.state.name}
            />
            <Button raised ripple colored type='submit'>Update Class</Button>
          </form>
        </div>
      </div>
    );
  }
}

export default Class;
