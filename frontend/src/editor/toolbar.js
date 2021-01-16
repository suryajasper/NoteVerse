import m from 'mithril';
import styles from './toolbar.css';
import {
  brush,
  image,
  text,
  eraser,
  select,
} from '../elements/svg';
import {
  brushOverlay,
  eraserOverlay,
} from './overlay';

const toolStyles = [
  {
    stroke: '#434343',
    linewidth: 4,
    opacity: 1,
    cap: 'round',
    join: 'round',
  },
  {
    stroke: '#FFF',
    linewidth: 20,
    opacity: 1,
    cap: 'round',
    join: 'round',
  },
];

export default class Toolbar {
  constructor(vnode) {
    this.tools = [brush, eraser, text, image, select];
    this.overlays = [brushOverlay, eraserOverlay];
    this.styles = vnode.attrs.initStyles || toolStyles;
    this.active = 0;
    this.expand = false;
  }

  tool(icon, selected, idx) {
    return m('div', {
      class: `${styles.tool} ${selected ? styles.selected : ''}`,
      onclick: () => {
        this.active = idx;
        this.expand = this.overlays[idx];
        m.redraw();
      },
      onmouseover: () => {
        this.expand = this.active === idx && this.overlays[idx];
      },
    }, m(icon));
  }

  overlay(children, idx) {
    return m('div', {
      class: `${styles.overlay} ${this.active === idx ? '' : styles.none}`,
    }, children);
  }

  styleUpdater(style) {
    this.style = Object.assign(this.style, style);
  }

  view(vnode) {
    vnode.attrs.updateState({
      tool: this.active,
      style: this.styles[this.active],
    });

    return m('div', {
      class: `${styles.container} ${this.expand ? styles.expand : ''}`,
      onmouseleave: () => {
        this.hover = undefined;
        this.expand = false;
      },
    },
    m('div', {
      class: styles.toolbar,
    },
    this.tools.map(
      (k, i) => this.tool(
        k,
        i === this.active,
        i,
      ),
    )),
    this.overlays.map((overlay, i) => this.overlay(
      m(overlay, { styleUpdater: (style) => { this.styles[i] = style; } }), i,
    )));
  }
}
