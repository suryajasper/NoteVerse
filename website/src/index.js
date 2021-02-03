import m from 'mithril';
import Explorer from './views/explorer';
import {Login, Signup} from './views/login';

m.route(document.body, "/notes/root", {
  "/notes/:folderId": Explorer,
  '/login': Login,
  '/signup': Signup
});

// m.mount(document.body, Explorer);