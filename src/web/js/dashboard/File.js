import React, { Component } from 'react';

class File extends Component {
  render = () => {
    return (
        <div className='file-wrapper'>
          <div className="file" onClick={this.handleFileClick}>
              <i className="fa fa-file-code-o" aria-hidden="true"></i>
              <p className='truncate'>{this.props.name}</p>
          </div>
        </div>
    );
  }

  handleFileClick = () => {
    window.open(EDITOR_REDIRECT_URL + this.props.id, '_newtab');
  }
}

export default File;
