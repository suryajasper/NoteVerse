import m from 'mithril'
import styles from '../explorer.css';
import Element from './element';

class Folder extends Element {
  constructor(vnode) {
    super(vnode);
  }
  
  view() {
    return m('div', {class: `${styles.folderDivOuter}`}, [
      m('div', {class: `${styles.folderDiv}`}, [
        m('div', {class: `${styles.folderItemContainer}`, style: 'width: 20px;'}, [
          m('img', {src: '/src/images/Folder.svg'})
        ]),
        m('div', {class: `${styles.folderItemContainer}`, style: ''}, this.nameInput(styles.folderTitle)),
        m('div', {class: styles.overflowContainer},
          m('img', {src: '/src/images/Overflow.svg'})
        ),
        m('div', {class: styles.overflowDiv},
          
        ),
        m('div', {style: "position:absolute; left:0; right:0; top:0; bottom:0;", hidden: this.showNameInput,
          onmouseenter: (e) => {
            this.hideElementEditButtons = false;
          }, onmouseleave: (e) => {
            this.hideElementEditButtons = true;
          }, onclick: (e) => {
            if (e.shiftKey) {
              var inpField = e.target.parentNode.getElementsByTagName('input')[0];
              this.showNameInput = true;
              inpField.focus();
              inpField.select();
            } else if (!this.showNameInput) {
              var href = window.location.href;
              if (href.charAt(href.length-1) == '/') window.location.href += this.inputVal;
              else window.location.href += '/' + this.inputVal;
            }
          }
        })
      ])
    ])
  }
}

export default Folder;