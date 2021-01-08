import m from 'mithril';
import navbar from '../elements/navbar';
import version from '../elements/version';
import styles from './editor.css';

export default {
  view() {
    return [m(navbar, m(version)),
      m('div', { class: styles.container },
        m('div', { class: styles.letter_doc }),
        m('div', { class: styles.letter_doc }),
      )];
  },
};
