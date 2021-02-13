import m from 'mithril'
import styles from '../explorer.css';
import Element from './element';

class File extends Element {
  constructor(vnode) {
    super(vnode);
    this.refresh = vnode.attrs.refresh;
    this.removeFromExplorer = vnode.attrs.remove;
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
      this.removeFromExplorer();
    });
  }

  view(vnode) {
    return m('div', {className: `${styles.elementDivOuter}`}, 
    m('div', {className: `${styles.elementDiv}`}, [
      m('div', {className: `${styles.elementIconContainer}`, style: 'width: 20px;'}, [
          m('img', {src: '/src/images/File.svg'})
        ]),
        m('div', {className: `${styles.elementInfo}`}, this.nameInput(styles.elementTitle)),
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
              this.showNameInput = true;
            } else if (!this.showNameInput) {
              
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
    );
  }
}

export default File;