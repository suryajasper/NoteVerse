import m from 'mithril';
import pkg from '../../package.json';
import styles from './navbar.css';

export default {
  view() {
    return m('span', { class: styles.right }, `alpha v${pkg.version}`);
  },
};
