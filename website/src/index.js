import m from 'mithril';
import Explorer from './views/explorer';
import {Login, Signup} from './views/login';
import Editor from './document-editor/editor/editor';
import EditProfile from './views/edit-profile'

m.route(document.body, "/notes/root", {
  "/notes/:folderId": Explorer,
  '/login': Login,
  '/signup': Signup,
  '/document/:docId': Editor,
  '/editprofile': EditProfile
});

// m.mount(document.body, Explorer);