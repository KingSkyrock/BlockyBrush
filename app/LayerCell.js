import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

export default class LayerCell extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      bgColor: 'lightgray',
      selected: false,
    }
  };

  render() {
    return (
      <div>
        <button style={{backgroundColor: this.state.bgColor}} onClick={() => this.handleClick()}> {this.props.layerName} </button>
        <br />
      </div>
    );
  }

  componentDidUpdate(prevProps) {
    if (prevProps.currentSelectedLayer !== this.props.currentSelectedLayer) {
      if (this.props.currentSelectedLayer == this.props.layerId) {
        this.setState({bgColor: 'gray'});
      } else {
        this.setState({bgColor: 'lightgray'});
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
