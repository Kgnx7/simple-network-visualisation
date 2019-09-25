// // # ==================================================================
// // # Algorithm
// // # ==================================================================

// Dijkstra’s shortest path algorithm 
// probably ... 

// // # ==================================================================
// // # GUI
// // # ==================================================================

import SVG from "svg.js";

class GUI {
  constructor() {
    this._svgWrapper = document.getElementById("surface");
  } 
  
  init = () => {
    if (SVG.supported) {
      this._svg = new _SVG(this._svgWrapper);
      this._svg.render();
    } else {
      this._svgWrapper.textContent = 'SVG not supported';
    }
  }
}

class _SVG {
  constructor(svgWrapper) {
    this._draw = SVG(svgWrapper.id);
    this._nodes = [
      {id: 0, x: 100, y: 300},
      {id: 1, x: 350, y: 420},
      {id: 2, x: 320, y: 30},
    ],
    this._links = [
      {from: this._nodes[0], to: this._nodes[2], weight: 1},
      {from: this._nodes[1], to: this._nodes[2], weight: 3},
    ],
    this._popover = null;
    this._matrix = null;
  }

  _setPopover = (el, desc) => {
    this._popover = this._draw.text(desc).move(el.x + 20, el.y);
  }
  _clearPopover = _ => {

    if (this._popover != null) {
      this._popover.clear();
      this._popover = null;
    }
  }

  render = () => {
    this._renderLinks();
    this._renderNodes();
  }

  _renderLinks = () => {

    for (const link of this._links) {
      const f = link.from,
            t = link.to,
            w = link.weight;
      
      this._draw
      .polyline([f.x,f.y, t.x,t.y])
      .stroke({ 
        color: 'silver',
        width: Math.min(10, w),
        // linecap: 'round',
        // linejoin: 'round' 
      });
    }

    this._createLinksMatrix();
  }

  _createLinksMatrix = _ => {
    this._matrix = [];
    // this._matrix = Array.from({length: this.});

    for (let node of this._nodes) {
      this._matrix
      .push(this._links
        .filter(link => link.from.id == node.id)
        .map(link => link.weight));
    }

    console.log(this._matrix);
  }

  _renderNodes = () => {

    for (const node of this._nodes) {
      this._draw
      .text("💻")
      .font({ size: '1.5rem'})
      .center(node.x, node.y)
      .on("mouseover", () => this._setPopover(node, node.id.toString()))
      .on("mouseout", this._clearPopover)
    }
  }
}

function findPath(source, target) {

}

function main() {
  const gui = new GUI();
  gui.init();
};

window.addEventListener("load", main);

