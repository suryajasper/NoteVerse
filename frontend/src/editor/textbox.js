import m from 'mithril';
import styles from './editor.css';
import { getRelativeMousePosition } from './util';

export default class Textbox {
  constructor(vnode) {
    this.dim = vnode.attrs.dim;
    this.pos = vnode.attrs.pos;

    // i am sorry
    this.updateRules = [...Array(4).keys()].map((i) => {
      const x = i & (1 << 0);
      const y = i & (1 << 1);

      return (function updateRule(e) {
        const dp = getRelativeMousePosition(e, 1);

        return {
          dim: {
            x: dp.x + this.dim.x,
            y: dp.y + this.dim.y,
          },
          pos: {
            x: x ? this.pos.x : dp.x,
            y: y ? this.pos.y : dp.y,
          },
        };
      }).bind(this);
    });
  }

  oncreate(vnode) {
    vnode.dom.focus();
  }

  view(vnode) {

    return m('div', {
      style: {
        width: `${this.dim.width}px`,
        height: `${this.dim.height}px`,
        marginLeft: `${this.pos.x}px`,
        marginTop: `${this.pos.y}px`,
      },
      class: styles.textbox,
    },
    [...Array(1).keys()].map((i) => m(
      'div', {
        // onmousedown: (e) => {
        //   vnode.dom.addEventListener('pointermove', this.updateRules[i]);
        // },
        // onmouseup: (e) => {
        //   vnode.dom.addEventListener('pointermove', this.updateRules[i]);
        // },
        class: styles.resize_handle,
      },
    )),
    m('div', {
      class: styles.textfield,
      contenteditable: true,
      onmousedown: (e) => {
        e.stopPropagation();
      },
    }));
  }
}
