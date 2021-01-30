import m from 'mithril'
import File from './file'
import styles from '../explorer.css';
import Folder from './folder';

class Explorer {
  constructor(vnode) {
    this.lastPath = null;
    this.folders = [];
    this.files = [];
    console.log('constructor', this.files);
  }

  fetch() {
    m.request({
      method: "GET",
      url: "http://localhost:2000/getDocuments",
      params: {
        uid: 'suryajasper',
        path: this.lastPath
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
    console.log('ON INIT', vnode);
    this.lastPath = vnode.attrs.path;
    this.fetch();
  }

  createFile() {
    console.log(this);
    var date = new Date();
    var newFileObj = {fileName: 'Note ' + date.toDateString() + ' ' + date.toTimeString(), dateModified: date, isNew: true};
    this.files.push(newFileObj);
    m.request({
      method: 'POST',
      url: 'http://localhost:2000/newDocument',
      params: {
        fileName: newFileObj.fileName,
        uid: 'suryajasper',
        path: this.lastPath
      }
    });
  }

  createFolder() {
    var date = new Date();
    var newFolderObj = {fileName: 'New Folder', dateModified: date, isNew: true};
    console.log('getting folders', this.folders);
    this.folders.push(newFolderObj);
    m.request({
      method: 'POST',
      url: 'http://localhost:2000/newFolder',
      params: {
        fileName: newFolderObj.fileName,
        uid: 'suryajasper',
        path: this.lastPath
      }
    });
  }

  view(vnode) {
    if (vnode.attrs.path && vnode.attrs.path != this.lastPath) {
      this.lastPath = vnode.attrs.path;
      this.fetch();
    }
    return m('div', {className: `${styles.explorerContainer}`}, [
      m('div', {className: `${styles.centerHorizontalContainer}`}, [
        m('div', {className: `${styles.centerHorizontalChild} ${styles.optionsMenu} ` }, [
          m('div', {className: `${styles.dropdownDiv}`}, [
            m('button', {className: `${styles.dropdownButton}`}, 'Add'),
            m('div', {className: `${styles.dropdownContent}`}, [
              m('div', {className: `${styles.dropdownElement}`, onclick: () => this.createFile()},
                m('img', {src: '/src/images/File.svg'})
              ),
              m('div', {className: `${styles.dropdownElement}`, onclick: () => this.createFolder()},
                m('img', {src: '/src/images/Folder.svg'})
              )
            ])
          ]),
          m('button', {className: `${styles.optionsMenuButton}`}, 'Share Settings'),
          m('button', {className: `${styles.optionsMenuButton}`}, 'Remove Folder')
        ])
      ]),
      m('p', {className: `${styles.elementTypeName}`}, 'Folders'),
      m('div', {className: `${styles.foldersView}`}, this.folders.map(folderObj => m(Folder, folderObj))),
      m('p', {className: `${styles.elementTypeName}`}, 'Files'),
      m('div', {className: `${styles.explorerContent}`}, this.files.map(fileObj => {
        console.log('addingFile', fileObj.fileName);
        // m.redraw();
        return m(File, {key: fileObj._id, file: fileObj});
      }))
    ])
  }
}

export default Explorer;