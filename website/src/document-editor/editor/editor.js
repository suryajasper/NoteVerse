import m from 'mithril';
import navbar from '../elements/navbar';
import version from '../elements/version';
import {Canvas} from './canvas';
import Toolbar from './toolbar';
import FeatureLayer from './feature';
import styles from './editor.css';
import io from 'socket.io-client';

let editorState = {};

let socket = io('localhost:2000');

const updateState = (state) => {
  editorState = Object.assign(editorState, state);
};

export default {
  view(vnode) {
    return [m(navbar, m(version)),
      m(Toolbar, { updateState, socket }),
      m('div', { class: styles.container },
        m(Canvas, { editorState, socket, docId: vnode.attrs.docId }, m(FeatureLayer, { editorState, socket }))),
    ];
  },
};
