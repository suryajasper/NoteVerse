import m from 'mithril'
import styles from '../explorer.css';

class Element {
  constructor(vnode) {
    this.hideElementEditButtons = true;
    this.fileObj = vnode.attrs.file;
    this.showNameInput = vnode.attrs.file.isNew;
    this.startName = vnode.attrs.file.fileName;
    this.inputVal = vnode.attrs.file.fileName;
    this.parentFolderId = vnode.attrs.file.parentFolderId;
    this.fileId = vnode.attrs.key;
    console.log('fileObj', this.fileObj);
  }
  
  updateFileNameInServer() {
    m.request({
      method: 'POST',
      url: 'http://localhost:2000/updateFolder',
      params: {
        query: {
          _id: this.fileId
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

  nameInput(classType) {
    return m('input', {className: classType, value: this.inputVal, disabled: !this.showNameInput, 
      oninput: e => {
        this.inputVal = e.target.value;
      }, onblur: () => {
        this.showNameInput = false;
        this.updateFileNameInServer();
      }, onkeydown: e => {
        if (e.key.toLowerCase() == 'enter') {
          this.showNameInput = false;
          this.updateFileNameInServer();
        } 
      }
    });
  }

  view(vnode) {
    return m('div', {className: `${styles.elementDivOuter}`}, 
    m('div', {className: `${styles.elementDiv}`}, [
      m('div', {className: `${styles.elementIconContainer}`, style: 'width: 20px;'}, [
          m('img', {src: '/src/file-explorer/images/File.svg'})
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

export default Element;