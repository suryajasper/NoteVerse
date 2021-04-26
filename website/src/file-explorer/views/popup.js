import m from 'mithril';
import Cookies from '../../utils/cookies';
import styles from '../popup.css';
import {createRipple} from '../../utils/dom';

class Popup {
  constructor(vnode) {
    this.title = vnode.attrs.title;
    this.callback = vnode.attrs.callback;
  }
}

class SharePopup extends Popup {
  constructor(vnode) {
    super(vnode);
  }

  view(vnode) {
    return m('div', {class: styles.centered}, 
      m('div', {class: styles.popupDiv, tabindex: '0', hidden: !vnode.attrs.isVisible/*\\, onblur: () => this.hide()*/}, [
        m('h2', {class: styles.popupTitle}, this.title),
        m('button', {class: styles.popupCancel, onclick: () => {vnode.attrs.hide();}}, 
          m('img', {src: '/src/file-explorer/images/close.svg'})
        ),
        m('div', {class: styles.popupContent}, [
          m('div', {class: styles.sharePopupInput}, [
            m('input', {type: 'text', placeholder: 'enter username/email', 
              onkeydown: e => {
                if (e.key.toLowerCase() == 'enter') {
                  vnode.attrs.loadUsername(e);
                }
              },
              oninput: e => vnode.attrs.loadSuggestions(e),
              onfocus: e => vnode.attrs.loadSuggestions(e),
              onblur: e => {
                setTimeout(() => {
                  vnode.attrs.clearSuggestions()
                }, 200);
              }
            }),
            m('div', {class: styles.sharePopupSuggestDiv}, vnode.attrs.suggestions.map(
              suggestion => {
                return m('div', {class: styles.sharePopupSuggestEl, onclick: e => {
                  console.log('loadusername', suggestion.username);
                  vnode.attrs.loadUsername(e, suggestion.username);
                }}, suggestion.username)
              }
            ))
          ]),
          m('ul', {class: styles.shareDiv}, vnode.attrs.contributors.map(contributor => {
            return m('li', [
              m('p', contributor.username),
              m('div', {class: styles.shareUserOptions}, [
                m('img', {src: '/src/file-explorer/images/remove-person.svg', title: 'Remove', class: styles.showOnHover, onclick: e => {
                  vnode.attrs.removeContributor(contributor.authorUID);
                }}),
                m('img', {src: contributor.editingMode === 'editing' ? '/src/file-explorer/images/Edit.svg': '/src/file-explorer/images/view.svg', title: 'Access Mode', onclick: e => {
                  if (e.target.src.includes('Edit')) {
                    vnode.attrs.updateContributor(contributor.authorUID, {editingMode: 'viewing'});
                  } else {
                    vnode.attrs.updateContributor(contributor.authorUID, {editingMode: 'editing'});
                  }
                }}),
                m('img', {src: contributor.canShare ? '/src/file-explorer/images/Share.svg' : '/src/file-explorer/images/person-off.svg', title: 'Share Permissions', onclick: e => {
                  if (e.target.src.includes('Share')) {
                    vnode.attrs.updateContributor(contributor.authorUID, {canShare: false});
                  } else {
                    vnode.attrs.updateContributor(contributor.authorUID, {canShare: true});
                  }
                }}),
              ])
            ]);
          }))
        ]),
        m('button', {class: `${styles.popupConfirm} ${styles.rippleButton}`, onclick: e => {
          createRipple(e, styles);
          vnode.attrs.saveContributors();
          
        }}, 'Share')
      ])
    );
  }
};

export {Popup, SharePopup};