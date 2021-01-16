import m from 'mithril';
import navbar from '../elements/navbar';
import version from '../elements/version';
import Canvas from './canvas';
import Toolbar from './toolbar';
import styles from './editor.css';

let editorState = {};

const updateState = (state) => {
  editorState = Object.assign(editorState, state);
};

export default {
  view() {
    return [m(navbar, m(version)),
      m(Toolbar, { updateState }),
      m('div', { class: styles.container },
        m(Canvas, { editorState }))];
  },
};
