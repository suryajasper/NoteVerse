import m from 'mithril';
import Two from 'two.js';
import styles from './editor.css';
import { getRelativeMousePosition, getAbsoluteMousePosition, makePoint, inToPix, pixToIn } from './util';
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
      for (let stroke of strokes) {
        let strokeBuild = this.two.makeCurve(true);
        strokeBuild.noFill();
        strokeBuild = Object.assign(strokeBuild, stroke.style);

        for (let point of stroke.points)
          strokeBuild.vertices.push(makePoint(
              inToPix( point, this.target )
          ));
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
      console.log('not syncing');
      this.state.lastPos = makePoint(getRelativeMousePosition(f, canvasState.scale));

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
      pos = makePoint(inToPix({
        x: e.clientX,
        y: e.clientY,
        target: this.target,
      }));
    }
    else {
      pos = makePoint(getRelativeMousePosition(f, canvasState.scale));
      this.socket.emit('send', 'syncDrag', Object.assign(
        pixToIn({x: pos.x, y: pos.y, target: this.target}),
        {uid: this.uid}
      ));
    }

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

    if (isSyncing)
      this.syncs[e.uid].currStroke.vertices.push(pos);
    else
      this.currStroke.vertices.push(pos);

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

  handleToolUp(syncE) {
    document.body.style.cursor = 'default';
    this.state.drawing = false;
    clearTimeout(this.idleTimeout);

    if (this.currStroke && !syncE.uid) {
      let stroke = {
        points: this.collectionToArray( this.currStroke._collection, ['_x', '_y']),
        style: this.state.style
      };
      // this.socket.emit('stroke', stroke);
      this.socket.emit('send', 'syncStopDrawing', {uid: this.uid});
      console.log('madeStroke', stroke);
      if (stroke.points.length > 0) {
        this.socket.emit('saveStroke', {
          docId: this.docId,
          uid: this.uid,
          stroke: stroke
        })
      }
      this.state.strokes.push(this.currStroke);
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