import m from 'mithril';
import styles from './editor.css';
import Textbox from './textbox';
import { getRelativeMousePosition } from './util';

export default class FeatureLayer {
  constructor() {
    this.features = [];
    this.state = {};
    this.selectedID = undefined;
  }

  setFocus(id) {
    this.selectedID = id;
  }

  getFocus() {
    return this.selectedID;
  }

  insertTextBox(e) {
    const f = {
      target: this.target,
      clientX: e.clientX,
      clientY: e.clientY,
    };

    const params = {
      pos: getRelativeMousePosition(f, 1),
      dim: { x: 200, y: 32 },
      setFocus: this.setFocus.bind(this),
      getFocus: this.getFocus.bind(this),
      id: this.features.length,
    };

    this.setFocus(params.id);
    this.features.push({
      elem: Textbox,
      params,
    });
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
      { ...feature.params, delete: this.removeTextBox.bind(this), editorState: vnode.attrs.editorState })));
  }
}
