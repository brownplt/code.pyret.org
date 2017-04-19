import React, { Component } from 'react';
import GoogleAPI from './GoogleAPI.js';
import Class from './Class.js';
import { FABButton, Icon, Button, Textfield, Spinner } from 'react-mdl';

class ClassList extends Component {
  state = {
    addingClass: false,
    newClassName: '',
  };

  handleClickAddClass = () => {
    this.setState({addingClass: ! this.state.addingClass});
  }

  handleChange = (event) => {
    this.setState({[event.target.id]: event.target.value});
  }

  handleSubmitAddClass = (event) => {
    event.preventDefault();
    this.props.snackBar('Class Added. Please allow a few seconds for it to appear.');
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
                snackBar={this.props.snackBar}
              />
    });
    return (
      <div>
        <Spinner className={this.props.updating ? '' : 'hidden'} singleColor style={{'margin': '16px 40px'}}/>
        <div className={this.props.updating ? 'hidden' : ''}>
          {classes}
          <div style={{'margin': '16px 40px'}}>
            <Button raised ripple colored
              onClick={this.handleClickAddClass}
            >
              {this.state.addingClass ? 'Cancel' : 'Add Class'}
            </Button>
            <div className={this.state.addingClass ? '': 'hidden'}>
              <form onSubmit={this.handleSubmitAddClass}>
                <Textfield
                  id='newClassName'
                  onChange={this.handleChange}
                  label="Class Name"
                  floatingLabel
                  style={{width: '100%'}}
                  value={this.state.newClassName}
                  onChange={this.handleChange}
                />
                <Button raised ripple colored type='submit'>Add Class</Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ClassList;
