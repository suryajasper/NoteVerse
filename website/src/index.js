import m from 'mithril';
import Explorer from './views/explorer';
import {Login, Signup} from './views/login';
import Editor from './document-editor/editor/editor';

m.route(document.body, "/notes/root", {
  "/notes/:folderId": Explorer,
  '/login': Login,
  '/signup': Signup,
  '/document/:docId': Editor
});

// m.mount(document.body, Explorer);