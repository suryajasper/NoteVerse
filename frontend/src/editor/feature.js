import m from 'mithril';
import styles from './editor.css';
import { getRelativeMousePosition } from './util';

function textbox() {
  return {
    view(vnode) {
      return m('div', {
        class: styles.textbox,
        style: {
          width: `${vnode.attrs.width}px`,
          height: `${vnode.attrs.height}px`,
          marginLeft: `${vnode.attrs.anchor.x}px`,
          marginTop: `${vnode.attrs.anchor.y}px`,
          // marginTop: 10,
        },
        contenteditable: true,
      });
    },
  };
}

export default class FeatureLayer {
  constructor() {
    this.features = [];
    this.state = {};
  }

  oncreate() {
    this.startTextDrag = this.startTextDrag.bind(this);
    this.handleTextDrag = this.handleTextDrag.bind(this);
  }

  startTextDrag(e) {
    this.currentFeature = {
      elem: textbox,
      params: {
        width: 0,
        height: 0,
        anchor: getRelativeMousePosition(e, 1),
      },
    };

    this.features.push(this.currentFeature);
  }

  handleTextDrag(e) {
    const pos = getRelativeMousePosition(e, 1);
    const { anchor } = this.currentFeature.params;

    this.currentFeature.params = {
      // width: Math.max(0, pos.x - anchor.x),
      // height: Math.max(0, pos.y - anchor.y),
      width: pos.x - anchor.x,
      height: pos.y - anchor.y,
      anchor,
    };
    // console.log(this.features);
    m.redraw();
  }

  view(vnode) {
    // const { editorState } = vnode.attrs;
    this.editorState = vnode.attrs.editorState;

    return m('div', {
      class: styles.featurelayer,
      onmousedown: (e) => {
        if (!this.editorState.isCanvasLevel) {
          this.startTextDrag(e);
          e.stopPropagation();
          vnode.dom.addEventListener('pointermove', this.handleTextDrag);
        }
      },
      onmouseup: () => {
        vnode.dom.removeEventListener('pointermove', this.handleTextDrag);
      },
    }, this.features.map((feature) => m(feature.elem, { ...feature.params })));
  }
}
