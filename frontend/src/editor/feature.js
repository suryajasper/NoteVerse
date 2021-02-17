import m from 'mithril';
import styles from './editor.css';
import Textbox from './textbox';
import { getRelativeMousePosition } from './util';

export default class FeatureLayer {
  constructor() {
    this.features = [];
    this.state = {};
  }

  insertTextBox(e) {
    const f = {
      target: this.target,
      clientX: e.clientX,
      clientY: e.clientY,
    };

    this.features.push({
      elem: Textbox,
      params: {
        pos: getRelativeMousePosition(f, 1),
        dim: { width: 200, height: 40 },
        // default width/height of textboxes
      },
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
        }
      },
    }, this.features.map((feature) => m(feature.elem, feature.params)));
  }
}
