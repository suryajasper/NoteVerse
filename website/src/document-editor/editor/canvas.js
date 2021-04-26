import m from 'mithril';
import Two from 'two.js';
import styles from './editor.css';
import { getRelativeMousePosition, makePoint, inToPix, pixToIn, pointInRect, pointInPolygon } from './util';
import Cookies from '../../utils/cookies';

let canvasState = {
  scale: 1
};

class Canvas {
  constructor(vnode) {
    this.docId = vnode.attrs.docId;
    this.uid = Cookies.get('uid');

    this.state = {
      strokes: [],
      drawing: false,
      lineModeTimeout: 500,
      lineMode: false,
    };

    this.syncs = {};
    this.syncedStyle = null;

    this.socket = vnode.attrs.socket;
    this.socket.emit('confirmDocId', this.docId);
    
    this.state.style = vnode.attrs.editorState.style;
    this.state.tool = vnode.attrs.editorState.tool;
  }
  
  fetchStrokes() {
    m.request({
      method: "GET",
      url: "http://localhost:2000/document",
      params: {
        uid: this.uid,
        docId: this.docId
      }
    }).then(docInfo => {
      console.log(docInfo);
      if (docInfo.pages.length == 0) return;
      let strokes = docInfo.pages[0].strokes;

      this.points = [];
      this.strokes = [];

      for (let stroke of strokes) {
        let strokeBuild = this.two.makeCurve(true);
        strokeBuild.noFill();
        strokeBuild = Object.assign(strokeBuild, stroke.style);

        for (let point of stroke.points) {
          strokeBuild.vertices.push(makePoint(
            inToPix( point, this.target )
          ));
          this.points.push({
            stroke: strokeBuild,
            coord: inToPix( point, this.target )
          });
          this.strokes.push(strokeBuild);
        }
      }
      m.redraw();
    }).catch(function(error) {
      console.log(error);
      // window.location.href = '/notes#!/root/';
    })
  }

  oncreate(vnode) {
    this.socket.on('syncStroke', this.syncStroke.bind(this));
    this.socket.on('syncStartDrawing', this.syncStartStroke.bind(this));
    this.socket.on('syncDrag', this.syncDragStroke.bind(this));
    this.socket.on('syncStopDrawing', this.syncEndStroke.bind(this));

    this.target = vnode.dom;
    this.initSize = {
      width: vnode.dom.clientWidth,
      height: vnode.dom.clientHeight,
    };

    canvasState.scale = 1;

    this.two = new Two({
      autostart: true,
      type: Two.Types.canvas,
      width: vnode.dom.clientWidth,
      height: vnode.dom.clientHeight,
      ...vnode.attrs.twoparams,
    });

    this.two.appendTo(vnode.dom);
    window.addEventListener('resize', () => { this.handleResize(vnode) });
    this.handleResize(vnode);

    this.handleToolDrag = this.handleToolDrag.bind(this);

    this.fetchStrokes();
  }

  handleResize(vnode) {
    this.two.renderer.setSize(vnode.dom.clientWidth, vnode.dom.clientHeight);
    canvasState.scale = vnode.dom.clientWidth / this.initSize.width;
    this.two.scene.scale = canvasState.scale; 
    console.log('scale', this.two.scene.scale);
  }

  handleToolDown(e, isSyncing) {
    document.body.style.cursor = 'crosshair';
    this.state.drawing = true;
    const f = {
      target: this.target,
      clientX: e.clientX,
      clientY: e.clientY,
    };

    if (isSyncing) {
      this.syncedStyle = e.style;
      
      this.syncs[e.uid] = {
        lastPos : makePoint(inToPix({
          x: e.clientX,
          y: e.clientY,
          target: this.target,
        }))
      };
      let thisSync = this.syncs[e.uid];
      
      thisSync.currStroke = this.two.makeCurve(true);
      thisSync.currStroke.noFill();
      thisSync.currStroke = Object.assign(thisSync.currStroke, this.syncedStyle);

      // should be able to tap to place points without dragging
      thisSync.currStroke.vertices.push(thisSync.lastPos);
      thisSync.currStroke.vertices.push(thisSync.lastPos);
    }
    else {
      let pos = getRelativeMousePosition(f, canvasState.scale);
      
      this.state.lastPos = makePoint(pos);

      if (this.state.tool == 4) {
        if (this.currSelection) {

          if (pointInPolygon(this.currSelection.vertices, pos)) {
            this.draggingSelection = true;
            document.body.style.cursor = 'move';
            return;
          } else {
            for (let stroke of this.strokesInSelection)
              stroke.stroke.stroke = stroke.oldStyle;
            
            this.two.remove(this.currSelection);
            this.draggingSelection = false;
          }
        }

        this.currSelection = this.two.makePath(true);
        this.currSelection.fill = '#abdded80';
        this.currSelection = Object.assign(this.currSelection, this.state.style);

        this.currSelection.vertices.push(this.state.lastPos);

      } else {
  
        let posToSend = pixToIn({
          x: this.state.lastPos.x,
          y: this.state.lastPos.y,
          target: this.target,
        });
  
        this.socket.emit('send', 'syncStartDrawing', Object.assign({
          style: this.state.style,
          uid: this.uid
        }, posToSend));
  
        this.currStroke = this.two.makeCurve(true);
        this.currStroke.noFill();
        this.currStroke = Object.assign(this.currStroke, this.state.style);
  
        // should be able to tap to place points without dragging
        this.currStroke.vertices.push(this.state.lastPos);
        this.currStroke.vertices.push(this.state.lastPos);

      }
    }

    this.currIdle = 0;
  }

  handleLineMode() {
    this.lineMode = true;

    const collection = new Two.Utils.Collection();
    collection.push(this.currStroke.vertices.shift());
    collection.push(this.currStroke.vertices.pop());
    this.currStroke.vertices = collection;
  }

  handleToolDrag(e, isSyncing) {
    // window.style.cursor = 'default';
    const f = {
      target: this.target,
      clientX: e.clientX,
      clientY: e.clientY,
    };

    let state = this.state;
    if (isSyncing) state = this.syncs[e.uid];

    let pos;
    if (isSyncing) {
      pos = makePoint(inToPix(e, this.target));
    } else {
      pos = makePoint(getRelativeMousePosition(f, canvasState.scale));
      if (this.state.tool == 0) {
        this.socket.emit('send', 'syncDrag', Object.assign(
          pixToIn(pos, this.target),
          {uid: this.uid}
        ));
      }
    }

    if (this.state.tool == 0) {
      const vel = Math.sqrt(
        (pos.x - state.lastPos.x) ** 2 + (pos.y - state.lastPos.y) ** 2,
      );
  
      if (vel > 1) {
        clearTimeout(this.idleTimeout);
        this.idleTimeout = undefined;
      }
  
      if (!this.idleTimeout) {
        this.idleTimeout = setTimeout(this.handleLineMode.bind(this), this.state.lineModeTimeout);
      }
    }

    if (isSyncing)
      this.syncs[e.uid].currStroke.vertices.push(pos);
    else {
      if (this.state.tool == 0)
        this.currStroke.vertices.push(pos);
      
      else if (this.state.tool == 4) {
        if (this.draggingSelection) {

          let movement = new Two.Vector(e.movementX, e.movementY);

          for (let rawStroke of this.strokesInSelection) {
            let stroke = rawStroke.stroke;
            for (let i = 0; i < stroke.vertices.length; i++) {
              stroke.vertices[i].add(movement);
            }
          }

          this.currSelection.position.add(movement);

        } else {

          let vertices = this.currSelection.vertices;

          if (vertices.length > 1) {
            let lastPredict = vertices.pop();
            lastPredict.clear();
          }
          vertices.push(pos);
          vertices.push(makePoint({
            x: vertices[0].x,
            y: vertices[0].y
          }));

        }
      }
    }

    if (this.lineMode) {
      this.handleLineMode();
    }

    state.lastPos = pos;
  }

  collectionToArray(coll, extractValues) {
    let arr = [];
    for (let el of Array.prototype.slice.call( coll, 0 )) {
      let obj = {};
      for (let val of extractValues) {
        obj[val.substring(1)] = el[val];
      }
      arr.push(pixToIn(obj, this.target));
    }
    return arr;
  }

  refreshPoints() {
    this.points = [];

    for (let stroke of this.strokes) {
      for (let i = 0; i < stroke.vertices.length; i++) {
        this.points.push({
          coord: {
            x: stroke.vertices[i].x,
            y: stroke.vertices[i].y
          },
          stroke: stroke
        });
      }
    }
  }

  handleToolUp(syncE) {
    document.body.style.cursor = 'default';
    this.state.drawing = false;
    clearTimeout(this.idleTimeout);

    if (this.state.tool == 4 && syncE.type != 'mouseout') {

      if (this.draggingSelection) this.refreshPoints();

      else {

        let startTime = performance.now();
  
        let len = this.currSelection.vertices.length;
        
        let bb = [{x: 100000, y: 100000}, {x: 0, y: 0}];
        for (let i = 0; i < len; i ++) {
          let coord = this.currSelection.vertices[i];
  
          bb[0].x = Math.min(bb[0].x, coord.x);
          bb[0].y = Math.min(bb[0].y, coord.y);
  
          bb[1].x = Math.max(bb[1].x, coord.x);
          bb[1].y = Math.max(bb[1].y, coord.y);
        }
        
        console.log('before bb', this.points.length);
        
        let ptsInBB = [];
        
        for (let pt of this.points) {
          if (pointInRect(bb[0].x, bb[0].y, bb[1].x, bb[1].y, pt.coord.x, pt.coord.y)) {
            // pt.stroke.stroke = 'orangered';
            ptsInBB.push(pt);
          }
        }
  
        console.log('after bb', ptsInBB.length);
        
        let selectedStrokes = [];
        this.strokesInSelection = [];
  
        let s = 0;
  
        for (let pt of ptsInBB) {
          if (selectedStrokes.includes(pt.stroke.id)) continue;
          else if (pointInPolygon(this.currSelection.vertices, pt.coord)) {
            selectedStrokes.push(pt.stroke.id);
            this.strokesInSelection.push({
              stroke: pt.stroke,
              oldStyle: pt.stroke.stroke
            });
            // pt.stroke.stroke = 'orange';
          }
          s++;
        }
  
        console.log('after lasso', s);
        console.log(`elapsed time ${(performance.now()-startTime)/1000} seconds`);
        console.log('-------------');
      }
    }

    if (this.currStroke && !syncE.uid) {
      let stroke = {
        points: this.collectionToArray( this.currStroke._collection, ['_x', '_y']),
        style: this.state.style
      };
      // this.socket.emit('stroke', stroke);
      this.socket.emit('send', 'syncStopDrawing', {uid: this.uid});
      if (stroke.points.length > 0) {
        this.socket.emit('saveStroke', {
          docId: this.docId,
          uid: this.uid,
          stroke: stroke
        })
      }

      this.state.strokes.push(this.currStroke);
      for (let i = 0; i < this.currStroke.vertices.length; i++) {
        let coord = this.currStroke.vertices[i];
        this.points.push({
          coord: {x: coord.x, y: coord.y},
          stroke: this.currStroke
        });
        this.strokes.push(this.currStroke);
      }
    }
    if (syncE.uid) {
      this.state.strokes.push(this.syncs[syncE.uid].currStroke);
      delete this.syncs[syncE.uid];
    }
    this.lineMode = false;
    this.currStroke = undefined;
  }

  syncStroke(stroke) {
    this.syncedStyle = stroke.style;
    this.handleToolDown({
      clientX: stroke.points[0]._x,
      clientY: stroke.points[0]._y,
    }, true);
    for (let i = 1; i < stroke.points.length; i++) {
      this.handleToolDrag({
        clientX: stroke.points[i]._x,
        clientY: stroke.points[i]._y,
      }, true);
    }
    this.handleToolUp(true);
  }

  syncStartStroke(pos) {
    this.handleToolDown({
      clientX: pos.x,
      clientY: pos.y,
      style: pos.style,
      uid: pos.uid
    }, true);
  }

  syncDragStroke(pos) {
    this.handleToolDrag({
      clientX: pos.x,
      clientY: pos.y,
      uid: pos.uid
    }, true);
  }

  syncEndStroke(e) {
    this.handleToolUp(e);
  }

  view(vnode) {
    this.state.style = vnode.attrs.editorState.style;
    this.state.tool = vnode.attrs.editorState.tool;

    return m('div', {
      class: styles.letter_doc,
      onmousedown: (e) => {
        this.handleToolDown(e);
        vnode.dom.addEventListener('pointermove', this.handleToolDrag);
      },
      onmouseout: (e) => {
        if (!vnode.dom.contains(e.toElement)) {
          vnode.dom.removeEventListener('pointermove', this.handleToolDrag);
          this.handleToolUp(e);
        }
      },
      onmouseup: (e) => {
        vnode.dom.removeEventListener('pointermove', this.handleToolDrag);
        this.handleToolUp(false);
      },
    }, vnode.children);
  }
}

export {Canvas, canvasState};