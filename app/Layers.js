import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import LayerCell from './LayerCell.js';


export default class Layers extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedLayer: 1
    }
  };

  render() {
    return (
      <div style={{float: 'right', display: 'inline', border: '2px solid #adbed9', borderRadius: '3px', minHeight: '40px', width: '250px'}}>
        <b>Layers:</b>
        {" "}
        <button onClick={() => this.props.addLayer()}>+</button>
        <button onClick={() => this.props.removeLayer()}>-</button>
        <button onClick={() => this.props.moveLayer(true)}>Move Up</button>
        <button onClick={() => this.props.moveLayer(false)}>Move Down</button>
        <button onClick={() => this.props.changeLayerName(prompt("Enter new name: "))}>Edit layer name</button>
        <br />

        {this.props.layers.map((layers) => {
          return (
            <LayerCell currentSelectedLayer={this.state.selectedLayer} layerId={layers.id} layerName={layers.name} select={(id) => {
              this.props.changeLayer(id)
              this.setState({selectedLayer: id});
            }}/>
          )
        })}

      </div>
    );
  }

  componentDidUpdate(prevProps) {
    if (prevProps.changedLayer !== this.props.changedLayer) {
      this.setState({selectedLayer: this.props.changedLayer});
    }
  }

}

Layers.propTypes = {
  layers: PropTypes.array.isRequired,
  changedLayer: PropTypes.number.isrequired,
  addLayer: PropTypes.func.isRequired,
  removeLayer: PropTypes.func.isRequired,
  moveLayer: PropTypes.func.isRequired,
  changeLayerName: PropTypes.func.isRequired,
};
