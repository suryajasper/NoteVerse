import m from 'mithril';
import styles from './navbar.css';

export default {
  view(vnode) {
    return m('div', { class: styles.container },
      m(m.route.Link, { class: styles.home, href: '/' }, ''),
      vnode.children);
  },
};
