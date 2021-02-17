import m from 'mithril'
import File from './file'
import styles from '../explorer.css';
import Cookies from '../utils/cookies';
import Folder from './folder';
import { SharePopup } from './popup';

class Explorer {
  constructor(vnode) {
    this.uid = Cookies.get('uid');
    this.parentFolderId = vnode.attrs.folderId;
    this.folders = [];
    this.files = [];
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

  oncreate(vnode) {
    if (!Cookies.get('uid')) {
      window.location.href = '/#!/login';
    }
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
      url: 'http://localhost:2000/newFolder',
      params: {
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
          this.getIndexById(suggestion._id) < 0) {
        this.shareSettings.applicableSuggestions.push(suggestion);
      }
    }
  }

  getIndexById(id) {
    for (var i = 0; i < this.shareSettings.contributors.length; i++) {
      if (this.shareSettings.contributors[i].authorUID === id) {
        return i;
      }
    }
    return -1;
  }
  
  updateContributor(id, data) {
    let ind = this.getIndexById(id);
    Object.assign(this.shareSettings.contributors[ind], data);
  }
  
  removeContributor(id) {
    let ind = this.getIndexById(id);
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
            // this.updateContext('show', e);
            Cookies.erase('uid');
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
          m('li', {onclick: () => {
            this.fetchSuggestions();
            this.loadContributors();
          }}, [
            m('div', {class: styles.folderItemContainer}, m('img', {style: 'width: 24px; height: 24px', src: '/src/images/Share.svg'})),
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
        
        hide:               ()          =>  {this.shareSettings.sharePopupVisible = false;},
        removeContributor:  id          =>  this.removeContributor(id),
        updateContributor:  (id, data)  =>  this.updateContributor(id, data),
        getIndexById:       id          =>  this.getIndexById(id),
        loadSuggestions:    e           =>  this.loadSuggestions(e),
        clearSuggestions:   ()          =>  this.clearSuggestions(),
        loadUsername:       (e, name)   =>  this.loadUsername(e, name),
        fetchSuggestions:   ()          =>  this.fetchSuggestions(),
        saveContributors:   ()          =>  this.saveContributors()
      })
    ])
  }
}

export default Explorer;