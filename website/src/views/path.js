import m from 'mithril'
import styles from '../explorer.css';

export default function Path() {
  return {
    view(vnode) {
      return m('div', {class: styles.pathDiv}, vnode.attrs.location.map(folder => {
        return [
          m('div', {class: styles.pathFolder, onclick: e => {
            window.location.href = '/#!/notes/' + folder.id;
          }}, folder.name),
          m('p', {class: styles.pathSlash}, '/')
        ];
      }));
    }
  }
}