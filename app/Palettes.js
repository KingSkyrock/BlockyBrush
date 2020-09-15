import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
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
      <div style={{float: 'right', display: 'inline', border: '2px solid #adbed9', borderRadius: '3px', minHeight: '40px', width: '250px'}}>
        <b>Palettes:</b>
        {" "}
        <br />
        <select ref={this.paletteDropdown} onChange={() => this.handlePaletteChange()}>
          {this.props.palettes.map((palettes) => {
            return (
              <option value={palettes.id.toString()}>{palettes.name}</option>
            );
          })}
        </select>
        <button onClick={() => this.props.addPalette()}>+</button>
        <button onClick={() => this.props.addColor()}>Add Color</button>
        <br />
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
  }
}

Palettes.propTypes = {
  palettes: PropTypes.array.isRequired,
  addPalette: PropTypes.func.isRequired,
  addColor: PropTypes.func.isRequired,
  setColor: PropTypes.func.isRequired
};
