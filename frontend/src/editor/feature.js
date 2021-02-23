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
      dim: { x: 200, y: 40 },
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

  view(vnode) {
    this.editorState = vnode.attrs.editorState;

    return m('div', {
      class: styles.featurelayer,
      onmousedown: (e) => {
        if (!this.editorState.isCanvasLevel) {
          e.stopPropagation();
          this.target = vnode.dom;
          this.insertTextBox(e);
          return;
        }
        this.selectedID = undefined;
      },
    }, this.features.map((feature) => m(feature.elem, feature.params)));
  }
}
