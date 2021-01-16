import m from 'mithril';
import styles from './toolbar.css';
import {
  brush,
  image,
  text,
  eraser,
  select,
} from '../elements/svg';

export default class Toolbar {
  constructor() {
    this.tools = [brush, eraser, text, image, select];
    this.active = 0;
    this.expand = false;
  }

  tool(icon, selected, idx) {
    return m('div', {
      class: `${styles.tool} ${selected ? styles.selected : ''}`,
      onclick: () => {
        this.active = idx;
        this.expand = true;
        m.redraw();
      },
      onmouseover: () => {
        this.expand = this.active === idx;
      },
    }, m(icon));
  }

  overlay(children) {
    return m('div', {
      class: `${styles.overlay} ${this.expand ? '' : styles.none}`,
    }, children);
  }

  view() {
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
    this.overlay(),
  );
  }
}
