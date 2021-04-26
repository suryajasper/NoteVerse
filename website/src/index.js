import m from 'mithril';
import EditProfile from './file-explorer/views/edit-profile';
import Explorer from './file-explorer/views/explorer';
import {Login, Signup} from './file-explorer/views/login';
import Editor from './document-editor/editor/editor';

m.route(document.body, "/notes/root", {
  "/notes/:folderId": Explorer,
  '/login': Login,
  '/signup': Signup,
  '/document/:docId': Editor,
  '/editprofile': EditProfile
});

// m.mount(document.body, Explorer);