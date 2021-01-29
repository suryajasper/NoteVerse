import m from 'mithril'
import styles from '../explorer.css';

var isEditing = false;

function File(vnode) {
  var hideElementEditButtons = true;
  var showNameInput = vnode.attrs.isNew;
  var startName = vnode.attrs.fileName;
  var inputVal = vnode.attrs.fileName;
  
  console.log('hi', showNameInput);
  
  function updateFileNameInServer() {
    console.log({
      path: vnode.attrs.path,
      fileName: inputVal,
      oldFileName: startName
    });
    m.request({
      method: 'POST',
      url: 'http://localhost:2000/updateFolder',
      params: {
        query: {
          path: vnode.attrs.path,
          fileName: startName
        },
        type: 'file',
        update: {
          fileName: inputVal,
        }
      }
    }).then(function(res) {
      console.log(res);
      startName = res.newName;
    });
  }
  
  return {
    oninit: function(subvnode) {
      startName = vnode.attrs.fileName;
      inputVal = vnode.attrs.fileName;
      console.log('hoaweifj', vnode.attrs.fileName);
    },
    view: function(subvnode) {
      return m('div', {className: `${styles.elementDivOuter}`}, 
      m('div', {className: `${styles.elementDiv}`}, [
        m('div', {className: `${styles.elementIconContainer}`, style: 'width: 20px;'}, [
            m('img', {src: '/src/images/File.svg'})
          ]),
          m('div', {className: `${styles.elementInfo}`}, [
            m('input', {className: `${styles.elementTitle}`, value: inputVal, disabled: !showNameInput, 
              oninput: function(e) {
                inputVal = e.target.value;
              }, onblur: function() {
                showNameInput = false;
                updateFileNameInServer();
              }, onkeydown: function(e) {
                if (e.key.toLowerCase() == 'enter') {
                  showNameInput = false;
                  updateFileNameInServer();
                } 
              }
            })
          ]),
          m('div', {style: "position:absolute; left:0; right:0; top:0; bottom:0;", hidden: showNameInput,
            onmouseenter: function(e) {
              hideElementEditButtons = false;
            }, onmouseleave: function(e) {
              hideElementEditButtons = true;
            }, onclick: function(e) {
              if (e.shiftKey) {
                showNameInput = true;
              } else if (!showNameInput) {
                
              }
            }
          })
        ])
      );
    }
  }
}

export default File;