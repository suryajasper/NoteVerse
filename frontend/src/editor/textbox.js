import m from 'mithril';
import styles from './editor.css';
import { getRelativeMousePosition } from './util';

export default class Textbox {
  constructor(vnode) {
    this.dim = vnode.attrs.dim;
    this.pos = vnode.attrs.pos;
    this.id = vnode.attrs.id;

    this.movable = true;
    this.editing = false;

    this.updateRules = [...Array(4).keys()].map((i) => {
      /* eslint-disable */
      const x = i & (1 << 0);
      const y = i & (1 << 1);
      /* eslint-enable */

      return (function updateRule(e) {
        const f = {
          target: this.target.parentNode,
          clientX: e.clientX,
          clientY: e.clientY,
        };
        const pos = getRelativeMousePosition(f, 1);

        this.dim = {
          x: (this.pos.x - pos.x) + this.dim.x,
          y: (this.pos.y - pos.y) + this.dim.y,
        };
        this.pos = {
          x: pos.x,
          y: pos.y,
        };
        m.redraw();
      }).bind(this);
    });
  }

  oncreate(vnode) {
    vnode.dom.focus();
    this.target = vnode.dom;
    this.updateRules.forEach((k, i) => {
      vnode.dom.parentNode.addEventListener('mouseup', () => {
        vnode.dom.parentNode.removeEventListener('pointermove', this.updateRules[i]);
      });
      vnode.dom.parentNode.addEventListener('mouseleave', () => {
        vnode.dom.parentNode.removeEventListener('pointermove', this.updateRules[i]);
      });
    });
  }

  view(vnode) {
    this.selected = false;
    if (vnode.attrs.getFocus() !== undefined) {
      this.selected = vnode.attrs.getFocus() === this.id;
    }

    return m('div', {
      style: {
        width: `${this.dim.x}px`,
        height: `${this.dim.y}px`,
        marginLeft: `${this.pos.x}px`,
        marginTop: `${this.pos.y}px`,
      },
      onmousedown: (e) => {
        e.stopPropagation();
        if (this.selected) {
          this.editing = true;
        }
        vnode.attrs.setFocus(this.id);
      },
      onfocusout: () => {
        this.editing = false;
      },
      class: styles.textbox,
    },
    [...Array(1).keys()].map((i) => m(
      'div', {
        onmousedown: (e) => {
          document.activeElement.blur();
          vnode.dom.parentNode.addEventListener('pointermove', this.updateRules[i]);
          e.stopPropagation();
        },
        class: styles.resize_handle,
        style: {
          display: `${this.selected ? 'block' : 'none'}`,
        },
      },
    )),
    m('div', {
      class: `${styles.textfield} ${this.selected ? styles.sel_border : ''}`,
      contenteditable: true,
      onselectstart: () => this.editing,
    }));
  }
}
