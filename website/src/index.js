import m from 'mithril';
import Explorer from './views/explorer';

m.route(document.body, "/notes", {
  "/:path...": Explorer
});

// m.mount(document.body, Explorer);