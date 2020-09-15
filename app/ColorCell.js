import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

export default class ColorCell extends React.Component {
  constructor(props) {
    super(props);

  };

  render() {
    return (
      <button style={{backgroundColor: this.props.color, padding: '10px', border: '1px solid gray'}} onMouseDown={ (evt) => {this.props.setColor(evt, this.props.color)} } onContextMenu={(evt)=>{evt.preventDefault(); return false}} />
    );
  }

}

ColorCell.propTypes = {
  color: PropTypes.string.isRequired,
  setColor: PropTypes.func.isRequired
};
