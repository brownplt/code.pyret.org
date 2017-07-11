import React, { Component } from 'react';

class File extends Component {
  render = () => {
    return (
        <div className='file-wrapper'>
          <div className="file" onClick={this.handleFileClick}>
            <img src='/img/pyret-logo.png'/>
            <p className='truncate'>{this.props.name}</p>
          </div>
        </div>
    );
  }

  handleFileClick = () => {
    window.open(EDITOR_REDIRECT_URL + this.props.id, '_blank');
  }
}

export default File;
