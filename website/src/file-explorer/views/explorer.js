import m from 'mithril';
import File from './file';
import Path from './path';
import styles from '../explorer.css';
import Cookies from '../../utils/cookies';
import Folder from './folder';
import { SharePopup } from './popup';

class Explorer {
  constructor(vnode) {
    this.uid = Cookies.get('uid');
    this.parentFolderId = vnode.attrs.folderId;
    this.folders = [];
    this.files = [];
    this.path = [];
    this.contextMenu = {
      x: 0,
      y: 0,
      hidden: 'none'
    };
    this.selectedNode = null;
    this.shareSettings = {
      suggestions: [],
      applicableSuggestions: [],
      contributors: [],
      sharePopupVisible: false
    };
  }

  fetch() {
    m.request({
      method: "GET",
      url: "http://localhost:2000/getDocuments",
      params: {
        uid: this.uid,
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

  fetchPath() {
    m.request({
      method: "GET",
      url: "http://localhost:2000/getLocation",
      params: {
        parentFolderId: this.parentFolderId
      }
    }).then(location => {
      console.log('path', location);
      this.path = location;
      m.redraw();
    }).catch(function(error) {
      window.location.href = '/notes#!/root/';
    })
  }

  oncreate(vnode) {
    if (!Cookies.get('uid')) {
      window.location.href = '/#!/login';
    }
    this.fetch();
    this.fetchPath();
    this.contextMenu = {
      x: 0,
      y: 0,
      hidden: 'none'
    }
  }
  
  createFile() {
    var date = new Date();
    var newFileObj = {fileName: 'Note ' + date.toDateString() + ' ' + date.toTimeString(), dateModified: date, isNew: true};
    // this.files.push(newFileObj);
    m.request({
      method: 'POST',
      url: 'http://localhost:2000/newFile',
      params: {
        isFile: true,
        fileName: newFileObj.fileName,
        uid: this.uid,
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
      url: 'http://localhost:2000/newFile',
      params: {
        isFile: false,
        fileName: newFolderObj.fileName,
        uid: this.uid,
        parentFolderId: this.parentFolderId
      }
    }).then(res => {
      this.fetch();
    });
  }

  updateContext(action, e, selectedNode) {
    if (action == 'show') {
      this.selectedNode = selectedNode;
      this.contextMenu.hidden = 'block';
      this.contextMenu.x = e.clientX + window.scrollX;
      this.contextMenu.y = e.clientY + window.scrollY;
    } else if (action == 'hide') {
      console.log('bruh');
      this.contextMenu.hidden = 'none';
    }
  }

  fetchSuggestions() {
    console.log(this.uid, 'fetch');
    this.shareSettings.sharePopupVisible = false;
    m.request({
      method: "GET",
      url: "http://localhost:2000/getPreviousCollaborators",
      params: {
        uid: this.uid
      }
    }).then(names => {
      for (var i = 0; i < names.length; i++) {
        names[i] = (({ _id, username }) => ({ _id, username }))(names[i]);
      }
      
      this.shareSettings.suggestions = names;
    }).catch(err => {
      console.log(err);
    })
  }

  loadUsername(e, name) {
    var username = (name) ? name: e.target.value;

    if (username == '') return;
    if (this.shareSettings.contributors.includes(username)) return;

    m.request({
      method: "GET",
      url: "http://localhost:2000/getUser",
      params: {
        uid: this.uid,
        query: {
          username: username
        }
      }
    }).then(userRes => {
      let formattedContributor = (({ username }) => ({ username }))(userRes);
      formattedContributor.authorUID = userRes._id;
      formattedContributor.editingMode = 'editing';
      formattedContributor.canShare = true;
      this.shareSettings.contributors.push(formattedContributor);
      e.target.value = '';
    }).catch(err => {
      e.target.value = '';
    })
  }

  clearSuggestions() {
    this.shareSettings.applicableSuggestions = [];
  }

  loadSuggestions(e) {
    if (!this.shareSettings.suggestions || this.shareSettings.suggestions.length == 0) return;
    
    this.clearSuggestions();
    for (var suggestion of this.shareSettings.suggestions) {
      if (suggestion.username.toLowerCase().includes(e.target.value.toLowerCase().trim()) &&
          this.getIndexById(this.shareSettings.contributors, 'authorUID', suggestion._id) < 0) {
        this.shareSettings.applicableSuggestions.push(suggestion);
      }
    }
  }

  getIndexById(array, key, value) {
    for (var i = 0; i < array.length; i++) {
      if (array[i][key] === value) {
        return i;
      }
    }
    return -1;
  }
  
  updateContributor(id, data) {
    let ind = this.getIndexById(this.shareSettings.contributors, 'authorUID', id);
    Object.assign(this.shareSettings.contributors[ind], data);
  }
  
  removeContributor(id) {
    let ind = this.getIndexById(this.shareSettings.contributors, 'authorUID', id);
    this.shareSettings.contributors.splice(ind, 1);
  }
  
  loadContributors() {
    console.log('selectednode', this.selectedNode?.fileId);
    m.request({
      method: "GET",
      url: "http://localhost:2000/getCollaborators",
      params: {
        fileId: this.selectedNode?.fileId
      }
    }).then(collaboratorRes => {
      console.log('collaboratorRes', collaboratorRes);
      this.shareSettings.contributors = collaboratorRes;
      this.shareSettings.sharePopupVisible = true;
      m.redraw();
    }).catch(err => {
      console.log(err);
      console.log('no contributors');
    })
  }

  saveContributors() {
    console.log('saving', this.shareSettings.contributors);
    m.request({
      method: 'POST',
      url: 'http://localhost:2000/updateCollaborators',
      params: {
        uid: this.uid,
        fileId: this.selectedNode?.fileId,
        collaborators: this.shareSettings.contributors        
      }
    }).then((res) => {
      console.log('shared', res);
      this.shareSettings.sharePopupVisible = false;
    }).catch(err => {
      console.log('error saving contributors', err);
    });
  }

  removeFile(id) {
    console.log('remove file', id);
    m.request({
      method: 'POST',
      url: 'http://localhost:2000/deleteFile',
      params: {
        idToDelete: id
      },
      deserialize: function(value) {return value}
    }).then((res) => {
      this.fetch();
    });
  }

  view(vnode) {
    if (vnode.attrs.folderId && vnode.attrs.folderId != this.parentFolderId) {
      this.parentFolderId = vnode.attrs.folderId;
      this.fetch();
      this.fetchPath();
    }
    return m('div', {class: `${styles.explorerContainer}`}, [
      m('div', {class: `${styles.centerHorizontalContainer}`}, [
        m('div', {class: `${styles.centerHorizontalChild} ${styles.optionsMenu} ` }, [
          m('div', {class: `${styles.dropdownDiv}`}, [
            m('button', {class: `${styles.dropdownButton}`}, 'Add'),
            m('div', {class: `${styles.dropdownContent}`}, [
              m('div', {class: `${styles.dropdownElement}`, onclick: () => this.createFile()},
                m('img', {src: '/src/file-explorer/images/File.svg'})
              ),
              m('div', {class: `${styles.dropdownElement}`, onclick: () => this.createFolder()},
                m('img', {src: '/src/file-explorer/images/Folder.svg'})
              )
            ])
          ]),
          m('button', {class: `${styles.optionsMenuButton}`, onclick: e => {
            // this.updateContext('show', e);
            Cookies.erase('uid');
          }}, 'Share Settings'),
          m('button', {class: `${styles.optionsMenuButton}`, onclick: e => {
            this.fetch();
          }}, 'Refresh'),
          m('button', {class: `${styles.optionsMenuButton}`}, 'Edit Profile')
        ]),
        m(Path, {location: this.path}),
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
        return m(File, {
          key: fileObj._id, 
          file: fileObj,
          updateContext: (act, e, g) => {this.updateContext(act, e, g);}, 
          refresh: () => {this.fetch();},
          remove: () => {this.files = this.files.filter(el => el != fileObj); console.log(this.files); m.redraw();}
        }) 
      })),
      m('div', {class: styles.contextMenuDiv, style: `left: ${this.contextMenu.x}px; top: ${this.contextMenu.y}px; display: ${this.contextMenu.hidden}`}, [
        m('ul', {class: styles.contextMenuList}, [
          m('li', {onclick: () => {
            console.log(this.selectedNode);
            if (this.selectedNode) {
              this.selectedNode.rename();
            }
          }}, [
            m('div', {class: styles.folderItemContainer}, m('img', {style: 'width: 24px; height: 24px', src: '/src/file-explorer/images/Edit.svg'})),
            m('div', {class: styles.folderItemContainer}, m('span', 'Rename'))
          ]),
          m('li', {onclick: () => {
            if (this.selectedNode) {
              this.removeFile(this.selectedNode.fileId);
            }
          }}, [
            m('div', {class: styles.folderItemContainer}, m('img', {style: 'width: 24px; height: 24px', src: '/src/file-explorer/images/Delete.svg'})),
            m('div', {class: styles.folderItemContainer}, m('span', 'Remove'))
          ]),
          m('li', {onclick: () => {
            this.fetchSuggestions();
            this.loadContributors();
          }}, [
            m('div', {class: styles.folderItemContainer}, m('img', {style: 'width: 24px; height: 24px', src: '/src/file-explorer/images/Share.svg'})),
            m('div', {class: styles.folderItemContainer}, m('span', 'Share'))
          ])
        ])
      ]),
      m(SharePopup, {
        title: 'Share',

        suggestions: this.shareSettings.applicableSuggestions,
        contributors: this.shareSettings.contributors,
        fileId: this.selectedNode?.fileId,
        isVisible: this.shareSettings.sharePopupVisible,
        
        hide:               () => { this.shareSettings.sharePopupVisible = false; },
        removeContributor:  this.removeContributor.bind(this),
        updateContributor:  this.updateContributor.bind(this),
        getIndexById:       this.getIndexById.bind(this),
        loadSuggestions:    this.loadSuggestions.bind(this),
        clearSuggestions:   this.clearSuggestions.bind(this),
        loadUsername:       this.loadUsername.bind(this),
        fetchSuggestions:   this.fetchSuggestions.bind(this),
        saveContributors:   this.saveContributors.bind(this)
      })
    ])
  }
}

export default Explorer;