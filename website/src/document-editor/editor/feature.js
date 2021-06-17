import m from 'mithril';
import styles from './editor.css';
import Textbox from './textbox';
import {canvasState} from './canvas';
import { getRelativeMousePosition, uuid, pixToIn, inToPix } from './util';

export default class FeatureLayer {
  constructor(vnode) {
    this.features = [];
    this.state = {};
    this.selectedID = undefined;

    this.socket = vnode.attrs.socket;
  }

  oncreate(vnode) {
    this.socket.on('createTextbox', e => this.insertTextBox(e, true));
    this.socket.on('updateTextbox', this.updateTextbox.bind(this));
    this.socket.on('stoppedEditingTextbox', id => {
      this.features[id].params.isBeingEdited = false;
    })
    this.socket.on('startEditingTextbox', id => {
      this.features[id].params.isBeingEdited = true;
    })

    this.target = vnode.dom;
  }

  setFocus(id) {
    this.selectedID = id;
  }

  getFocus() {
    return this.selectedID;
  }

  insertTextBox(e, isSyncing) {
    const f = {
      target: this.target,
      clientX: e.clientX,
      clientY: e.clientY,
    };
    console.log('f', f);
    
    let params = {
      dim: { x: 200, y: 32 },
      setFocus: this.setFocus.bind(this),
      getFocus: this.getFocus.bind(this),
      id: uuid(),
    };
    
    if (!isSyncing) {
      console.log('sync this hsit', f);
      console.log('to inches' , pixToIn(getRelativeMousePosition(f, canvasState.scale), this.target));
      this.socket.emit('send', 'createTextbox', {
        pos: pixToIn(getRelativeMousePosition(f, canvasState.scale), this.target),
        dim: { x: 200, y: 32 },
        id: params.id,
      });
      
      console.log('f', f);
      params.pos = getRelativeMousePosition(f, 1);
      
      this.setFocus(params.id);
    } else {
      console.log(this.target);
      console.log('ebeforepos', e);
      // params.pos = getRelativeMousePosition({target: this.target, clientX: e.pos.x, clientY: e.pos.y}, 1/canvasState.scale);
      params.pos = inToPix(e.pos, this.target);
      params.dim = e.dim;
      params.id = e.id;
      console.log('syncing textbox', params);
    }

    this.features.push({
      elem: Textbox,
      params,
    });
  }

  updateTextbox(id, info) {
    console.log('updating', id, info);
    let ind = this.findTextBoxById(id);
    this.features[ind].params = Object.assign(info, this.features[ind].params);
    m.redraw();
  }

  findTextBoxById(id) {
    for (let i = 0; i < this.features.length; i += 1) {
      if (this.features[i].params.id === id) {
        return i;
      }
    }
  }

  removeTextBox(id) {
    for (let i = 0; i < this.features.length; i += 1) {
      if (this.features[i].params.id === id) {
        this.features.splice(i, 1);
      }
    }
  }

  view(vnode) {
    this.editorState = vnode.attrs.editorState;

    return m('div', {
      class: styles.featurelayer,
      onmousedown: (e) => {
        if (!this.editorState.isCanvasLevel) {
          e.stopPropagation();
          if (this.selectedID !== undefined) {
            this.selectedID = undefined;
            return;
          }
          this.target = vnode.dom;
          this.insertTextBox(e);
          return;
        }
        this.selectedID = undefined;
      },
    }, this.features.map((feature) => m(feature.elem,
      { ...feature.params, delete: this.removeTextBox.bind(this), editorState: vnode.attrs.editorState, socket: vnode.attrs.socket })));
  }
}
