import m from 'mithril';
import Two from 'two.js';
import styles from './editor.css';

export default class Document {
  constructor(vnode) {
    this.state = {
      strokes: [],
      drawing: false,
      ...vnode.attrs.state,
      idleTimeout: 4,
      velThresh: 1,
      lineMode: false,
    };

    if (!this.state.style) {
      this.state.style = {
        stroke: '#333',
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

  getRelativeMousePosition(e) {
    const rect = e.target.getBoundingClientRect();
    const pos = {
      x: (e.clientX - rect.left) / this.scale,
      y: (-(rect.top - e.clientY)) / this.scale,
    };
    return pos;
  }

  makePoint(pos) {
    const v = new Two.Vector(pos.x, pos.y);
    v.position = new Two.Vector().copy(v);
    return v;
  }

  handleToolDown(e) {
    this.state.drawing = true;
    this.state.lastPos = this.makePoint(this.getRelativeMousePosition(e));
    this.state.lineMode = false;
    this.currIdle = 0;
    this.currStroke = undefined;
    this.idleInterval = setInterval(this.setLineMode.bind(this), 100);
  }

  setLineMode() {
    if (this.vel > this.state.velThresh) {
      this.currIdle = 0;
      this.vel = 0;
      return;
    }

    if (this.currIdle > this.state.idleTimeout) {
      this.lineMode = true;
      clearInterval(this.idleInterval);
      this.handleLineMode();
      return;
    }

    this.currIdle += 1;
  }

  handleLineMode() {
    const collection = new Two.Utils.Collection();
    collection.push(this.currStroke.vertices.shift());
    collection.push(this.currStroke.vertices.pop());
    this.currStroke.vertices = collection;
  }

  handleToolDrag(e) {
    const pos = this.makePoint(this.getRelativeMousePosition(e));
    this.vel = Math.sqrt(
      (pos.x - this.state.lastPos.x) ** 2 + (pos.y - this.state.lastPos.y) ** 2,
    );

    if (this.currStroke) {
      this.currStroke.vertices.push(pos);

      if (this.lineMode) {
        this.handleLineMode();
      }
    } else {
      this.currStroke = this.two.makePath(this.state.lastPos, pos, true);
      this.currStroke.noFill();
      this.currStroke = Object.assign(this.currStroke, this.state.style);
    }

    this.state.lastPos = pos;
  }

  handleToolUp() {
    this.state.drawing = false;
    clearInterval(this.idleInterval);

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
