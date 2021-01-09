import m from 'mithril';
import Two from 'two.js';
import styles from './editor.css';

export default class Document {
  constructor(vnode) {
    this.state = {
      strokes: [],
      drawing: false,
      style: vnode.attrs.style,
    };

    if (!this.state.style) {
      this.state.style = {
        stroke: '#FFFF00',
        linewidth: 15,
        opacity: 0.5,
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
    this.currStroke = undefined;
  }

  handleToolDrag(e) {
    const pos = this.makePoint(this.getRelativeMousePosition(e));

    if (this.currStroke) {
      this.currStroke.vertices.push(this.makePoint(pos));
    } else {
      this.currStroke = this.two.makePath(this.state.lastPos, pos, true);
      this.currStroke.noFill();
      this.currStroke = Object.assign(this.currStroke, this.state.style);
    }

    this.state.lastPos = pos;
  }

  handleToolUp() {
    this.state.drawing = false;
    this.state.strokes.push(this.currStroke);
    this.currStroke = undefined;
  }

  view(vnode) {
    return m('div', {
      class: styles.letter_doc,
      onmousedown: this.handleToolDown.bind(this),
      onpointermove: (e) => {
        if (this.state.drawing) {
          this.handleToolDrag(e);
        }
      },
      onmouseup: this.handleToolUp.bind(this),
    });
  }
}
