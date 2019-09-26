// // # ==================================================================
// // # Algorithm
// // # ==================================================================

// Dijkstra’s shortest path algorithm 
// source - https://rosettacode.org/wiki/Dijkstra%27s_algorithm#JavaScript

const dijkstra = (edges,source,target) => {
  const Q = new Set(),
        prev = {},
        dist = {},
        adj = {}

  const vertex_with_min_dist = (Q,dist) => {
      let min_distance = Infinity,
          u = null

      for (let v of Q) {
          if (dist[v] < min_distance) {
              min_distance = dist[v]
              u = v
          }
      }
      return u
  }

  for (let i=0;i<edges.length;i++) {
      let v1 = edges[i].from.id.toString(), 
          v2 = edges[i].to.id.toString(),
          len = edges[i].weight;

      Q.add(v1)
      Q.add(v2)

      dist[v1] = Infinity
      dist[v2] = Infinity

      if (adj[v1] === undefined) adj[v1] = {}
      if (adj[v2] === undefined) adj[v2] = {}

      adj[v1][v2] = len
      adj[v2][v1] = len
  }

  dist[source] = 0

  while (Q.size) {
      let u = vertex_with_min_dist(Q,dist),
          neighbors = Object.keys(adj[u]).filter(v=>Q.has(v)) //Neighbor still in Q 

      Q.delete(u)

      if (u===target) break //Break when the target has been found

      for (let v of neighbors) {
          let alt = dist[u] + adj[u][v]
          if (alt < dist[v]) {
              dist[v] = alt
              prev[v] = u
          }
      }
  }

  {
      let u = target,
      S = [u],
      len = 0

      while (prev[u] !== undefined) {
          S.unshift(prev[u])
          len += adj[u][prev[u]]
          u = prev[u]
      }
      return [S,len]
  }   
}

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
    this._wrapper = svgWrapper;
    this._draw = SVG(svgWrapper.id);
    this._nodes = [
      {id: 0, x:100, y:300},
      {id: 1, x:350, y:450},
      {id: 2, x:320, y:30},
      {id: 3, x:220, y:130},
      {id: 4, x:300, y:300},
    ],
    this._links = [
      {from: this._nodes[0], to: this._nodes[1], weight: 1},
      {from: this._nodes[1], to: this._nodes[2], weight: 13},
      {from: this._nodes[2], to: this._nodes[3], weight: 3},
      {from: this._nodes[1], to: this._nodes[3], weight: 10},
      {from: this._nodes[3], to: this._nodes[4], weight: 1},
    ],
    this._popover = null;
    this._matrix = null;
    this._bbox = svgWrapper.getBoundingClientRect();
    this._placeHolder = null;
    this._draggable = null;
    this._path = null;
  }

  _setPopover = (el, desc) => {
    this._popover = this._draw.text(desc).move(el.x + 20, el.y-5);
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
      
      link.el = this._draw
      .polyline([f.x,f.y, t.x,t.y])
      .stroke({ 
        color: 'silver',
        width: Math.min(10, w),
      });
    }

    let [path,length] = dijkstra(this._links, 1, 4);
    this._createPath(path);
  }

  _createPath = (list) => {
    this._path = '';

    for (let item of list) {
      const node = this._nodes.find(node => node.id == +item);

      const action = this._path.length === 0 ? "M" : "L",
            coords = `${node.x}, ${node.y}`

      this._path += `${action} ${coords}`
    }

    const path = this._draw.path(this._path).fill('none');
    const rect = this._draw.text("📦");
    const length = path.length();

    rect.animate(8000, '<>').during(function(pos, morph, eased){
      var p = path.pointAt(eased * length)
      rect.center(p.x, p.y)
    }).loop(true, true);
  }

  _changeLinks = () => {
    for (const link of this._links) {
      const f = link.from.el,
            t = link.to.el,
            w = link.weight;
      
      link.el
      .plot([f.cx(),f.cy(), t.cx(),t.cy()]);
    }
  }

  _getCoordsFromEvent = (ev) => {
    if (ev.changedTouches) {
      ev = ev.changedTouches[0]
    }
    return { x: ev.clientX - this._bbox.x, y: ev.clientY - this._bbox.y }
  }

  _renderNodes = () => {

    for (const node of this._nodes) {
      node.el = this._draw
      .text("💻")
      .font({ size: '1.5rem'})
      .center(node.x, node.y)
      .on("mouseover", () => this._setPopover(node, node.id.toString()))
      .on("mouseout", this._clearPopover)
      .on("mousedown", e => this._handleDown(e, node))
    }
  }

  _handleDown = (ev, node) => {
    const x = ev.clientX - this._bbox.x,
          y = ev.clientY - this._bbox.y;
    
    this._placeHolder = this._draw
      .text("💻")
      .font({ size: '1.5rem', opacity: .5})
      .center(x, y);

    this._draggable = node;
    this._wrapper.addEventListener("mousemove", this._handleMove);
    this._wrapper.addEventListener("mouseup", this._handleUp);
  }

  _handleMove = ev => {
    const coord = this._getCoordsFromEvent(ev);
    this._placeHolder.center(coord.x, coord.y);
  }

  _handleUp = (ev) => {
    const node = this._draggable;
    this._wrapper.removeEventListener("mousemove", this._handleMove);
    this._wrapper.removeEventListener("mouseup", this._handleUp);

    node.x = this._placeHolder.cx();
    node.y = this._placeHolder.cy();
    
    node.el.center(this._placeHolder.cx(), this._placeHolder.cy());
    this._placeHolder.clear();
    this._placeHolder = null;
    this._draggable = null;
    this._changeLinks();
  }
}

function findPath(source, target) {

}

function getCoordsFromEvent(ev)  {
  if (ev.changedTouches) {
    ev = ev.changedTouches[0]
  }
  return { x: ev.clientX, y: ev.clientY }
}


function main() {
  const gui = new GUI();
  gui.init();
};

window.addEventListener("load", main);

