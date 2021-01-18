import m from 'mithril'
import styles from '../explorer.css';

var isEditing = false;

function File(vnode) {
  var hideElementEditButtons = true;
  var nameIsEditable = false;

  function updateTitle(e) {
    nameIsEditable = false;
    isEditing = false;
    vnode.attrs.fileName = e.target.innerHTML;
  }
  
  return { view: function(subvnode) {
    return m('div', {className: `${styles.elementDiv}`, 
      onmouseenter: function() {
        if (!isEditing)
          hideElementEditButtons = false;
      }, onmouseleave: function() {
        if (!isEditing)
          hideElementEditButtons = true;
      }}, [
        m('div', {className: `${styles.elementIconContainer}`, style: 'width: 20px;'}, [
          m('img', {src: '/src/images/File.svg'})
        ]),
        m('div', {className: `${styles.elementInfo}`}, [
          m('div', {
            className: `${styles.elementTitle} ` + (nameIsEditable ? `${styles.elementTextSelected}` : ''),
            contentEditable: nameIsEditable,
            onblur: updateTitle,
            onkeypress: function(e) {
              if (e.key == 'enter') updateTitle(e);
            }}, m.trust(vnode.attrs.fileName)
          )/*,
          m('div', {className: `${styles.elementDate}`}, 'Last modified ', [
            m('span', {className: `${styles.dateHighlight}`}, vnode.attrs.dateModified.toLocaleDateString())
          ])*/
        ]),
        m('div', {className: `${styles.elementEditPanel}`, hidden: hideElementEditButtons}, [
          m('button', {className: `${styles.elementEditButton}`, onclick: function() {
            nameIsEditable = true;
            isEditing = true;
          }}, 'Rename'),
          m('button', {className: `${styles.elementEditButton}`}, 'sup'),
          m('button', {className: `${styles.elementEditButton}`}, 'sup'),
        ])
      ]
    );
  }}
}

export default File;