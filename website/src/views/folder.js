import m from 'mithril'
import styles from '../explorer.css';


function Folder(vnode) {
  var hideElementEditButtons = true;
  
  return { view: function(subvnode) {
    return m('div', {className: `${styles.folderDivOuter}`}, [
      m('div', {className: `${styles.folderDiv}`, 
        onmouseenter: function() {
          hideElementEditButtons = false;
        }, onmouseleave: function() {
          hideElementEditButtons = true;
        }}, [
          m('div', {className: `${styles.folderItemContainer}`, style: 'width: 20px;'}, [
            m('img', {src: '/src/images/Folder.svg'})
          ]),
          m('div', {className: `${styles.folderItemContainer}`, style: ''}, [
            m('div', {className: `${styles.folderTitle}`}, vnode.attrs.fileName)
          ])
        ]
      )
    ])
  }}
}

export default Folder;