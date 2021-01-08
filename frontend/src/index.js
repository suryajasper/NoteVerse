import m from 'mithril';
import Editor from './editor';
import './main.css';

m.route.prefix = '';
m.route(document.body, '/', {
  '/editor': {
    onmatch: () => {
      m.route.set('/editor');
      return Editor;
    },
  },
});
