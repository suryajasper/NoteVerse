import m from 'mithril'
import File from './file'
import styles from '../explorer.css';
import Folder from './folder';

class Explorer {
  constructor(vnode) {
    this.parentFolderId = vnode.attrs.folderId;
    this.folders = [];
    this.files = [];
    this.contextMenu = {
      x: 0,
      y: 0,
      hidden: 'none'
    }
    this.selectedNode = null;
    console.log('constructor', this.parentFolderId);
  }

  fetch() {
    m.request({
      method: "GET",
      url: "http://localhost:2000/getDocuments",
      params: {
        uid: 'suryajasper',
        parentFolderId: this.parentFolderId
      }
    }).then(elements => {
      if (!elements) return;
      this.files = [];
      this.folders = [];
      for (var element of elements) {
        element.isNew = false;
        if (element.isFile) this.files.push(element);
        else this.folders.push(element);
      }
      m.redraw();
    }).catch(function(error) {
      window.location.href = '/notes#!/root/';
    })
  }

  oncreate(vnode) {
    this.fetch();
    this.contextMenu = {
      x: 0,
      y: 0,
      hidden: 'none'
    }
    console.log('oncreate', this.contextMenu);
  }
  
  createFile() {
    console.log(this);
    var date = new Date();
    var newFileObj = {fileName: 'Note ' + date.toDateString() + ' ' + date.toTimeString(), dateModified: date, isNew: true};
    // this.files.push(newFileObj);
    m.request({
      method: 'POST',
      url: 'http://localhost:2000/newDocument',
      params: {
        fileName: newFileObj.fileName,
        uid: 'suryajasper',
        parentFolderId: this.parentFolderId
      }
    }).then(res => {
      this.fetch();
    });
  }

  createFolder() {
    var date = new Date();
    var newFolderObj = {fileName: 'New Folder', dateModified: date, isNew: true};
    console.log('getting folders', this.folders);
    // this.folders.push(newFolderObj);
    m.request({
      method: 'POST',
      url: 'http://localhost:2000/newFolder',
      params: {
        fileName: newFolderObj.fileName,
        uid: 'suryajasper',
        parentFolderId: this.parentFolderId
      }
    }).then(res => {
      this.fetch();
    });
  }

  updateContext(action, e, selectedNode) {
    if (action == 'show') {
      console.log('selectedNode =', selectedNode);
      this.selectedNode = selectedNode;
      var rect = e.target.getBoundingClientRect();
      this.contextMenu.hidden = 'block';
      this.contextMenu.x = e.clientX + window.scrollX;
      this.contextMenu.y = e.clientY + window.scrollY;
      console.log(this.contextMenu);
    } else if (action == 'hide') {
      console.log('bruh');
      this.contextMenu.hidden = 'none';
    }
  }

  view(vnode) {
    if (vnode.attrs.folderId && vnode.attrs.folderId != this.parentFolderId) {
      this.parentFolderId = vnode.attrs.folderId;
      this.fetch();
    }
    return m('div', {class: `${styles.explorerContainer}`}, [
      m('div', {class: `${styles.centerHorizontalContainer}`}, [
        m('div', {class: `${styles.centerHorizontalChild} ${styles.optionsMenu} ` }, [
          m('div', {class: `${styles.dropdownDiv}`}, [
            m('button', {class: `${styles.dropdownButton}`}, 'Add'),
            m('div', {class: `${styles.dropdownContent}`}, [
              m('div', {class: `${styles.dropdownElement}`, onclick: () => this.createFile()},
                m('img', {src: '/src/images/File.svg'})
              ),
              m('div', {class: `${styles.dropdownElement}`, onclick: () => this.createFolder()},
                m('img', {src: '/src/images/Folder.svg'})
              )
            ])
          ]),
          m('button', {class: `${styles.optionsMenuButton}`, onclick: e => {
            this.updateContext('show', e);
          }}, 'Share Settings'),
          m('button', {class: `${styles.optionsMenuButton}`}, 'Remove Folder')
        ])
      ]),
      m('p', {class: `${styles.elementTypeName}`}, 'Folders'),
      m('div', {class: `${styles.foldersView}`}, 
        this.folders.map(folderObj => m(Folder, {
          key: folderObj._id,
          file: folderObj, 
          updateContext: (act, e, g) => {this.updateContext(act, e, g);}, 
          refresh: () => {this.fetch();}
        }) )
      ),
      m('p', {class: `${styles.elementTypeName}`}, 'Files'),
      m('div', {class: `${styles.explorerContent}`}, this.files.map(fileObj => {
        if (!fileObj._id) return;
        return m(File, {key: fileObj._id, file: fileObj}) 
      })),
      m('div', {class: styles.contextMenuDiv, style: `left: ${this.contextMenu.x}px; top: ${this.contextMenu.y}px; display: ${this.contextMenu.hidden}`}, [
        m('ul', {class: styles.contextMenuList}, [
          m('li', {onclick: () => {
            console.log(this.selectedNode);
            if (this.selectedNode) {
              this.selectedNode.rename();
            }
          }}, [
            m('div', {class: styles.folderItemContainer}, m('img', {style: 'width: 24px; height: 24px', src: '/src/images/Edit.svg'})),
            m('div', {class: styles.folderItemContainer}, m('span', 'Rename'))
          ]),
          m('li', {onclick: () => {
            if (this.selectedNode) {
              this.selectedNode.remove();
            }
          }}, [
            m('div', {class: styles.folderItemContainer}, m('img', {style: 'width: 24px; height: 24px', src: '/src/images/Delete.svg'})),
            m('div', {class: styles.folderItemContainer}, m('span', 'Remove'))
          ]),
          m('li', [
            m('div', {class: styles.folderItemContainer}, m('img', {style: 'width: 24px; height: 24px', src: '/src/images/Share.svg'})),
            m('div', {class: styles.folderItemContainer}, m('span', 'Share'))
          ])
        ])
      ])
    ])
  }
}

export default Explorer;