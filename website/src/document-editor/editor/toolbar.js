import m from 'mithril';
import styles from './toolbar.css';
import {
  brush,
  fill,
  image,
  text,
  eraser,
  select,
  pan,
} from '../elements/svg';
import {
  brushOverlay,
  colorOverlay,
  eraserOverlay,
} from './overlay';

const toolStyles = [
  {
    stroke: '#434343',
    linewidth: 4,
    opacity: 1,
    cap: 'round',
    join: 'round',
    isCanvasLevel: true,
  },
  {
    stroke: 'none',
    isCanvasLevel: true,
  },
  {
    stroke: '#FFF',
    linewidth: 20,
    opacity: 1,
    cap: 'round',
    join: 'round',
    isCanvasLevel: true,
  },
  {
    isCanvasLevel: false,
  },
  {
    isCanvasLevel: false,
  },
  {
    stroke: '#abdded',
    linewidth: 5,
    opacity: 1,
    cap: 'round',
    join: 'round',
    isCanvasLevel: true,
  },
  {
    isCanvasLevel: true,
  }
];

export default class Toolbar {
  constructor(vnode) {
    this.tools = [brush, fill, eraser, text, image, select, pan];
    this.overlays = [brushOverlay, colorOverlay, eraserOverlay];
    this.styles = JSON.parse(window.localStorage.getItem('styleCache')) || toolStyles;
    this.expand = false;

    let cachedTool = window.localStorage.getItem('activeTool');
    if (cachedTool)
      this.active = parseInt(cachedTool);
    else
      this.active = 0;
  }

  tool(icon, selected, idx) {
    return m('div', {
      class: `${styles.tool} ${selected ? styles.selected : ''}`,
      onclick: () => {
        this.active = idx;
        window.localStorage.setItem('activeTool', this.active);
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

  view(vnode) {
    vnode.attrs.updateState({
      tool: this.active,
      isCanvasLevel: this.styles[this.active].isCanvasLevel,
      style: this.styles[this.active],
      fill: this.styles[1].stroke,
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
      m(overlay, { style: this.styles[i], styleUpdater: style => {
        this.styles[i] = Object.assign(this.styles[i], style); 
        if (this.tools[i].color)
          this.tools[i].color = this.styles[i].stroke;
        window.localStorage.setItem('styleCache', JSON.stringify(this.styles));
      } }), i,
    )));
  }
}
