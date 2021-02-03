import m from 'mithril'
import styles from '../explorer.css';
import Element from './element';

class Folder extends Element {
  constructor(vnode) {
    super(vnode);
    this.refresh = vnode.attrs.refresh;
  }

  rename() {
    this.showNameInput = true;
  }

  remove() {
    m.request({
      method: 'POST',
      url: 'http://localhost:2000/deleteFile',
      params: {
        idToDelete: this.fileId
      }
    }).then((res) => {
      console.log(res);
      this.refresh();
    });
  }
  
  view(vnode) {
    return m('div', {class: `${styles.folderDivOuter}`}, [
      m('div', {class: `${styles.folderDiv}`}, [
        m('div', {class: `${styles.folderItemContainer}`, style: 'width: 20px;'}, [
          m('img', {src: '/src/images/Folder.svg'})
        ]),
        m('div', {class: `${styles.folderItemContainer}`, style: ''}, this.nameInput(styles.folderTitle)),
        m('div', {class: styles.overflowContainer, tabindex: '0', onclick: e => {
          vnode.attrs.updateContext('show', e, this);
        }, onblur: () => {
          setTimeout(() => {
            vnode.attrs.updateContext('hide');
            m.redraw();
          }, 100);
        }},
          m('img', {src: '/src/images/Overflow.svg'})
        ),
        m('div', {style: "position:absolute; left:0; right:0; top:0; bottom:0;", tabindex: '0', hidden: this.showNameInput,
          onmouseenter: (e) => {
            this.hideElementEditButtons = false;
          }, onmouseleave: (e) => {
            this.hideElementEditButtons = true;
          }, onclick: (e) => {
            if (e.shiftKey) {
              this.rename();
            } else if (!this.showNameInput) {
              window.location.href = `/#1/notes/${this.fileId}`;
            }
          }, oncontextmenu: e => {
            e.preventDefault();
            vnode.attrs.updateContext('show', e, this);
          }, onblur: () => {
            setTimeout(() => {
              vnode.attrs.updateContext('hide');
              m.redraw();
            }, 100);
          }
        })
      ])
    ])
  }
}

export default Folder;