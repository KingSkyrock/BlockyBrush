import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import LayerCell from './LayerCell.js';
import ReactTooltip from 'react-tooltip';
import styles from './App.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";


export default class Layers extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedLayer: 1,
      style: styles,
    }
  };

  render() {
    return (
      <React.Fragment>
        <div style={{overflow: "auto", maxHeight: "350px"}}>
          <ReactTooltip id='add' type='dark'>
            <span>Add new layer</span>
          </ReactTooltip>
          <ReactTooltip id='remove' type='dark'>
            <span>Remove selected layer</span>
          </ReactTooltip>
          <ReactTooltip id='up' type='dark'>
            <span>Move selected layer up</span>
          </ReactTooltip>
          <ReactTooltip id='down' type='dark'>
            <span>Move selected layer down</span>
          </ReactTooltip>
          <ReactTooltip id='edit' type='dark'>
            <span>Edit layer properties</span>
          </ReactTooltip>
          <span>Layers:</span>
          <br />
          <div className={this.state.style["sticky-menu"]}>
            <button className={this.state.style["layer-button"]} data-tip data-effect='solid' data-place="left" data-for='add' onClick={() => this.props.addLayer()}>+</button>
            <button className={this.state.style["layer-button"]} data-tip data-effect='solid' data-place="left" data-for='remove' onClick={() => this.props.removeLayer()}>-</button>
            <button className={this.state.style["layer-button"]} data-tip data-effect='solid' data-place="left" data-for='up' onClick={() => this.props.moveLayer(true)}><FontAwesomeIcon color="#404040" icon={faArrowUp}/></button>
            <button className={this.state.style["layer-button"]} data-tip data-effect='solid' data-place="left" data-for='down' onClick={() => this.props.moveLayer(false)}><FontAwesomeIcon color="#404040" icon={faArrowDown}/></button>
            <button className={this.state.style["layer-button2"]} data-tip data-effect='solid' data-place="left" data-for='edit' onClick={() => this.props.changeLayerName(prompt("Enter new name: "))}>Edit layer name</button>
          </div>

          {this.props.layers.map((layers) => {
            return (
              <LayerCell currentSelectedLayer={this.state.selectedLayer} layerId={layers.id} layerName={layers.name} select={(id) => {
                this.props.changeLayer(id)
                this.setState({selectedLayer: id});
              }}/>
            )
          })}
        </div>
        <hr />
      </React.Fragment>
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
