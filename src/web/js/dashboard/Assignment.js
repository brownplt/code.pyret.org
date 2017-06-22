import React, { Component } from 'react';
import { Icon, Tooltip } from 'react-mdl';
import { Card, CardTitle, CardText, Textfield, Button } from 'react-mdl';

class Assignment extends Component {
  handleAssignmentClick = () => {
    if (this.props.details.docID) {
      window.open(EDITOR_REDIRECT_URL + this.props.details.docID, '_newtab');
    }
  }

  render = () => {
    return (
      <Card
        onClick={this.handleAssignmentClick}
        shadow={1}
        style={{
          'display': 'inline-block',
          'margin': '8pt',
          'background': '#f4f6ff',
          'minHeight': '0px',
          'verticalAlign': 'middle',
          'cursor': 'pointer'
        }}
      >
          <CardTitle>{this.props.details.name}</CardTitle>
          <CardText>
            <div style={{'fontWeight': 600, 'padding': '8pt 0'}}>Opened by:</div>
            <div>{this.props.details.opened.length} students</div>
            <div style={{'fontWeight': 600, 'padding': '8pt 0'}}>Submitted by:</div>
            <div>{this.props.details.opened.length} students</div>
          </CardText>
      </Card>
    );
  }
}

export default Assignment;
