import m from 'mithril';
import Two from 'two.js';
import styles from './editor.css';
import { getRelativeMousePosition, makePoint } from './util';

export default class Canvas {
  constructor(vnode) {
    this.state = {
      strokes: [],
      drawing: false,
      ...vnode.attrs.state,
      lineModeTimeout: 500,
      lineMode: false,
    };

    if (!this.state.style) {
      this.state.style = {
        stroke: '#555',
        linewidth: 4,
        opacity: 1,
        cap: 'round',
        join: 'round',
      };
    }
  }

  oncreate(vnode) {
    this.initSize = {
      width: vnode.dom.clientWidth,
      height: vnode.dom.clientHeight,
    };

    this.scale = 1;

    this.two = new Two({
      autostart: true,
      type: Two.Types.canvas,
      width: vnode.dom.clientWidth,
      height: vnode.dom.clientHeight,
      ...vnode.attrs.twoparams,
    });

    this.two.appendTo(vnode.dom);
    window.addEventListener('resize', () => {
      this.two.renderer.setSize(vnode.dom.clientWidth, vnode.dom.clientHeight);
      this.scale = vnode.dom.clientWidth / this.initSize.width;
      this.two.scene.scale = this.scale;
    });
  }

  handleToolDown(e) {
    this.state.drawing = true;
    this.state.lastPos = makePoint(getRelativeMousePosition(e, this.scale));

    this.currIdle = 0;

    this.currStroke = this.two.makeCurve(true);
    this.currStroke.noFill();
    this.currStroke = Object.assign(this.currStroke, this.state.style);

    // should be able to tap to place points without dragging
    this.currStroke.vertices.push(this.state.lastPos);
    this.currStroke.vertices.push(this.state.lastPos);
  }

  handleLineMode() {
    this.lineMode = true;

    const collection = new Two.Utils.Collection();
    collection.push(this.currStroke.vertices.shift());
    collection.push(this.currStroke.vertices.pop());
    this.currStroke.vertices = collection;
  }

  handleToolDrag(e) {
    const pos = makePoint(getRelativeMousePosition(e, this.scale));

    const vel = Math.sqrt(
      (pos.x - this.state.lastPos.x) ** 2 + (pos.y - this.state.lastPos.y) ** 2,
    );

    if (vel > 1) {
      clearTimeout(this.idleTimeout);
      this.idleTimeout = undefined;
    }

    if (!this.idleTimeout) {
      this.idleTimeout = setTimeout(this.handleLineMode.bind(this), this.state.lineModeTimeout);
    }

    this.currStroke.vertices.push(pos);

    if (this.lineMode) {
      this.handleLineMode();
    }

    this.state.lastPos = pos;
  }

  handleToolUp() {
    this.state.drawing = false;
    clearTimeout(this.idleTimeout);

    this.state.strokes.push(this.currStroke);
    this.lineMode = false;
    this.currStroke = undefined;
  }

  view() {
    return m('div', {
      class: styles.letter_doc,
      onmousedown: this.handleToolDown.bind(this),
      onmouseout: this.handleToolUp.bind(this),
      onpointermove: (e) => {
        if (this.state.drawing) {
          this.handleToolDrag(e);
        }
      },
      onmouseup: this.handleToolUp.bind(this),
    });
  }
}
