import m from 'mithril';
import Editor from './editor/editor';
import './main.css';

m.route.prefix = '';
m.route(document.body, '/', {
  '/': {
    onmatch: () => {
      m.route.set('/editor');
    },
  },
  '/editor': {
    onmatch: () => {
      return Editor;
    },
  },
});
