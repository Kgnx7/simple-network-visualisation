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
    this._addNodeBtn = document.getElementById("add-node-btn");
    this._addLinkBtn = document.getElementById("add-link-btn");
    this._addLinkForm = document.getElementById("add-link-form");
    this._sendForm = document.getElementById("send-form");
    this._selectNodeAFrom = document.getElementById("a-from");
    this._selectNodeATo = document.getElementById("a-to");
    this._selectNodeSFrom = document.getElementById("s-from");
    this._selectNodeSTo = document.getElementById("s-to");
    this._sendPackageBtn = document.getElementById("send-package-btn");
  } 

  _setUpForm = (from, to) => {
    let child = from.lastElementChild;  
    while (child) { 
      from.removeChild(child); 
      child = from.lastElementChild; 
    } 
    child = to.lastElementChild;  
    while (child) { 
      to.removeChild(child); 
      child = to.lastElementChild; 
    } 

    this._svg.getNodesId().forEach(id => {
      const option1 = document.createElement("option");
      const option2 = document.createElement("option");
      option1.value=id;
      option1.textContent=`id: ${id}`;
      option2.value=id;
      option2.textContent=`id: ${id}`;

      from.append(option1);
      to.append(option2);
    })
  }

  init = () => {
    if (SVG.supported) {
      this._svg = new _SVG(this._svgWrapper);
      this._svg.render();

      this._addNodeBtn.addEventListener("click", this._svg.addNode);
      this._addLinkForm.addEventListener("submit", this._svg.handleAddLink);
      this._sendForm.addEventListener("submit", this._svg.handleSendPackage);
      this._addLinkBtn.addEventListener("click", e => {
        this._addLinkForm.classList.toggle("visible");
        this._setUpForm(this._selectNodeAFrom, this._selectNodeATo);
      });
      this._sendPackageBtn.addEventListener("click", e => {
        this._sendForm.classList.toggle("visible");
        this._setUpForm(this._selectNodeSFrom, this._selectNodeSTo);
      });
      
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
      this._createNode(0, 230, 399),
      this._createNode(1, 350, 450),
      this._createNode(2, 320, 30),
      this._createNode(3, 220, 130),
      this._createNode(4, 450, 250),
    ],
    this._links = [
      this._createLink(this._nodes[0], this._nodes[1], 1),
      this._createLink(this._nodes[1], this._nodes[2], 13),
      this._createLink(this._nodes[2], this._nodes[3], 3),
      this._createLink(this._nodes[1], this._nodes[3], 10),
      this._createLink(this._nodes[3], this._nodes[4], 1),
    ],
    this._popover = null;
    this._matrix = null;
    this._bbox = this._getBCR();
    this._placeHolder = null;
    this._draggableEl = null;
    this._draggable = true;
    this._path = null;
    this._idCounter = 10;

    this._draw.hide();
  }

  _getBCR = () => this._wrapper.getBoundingClientRect();
  _setBCR = () => this._bbox = this._getBCR();
  _setPopover = (el, desc) => {
    this._popover = this._draw.text(desc).move(el.x + 20, el.y-5);
  }

  getNodesId = () => this._nodes.map(n => n.id);

  _clearPopover = _ => {

    if (this._popover != null) {
      this._popover.clear();
      this._popover = null;
    }
  }

  render = () => {
    this._draw.show();
  }

  addNode = ev => {
    ev.preventDefault();

    this._idCounter ++;

    this._nodes.push(
      this._createNode(this._idCounter)
    )
  }

  handleSendPackage = ev => {
    ev.preventDefault();
    
    this._draggable = true;

    const target = ev.target;
    const nodes = this._nodes;

    const f = target.from.value,
          t = target.to.value;

    if (f === t || f === undefined || t === undefined) {
      alert("Данные некорректны");
      return;
    }

    const [path, len] = dijkstra(this._links, f, t);

    this._createPath(path);
  }

  handleAddLink = ev => {
    ev.preventDefault();
    const target = ev.target;
    const nodes = this._nodes;

    const f = nodes.find(n => n.id == target.from.value),
          t = nodes.find(n => n.id == target.to.value,),
          w = +target.weight.value;

    if (f === t || f === undefined || t === undefined || w < 1) {
      alert("Данные некорректны");
      return;
    }
     
    this._links.push(this._createLink(f,t,w));
  }

  _createNode = (id, x=10, y=10) => {
    const el = this._draw
    .text("💻")
    .font({ size: '1.5rem'})
    .center(x, y)
    .style('cursor', 'pointer')
    .style('user-select', 'none');

    const node = {
      id,
      x, y,
      el
    }

    el
    .on("mouseover", () => this._setPopover(node, id.toString()))
    .on("mouseout", this._clearPopover)
    .on("mousedown", e => this._handleDown(e, node))

    return node;
  };

  _createLink = (f, t, w) => {

    const el = this._draw
    .polyline([f.x,f.y, t.x,t.y])
    .stroke({ 
      color: 'silver',
      width: Math.min(10, w),
    })
    .back();

    return {
      from: f,
      to: t,
      weight: w,
      el
    };
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

    this._draggable = false;
    rect.animate(4000, '<>').during(function(pos, morph, eased){
      var p = path.pointAt(eased * length)
      rect.center(p.x, p.y)
    })
    .after(situation => {
      rect.clear();
      this._draggable = true;
    });
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

  _handleDown = (ev, node) => {
    if (!this._draggable) {
      return;
    }
    const x = ev.clientX - this._bbox.x,
          y = ev.clientY - this._bbox.y;
    
    this._placeHolder = this._draw
      .text("💻")
      .font({ size: '1.5rem', opacity: .5})
      .center(x, y);

    this._draggableEl = node;
    this._wrapper.addEventListener("mousemove", this._handleMove);
    this._wrapper.addEventListener("mouseup", this._handleUp);
  }

  _handleMove = ev => {
    const coord = this._getCoordsFromEvent(ev);
    this._placeHolder.center(coord.x, coord.y);
  }

  _handleUp = (ev) => {
    const node = this._draggableEl;
    this._wrapper.removeEventListener("mousemove", this._handleMove);
    this._wrapper.removeEventListener("mouseup", this._handleUp);

    node.x = this._placeHolder.cx();
    node.y = this._placeHolder.cy();
    
    node.el.center(this._placeHolder.cx(), this._placeHolder.cy());
    this._placeHolder.clear();
    this._placeHolder = null;
    this._draggableEl = null;
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

