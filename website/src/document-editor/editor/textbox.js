import m from 'mithril';
import styles from './textbox.css';
import { getTrueMousePosition, getRelativeMousePosition, inToPix, pixToIn } from './util';

export default class Textbox {
  constructor(vnode) {
    this.dim = vnode.attrs.dim;
    this.pos = vnode.attrs.pos;
    this.id = vnode.attrs.id;

    this.selected = false;
    this._editing = false;

    this.socket = vnode.attrs.socket;

    this.moveStep = {};

    this.handleMove = this.handleMove.bind(this);
    this.removeMouseEvent = this.removeMouseEvent.bind(this);

    this.updateRules = [...Array(4).keys()].map((i) => {
      /* eslint-disable */
      const x = i & (1 << 0);
      const y = i & (1 << 1);
      /* eslint-enable */

      const sock = this.socket;

      return (function updateRule(e) {
        const pos = getTrueMousePosition(e, this.target.parentNode, 1);

        const xqty = this.pos.x - pos.x;
        const yqty = this.pos.y - pos.y;

        this.dim = {
          x: x ? -xqty : xqty + this.dim.x,
          y: y ? -yqty : yqty + this.dim.y,
        };
        this.pos = {
          x: x ? this.pos.x : pos.x,
          y: y ? this.pos.y : pos.y,
        };

        sock.emit('send', 'updateTextbox', this.id, {dim: this.dim});

        m.redraw();
      }).bind(this);
    });
  }

  get editing() {
    return this._editing;
  }

  set editing(val) {
    if (val) {
      this.socket.emit('send', 'stoppedEditingTextbox', this.id);
    } else {
      this.socket.emit('send', 'startedEditingTextbox', this.id);
    }

    this._editing = val;
  }

  removeMouseEvent() {
    this.updateRules.forEach((k, i) => {
      this.target.parentNode.removeEventListener('pointermove', this.updateRules[i]);
      this.target.parentNode.removeEventListener('pointermove', this.handleMove);
    });
  }

  oncreate(vnode) {
    vnode.dom.focus();
    this.target = vnode.dom;
    vnode.dom.parentNode.addEventListener('mouseup', this.removeMouseEvent);
    vnode.dom.parentNode.addEventListener('mouseleave', this.removeMouseEvent);

    // currently only delete events
    const handleExternalKeypress = (e) => {
      if (e.code !== 'Backspace') return;
      if (this.selected && !this.editing) {
        vnode.dom.parentNode.removeEventListener('mouseup', this.removeMouseEvent);
        vnode.dom.parentNode.removeEventListener('mouseleave', this.removeMouseEvent);

        vnode.attrs.setFocus(undefined);
        vnode.attrs.delete(this.id);
        window.removeEventListener('keydown', handleExternalKeypress);
        m.redraw();
      }
    };
    window.addEventListener('keydown', handleExternalKeypress);
  }

  handleMoveStart(e) {
    this.moveStep = getTrueMousePosition(e, this.target.parentNode, 1);
  }

  handleMove(e) {
    if (this.editing) return;
    const pos = getTrueMousePosition(e, this.target.parentNode, 1);
    this.pos = {
      x: this.pos.x - (this.moveStep.x - pos.x),
      y: this.pos.y - (this.moveStep.y - pos.y),
    };

    this.socket.emit('send', 'updateTextbox', this.id, {
      pos: pixToIn(this.pos, this.target.parentNode)
    });
    
    this.moveStep = pos;
    m.redraw();
  }

  view(vnode) {
    const resizeStyles = [styles.tl, styles.tr, styles.bl, styles.br];

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
      onselectstart: () => this.movable,
      onmousedown: (e) => {
        if (!vnode.attrs.editorState.isCanvasLevel) {
          e.stopPropagation();
          this.handleMoveStart(e);
          vnode.dom.parentNode.addEventListener('pointermove', this.handleMove);
          vnode.attrs.setFocus(this.id);
        }
      },
      ondblclick: () => {
        if (this.selected) {
          this.editing = true;
        }
        vnode.dom.lastChild.focus();
      },
      onfocusout: () => {
        this.editing = false;
      },
      class: `${styles.textbox} ${this.selected && !this.editing ? styles.movable : ''}`,
    },
    [...Array(4).keys()].map((i) => m(
      'div', {
        onmousedown: (e) => {
          vnode.dom.parentNode.addEventListener('pointermove', this.updateRules[i]);
          e.stopPropagation();
        },
        class: `${styles.resize_handle} ${resizeStyles[i]}`,
        style: {
          display: `${this.selected ? 'block' : 'none'}`,
        },
      },
    )),
    m('div', {
      class: `${vnode.attrs.isBeingEdited ? styles.beingedited : ''} ${styles.textfield} ${this.selected ? styles.sel_border : ''}`,
      contenteditable: true,
      onkeydown: (e) => {
        if (e.code === 'Escape') {
          vnode.dom.lastChild.blur();
          this.editing = false;
        }
      },
      onfocus: () => {
        if (!this.editing) {
          vnode.dom.lastChild.blur();
        }
      },
      spellcheck: false,
    }));
  }
}
