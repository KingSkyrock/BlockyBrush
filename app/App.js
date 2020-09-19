import React from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import styles from './App.css';
import darkStyles from './DarkApp.css';
import { ChromePicker } from 'react-color';
import tinycolor from 'tinycolor2';
import Layers from './Layers.js';
import Palettes from './Palettes.js';
import SVG from 'react-inlinesvg';
import logo from "./logo.svg";
import logoDark from "./logoDark.svg";
import swapIcon from "./swapIcon.png";
import ReactTooltip from 'react-tooltip';
import { faCog, faPaintBrush, faEyeDropper, faEraser, faFill, faFillDrip, faSlash, faChessBoard, faAdjust, faArrowsAlt, faTh, faSync} from "@fortawesome/free-solid-svg-icons";
import { faSquare, faCircle} from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

Modal.setAppElement('#root')

//MAKE SURE TO FIX WHITE VS NULL FILL
export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.mainCanvas = React.createRef();
    this.previewCanvas = React.createRef();
    this.hiddenCanvas = React.createRef();
    this.downloadLink = React.createRef();
    this.uploadLink = React.createRef();

    this.history = [];
    this.redos = [];
    this.rectAnchorPoint = [];
    this.lineAnchorPoint = [];
    this.circleAnchorPoint = [];
    this.brushAnchorPoint = null;
    this.tempSave = null;
    this.lastMouseButton = null;
    this.inputChanging = false;
    this.pd = 20;
    this.lightingInt = 10;
    this.saturatingInt = 10;
    this.currentColors = [''];
    this.layerIdCount = 1;
    this.layerCount = 1;
    this.paletteIdCount = 1;

    this.state = {
      painting: false,
      filling: false,
      sameColorFilling: false,
      ditherPainting: false,
      creatingRectangle: false,
      creatingLine: false,
      creatingCircle: false,
      moving: false,
      lightening: false,
      intensity1: false,
      saturating: false,
      intensity2: false,
      clickX: [],
      clickY: [],
      clickDrag: [],
      gridDimensions: [32,32],
      saveState: [],
      layerOpacitySave: [],
      currentColor: "#000000",
      secondColor: "#000000",
      showingColorPicker: false,
      showingSecondColorPicker: false,
      usingTool: "BRUSH",
      erasing: false,
      rectCorner: ['', ''],
      lineEnd: ['', ''],
      circleCorner: ['', ''],
      movePoint: ['', ''],
      highlight: ['', ''],
      changingDimensions: false,
      transforming: false,
      changeGridInput: 32,
      res: 32,
      palettes: [],
      currentLayerId: 1,
      layers: [{name: "Layer 1", id: 1, data: []}],
      palettes: [{name: "Current Colors", id: 0, data: []}],
      previewOutput: false,
      previewButtonText: "Preview Output",
      addingColor: false,
      settingsModal: false,
      style: styles,
      darkMode: false,
    }
  }

  render() {
    return (
      <div>
        <menu className={this.state.style["nav-menu"]}>
          {this.state.darkMode &&
            <SVG className={this.state.style["logo"]} src={logoDark} />
          }
          {!this.state.darkMode &&
            <SVG className={this.state.style["logo"]} src={logo} />
          }
          <li><button className={this.state.style["menu-button"]} onClick={()=>this.save()}>Save As Image</button></li>
          |
          <li><button className={this.state.style["menu-button"]} onClick={()=>this.saveFile()}>Save Locally As .blockArt File</button></li>
          |
          <li><button className={this.state.style["menu-button"]} onClick={()=>this.uploadLink.current.click()}>Load .blockArt File</button></li>
          |
          <li><button className={this.state.style["menu-button"]} onClick={()=>this.previewOutput(this.state.previewOutput)}>{this.state.previewButtonText}</button></li>
          <div onMouseDown={(evt) => {this.settings()}} className={this.state.style["settings"]}><FontAwesomeIcon size="2x" color="#404040" icon={faCog} /></div>
          <Modal
            isOpen={this.state.settingsModal}
            onRequestClose={()=>{this.setState({settingsModal: false})}}
            contentLabel="Settings"
          >
            <div className={this.state.style["settings-header"]}>
              Settings
            </div>
            <br />
            <span className={this.state.style["settings-subheader"]}>THEME</span>
            <div className={this.state.style["settings-content"]}>
              <input type="radio" id="lightMode" name="lightMode" value="Light" /> Light
              <input type="radio" id="lightMode" name="lightMode" value="Light" /> Dark
            </div>
            <br />

          </Modal>

          <input onChange={() => this.loadFile(this.uploadLink.current.files[0])} accept=".blockArt" ref={this.uploadLink} style={{display: 'none'}} type='file'></input>
        </menu>
        <div className={this.state.style["container"]}>
          <div className={this.state.style["tools-container"]}>
            <ReactTooltip id='primaryColor' type='dark'>
              <span>Primary Color (left mouse button)</span>
            </ReactTooltip>
            <ReactTooltip id='secondaryColor' type='dark'>
              <span>Secondary Color (right mouse button)</span>
            </ReactTooltip>
            <ReactTooltip id='eyedropper' type='dark'>
              <span>Color picker</span>
            </ReactTooltip>
            <ReactTooltip id='eraser' type='dark'>
              <span>Eraser Tool</span>
            </ReactTooltip>
            <ReactTooltip id='brush' type='dark'>
              <span>Pen/Brush Tool</span>
            </ReactTooltip>
            <ReactTooltip id='bucket' type='dark'>
              <span>Paint Bucket Tool</span>
            </ReactTooltip>
            <ReactTooltip id='replace' type='dark'>
              <span>Replace all of one color with another</span>
            </ReactTooltip>
            <ReactTooltip id='rect' type='dark'>
              <span>Rectangle Tool</span>
            </ReactTooltip>
            <ReactTooltip id='line' type='dark'>
              <span>Line Tool</span>
            </ReactTooltip>
            <ReactTooltip id='circle' type='dark'>
              <span>Circle/Ellipse Tool</span>
            </ReactTooltip>
            <ReactTooltip id='dither' type='dark'>
              <span>Dither Tool</span>
            </ReactTooltip>
            <ReactTooltip id='light' type='dark'>
              <span>Lighten/Darken (left click and right click)</span>
            </ReactTooltip>
            <ReactTooltip id='saturate' type='dark'>
              <span>Saturate/Desaturate (left click and right click)</span>
            </ReactTooltip>
            <ReactTooltip id='move' type='dark'>
              <span>Move everything on the canvas</span>
            </ReactTooltip>
            <ReactTooltip id='dimensions' type='dark'>
              <span>Change canvas dimensions</span>
            </ReactTooltip>
            <ReactTooltip id='transform' type='dark'>
              <span>Transform everything on the canvas</span>
            </ReactTooltip>
            <span>Colors: </span>

            <div data-effect='solid' data-tip data-for='secondaryColor' className={this.state.style["color-picker"]} style={{backgroundColor: this.state.secondColor}} onMouseDown={(evt) => {this.setState({showingSecondColorPicker: true, showingColorPicker: false})} }> </div>
            <img onMouseDown={(evt) => {this.swapColors();}} src={swapIcon} className={this.state.style["swap-icon"]} alt="swap"/>
            <div data-effect='solid' data-tip data-for='primaryColor' className={this.state.style["bottom-picker"]} style={{backgroundColor: this.state.currentColor}} onMouseDown={(evt) => {this.setState({showingColorPicker: true, showingSecondColorPicker: false})} }> </div>

            {this.state.showingColorPicker &&
              <span>
                <ChromePicker
                  color={ this.state.currentColor }
                  onChange={ this.changeColor }
                />
              </span>
            }
            {this.state.showingSecondColorPicker &&
              <span>
                <ChromePicker
                  color={ this.state.secondColor }
                  onChange={ this.changeSecondColor }
                />
              </span>
            }
            <br />
            <div className={this.state.style["tools-sub-container"]}>
              <div>
                <button aria-label="Eyedropper" data-tip data-effect='solid' data-place="right" data-for='eyedropper' className={this.state.style["tool-button"]} onClick={()=>this.setState({usingTool:"EYEDROPPER", intensity1: false, intensity2: false})}><FontAwesomeIcon size="2x" color="#404040" icon={faEyeDropper} /></button>
                <br />
                <button aria-label="Eraser" data-tip data-effect='solid' data-place="right" data-for='eraser' className={this.state.style["tool-button"]} onClick={()=>this.setState({usingTool:"ERASER", intensity1: false, intensity2: false})}><FontAwesomeIcon size="2x" color="#404040" icon={faEraser} /></button>
                <br />
                <button aria-label="Brush" data-tip data-effect='solid' data-place="right" data-for='brush' className={this.state.style["tool-button"]} onClick={()=>this.setState({usingTool:"BRUSH", intensity1: false, intensity2: false})}><FontAwesomeIcon size="2x" color="#404040" icon={faPaintBrush} /></button>
                <br />
                <button aria-label="Bucket" data-tip data-effect='solid' data-place="right" data-for='bucket' className={this.state.style["tool-button"]} onClick={()=>this.setState({usingTool:"BUCKET", intensity1: false, intensity2: false})}><FontAwesomeIcon size="2x" color="#404040" icon={faFillDrip} /></button>
                <br />
                <button aria-label="Replace Color" data-tip data-effect='solid' data-place="right" data-for='replace' className={this.state.style["tool-button"]} onClick={()=>this.setState({usingTool:"BUCKETALL", intensity1: false, intensity2: false})}><FontAwesomeIcon size="2x" color="#404040" icon={faFill} /></button>
                <br />
                <button aria-label="Rectangle" data-tip data-effect='solid' data-place="right" data-for='rect' className={this.state.style["tool-button"]} onClick={()=>this.setState({usingTool:"RECT", intensity1: false, intensity2: false})}><FontAwesomeIcon size="2x" color="#404040" icon={faSquare} /></button>
                <br />
                <button aria-label="Line" data-tip data-effect='solid' data-place="right" data-for='line' className={this.state.style["tool-button"]} onClick={()=>this.setState({usingTool:"LINE", intensity1: false, intensity2: false})}><FontAwesomeIcon size="2x" color="#404040" icon={faSlash} /></button>
                <br />
                <button aria-label="Circle" data-tip data-effect='solid' data-place="right" data-for='circle' className={this.state.style["tool-button"]} onClick={()=>this.setState({usingTool:"CIRCLE", intensity1: false, intensity2: false})}><FontAwesomeIcon size="2x" color="#404040" icon={faCircle} /></button>
                <br />
                <button aria-label="Dither" data-tip data-effect='solid' data-place="right" data-for='dither' className={this.state.style["tool-button"]} onClick={()=>this.setState({usingTool:"DITHER", intensity1: false, intensity2: false})}><FontAwesomeIcon size="2x" color="#404040" icon={faChessBoard} /></button>
                <br />
              </div>
              <div>
                <div className={this.state.style["popover-container"]}>
                  {this.state.intensity1 &&
                    <form className={this.state.style["intensity-form"]} onSubmit={(evt) => this.changeLightingInt(evt)}>
                      Intensity: <span className={this.state.style["default-label"]}>(DEFAULT: 10)</span>
                      <br />
                      <input defaultValue={this.lightingInt} min="0" max="100" type="number"></input>
                      <br />
                      <input value="Done" type="submit"></input>
                      <br />
                    </form>
                  }
                  <button aria-label="Light/Darken" data-tip data-effect='solid' data-place="right" data-for='light' className={this.state.style["tool-button"]} onClick={()=>this.setState({usingTool:"LIGHT", changingDimensions: false, intensity1: !this.state.intensity1, intensity2: false, transforming: false})}><FontAwesomeIcon size="2x" color="#404040" icon={faAdjust} /></button>
                </div>
                <br />
                <div className={this.state.style["popover-container"]}>
                  {this.state.intensity2 &&
                    <form className={this.state.style["intensity-form"]} onSubmit={(evt) => this.changeSaturationInt(evt)}>
                      Intensity: <span className={this.state.style["default-label"]}>(DEFAULT: 10)</span>
                      <br />
                      <input defaultValue={this.saturatingInt} min="0" max="100" type="number"></input>
                      <br />
                      <input value="Done" type="submit"></input>
                      <br />
                    </form>
                  }
                  <button aria-label="Saturate/Desaturate" data-tip data-effect='solid' data-place="right" data-for='saturate' className={this.state.style["tool-button"]} onClick={()=>this.setState({usingTool:"SATURATE", changingDimensions: false, intensity1: false, intensity2: !this.state.intensity2, transforming: false})}><FontAwesomeIcon size="2x" flip="both" rotation={120} color="#404040" icon={faAdjust} /></button>
                </div>
                <br />

                <button aria-label="Move" data-tip data-effect='solid' data-place="right" data-for='move' className={this.state.style["tool-button"]} onClick={()=>this.setState({usingTool:"MOVE", intensity1: false, intensity2: false})}><FontAwesomeIcon size="2x" color="#404040" icon={faArrowsAlt} /></button>
                <br />
                <div className={this.state.style["popover-container"]}>
                  {this.state.changingDimensions &&
                    <form className={this.state.style["intensity-form"]} onSubmit={(evt) => this.changeGridDimensions(evt)}>
                      Dimensions:
                      <input defaultValue={this.state.gridDimensions[0]} onChange={(evt) => this.inputChange(evt.target.value)} min="1" max="10000" type="number"></input> x <span>{this.state.changeGridInput}</span>
                      <br />
                      <input value="Done" type="submit"></input>
                    </form>
                  }
                  <button aria-label="Change canvas size" data-tip data-effect='solid' data-place="right" data-for='dimensions' className={this.state.style["tool-button"]} onClick={()=>this.setState({changingDimensions: true, intensity1: false, intensity2: false, transforming: false})}><FontAwesomeIcon size="2x" color="#404040" icon={faTh} /></button>
                </div>
                <br />
                <div className={this.state.style["popover-container"]}>
                  <button aria-label="Transform" data-tip data-effect='solid' data-place="right" data-for='transform' className={this.state.style["tool-button"]} onClick={()=>this.setState({transforming: !this.state.transforming, intensity1: false, intensity2: false, changingDimensions: false})}><FontAwesomeIcon size="2x" color="#404040" icon={faSync} /></button>
                  {this.state.transforming &&
                    <div className={this.state.style["intensity-form2"]}>
                      <button className={this.state.style["submit-button"]} aria-label="Verticle flip" onClick={() => this.vertFlip()}>Flip Vertically</button>
                      <button className={this.state.style["submit-button"]} aria-label="Horozontal flip" onClick={() => this.horoFlip()}>Flip Horozontally</button>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
          <div className={this.state.style["canvas-container"]}>
            {!this.state.previewOutput &&
              <canvas
                width='640'
                height='640'
                onMouseLeave={()=>this.setState({painting: false})}
                onMouseUp={(evt)=>this.canvasMouseUp(evt)}
                onMouseMove={(evt)=>this.canvasMouseMove(evt)}
                onMouseDown={(evt)=>this.canvasMouseDown(evt)}
                ref={this.mainCanvas}
                className={this.state.style["main-canvas"]}
                onContextMenu={(evt)=>{evt.preventDefault(); return false}}
              ></canvas>
            }
            {this.state.previewOutput &&
              <canvas
                width='640'
                height='640'
                ref={this.previewCanvas}
                className={this.state.style["main-canvas"]}
                onContextMenu={(evt)=>{evt.preventDefault(); return false}}
              ></canvas>
            }

          </div>
          <menu className={this.state.style["right-menu"]}>
            <Layers
              layers={this.state.layers}
              changedLayer={this.state.currentLayerId}
              addLayer={() => {
                this.layerIdCount += 1;
                this.layerCount += 1;

                var arr = this.state.layers
                var arr2 = new Array(32);

                for (var i = 0; i < arr2.length; i++) {
                  arr2[i] = new Array(32);
                }
                arr.push({name: "Layer " + this.layerIdCount, id: this.layerIdCount, data: arr2});

                this.setState({layers: arr})
                this.changeLayer(this.layerIdCount)

              }}
              removeLayer={() => {
                if (this.layerCount != 1) {
                  this.layerCount -= 1;

                  for (var i = 0; i < this.state.layers.length; i++) {
                    if (this.state.layers[i].id == this.state.currentLayerId) {
                      this.state.layers.splice(i, 1)
                    }
                  }
                  this.changeLayer(this.state.layers[0].id)
                }
              }}
              moveLayer={(up) => {
                var temp;
                var temp2;
                var layers = JSON.parse(JSON.stringify(this.state.layers));
                if (up) {
                  for (var i = 0; i < this.state.layers.length; i++) {
                    if (this.state.layers[i].id == this.state.currentLayerId) {
                      if (layers[i-1].id != undefined) {
                        temp = layers[i]
                        temp2 = layers[i-1]
                        layers[i] = temp2
                        layers[i-1] = temp
                      }
                      this.setState({layers: layers});
                    }
                  }
                } else {
                  for (var i = 0; i < this.state.layers.length; i++) {
                    if (this.state.layers[i].id == this.state.currentLayerId) {
                      if (layers[i+1].id != undefined) {
                        temp = layers[i]
                        temp2 = layers[i+1]
                        layers[i] = temp2
                        layers[i+1] = temp
                      }
                      this.setState({layers: layers});
                    }
                  }
                }
              }}
              changeLayerName={(name) => {
                var layers = this.state.layers
                for (var i = 0; i < this.state.layers.length; i++) {
                  if (this.state.layers[i].id == this.state.currentLayerId) {
                    layers[i].name = name
                  }
                }

                this.setState({layers: layers})
              }}
              changeLayer={(id) => {
                this.changeLayer(id)
              }}
            />
            <Palettes
              palettes={this.state.palettes}
              setColor={(button, color) => {
                if (button == 0) {
                  this.setState({currentColor: color})
                } else if (button == 2) {
                  this.setState({secondColor: color})
                }
              }}
              addPalette={() => {
                var temp = JSON.parse(JSON.stringify(this.state.palettes));
                temp.push({name: prompt("Name of palette:"), id: this.paletteIdCount, data: []});
                this.setState({palettes: temp}, () => {
                  this.paletteIdCount += 1;
                });
              }}
              addColor={() => {
                this.setState({addingColor: "#000000"});
              }}
            />
            {this.state.addingColor &&
              <div>
                <span>
                  <ChromePicker
                    color = {this.state.addingColor}
                    onChange={ this.changePaletteColor }
                  />
                </span>
                <button onClick={() => {this.addPaletteColor(this.state.addingColor)}}>Done</button>
              </div>
            }
          </menu>
        </div>
        <br/><br/>

        <canvas
          width={this.state.res}
          height={this.state.res}
          className={this.state.style["hidden-canvas"]}
          ref={this.hiddenCanvas}
        ></canvas>
        <a ref={this.downloadLink} href="" style={{display: 'none'}}></a>
      </div>
    );
  }

  componentDidMount() {
    document.addEventListener("keydown", (evt)=>{this.keyShortcuts(evt)}, false);
    var arr = new Array(32);

    for (var i = 0; i < arr.length; i++) {
      arr[i] = new Array(32);
    }

    this.setState({saveState: arr, layerOpacitySave: arr});

    // the initial state of the canvas makes up the first history item
    this.history.push(JSON.parse(JSON.stringify(arr)));
    this.drawGrid();
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", (evt)=>{this.keyShortcuts(evt)}, false);
  }

  settings() {
    this.setState({settingsModal: true});
  }

  changeLayer(id) {
    var context = this.mainCanvas.current.getContext("2d");
    if (id != this.state.currentLayerId) {
      var layerData = this.state.layers;
      for (var i = 0; i < layerData.length; i++) {
        if (layerData[i].id == this.state.currentLayerId) {
          layerData[i].data = JSON.parse(JSON.stringify(this.state.saveState))
        }
        if (layerData[i].id == id) {
          this.setState({saveState: layerData[i].data}, () => {
            this.drawCanvas(context)
            this.drawGrid(context)
          })
        }
      }
      this.setState({layers: layerData, currentLayerId: id})
    }
    this.updateCurrentColors();
  }

  swapColors() {
    var temp1 = this.state.currentColor;
    var temp2 = this.state.secondColor;

    this.setState({currentColor: temp2, secondColor: temp1});
  };

  addPaletteColor(color) {
    var temp = JSON.parse(JSON.stringify(this.state.palettes));
  }

  createPalette(evt) {
    evt.preventDefault()
    evt.stopPropagation()
    var temp = JSON.parse(JSON.stringify(this.state.palettes));
  }

  previewOutput(toggleOn) {
    if (!toggleOn) {
      this.setState({previewOutput: true, previewButtonText: "Hide Preview"}, () => {
        var context = this.previewCanvas.current.getContext("2d");
        if (this.state.layers.length == 1) {
          for (var i = 0; i < this.state.saveState.length; i++) {
            for (var j = 0; j < this.state.saveState[i].length; j++) {
              context.fillStyle = this.state.saveState[i][j];
              if (this.state.saveState[i][j] != undefined) {
                context.fillRect(j*this.pd, i*this.pd, this.pd, this.pd);
              }
            }
          }
        } else {
          for (var i = this.state.layers.length - 1; i >= 0; i--) {
            for (var j = 0; j < this.state.layers[i].data.length; j++) {
              for (var k = 0; k < this.state.layers[i].data[j].length; k++) {
                context.fillStyle = this.state.layers[i].data[j][k];
                if (this.state.layers[i].data[j][k] != undefined) {
                  context.fillRect(k*this.pd, j*this.pd, this.pd, this.pd);
                }
              }
            }
          }
        }
        context.stroke()
      });
    } else {
      this.setState({previewOutput: false, previewButtonText: "Preview Output"}, () => {
        var context = this.mainCanvas.current.getContext("2d");
        this.drawCanvas(context);
        context.stroke();
      });
    }

  }

  save() {
    var context = this.hiddenCanvas.current.getContext("2d");
    var resolution = prompt("Enter export resolution (default is same as canvas size)")
    if (resolution == '') {
      resolution = this.state.gridDimensions[0]
    }
    this.setState({res: resolution}, () => {
      context.clearRect(0, 0, this.state.res, this.state.res);

      if (this.state.layers.length == 1) {
        for (var i = 0; i < this.state.saveState.length; i++) {
          for (var j = 0; j < this.state.saveState[i].length; j++) {
            context.fillStyle = this.state.saveState[i][j];
            if (this.state.saveState[i][j] != undefined) {
              context.fillRect(j*this.state.res/this.state.gridDimensions[0], i*this.state.res/this.state.gridDimensions[0], this.state.res/this.state.gridDimensions[0], this.state.res/this.state.gridDimensions[0]);
            }
          }
        }
      } else {
        for (var i = this.state.layers.length - 1; i >= 0; i--) {
          for (var j = 0; j < this.state.layers[i].data.length; j++) {
            for (var k = 0; k < this.state.layers[i].data[j].length; k++) {
              context.fillStyle = this.state.layers[i].data[j][k];
              if (this.state.layers[i].data[j][k] != undefined) {
                context.fillRect(k*this.state.res/this.state.gridDimensions[0], j*this.state.res/this.state.gridDimensions[0], this.state.res/this.state.gridDimensions[0], this.state.res/this.state.gridDimensions[0]);
              }
            }
          }
        }
      }
      var image = this.hiddenCanvas.current.toDataURL();
      this.downloadLink.current.href = this.hiddenCanvas.current.toDataURL();
      this.downloadLink.current.download = prompt('ENTER FILE NAME:') + '.png';
      this.downloadLink.current.click();
      context.stroke()
    });
  }

  saveFile() {
    var obj = {
      layers: this.state.layers,
      layerCount: this.layerCount,
      layerIdCount: this.layerIdCount,
      width: this.state.gridDimensions[0],
      height: this.state.gridDimensions[1],
      frameCount: 1
    }
    var blob = new Blob([JSON.stringify(obj)],{ type: "application/blockArt+json" });
    var url = window.URL.createObjectURL(blob);

    this.downloadLink.current.href = url;
    this.downloadLink.current.download = prompt('ENTER FILE NAME:') + '.blockArt';
    this.downloadLink.current.click();
  }

  loadFile(file) {
    var context = this.mainCanvas.current.getContext("2d");
    var reader = new FileReader()
    var data;
    var tempSave;
    var temp = [];
    reader.onload = (evt) => {
      try {
        data = JSON.parse(evt.target.result)
      } catch (e) {
        alert("Error! There is something wrong with the file.")
      }
      this.setState({gridDimensions: [data.width, data.height]}, () => {
        this.pd = 640/data.width;

        var arr = new Array(parseInt(data.height));

        for (var i = 0; i < arr.length; i++) {
          arr[i] = new Array(parseInt(data.width));
        }
        this.setState({saveState: arr, layers: data.layers, changingDimensions: false}, () => {
          this.history.push(JSON.parse(JSON.stringify(arr)));
          context.clearRect(0, 0, 640, 640);
          this.drawGrid();
          this.layerIdCount = data.layerIdCount;
          this.layerCount = data.layerCount;

          this.setState({saveState: data.layers[0].data});
          this.drawCanvas(context)

          this.changeLayer(data.layers[0].id)

          this.updateCurrentColors()
          context.stroke()
        });
      });
    };
    reader.readAsText(file)
  }

  inputChange(val) {
    this.setState({changeGridInput: val})
  }

  changeLightingInt(evt) {
    evt.preventDefault();

    this.lightingInt = evt.target[0].value;
    this.setState({intensity1: false})
  }

  changeSaturationInt(evt) {
    evt.preventDefault();

    this.saturatingInt = evt.target[0].value;
    this.setState({intensity2: false})
  }

  updateCurrentColors() {
    this.currentColors = ['']
    var temp = JSON.parse(JSON.stringify(this.currentColors));
    var palettes = JSON.parse(JSON.stringify(this.state.palettes));
    var arr = [];
    var color = ''
    var x = true;

    if (this.state.layers.length == 1) {
      for (var i = 0; i < this.state.saveState.length; i++) {
        for (var j = 0; j < this.state.saveState[i].length; j++) {
          x = true;
          for (var k = 0; k < this.currentColors.length; k++) {
            if (this.state.saveState[i][j] == temp[k]) {
              x = false
            }
            for (var l = 0; l < temp.length; l++) {
              if (temp[l] == this.state.saveState[i][j]) {
                x = false
              }
            }
          }
          if (x && this.state.saveState[i][j] != undefined) {
            temp.push(this.state.saveState[i][j])
          }
        }
      }
    } else {
      for (var m = 0; m < this.state.layers.length; m++) {
        for (var i = 0; i < this.state.layers[m].data.length; i++) {
          for (var j = 0; j < this.state.layers[m].data[i].length; j++) {
            x = true;
            for (var k = 0; k < this.currentColors.length; k++) {
              if (this.state.layers[m].data[i][j] == temp[k]) {
                x = false
              }
              for (var l = 0; l < temp.length; l++) {
                if (temp[l] == this.state.layers[m].data[i][j]) {
                  x = false
                }
              }
            }
            if (x && this.state.layers[m].data[i][j] != undefined) {
              temp.push(this.state.layers[m].data[i][j])
            }
          }
        }
      }
    }

    this.currentColors = temp;
    this.currentColors.shift()

    for (var i = 0; i < this.state.palettes.length; i++) {
      if (this.state.palettes[i].id == 0) {
        palettes[i].data = JSON.parse(JSON.stringify(this.currentColors));
      }
    }
    this.setState({palettes: palettes});
  }

  changeGridDimensions(evt) { /////////////////////////////////////////////////////////////////////////////////////////SAVE FOR TOMORROW! FIX CANVAS CHANGING SIZE WITH LAYERS
    var context = this.mainCanvas.current.getContext("2d");

    evt.preventDefault();

    this.setState({gridDimensions: [this.state.changeGridInput, this.state.changeGridInput]}, () => {
      this.pd = 640/this.state.changeGridInput;

      var arr = new Array(parseInt(this.state.changeGridInput));

      for (var i = 0; i < arr.length; i++) {
        arr[i] = new Array(parseInt(this.state.changeGridInput));
      }
      this.setState({saveState: arr, layerOpacitySave: arr, changingDimensions: false});

      this.history.push(JSON.parse(JSON.stringify(arr)));
      context.clearRect(0, 0, 640, 640);
      this.drawGrid();
      this.drawSave(context)
      context.stroke()
    });
  }

  changeColor = (color) => {
    this.setState({currentColor: color.hex, usingTool: "BRUSH"})
  }

  changeSecondColor = (color) => {
    this.setState({secondColor: color.hex, usingTool: "BRUSH"})
  }

  changePaletteColor = (color) => {
    this.setState({addingColor: color.hex})
  }

  drawCanvas(context) {
    this.drawGrid();
    context.clearRect(0, 0, 640, 640);
    this.drawSave(context);
  }

  drawSave(context) {
    for (var i = 0; i < this.state.layers.length; i++) {
      if (this.state.layers[i].id != this.state.currentLayerId) {
        for (var j = 0; j < this.state.layers[i].data.length; j++) {
          for (var k = 0; k < this.state.layers[i].data[j].length; k++) {
            context.fillStyle = tinycolor(this.state.layers[i].data[j][k]).setAlpha(.2)
            if (this.state.layers[i].data[j][k] != undefined) {
              context.fillRect(k*this.pd, j*this.pd, this.pd, this.pd);
            }
          }
        }
      }
    }
    for (var i = 0; i < this.state.saveState.length; i++) {
      for (var j = 0; j < this.state.saveState[i].length; j++) {
        context.fillStyle = this.state.saveState[i][j];
        if (this.state.saveState[i][j] != undefined) {
          context.fillRect(j*this.pd, i*this.pd, this.pd, this.pd);
        }
      }
    }
  }

  keyShortcuts(evt) {
    if(evt.keyCode === 90 && evt.ctrlKey && !evt.shiftKey) {
      var context = this.mainCanvas.current.getContext("2d");
      context.beginPath();
      this.drawGrid();
      context.clearRect(0, 0, 640, 640);

      if (this.history.length > 1) {
        var lastSave = this.history.pop();
        this.redos.push(lastSave)

        this.setState({saveState: JSON.parse(JSON.stringify(this.history[this.history.length-1]))}, () => {this.drawSave(context)});
      } else {
        this.setState({saveState: JSON.parse(JSON.stringify(this.history[this.history.length-1]))})
      }

      context.stroke();
    }

    if (evt.keyCode === 90 && evt.ctrlKey && evt.shiftKey) {
      var context = this.mainCanvas.current.getContext("2d");
      context.beginPath();
      this.drawGrid();
      context.clearRect(0, 0, 640, 640);

      if (this.redos.length > 0) {
        var redo = this.redos.pop()
        this.history.push(redo);

        this.setState({saveState: redo}, () => {this.drawSave(context)});
      } else {
        this.drawSave(context)
      }
      context.stroke();
    }
  }

  drawGrid() {
    //draw canvas grid
    var context = this.mainCanvas.current.getContext("2d");

    context.strokeStyle = "rgba(255, 255, 255)";
    context.lineWidth = 0.5;
    context.beginPath();
    for (var i = 0; i < this.state.gridDimensions[0] * this.state.gridDimensions[1]; i++) {
      context.moveTo(0, i*this.pd);
      context.lineTo(640, i*this.pd);
    }
    for (var i = 0; i < this.state.gridDimensions[0] * this.state.gridDimensions[1]; i++) {
      context.moveTo(i*this.pd, 0);
      context.lineTo(i*this.pd, 640);
    }
    context.stroke();
  }

  canvasMouseUp(evt) {
    this.setState({erasing: false});
    this.redos = [];
    this.brushAnchorPoint = null;
    if (this.state.painting || this.state.filling || this.state.sameColorFilling ||this.state.ditherPainting || this.state.lightening || this.state.saturating) {
      this.setState({painting: false, filling: false, sameColorFilling: false, ditherPainting: false, lightening: false, saturating: false}, () => {
        var context = this.mainCanvas.current.getContext("2d");
        context.beginPath();
        this.drawGrid();
        context.clearRect(0, 0, 640, 640);
        this.drawSave(context);
        this.history.push(JSON.parse(JSON.stringify(this.state.saveState)));
        context.stroke();
      });
    } else if (this.state.creatingRectangle) {
      this.setState({creatingRectangle: false, saveState: this.tempSave}, () => {
        var context = this.mainCanvas.current.getContext("2d");
        context.beginPath();
        this.drawGrid()
        context.clearRect(0, 0, 640, 640);
        this.drawSave(context);
        this.tempSave = JSON.parse(JSON.stringify(this.state.saveState));
        this.history.push(JSON.parse(JSON.stringify(this.state.saveState)));
        context.stroke();
      });
    } else if (this.state.creatingLine) {
      this.setState({creatingLine: false, saveState: this.tempSave}, () => {
        var context = this.mainCanvas.current.getContext("2d");
        context.beginPath();
        this.drawGrid()
        context.clearRect(0, 0, 640, 640);
        this.drawSave(context);
        this.tempSave = JSON.parse(JSON.stringify(this.state.saveState));
        this.history.push(JSON.parse(JSON.stringify(this.state.saveState)));
        context.stroke();
      });
    } else if (this.state.creatingCircle) {
      this.setState({creatingCircle: false, saveState: this.tempSave}, () => {
        var context = this.mainCanvas.current.getContext("2d");
        context.beginPath();
        this.drawGrid()
        context.clearRect(0, 0, 640, 640);
        this.drawSave(context);
        this.tempSave = JSON.parse(JSON.stringify(this.state.saveState));
        this.history.push(JSON.parse(JSON.stringify(this.state.saveState)));
        context.stroke();
      });
    } else if (this.state.moving) {
      this.setState({moving: false, saveState: this.tempSave, movePoint: ['','']}, () => {
        var context = this.mainCanvas.current.getContext("2d");
        context.beginPath();
        this.drawGrid()
        context.clearRect(0, 0, 640, 640);
        this.drawSave(context);
        this.tempSave = JSON.parse(JSON.stringify(this.state.saveState));
        this.history.push(JSON.parse(JSON.stringify(this.state.saveState)));
        context.stroke();
      });
    } else {
      this.history.push(JSON.parse(JSON.stringify(this.state.saveState)));
    }
    this.updateCurrentColors()

    //REMEMBER TO FIX REDO/UNDO BUG! HOW TO RECREATE BUG: DRAW THREE LINES. UNDO TWICE. REDO ONCE. DRAW ANOTHER LINE. UNDO TWICE.
  }

  canvasMouseDown(evt) {
    var mouseX = evt.pageX - this.mainCanvas.current.offsetLeft;
    var mouseY = evt.pageY - this.mainCanvas.current.offsetTop;
    var column;
    var row;
    if (this.state.usingTool == "BRUSH") {
      this.setState({painting: true});
      this.addPixel(mouseX, mouseY, false, evt.button);
    } else if (this.state.usingTool == "EYEDROPPER") {
      for (var i = 0; i < mouseX; i += Math.round(this.pd)) {
        column = i/Math.round(this.pd);
      }
      for (var i = 0; i < mouseY; i += Math.round(this.pd)) {
        row = i/Math.round(this.pd);
      }
      if (evt.button == 0) {
        if (this.state.saveState[row][column] == null) {
          this.setState({currentColor: '#ffffff', usingTool: "BRUSH"});
        } else {
          this.setState({currentColor: this.state.saveState[row][column], usingTool: "BRUSH"});
        }
      } else if (evt.button == 2) {
        if (this.state.saveState[row][column] == null) {
          this.setState({secondColor: '#ffffff', usingTool: "BRUSH"});
        } else {
          this.setState({secondColor: this.state.saveState[row][column], usingTool: "BRUSH"});
        }
      }
    } else if (this.state.usingTool == "ERASER") {
      this.setState({erasing: true});
      this.erase(mouseX, mouseY, false);
    } else if (this.state.usingTool == "BUCKET") {
      this.setState({filling: true});
      this.bucketFill(mouseX, mouseY, evt.button)
    } else if (this.state.usingTool == "BUCKETALL") {
      this.setState({sameColorFilling: true});
      this.sameColorFill(mouseX, mouseY, evt.button)
    } else if (this.state.usingTool == "RECT") {
      this.startRect(mouseX, mouseY, evt.button);
    } else if (this.state.usingTool == "LINE") {
      this.startLine(mouseX, mouseY, evt.button);
    } else if (this.state.usingTool == "CIRCLE") {
      this.startCircle(mouseX, mouseY, evt.button);
    } else if (this.state.usingTool == "DITHER") {
      this.setState({ditherPainting: true});
      this.addDither(mouseX, mouseY, true, evt.button);
    } else if (this.state.usingTool == "LIGHT") {
      this.setState({lightening: true});
      this.lighten(mouseX, mouseY, false, evt.button)
    } else if (this.state.usingTool == "SATURATE") {
      this.setState({saturating: true});
      this.lighten(mouseX, mouseY, false, evt.button)
    } else if (this.state.usingTool == "MOVE") {
      this.setState({moving: true});
      this.move(mouseX, mouseY)
    }
  }

  canvasMouseMove(evt) {
    if (this.state.painting) {
      this.addPixel(evt.pageX - this.mainCanvas.current.offsetLeft, evt.pageY - this.mainCanvas.current.offsetTop, true, evt.button);
    } else if (this.state.erasing) {
      this.erase(evt.pageX - this.mainCanvas.current.offsetLeft, evt.pageY - this.mainCanvas.current.offsetTop, true)
    } else if (this.state.filling) {
      this.bucketFill(evt.pageX - this.mainCanvas.current.offsetLeft, evt.pageY - this.mainCanvas.current.offsetTop)
    } else if (this.state.sameColorFilling) {
      this.sameColorFill(evt.pageX - this.mainCanvas.current.offsetLeft, evt.pageY - this.mainCanvas.current.offsetTop, null)
    } else if (this.state.creatingRectangle) {
      this.drawRect(evt.pageX - this.mainCanvas.current.offsetLeft, evt.pageY - this.mainCanvas.current.offsetTop);
    } else if (this.state.creatingLine) {
      this.drawLine(Math.round(this.lineAnchorPoint[0]), Math.round(this.lineAnchorPoint[1]), evt.pageX - this.mainCanvas.current.offsetLeft, evt.pageY - this.mainCanvas.current.offsetTop)
    } else if (this.state.creatingCircle) {
      this.drawCircle(this.circleAnchorPoint[0], this.circleAnchorPoint[1], evt.pageX - this.mainCanvas.current.offsetLeft, evt.pageY - this.mainCanvas.current.offsetTop)
    } else if (this.state.ditherPainting) {
      this.addDither(evt.pageX - this.mainCanvas.current.offsetLeft, evt.pageY - this.mainCanvas.current.offsetTop, true, evt.button);
    } else if (this.state.lightening) {
      this.lighten(evt.pageX - this.mainCanvas.current.offsetLeft, evt.pageY - this.mainCanvas.current.offsetTop, true, evt.button);
    } else if (this.state.saturating) {
      this.saturate(evt.pageX - this.mainCanvas.current.offsetLeft, evt.pageY - this.mainCanvas.current.offsetTop, true, evt.button);
    } else if (this.state.moving) {
      this.move(evt.pageX - this.mainCanvas.current.offsetLeft, evt.pageY - this.mainCanvas.current.offsetTop)
    } else {
      this.highlight(evt.pageX - this.mainCanvas.current.offsetLeft, evt.pageY - this.mainCanvas.current.offsetTop);
    }
  }

  addPixel(x, y, dragging, mouseButton) {
    this.setState({showingColorPicker: false, showingSecondColorPicker: false});
    var context = this.mainCanvas.current.getContext("2d");
    context.beginPath();
    if (mouseButton != this.lastMouseButton && dragging != true || this.lastMouseButton == null) {
      this.lastMouseButton = mouseButton
    }
    if (this.lastMouseButton == 0) {
      context.fillStyle = JSON.parse(JSON.stringify(this.state.currentColor));
    } else if (this.lastMouseButton == 2) {
      context.fillStyle = JSON.parse(JSON.stringify(this.state.secondColor));
    }
    var column = Math.floor(x / this.pd) * this.pd;
    var row =  Math.floor(y / this.pd) * this.pd;

    var tempSave = this.state.saveState;
    if (tempSave[Math.round(row/this.pd)] != undefined) {
      tempSave[Math.round(row/this.pd)][Math.round(column/this.pd)] = context.fillStyle;
    }
    context.fillRect(column, row, this.pd, this.pd);
    if (this.brushAnchorPoint != null) {
      var deltax = Math.abs(Math.round(column/this.pd) - this.brushAnchorPoint[0]);
      var deltay = Math.abs(Math.round(row/this.pd) - this.brushAnchorPoint[1]);
      var sx = (this.brushAnchorPoint[0] < Math.round(column/this.pd)) ? 1 : -1;
      var sy = (this.brushAnchorPoint[1] < Math.round(row/this.pd)) ? 1 : -1;
      var err = deltax - deltay;

      while(true) {
        context.fillRect(this.brushAnchorPoint[0]*this.pd, this.brushAnchorPoint[1]*this.pd, this.pd, this.pd)
        if (tempSave[Math.round(this.brushAnchorPoint[1])] != undefined) {
          tempSave[Math.round(this.brushAnchorPoint[1])][Math.round(this.brushAnchorPoint[0])] = JSON.parse(JSON.stringify(context.fillStyle));
        }
        if ((this.brushAnchorPoint[0] === Math.round(column/this.pd)) && (this.brushAnchorPoint[1] === Math.round(row/this.pd))) {
          break;
        }
        var e2 = 2*err;
        if (e2 > -deltay) {
          err -= deltay; this.brushAnchorPoint[0] += sx;
        }
        if (e2 < deltax) {
          err += deltax; this.brushAnchorPoint[1] += sy;
        }
      }
    }
    this.brushAnchorPoint = [Math.round(column/this.pd), Math.round(row/this.pd)]
    this.setState({saveState: tempSave});
    context.stroke();
  }

  erase(x, y, dragging) {
    this.setState({showingColorPicker: false, showingSecondColorPicker: false});
    var context = this.mainCanvas.current.getContext("2d");
    context.beginPath();
    var column = Math.floor(x / this.pd) * this.pd;
    var row =  Math.floor(y / this.pd) * this.pd;

    var tempSave = this.state.saveState
    tempSave[Math.round(row/this.pd)][Math.round(column/this.pd)] = undefined;
    this.setState({saveState: tempSave})
    this.drawGrid()
    context.clearRect(0, 0, 640, 640);
    this.drawSave(context)
    context.stroke();
  }

  bucketFill(x, y, mouseButton) {
    this.setState({showingColorPicker: false, showingSecondColorPicker: false});
    var tempSave = this.state.saveState;
    var column = Math.floor(x / this.pd);
    var row =  Math.floor(y / this.pd);

    if (mouseButton == 0) {
      this.fillSides(column, row, this.state.saveState[Math.round(row)][Math.round(column)], this.state.currentColor, tempSave);
    } else if (mouseButton == 2) {
      this.fillSides(column, row, this.state.saveState[Math.round(row)][Math.round(column)], this.state.secondColor, tempSave);
    }

  }

  fillSides(x, y, affectedColor, fillingColor, tempSave) {
    if (affectedColor != fillingColor) {
      var context = this.mainCanvas.current.getContext("2d");
      tempSave[Math.round(y)][Math.round(x)] = fillingColor;
      context.fillStyle = fillingColor;
      context.beginPath();
      context.fillRect(x*this.pd, y*this.pd, this.pd, this.pd);
      context.stroke();
      if (y < this.state.gridDimensions[0]-1 && tempSave[Math.round(y+1)] != undefined && tempSave[Math.round(y+1)][Math.round(x)] == affectedColor) {
        this.fillSides(x, y+1, affectedColor, fillingColor, tempSave);
      }
      if (y > 0 && tempSave[Math.round(y-1)] != undefined && tempSave[Math.round(y)-1][Math.round(x)] == affectedColor) {
        this.fillSides(x, y-1, affectedColor, fillingColor, tempSave);
      }
      if (x < this.state.gridDimensions[1]-1 && tempSave[Math.round(y)][Math.round(x)+1] == affectedColor) {
        this.fillSides(x+1, y, affectedColor, fillingColor, tempSave);
      }
      if (x > 0 && tempSave[Math.round(y)][Math.round(x)-1] == affectedColor) {
        this.fillSides(x-1, y, affectedColor, fillingColor, tempSave);
      } else {
        this.setState({saveState: tempSave});
      }
    }
  }

  sameColorFill(x, y, mouseButton) {
    this.setState({showingColorPicker: false, showingSecondColorPicker: false});
    var context = this.mainCanvas.current.getContext("2d");
    var tempSave = this.state.saveState;
    var column = Math.floor(x / this.pd);
    var row =  Math.floor(y / this.pd);

    if (mouseButton == 0) {
      context.fillStyle = JSON.parse(JSON.stringify(this.state.currentColor));
    } else if (mouseButton == 2) {
      context.fillStyle = JSON.parse(JSON.stringify(this.state.secondColor));
    }

    var affectedColor = this.state.saveState[Math.round(row)][Math.round(column)];

    for (var i = 0; i < tempSave.length; i++) {
      for (var j = 0; j < tempSave[i].length; j++) {
        if (tempSave[i][j] == affectedColor) {
          tempSave[i][j] = context.fillStyle;
          context.fillRect(j*this.pd, i*this.pd, this.pd, this.pd);
        }
      }
    }
    this.setState({saveState: tempSave});
  }

  startRect(x, y, mouseButton) {
    this.setState({showingColorPicker: false, showingSecondColorPicker: false});
    var context = this.mainCanvas.current.getContext("2d");
    context.beginPath();
    var column = Math.floor(x / this.pd);
    var row =  Math.floor(y / this.pd);

    this.lastMouseButton = mouseButton;

    if (mouseButton == 0) {
      context.fillStyle = JSON.parse(JSON.stringify(this.state.currentColor));
    } else if (mouseButton = 2) {
      context.fillStyle = JSON.parse(JSON.stringify(this.state.secondColor));
    }
    var tempSave = this.state.saveState
    tempSave[Math.round(row)][Math.round(column)] = context.fillStyle;
    context.fillRect(column*this.pd, row*this.pd, this.pd, this.pd);
    context.stroke();
    this.rectAnchorPoint = [column, row];
    this.setState({creatingRectangle: true, saveState: tempSave})
  }

  drawRect(x, y) {
    var context = this.mainCanvas.current.getContext("2d");
    context.beginPath();
    var column = Math.floor(x / this.pd);
    var row =  Math.floor(y / this.pd);

    if (this.state.rectCorner[0] != column || this.state.rectCorner[1] != row) {
      this.tempSave = JSON.parse(JSON.stringify(this.state.saveState));
      this.setState({rectCorner: [column, row]});
      this.drawGrid();
      context.clearRect(0, 0, 640, 640);
      this.drawSave(context);

      this.tempSave[Math.round(row)][Math.round(column)] = context.fillStyle;
      context.fillRect(column*this.pd, row*this.pd, this.pd, this.pd);

      if (this.lastMouseButton == 0) {
        context.fillStyle = JSON.parse(JSON.stringify(this.state.currentColor));
      } else if (this.lastMouseButton == 2) {
        context.fillStyle = JSON.parse(JSON.stringify(this.state.secondColor));
      }

      if (this.rectAnchorPoint[0] <= column) {
        for (var i = this.rectAnchorPoint[0]; i <= column; i++) {
          context.fillRect(i*this.pd, row*this.pd, this.pd, this.pd);
          context.fillRect(i*this.pd, this.rectAnchorPoint[1]*this.pd, this.pd, this.pd);
          this.tempSave[Math.round(row)][Math.round(i)] = JSON.parse(JSON.stringify(context.fillStyle));
          this.tempSave[Math.round(this.rectAnchorPoint[1])][Math.round(i)] = JSON.parse(JSON.stringify(context.fillStyle));
        }
      } else if (this.rectAnchorPoint[0] >= column) {
        for (var i = this.rectAnchorPoint[0]; i >= column; i--) {
          context.fillRect(i*this.pd, row*this.pd, this.pd, this.pd);
          context.fillRect(i*this.pd, this.rectAnchorPoint[1]*this.pd, this.pd, this.pd);
          this.tempSave[Math.round(row)][Math.round(i)] = JSON.parse(JSON.stringify(context.fillStyle));
          this.tempSave[Math.round(this.rectAnchorPoint[1])][Math.round(i)] = JSON.parse(JSON.stringify(context.fillStyle));
        }
      }

      if (this.rectAnchorPoint[1] <= row) {
        for (var i = this.rectAnchorPoint[1]; i <= row; i++) {
          context.fillRect(column*this.pd, i*this.pd, this.pd, this.pd);
          context.fillRect(this.rectAnchorPoint[0]*this.pd, i*this.pd, this.pd, this.pd);
          this.tempSave[Math.round(i)][Math.round(column)] = JSON.parse(JSON.stringify(context.fillStyle));
          this.tempSave[Math.round(i)][Math.round(this.rectAnchorPoint[0])] = JSON.parse(JSON.stringify(context.fillStyle));
        }
      } else if (this.rectAnchorPoint[1] >= row) {
        for (var i = this.rectAnchorPoint[1]; i >= row; i--) {
          context.fillRect(column*this.pd, i*this.pd, this.pd, this.pd);
          context.fillRect(this.rectAnchorPoint[0]*this.pd, i*this.pd, this.pd, this.pd);
          this.tempSave[Math.round(i)][Math.round(column)] = JSON.parse(JSON.stringify(context.fillStyle));
          this.tempSave[Math.round(i)][Math.round(this.rectAnchorPoint[0])] = JSON.parse(JSON.stringify(context.fillStyle));
        }
      }

    }
    context.stroke();
  }

  startLine (x, y, mouseButton) {
    this.setState({showingColorPicker: false, showingSecondColorPicker: false});
    var context = this.mainCanvas.current.getContext("2d");
    context.beginPath();
    var column = Math.floor(x / this.pd);
    var row =  Math.floor(y / this.pd);

    this.lastMouseButton = mouseButton;

    if (mouseButton == 0) {
      context.fillStyle = JSON.parse(JSON.stringify(this.state.currentColor));
    } else if (mouseButton == 2) {
      context.fillStyle = JSON.parse(JSON.stringify(this.state.secondColor));
    }

    var tempSave = this.state.saveState
    tempSave[Math.round(row)][Math.round(column)] = context.fillStyle;
    context.fillRect(column*this.pd, row*this.pd, this.pd, this.pd);
    context.stroke();
    this.lineAnchorPoint = [column, row];
    this.setState({creatingLine: true, saveState: tempSave})
  }

  drawLine(x0, y0, x1, y1) {
    var context = this.mainCanvas.current.getContext("2d");
    context.beginPath();
    var x;
    var y;
    for (var i = 0; i < x1; i += this.pd) {
      x = i/this.pd;
    }
    for (var i = 0; i < y1; i += this.pd) {
      y = i/this.pd;
    }

    if (this.state.lineEnd[0] != x || this.state.lineEnd[1] != y && y <= this.state.gridDimensions[0]-1) {
      this.tempSave = JSON.parse(JSON.stringify(this.state.saveState));
      this.setState({lineEnd: [x, y]});
      this.drawGrid();
      context.clearRect(0, 0, 640, 640);
      this.drawSave(context);

      if (this.lastMouseButton == 0) {
        context.fillStyle = JSON.parse(JSON.stringify(this.state.currentColor));
      } else if (this.lastMouseButton == 2) {
        context.fillStyle = JSON.parse(JSON.stringify(this.state.secondColor));
      }
      //Bresenham's Algorithm
      var deltax = Math.abs(Math.round(x) - x0);
      var deltay = Math.abs(Math.round(y) - y0);
      var sx = (x0 < Math.round(x)) ? 1 : -1;
      var sy = (y0 < Math.round(y)) ? 1 : -1;
      var err = deltax - deltay;

      while(true) {
        context.fillRect(x0*this.pd, y0*this.pd, this.pd, this.pd)
        this.tempSave[y0][x0] = JSON.parse(JSON.stringify(context.fillStyle));
        if ((x0 === Math.round(x)) && (y0 === Math.round(y))) {
          break;
        }
        var e2 = 2*err;
        if (e2 > -deltay) {
          err -= deltay; x0  += sx;
        }
        if (e2 < deltax) {
          err += deltax; y0  += sy;
        }
      }
    }
    context.stroke();
  }

  startCircle(x, y, mouseButton) {
    this.setState({showingColorPicker: false, showingSecondColorPicker: false});
    var column = Math.floor(x / this.pd);
    var row =  Math.floor(y / this.pd);
    this.lastMouseButton = mouseButton;

    this.circleAnchorPoint = [column, row];
    this.setState({creatingCircle: true})
  }

  drawCircle(x0, y0, x1, y1) { //FIX ERRORS WITH CANVAS SIZE
    var context = this.mainCanvas.current.getContext("2d");
    context.beginPath();
    var x;
    var y;
    for (var i = 0; i < x1; i += this.pd) {
      x = i/this.pd
    }
    for (var i = 0; i < y1; i += this.pd) {
      y = i/this.pd
    }

    if (this.state.circleCorner[0] != x || this.state.circleCorner[1] != y && y <= this.state.gridDimensions[1]-1) {
      this.tempSave = JSON.parse(JSON.stringify(this.state.saveState));
      this.setState({circleCorner: [x, y]});
      this.drawGrid();
      context.clearRect(0, 0, 640, 640);
      this.drawSave(context);

      if (this.lastMouseButton == 0) {
        context.fillStyle = JSON.parse(JSON.stringify(this.state.currentColor));
      } else if (this.lastMouseButton == 2) {
        context.fillStyle = JSON.parse(JSON.stringify(this.state.secondColor));
      }
      this.ellipse(context, x0, y0, x, y)
    }
  }
  ellipse(context, x0, y0, x1, y1) {
    this.drawGrid();
    var temp;
    if (x1 < x0) {
      temp = x1;
      x1 = x0;
      x0 = temp;
    }
    if (y1 < y0) {
      temp = y1;
      y1 = y0;
      y0 = temp;
    }
    var xC = Math.round((x0 + x1) / 2);
    var yC = Math.round((y0 + y1) / 2);
    var evenX = (x0 + x1) % 2;
    var evenY = (y0 + y1) % 2;
    var rX = x1 - xC;
    var rY = y1 - yC;

    var x;
    var y;
    var angle;
    var r;

    for (x = x0 ; x <= xC ; x++) {
      angle = Math.acos((x - xC) / rX);
      y = Math.round(rY * Math.sin(angle) + yC);
      if (y) {
        context.fillRect((x - evenX)*this.pd, y*this.pd, this.pd, this.pd);
        context.fillRect((x - evenX)*this.pd, (2 * yC - y - evenY)*this.pd, this.pd, this.pd);
        context.fillRect((2 * xC - x)*this.pd, y*this.pd, this.pd, this.pd);
        context.fillRect((2 * xC - x)*this.pd, (2 * yC - y - evenY)*this.pd, this.pd, this.pd);
        this.tempSave[Math.round(y)][Math.round(x - evenX)] = context.fillStyle
        this.tempSave[Math.round(2 * yC - y - evenY)][Math.round(x - evenX)] = context.fillStyle
        this.tempSave[Math.round(y)][Math.round(2 * xC - x)] = context.fillStyle
        this.tempSave[Math.round(2 * yC - y - evenY)][Math.round(2 * xC - x)] = context.fillStyle
      }
    }
    for (y = y0 ; y <= yC ; y++) {
      angle = Math.asin((y - yC) / rY);
      x = Math.round(rX * Math.cos(angle) + xC);
      if (x) {
        context.fillRect(x*this.pd, (y - evenY)*this.pd, this.pd, this.pd)
        context.fillRect((2 * xC - x - evenX)*this.pd, (y - evenY)*this.pd, this.pd, this.pd)
        context.fillRect(x*this.pd, (2 * yC - y)*this.pd, this.pd, this.pd)
        context.fillRect((2 * xC - x - evenX)*this.pd, (2 * yC - y)*this.pd, this.pd, this.pd)
        this.tempSave[Math.round(y - evenY)][Math.round(x)] = context.fillStyle
        this.tempSave[Math.round(y - evenY)][Math.round(2 * xC - x - evenX)] = context.fillStyle
        this.tempSave[Math.round((2 * yC - y))][Math.round(x)] = context.fillStyle
        this.tempSave[Math.round(2 * yC - y)][Math.round(2 * xC - x - evenX)] = context.fillStyle
      }
    }
  }

  addDither(x, y, dragging, mouseButton) {
    this.setState({showingColorPicker: false, showingSecondColorPicker: false});
    var context = this.mainCanvas.current.getContext("2d");
    context.beginPath();
    if (mouseButton != this.lastMouseButton && dragging != true || this.lastMouseButton == null) {
      this.lastMouseButton = mouseButton
    }
    if (this.lastMouseButton == 0) {
      context.fillStyle = JSON.parse(JSON.stringify(this.state.currentColor));
    } else if (this.lastMouseButton == 2) {
      context.fillStyle = JSON.parse(JSON.stringify(this.state.secondColor));
    }
    var column = Math.floor(x / this.pd) * this.pd;
    var row =  Math.floor(y / this.pd) * this.pd;

    var tempSave = this.state.saveState
    if (Math.round(row/this.pd) % 2 == 0 && Math.round(column/this.pd) % 2 != 0) {
      tempSave[Math.round(row/this.pd)][Math.round(column/this.pd)] = context.fillStyle;
      context.fillRect(column, row, this.pd, this.pd);
    } else if (Math.round(row/this.pd) % 2 != 0 && Math.round(column/this.pd) % 2 == 0) {
      tempSave[Math.round(row/this.pd)][Math.round(column/this.pd)] = context.fillStyle;
      context.fillRect(column, row, this.pd, this.pd);
    } else {
      context.fillStyle = JSON.parse(JSON.stringify(this.state.secondColor));
      tempSave[Math.round(row/this.pd)][Math.round(column/this.pd)] = context.fillStyle;
      context.fillRect(column, row, this.pd, this.pd);
      context.fillStyle = JSON.parse(JSON.stringify(this.state.currentColor));
    }

    if (this.brushAnchorPoint != null) {
      var deltax = Math.abs(Math.round(column/this.pd) - this.brushAnchorPoint[0]);
      var deltay = Math.abs(Math.round(row/this.pd) - this.brushAnchorPoint[1]);
      var sx = (this.brushAnchorPoint[0] < Math.round(column/this.pd)) ? 1 : -1;
      var sy = (this.brushAnchorPoint[1] < Math.round(row/this.pd)) ? 1 : -1;
      var err = deltax - deltay;

      while(true) {
        if (Math.round(this.brushAnchorPoint[1]) % 2 == 0 && Math.round(this.brushAnchorPoint[0]) % 2 != 0) {
          tempSave[Math.round(this.brushAnchorPoint[1])][Math.round(this.brushAnchorPoint[0])] = context.fillStyle;
          context.fillRect(this.brushAnchorPoint[0]*this.pd, this.brushAnchorPoint[1]*this.pd, this.pd, this.pd);
        } else if (Math.round(this.brushAnchorPoint[1]) % 2 != 0 && Math.round(this.brushAnchorPoint[0]) % 2 == 0) {
          tempSave[Math.round(this.brushAnchorPoint[1])][Math.round(this.brushAnchorPoint[0])] = context.fillStyle;
          context.fillRect(this.brushAnchorPoint[0]*this.pd, this.brushAnchorPoint[1]*this.pd, this.pd, this.pd);
        } else {
          context.fillStyle = JSON.parse(JSON.stringify(this.state.secondColor));
          tempSave[Math.round(this.brushAnchorPoint[1])][Math.round(this.brushAnchorPoint[0])] = context.fillStyle;
          context.fillRect(this.brushAnchorPoint[0]*this.pd, this.brushAnchorPoint[1]*this.pd, this.pd, this.pd);
          context.fillStyle = JSON.parse(JSON.stringify(this.state.currentColor));
        }

        if (Math.round(row/this.pd) % 2 == 0 && Math.round(column/this.pd) % 2 != 0) {
          tempSave[Math.round(row/this.pd)][Math.round(column/this.pd)] = context.fillStyle;
          context.fillRect(column, row, this.pd, this.pd);
        } else if (Math.round(row/this.pd) % 2 != 0 && Math.round(column/this.pd) % 2 == 0) {
          tempSave[Math.round(row/this.pd)][Math.round(column/this.pd)] = context.fillStyle;
          context.fillRect(column, row, this.pd, this.pd);
        } else {
          context.fillStyle = JSON.parse(JSON.stringify(this.state.secondColor));
          tempSave[Math.round(row/this.pd)][Math.round(column/this.pd)] = context.fillStyle;
          context.fillRect(column, row, this.pd, this.pd);
          context.fillStyle = JSON.parse(JSON.stringify(this.state.currentColor));
        }

        if ((this.brushAnchorPoint[0] === Math.round(column/this.pd)) && (this.brushAnchorPoint[1] === Math.round(row/this.pd))) {
          break;
        }
        var e2 = 2*err;
        if (e2 > -deltay) {
          err -= deltay; this.brushAnchorPoint[0] += sx;
        }
        if (e2 < deltax) {
          err += deltax; this.brushAnchorPoint[1] += sy;
        }
      }
    }
    this.brushAnchorPoint = [Math.round(column/this.pd), Math.round(row/this.pd)]
    this.setState({saveState: tempSave});
    context.stroke();
  }

  lighten(x, y, dragging, mouseButton) {
    this.setState({showingColorPicker: false, showingSecondColorPicker: false});
    var context = this.mainCanvas.current.getContext("2d");
    context.beginPath();
    if (mouseButton != this.lastMouseButton && dragging != true || this.lastMouseButton == null) {
      this.lastMouseButton = mouseButton
    }
    var tempSave = this.state.saveState
    var column = Math.floor(x / this.pd) * this.pd;
    var row =  Math.floor(y / this.pd) * this.pd;

    if (this.lastMouseButton == 0) {
      context.fillStyle = tinycolor(this.state.saveState[row/this.pd][column/this.pd]).lighten(this.lightingInt/10).toString()
    } else if (this.lastMouseButton == 2) {
      context.fillStyle = tinycolor(this.state.saveState[row/this.pd][column/this.pd]).darken(this.lightingInt/10).toString()
    }
    context.fillRect(column, row, this.pd, this.pd)
    tempSave[row/this.pd][column/this.pd] = context.fillStyle

    if (this.brushAnchorPoint != null) {
      var deltax = Math.abs(Math.round(column/this.pd) - this.brushAnchorPoint[0]);
      var deltay = Math.abs(Math.round(row/this.pd) - this.brushAnchorPoint[1]);
      var sx = (this.brushAnchorPoint[0] < Math.round(column/this.pd)) ? 1 : -1;
      var sy = (this.brushAnchorPoint[1] < Math.round(row/this.pd)) ? 1 : -1;
      var err = deltax - deltay;

      while(true) {
        if (this.lastMouseButton == 0) {
          context.fillStyle = tinycolor(tempSave[this.brushAnchorPoint[1]][this.brushAnchorPoint[0]]).lighten(this.lightingInt/10).toString()
        } else if (this.lastMouseButton == 2) {
          context.fillStyle = tinycolor(tempSave[this.brushAnchorPoint[1]][this.brushAnchorPoint[0]]).darken(this.lightingInt/10).toString()
        }
        if (this.brushAnchorPoint[1] != row/this.pd && this.brushAnchorPoint[0] != column/this.pd) {
          tempSave[Math.round(this.brushAnchorPoint[1])][Math.round(this.brushAnchorPoint[0])] = context.fillStyle;
          context.fillRect(this.brushAnchorPoint[0]*this.pd, this.brushAnchorPoint[1]*this.pd, this.pd, this.pd);
        }
        if ((this.brushAnchorPoint[0] === Math.round(column/this.pd)) && (this.brushAnchorPoint[1] === Math.round(row/this.pd))) {
          break;
        }
        var e2 = 2*err;
        if (e2 > -deltay) {
          err -= deltay; this.brushAnchorPoint[0] += sx;
        }
        if (e2 < deltax) {
          err += deltax; this.brushAnchorPoint[1] += sy;
        }
      }
    }

    this.brushAnchorPoint = [Math.round(column/this.pd), Math.round(row/this.pd)]
    this.setState({saveState: tempSave});
    context.stroke();
  }

  saturate(x, y, dragging, mouseButton) {
    this.setState({showingColorPicker: false, showingSecondColorPicker: false});
    var context = this.mainCanvas.current.getContext("2d");
    context.beginPath();
    if (mouseButton != this.lastMouseButton && dragging != true || this.lastMouseButton == null) {
      this.lastMouseButton = mouseButton
    }
    var tempSave = this.state.saveState
    var column = Math.floor(x / this.pd) * this.pd;
    var row =  Math.floor(y / this.pd) * this.pd;

    if (this.lastMouseButton == 0) {
      context.fillStyle = tinycolor(this.state.saveState[row/this.pd][column/this.pd]).saturate(this.saturatingInt/10).toString()
    } else if (this.lastMouseButton == 2) {
      context.fillStyle = tinycolor(this.state.saveState[row/this.pd][column/this.pd]).desaturate(this.saturatingInt/10).toString()
    }
    context.fillRect(column, row, this.pd, this.pd)
    tempSave[row/this.pd][column/this.pd] = context.fillStyle

    if (this.brushAnchorPoint != null) {
      var deltax = Math.abs(Math.round(column/this.pd) - this.brushAnchorPoint[0]);
      var deltay = Math.abs(Math.round(row/this.pd) - this.brushAnchorPoint[1]);
      var sx = (this.brushAnchorPoint[0] < Math.round(column/this.pd)) ? 1 : -1;
      var sy = (this.brushAnchorPoint[1] < Math.round(row/this.pd)) ? 1 : -1;
      var err = deltax - deltay;

      while(true) {
        if (this.lastMouseButton == 0) {
          context.fillStyle = tinycolor(tempSave[this.brushAnchorPoint[1]][this.brushAnchorPoint[0]]).saturate(this.saturatingInt/10).toString()
        } else if (this.lastMouseButton == 2) {
          context.fillStyle = tinycolor(tempSave[this.brushAnchorPoint[1]][this.brushAnchorPoint[0]]).desaturate(this.saturatingInt/10).toString()
        }
        if (this.brushAnchorPoint[1] != row/this.pd && this.brushAnchorPoint[0] != column/this.pd) {
          tempSave[Math.round(this.brushAnchorPoint[1])][Math.round(this.brushAnchorPoint[0])] = context.fillStyle;
          context.fillRect(this.brushAnchorPoint[0]*this.pd, this.brushAnchorPoint[1]*this.pd, this.pd, this.pd);
        }
        if ((this.brushAnchorPoint[0] === Math.round(column/this.pd)) && (this.brushAnchorPoint[1] === Math.round(row/this.pd))) {
          break;
        }
        var e2 = 2*err;
        if (e2 > -deltay) {
          err -= deltay; this.brushAnchorPoint[0] += sx;
        }
        if (e2 < deltax) {
          err += deltax; this.brushAnchorPoint[1] += sy;
        }
      }
    }

    this.brushAnchorPoint = [Math.round(column/this.pd), Math.round(row/this.pd)]
    this.setState({saveState: tempSave});
    context.stroke();
  }

  move(x, y) {
    this.setState({showingColorPicker: false, showingSecondColorPicker: false});
    var context = this.mainCanvas.current.getContext("2d");
    context.beginPath();
    var column = Math.floor(x / this.pd);
    var row =  Math.floor(y / this.pd);

    if (this.state.movePoint[0] != column || this.state.movePoint[1] != row && row <= this.state.gridDimensions[1]-1) {
      this.tempSave = JSON.parse(JSON.stringify(this.state.saveState));
      if (this.state.movePoint[0] != "") {
        if (column > this.state.movePoint[0] && row == this.state.movePoint[1]) {
          this.moveImage(1, 0, context)
        } else if (column < this.state.movePoint[0] && row == this.state.movePoint[1]) {
          this.moveImage(-1, 0, context)
        } else if (column == this.state.movePoint[0] && row < this.state.movePoint[1]) {
          this.moveImage(0, -1, context)
        } else if (column == this.state.movePoint[0] && row > this.state.movePoint[1]) {
          this.moveImage(0, 1, context)
        } else if (column > this.state.movePoint[0] && row > this.state.movePoint[1]) {
          this.moveImage(1, 1, context)
        } else if (column < this.state.movePoint[0] && row > this.state.movePoint[1]) {
          this.moveImage(-1, 1, context)
        } else if (column > this.state.movePoint[0] && row < this.state.movePoint[1]) {
          this.moveImage(1, -1, context)
        } else if (column < this.state.movePoint[0] && row < this.state.movePoint[1]) {
          this.moveImage(-1, -1, context)
        }
      }
      this.setState({movePoint: [column, row], saveState: this.tempSave});
      this.drawGrid();
      context.clearRect(0, 0, 640, 640);
      context.stroke()
      this.drawSave(context);
    }
  }

  moveImage(x, y, context) {
    for (var i = 0; i < this.state.saveState.length; i++) {
      for (var j = 0; j < this.state.saveState[i].length; j++) {
        if (this.tempSave[i+y] != undefined) {
          this.tempSave[i+y][j+x] = this.state.saveState[i][j]
          context.fillStyle = this.state.saveState[i][j]
          context.fillRect((j+x)*this.pd, (i+x)*this.pd, this.pd, this.pd)
          if (x == 1 && y == 1) {
            for (var k = 0; k < 32; k++) {
              this.tempSave[k][0] = null;
            }
          } else if (x == 1 && y == -1) {
            for (var k = 0; k < 32; k++) {
              this.tempSave[k][0] = null;
            }
          } else if (y == -1) {
            for (var k = 0; k < 32; k++) {
              this.tempSave[31][k] = null;
            }
          } else if (y == 1) {
            for (var k = 0; k < 32; k++) {
              this.tempSave[0][k] = null;
            }
          } else if (x == 1) {
            for (var k = 0; k < 32; k++) {
              this.tempSave[k][0] = null;
            }
          }
        }
      }
    }
    this.setState({saveState: this.tempSave}, () => {
      this.drawGrid();
      context.clearRect(0, 0, 640, 640);
      context.stroke()
      this.drawSave(context);
    });
  }

  vertFlip() {
    this.setState({showingColorPicker: false, showingSecondColorPicker: false, transforming: false});
    var context = this.mainCanvas.current.getContext("2d");
    context.beginPath();
    this.tempSave = JSON.parse(JSON.stringify(this.state.saveState));

    if (this.state.gridDimensions[1] % 2 == 0) {
      var c1 = this.state.gridDimensions[1] / 2;
      var c2 = c1 - 1
      var distance;
      for (var i = 0; i < this.state.saveState.length; i++) {
        for (var j = 0; j < this.state.saveState[i].length; j++) {
          if (j < c1) {
            distance = c2 - j;
            this.tempSave[i][c1+distance] = this.state.saveState[i][j]
          } else if (j >= c1) {
            distance = j - c1;
            this.tempSave[i][c2-distance] = this.state.saveState[i][j]
          }
        }
      }
    } else {
      var c1 = this.state.gridDimensions[1] / 2 - 0.5;
      var distance;
      for (var i = 0; i < this.state.saveState.length; i++) {
        for (var j = 0; j < this.state.saveState[i].length; j++) {
          if (j < c1) {
            distance = c1 - j;
            this.tempSave[i][c1+distance] = this.state.saveState[i][j]
          } else if (j >= c1) {
            distance = j - c1;
            this.tempSave[i][c1-distance] = this.state.saveState[i][j]
          }
        }
      }
    }
    this.setState({saveState: this.tempSave}, () => {
      this.drawGrid();
      context.clearRect(0, 0, 640, 640);
      this.drawSave(context);
      this.tempSave = JSON.parse(JSON.stringify(this.state.saveState));
      this.history.push(JSON.parse(JSON.stringify(this.state.saveState)));
      context.stroke();
    });
  }

  horoFlip() {
    this.setState({showingColorPicker: false, showingSecondColorPicker: false, transforming: false});
    var context = this.mainCanvas.current.getContext("2d");
    context.beginPath();
    this.tempSave = JSON.parse(JSON.stringify(this.state.saveState));

    if (this.state.gridDimensions[0] % 2 == 0) {
      var c1 = this.state.gridDimensions[0] / 2;
      var c2 = c1 - 1
      var distance;
      for (var i = 0; i < this.state.saveState.length; i++) {
        for (var j = 0; j < this.state.saveState[i].length; j++) {
          if (i < c1) {
            distance = c2 - i;
            this.tempSave[c1+distance][j] = this.state.saveState[i][j]
          } else if (i >= c1) {
            distance = i - c1;
            this.tempSave[c2-distance][j] = this.state.saveState[i][j]
          }
        }
      }
    } else {
      var c1 = this.state.gridDimensions[0] / 2 - 0.5;
      var distance;
      for (var i = 0; i < this.state.saveState.length; i++) {
        for (var j = 0; j < this.state.saveState[i].length; j++) {
          if (i < c1) {
            distance = c1 - i;
            this.tempSave[c1+distance][j] = this.state.saveState[i][j]
          } else if (i >= c1) {
            distance = i - c1;
            this.tempSave[c1-distance][j] = this.state.saveState[i][j]
          }
        }
      }
    }
    this.setState({saveState: this.tempSave}, () => {
      this.drawGrid();
      context.clearRect(0, 0, 640, 640);
      this.drawSave(context);
      this.tempSave = JSON.parse(JSON.stringify(this.state.saveState));
      this.history.push(JSON.parse(JSON.stringify(this.state.saveState)));
      context.stroke();
    });
  }

  highlight(x, y) {
    this.setState({showingColorPicker: false, showingSecondColorPicker: false});
    var context = this.mainCanvas.current.getContext("2d");
    context.beginPath();

    // column and row are rounded up x, y (to nearest pixel dimension)
    var column = Math.floor(x / this.pd) * this.pd;
    var row =  Math.floor(y / this.pd) * this.pd;

    if (this.state.saveState[row/this.pd]) {
      if (this.state.saveState[row/this.pd][column/this.pd] == null) {
        context.fillStyle = tinycolor('white').darken(9).toString()
      } else if (tinycolor(this.state.saveState[row/this.pd][column/this.pd]).isDark()) {
        context.fillStyle = tinycolor(this.state.saveState[row/this.pd][column/this.pd]).lighten(10).toString();
      } else {
        context.fillStyle = tinycolor(this.state.saveState[row/this.pd][column/this.pd]).darken(10).toString();
      }
    }

    context.fillRect(column, row, this.pd, this.pd)

    if (this.brushAnchorPoint != null) {
      var deltax = Math.abs(Math.round(column/this.pd) - this.brushAnchorPoint[0]);
      var deltay = Math.abs(Math.round(row/this.pd) - this.brushAnchorPoint[1]);
      var sx = (this.brushAnchorPoint[0] < Math.round(column/this.pd)) ? 1 : -1;
      var sy = (this.brushAnchorPoint[1] < Math.round(row/this.pd)) ? 1 : -1;
      var err = deltax - deltay;

      while(true) {
        if (this.brushAnchorPoint[1] != row/this.pd && this.brushAnchorPoint[0] != column/this.pd) {
          context.fillRect(this.brushAnchorPoint[0]*this.pd, this.brushAnchorPoint[1]*this.pd, this.pd, this.pd);
        }
        if ((this.brushAnchorPoint[0] === Math.round(column/this.pd)) && (this.brushAnchorPoint[1] === Math.round(row/this.pd))) {
          break;
        }
        var e2 = 2*err;
        if (e2 > -deltay) {
          err -= deltay; this.brushAnchorPoint[0] += sx;
        }
        if (e2 < deltax) {
          err += deltax; this.brushAnchorPoint[1] += sy;
        }
      }
    }

    if (this.state.highlight[0] != column || this.state.highlight[1] != row) {
      this.setState({highlight: [column, row]}, () => {
        this.brushAnchorPoint = [Math.round(column/this.pd), Math.round(row/this.pd)]
        this.drawGrid();
        context.clearRect(0, 0, 640, 640);
        this.drawSave(context);
        context.stroke();
      });
    }
  }

}
