import m from 'mithril'
import styles from '../explorer.css';
import Element from './element';

class File extends Element {
  constructor(vnode) {
    super(vnode);
  }

  view(vnode) {
    return m('div', {className: `${styles.elementDivOuter}`}, 
    m('div', {className: `${styles.elementDiv}`}, [
      m('div', {className: `${styles.elementIconContainer}`, style: 'width: 20px;'}, [
          m('img', {src: '/src/images/File.svg'})
        ]),
        m('div', {className: `${styles.elementInfo}`}, this.nameInput(styles.elementTitle)),
        m('div', {style: "position:absolute; left:0; right:0; top:0; bottom:0;", hidden: this.showNameInput,
          onmouseenter: (e) => {
            this.hideElementEditButtons = false;
          }, onmouseleave: (e) => {
            this.hideElementEditButtons = true;
          }, onclick: (e) => {
            if (e.shiftKey) {
              this.showNameInput = true;
            } else if (!this.showNameInput) {
              
            }
          }
        })
      ])
    );
  }
}

export default File;