import m from 'mithril'
import File from './file'
import styles from '../explorer.css';
import Folder from './folder';


var Content = {
  lastPath: null,
  folders: [],
  files: [],
  fetch: function() {
    var self = this;
    m.request({
      method: "GET",
      url: "http://localhost:2000/getDocuments",
      params: {
        uid: 'suryajasper',
        path: self.lastPath
      }
    }).then(function(elements) {
      console.log(elements);
      if (!elements) return;
      self.files = [];
      self.folders = [];
      for (var element of elements) {
        element.isNew = false;
        if (element.isFile) self.files.push(element);
        else self.folders.push(element);
      }
      m.redraw();
    }).catch(function(error) {
      window.location.href = '/notes#!/root/';
    })
  }
}

var Explorer = {
  oninit: function(vnode) {
    console.log(vnode.attrs.path);
    Content.lastPath = vnode.attrs.path;
    Content.fetch();
  },
  view: function(vnode) {
    if (vnode.attrs.path && vnode.attrs.path != Content.lastPath) {
      Content.lastPath = vnode.attrs.path;
      console.log('newPath', Content.lastPath);
      Content.fetch();
    }
    return [m('div', {className: `${styles.explorerContainer}`}, [
      m('div', {className: `${styles.centerHorizontalContainer}`}, [
        m('div', {className: `${styles.centerHorizontalChild} ${styles.optionsMenu} ` }, [
          m('div', {className: `${styles.dropdownDiv}`}, [
            m('button', {className: `${styles.dropdownButton}`}, 'Add'),
            m('div', {className: `${styles.dropdownContent}`}, [
              m('div', {className: `${styles.dropdownElement}`, onclick: function() {
                var date = new Date();
                var newFileObj = {fileName: 'Note ' + date.toDateString() + ' ' + date.toTimeString(), dateModified: date, isNew: true};
                Content.files.push(newFileObj);
                m.request({
                  method: 'POST',
                  url: 'http://localhost:2000/newDocument',
                  params: {
                    fileName: newFileObj.fileName,
                    uid: 'suryajasper',
                    path: vnode.attrs.path
                  }
                });
              }}, [
                m('img', {src: '/src/images/File.svg'})
              ]),
              m('div', {className: `${styles.dropdownElement}`, onclick: function() {
                var date = new Date();
                var newFolderObj = {fileName: 'New Folder', dateModified: date, isNew: true};
                Content.folders.push(newFolderObj);
                m.request({
                  method: 'POST',
                  url: 'http://localhost:2000/newFolder',
                  params: {
                    fileName: newFolderObj.fileName,
                    uid: 'suryajasper',
                    path: vnode.attrs.path
                  }
                });
              }}, [
                m('img', {src: '/src/images/Folder.svg'})
              ])
            ])
          ]),
          m('button', {className: `${styles.optionsMenuButton}`}, 'Share Settings'),
          m('button', {className: `${styles.optionsMenuButton}`}, 'Remove Folder')
        ])
      ]),
      m('p', {className: `${styles.elementTypeName}`}, 'Folders'),
      m('div', {className: `${styles.foldersView}`}, Content.folders.map(folderObj => m(Folder, folderObj))),
      m('p', {className: `${styles.elementTypeName}`}, 'Files'),
      m('div', {className: `${styles.explorerContent}`}, Content.files.map(fileObj => {
        // console.log('addingFile', fileObj);
        return m(File, fileObj);
      }))
    ])]
  }
}

export default Explorer;