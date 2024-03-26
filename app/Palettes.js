import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import styles from './App.css';
import ColorCell from './ColorCell.js';


export default class Palettes extends React.Component {
  constructor(props) {
    super(props);
    this.paletteDropdown = React.createRef();

    this.state = {
      currentPaletteName: "Current Colors",
      currentPaletteId: 0
    }
  };

  render() {
    return (
      <div style={{overflow: "auto", maxHeight: "250px", display: 'inline', borderRadius: '3px', minHeight: '40px', width: '250px'}}>
        <span>Palettes:</span>
        {" "}
        <br />
        <div className={styles["sticky-menu"]}>
          <select ref={this.paletteDropdown} onChange={() => this.handlePaletteChange()}>
            {this.props.palettes.map((palettes) => {
              return (
                <option value={palettes.id.toString()}>{palettes.name}</option>
              );
            })}
          </select>
          <button className={styles["layer-button"]} onClick={() => this.props.addPalette()}>+</button>
          <button className={styles["layer-button2"]} onClick={() => this.props.addColor()}>Add Color</button>
        </div>
        {this.state.currentPaletteName}:
        {this.props.palettes[this.state.currentPaletteId].data.map((colors) => {
          return (
            <ColorCell
              color={colors}
              setColor={(evt, color) => {
                evt.preventDefault();
                evt.stopPropagation();
                this.props.setColor(evt.button, color)
              }}
            />
          );
        })}
      </div>
    );
  }

  handlePaletteChange() {
    var value = this.paletteDropdown.current.options[this.paletteDropdown.current.selectedIndex].value;
    var name;
    for (var i = 0; i < this.props.palettes.length; i++) {
      if (this.props.palettes[i].id == value) {
        name = this.props.palettes[i].name
      }
    }
    this.setState({currentPaletteName: name, currentPaletteId: value})
    this.props.getCurrent(value)
  }
}

Palettes.propTypes = {
  palettes: PropTypes.array.isRequired,
  addPalette: PropTypes.func.isRequired,
  addColor: PropTypes.func.isRequired,
  setColor: PropTypes.func.isRequired,
  getCurrent: PropTypes.func.isRequired,
};
