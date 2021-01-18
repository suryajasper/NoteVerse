import m from 'mithril'
import File from './file'
import styles from '../explorer.css';
import Folder from './folder';

var folders = [{fileName: 'bruh', dateModified: new Date()}, {fileName: 'bruh', dateModified: new Date()}];
var files = [{fileName: 'bruh', dateModified: new Date()}, {fileName: 'bruh', dateModified: new Date()}, {fileName: 'bruh', dateModified: new Date()}, {fileName: 'bruh', dateModified: new Date()}];

var Explorer = {
  view() {
    return [m('div', {className: `${styles.explorerContainer}`}, [
      m('div', {className: `${styles.centerHorizontalContainer}`}, [
        m('div', {className: `${styles.centerHorizontalChild} ${styles.optionsMenu} ` }, [
          m('div', {className: `${styles.dropdownDiv}`}, [
            m('button', {className: `${styles.dropdownButton}`}, 'Add'),
            m('div', {className: `${styles.dropdownContent}`}, [
              m('div', {className: `${styles.dropdownElement}`, onclick: function() {
                var date = new Date();
                files.push({fileName: 'Note ' + date.toDateString() + ' ' + date.toTimeString(), dateModified: date});
              }}, [
                m('img', {src: '/src/images/File.svg'})
              ]),
              m('div', {className: `${styles.dropdownElement}`, onclick: function() {
                var date = new Date();
                folders.push({fileName: 'New Folder'});
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
      m('div', {className: `${styles.foldersView}`}, folders.map(folderObj => m(Folder, folderObj))),
      m('p', {className: `${styles.elementTypeName}`}, 'Files'),
      m('div', {className: `${styles.explorerContent}`}, files.map(fileObj => m(File, fileObj)))
    ])]
  }
}

export default Explorer;