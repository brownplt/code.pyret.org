import React, { Component } from 'react';
import { Card, CardTitle, CardText } from 'react-mdl';


class File extends Component {
  render = () => {
    return (
        <Card
          onClick={this.handleFileClick}
          shadow={1}
          style={{
            'display': 'inline-block',
            'textAlign': 'center',
            'margin': '8pt',
            'cursor': 'pointer',
            'background': '#f4f6ff'
          }}
        >
            <CardTitle expand>{this.props.name}</CardTitle>
            <CardText>
              <img src='/img/pyret-logo.png'/>
            </CardText>
        </Card>
    );
  }

  handleFileClick = () => {
    if (this.props.id) {
      window.open(EDITOR_REDIRECT_URL + this.props.id, '_newtab');
    }
  }
}

export default File;
