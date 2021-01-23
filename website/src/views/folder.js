import m from 'mithril'
import styles from '../explorer.css';



function Folder(vnode) {
  var hideElementEditButtons = true;
  var showNameInput = vnode.attrs.isNew;
  var startName = vnode.attrs.fileName;
  var inputVal = vnode.attrs.fileName;

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
        update: {
          fileName: inputVal,
        }
      }
    }).then(function(res) {
      console.log(res);
      startName = res.newName;
    });
  }
  
  return { view: function(subvnode) {
    return m('div', {className: `${styles.folderDivOuter}`}, [
      m('div', {className: `${styles.folderDiv}`}, [
        m('div', {className: `${styles.folderItemContainer}`, style: 'width: 20px;'}, [
          m('img', {src: '/src/images/Folder.svg'})
        ]),
        m('div', {className: `${styles.folderItemContainer}`, style: ''}, [
          m('input', {className: `${styles.folderTitle}`, value: inputVal, disabled: !showNameInput, 
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
              var href = window.location.href;
              if (href.charAt(href.length-1) == '/') window.location.href += inputVal;
              else window.location.href += '/' + inputVal;
            }
          }
        })
      ])
    ])
  }}
}

export default Folder;