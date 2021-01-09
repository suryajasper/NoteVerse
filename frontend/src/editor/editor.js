import m from 'mithril';
import navbar from '../elements/navbar';
import version from '../elements/version';
import Document from './document';
import styles from './editor.css';

export default {
  view() {
    return [m(navbar, m(version)),
      m('div', { class: styles.container },
        m(Document),
      )];
  },
};
