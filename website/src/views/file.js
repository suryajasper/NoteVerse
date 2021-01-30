import m from 'mithril'
import styles from '../explorer.css';

var isEditing = false;

class File {
  constructor(vnode) {
    this.hideElementEditButtons = true;
    this.showNameInput = vnode.attrs.file.isNew;
    this.startName = vnode.attrs.file.fileName;
    this.inputVal = vnode.attrs.file.fileName;
    console.log('vnode', vnode.attrs.file);
    // m.redraw();
  }
  
  updateFileNameInServer() {
    m.request({
      method: 'POST',
      url: 'http://localhost:2000/updateFolder',
      params: {
        query: {
          path: vnode.attrs.file.path,
          fileName: this.startName
        },
        type: 'file',
        update: {
          fileName: this.inputVal,
        }
      }
    }).then((res) => {
      console.log(res);
      this.startName = res.newName;
    });
  }

  oncreate(vnode) {
    this.startName = vnode.attrs.file.fileName;
    this.inputVal = vnode.attrs.file.fileName;
  }

  view(vnode) {
    return m('div', {className: `${styles.elementDivOuter}`}, 
    m('div', {className: `${styles.elementDiv}`}, [
      m('div', {className: `${styles.elementIconContainer}`, style: 'width: 20px;'}, [
          m('img', {src: '/src/images/File.svg'})
        ]),
        m('div', {className: `${styles.elementInfo}`}, [
          m('input', {className: `${styles.elementTitle}`, value: this.inputVal, disabled: !this.showNameInput, 
            oninput: e => {
              this.inputVal = e.target.value;
            }, onblur: () => {
              this.showNameInput = false;
              updateFileNameInServer();
            }, onkeydown: e => {
              if (e.key.toLowerCase() == 'enter') {
                this.showNameInput = false;
                updateFileNameInServer();
              } 
            }
          })
        ]),
        m('div', {style: "position:absolute; left:0; right:0; top:0; bottom:0;", hidden: this.showNameInput,
          onmouseenter: (e) => {
            this.hideElementEditButtons = false;
          }, onmouseleave: (e) => {
            this.hideElementEditButtons = true;
          }, onclick: function(e) {
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