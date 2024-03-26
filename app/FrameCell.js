import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

export default class LayerCell extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selected: false,
    }
  };

  render() {
    return (
      <div>
        <button style={{backgroundColor: this.state.bgColor, border: "1px solid lightgray", width: "100px"}} onClick={() => this.handleClick()}> {this.props.layerName} </button>
        <br />
      </div>
    );
  }

  componentDidUpdate(prevProps) {
    if (prevProps.currentSelectedLayer !== this.props.currentSelectedLayer) {
      if (this.props.currentSelectedLayer == this.props.layerId) {
        this.setState({bgColor: '#dbdbdb'});
      } else {
        this.setState({bgColor: '#EFEFEF'});
      }
    }
  }

  handleClick() {
    this.props.select(this.props.layerId);
  }

}

LayerCell.propTypes = {
  layerName: PropTypes.string.isRequired,
  currentSelectedLayer: PropTypes.number.isRequired,
  layerId: PropTypes.number.isRequired,
  select: PropTypes.func.isRequired
};
